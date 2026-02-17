class OrdersController < ApplicationController
  rescue_from CustomerServiceClient::Error, with: :handle_customer_service_error

  def index
    customer_id = params[:customer_id]
    return render json: { error: "customer_id is required" }, status: :bad_request if customer_id.blank?

    page = params.fetch(:page, 1).to_i
    per_page = params.fetch(:per_page, 20).to_i
    per_page = 20 if per_page <= 0 || per_page > 100
    page = 1 if page <= 0

    scope = Order.where(customer_id: customer_id).order(created_at: :desc)
    total = scope.count
    orders = scope.limit(per_page).offset((page - 1) * per_page)

    render json: {
      data: orders.as_json(only: %i[id customer_id customer_name customer_address product_name quantity price status created_at]),
      meta: { page: page, per_page: per_page, total: total }
    }
  end

  def create
    customer = CustomerServiceClient.fetch_customer(order_params[:customer_id])
    return render json: { error: "Customer not found" }, status: :unprocessable_entity unless customer

    order = Order.new(order_params.merge(
      customer_name: customer["customer_name"],
      customer_address: customer["address"]
    ))

    if order.save
      begin
        OrderEventPublisher.publish_order_created(order)
      rescue StandardError => e
        return render json: { error: "Order created but event publish failed", details: e.message }, status: :bad_gateway
      end

      render json: order, status: :created
    else
      render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def order_params
    params.fetch(:order, params).permit(:customer_id, :product_name, :quantity, :price, :status)
  end

  def handle_customer_service_error(error)
    render json: { error: "Customer service unavailable", details: error.message }, status: :bad_gateway
  end
end
