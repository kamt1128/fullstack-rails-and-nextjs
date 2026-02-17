require "rails_helper"

RSpec.describe "Customers API", type: :request do
  it "returns customer details" do
    customer = Customer.create!(customer_name: "Ana Morales", address: "Av. Siempre Viva 123")

    get "/customers/#{customer.id}"

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["customer_name"]).to eq("Ana Morales")
    expect(body["orders_count"]).to eq(0)
  end

  it "returns 404 when customer does not exist" do
    get "/customers/99999"
    expect(response).to have_http_status(:not_found)
  end
end
