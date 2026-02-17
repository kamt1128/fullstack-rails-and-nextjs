class OrderCreatedHandler
  def self.call(payload)
    data = payload.is_a?(Hash) ? payload["data"] || {} : {}
    customer_id = data["customer_id"]
    return false if customer_id.nil?

    customer = Customer.find_by(id: customer_id)
    return false unless customer

    customer.increment!(:orders_count)
    true
  end
end
