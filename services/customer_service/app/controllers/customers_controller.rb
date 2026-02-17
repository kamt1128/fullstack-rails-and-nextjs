class CustomersController < ApplicationController
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
