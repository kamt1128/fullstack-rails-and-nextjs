require "rails_helper"
require "webmock/rspec"

RSpec.describe "Customer Service integration", type: :request do
  before do
    ENV["CUSTOMER_SERVICE_URL"] = "http://customers.test"

    stub_request(:get, "http://customers.test/customers/1")
      .to_return(
        status: 200,
        headers: { "Content-Type" => "application/json" },
        body: {
          id: 1,
          customer_name: "Test Customer",
          address: "Test Address",
          orders_count: 0
        }.to_json
      )

    stub_request(:get, "http://customers.test/customers/999")
      .to_return(
        status: 404,
        headers: { "Content-Type" => "application/json" },
        body: { error: "Customer not found" }.to_json
      )
  end

  after do
    ENV.delete("CUSTOMER_SERVICE_URL")
  end

  it "creates an order using customer data from the customer service" do
    allow(OrderEventPublisher).to receive(:publish_order_created)

    post "/orders", params: {
      order: {
        customer_id: 1,
        product_name: "Keyboard",
        quantity: 1,
        price: 50.0,
        status: "created"
      }
    }, as: :json

    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["customer_name"]).to eq("Test Customer")
    expect(body["customer_address"]).to eq("Test Address")
  end

  it "returns 422 when customer service responds with 404" do
    allow(OrderEventPublisher).to receive(:publish_order_created)

    post "/orders", params: {
      order: {
        customer_id: 999,
        product_name: "Mouse",
        quantity: 1,
        price: 25.0,
        status: "created"
      }
    }, as: :json

    expect(response).to have_http_status(:unprocessable_entity)
  end
end
