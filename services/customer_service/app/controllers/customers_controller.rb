class CustomersController < ApplicationController
  def index
    customers = Customer.order(:id)

    if params[:q].present?
      term = "%#{ActiveRecord::Base.sanitize_sql_like(params[:q].to_s)}%"
      customers = customers.where("CAST(id AS TEXT) ILIKE :term OR customer_name ILIKE :term", term: term)
    end

    render json: {
      data: customers.select(:id, :customer_name).map do |customer|
        {
          id: customer.id,
          customer_name: customer.customer_name
        }
      end
    }
  end

  def show
    customer = Customer.find_by(id: params[:id])
    return render json: { error: "Customer not found" }, status: :not_found unless customer

    render json: {
      id: customer.id,
      customer_name: customer.customer_name,
      address: customer.address,
      orders_count: customer.orders_count
    }
  end
end
