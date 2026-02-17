require "rails_helper"

RSpec.describe "Orders API", type: :request do
  describe "GET /orders" do
    it "returns 400 when customer_id is missing" do
      get "/orders"
      expect(response).to have_http_status(:bad_request)
    end

    it "returns orders for a customer with pagination metadata" do
      Order.create!(customer_id: 1, product_name: "Item A", quantity: 2, price: 10.5, status: "created")
      Order.create!(customer_id: 1, product_name: "Item B", quantity: 1, price: 5.0, status: "created")

      get "/orders", params: { customer_id: 1, page: 1, per_page: 1 }

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["data"].length).to eq(1)
      expect(body["meta"]["total"]).to eq(2)
    end
  end

  describe "POST /orders" do
    it "creates an order and publishes an event" do
      allow(CustomerServiceClient).to receive(:fetch_customer).and_return(
        { "customer_name" => "Ana Morales", "address" => "Av. Siempre Viva 123" }
      )
      allow(OrderEventPublisher).to receive(:publish_order_created)

      payload = {
        order: {
          customer_id: 1,
          product_name: "Laptop",
          quantity: 1,
          price: 1200.50,
          status: "created"
        }
      }

      post "/orders", params: payload, as: :json

      expect(response).to have_http_status(:created)
      expect(Order.count).to eq(1)
      expect(OrderEventPublisher).to have_received(:publish_order_created)
    end
  end
end
