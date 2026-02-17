require "rails_helper"

RSpec.describe "Customer Service integration", type: :request do
  before(:all) do
    @port = 55_00 + rand(500)
    @server = WEBrick::HTTPServer.new(
      Port: @port,
      Logger: WEBrick::Log.new(File::NULL),
      AccessLog: []
    )

    @server.mount_proc "/customers/1" do |_req, res|
      res.status = 200
      res["Content-Type"] = "application/json"
      res.body = {
        id: 1,
        customer_name: "Test Customer",
        address: "Test Address",
        orders_count: 0
      }.to_json
    end

    @server.mount_proc "/customers/999" do |_req, res|
      res.status = 404
      res["Content-Type"] = "application/json"
      res.body = { error: "Customer not found" }.to_json
    end

    @thread = Thread.new { @server.start }
    ENV["CUSTOMER_SERVICE_URL"] = "http://localhost:#{@port}"
  end

  after(:all) do
    ENV.delete("CUSTOMER_SERVICE_URL")
    @server&.shutdown
    @thread&.join
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
