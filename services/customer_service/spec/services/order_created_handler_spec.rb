require "rails_helper"

RSpec.describe OrderCreatedHandler do
  it "increments orders_count for an existing customer" do
    customer = Customer.create!(customer_name: "Luis García", address: "Calle 45 #12-30")

    payload = { "data" => { "customer_id" => customer.id } }
    result = described_class.call(payload)

    expect(result).to be(true)
    expect(customer.reload.orders_count).to eq(1)
  end

  it "returns false when customer does not exist" do
    payload = { "data" => { "customer_id" => 9999 } }
    result = described_class.call(payload)

    expect(result).to be(false)
  end
end
