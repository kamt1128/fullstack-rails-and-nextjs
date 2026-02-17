require "rails_helper"

RSpec.describe OrderEventPublisher do
  def rabbitmq_available?
    connection = Bunny.new(ENV.fetch("RABBITMQ_URL", "amqp://guest:guest@localhost:5672"))
    connection.start
    connection.close
    true
  rescue Bunny::TCPConnectionFailed, Bunny::AuthenticationFailureError, Bunny::NetworkFailure
    false
  end

  it "publishes an order.created event to RabbitMQ" do
    skip "RabbitMQ not available" unless rabbitmq_available?

    connection = Bunny.new(ENV.fetch("RABBITMQ_URL", "amqp://guest:guest@localhost:5672"))
    connection.start
    channel = connection.create_channel
    exchange = channel.direct(ENV.fetch("RABBITMQ_EXCHANGE", "orders"), durable: true)
    queue = channel.queue("", exclusive: true)
    queue.bind(exchange, routing_key: ENV.fetch("RABBITMQ_ROUTING_KEY", "order.created"))

    order = Order.create!(customer_id: 1, product_name: "Monitor", quantity: 1, price: 199.99, status: "created")
    described_class.publish_order_created(order)

    payload = nil
    deadline = Time.now + 5
    while Time.now < deadline && payload.nil?
      _delivery_info, _properties, body = queue.pop
      payload = body if body
      sleep 0.1 unless payload
    end

    expect(payload).to include("\"event\":\"order.created\"")
  ensure
    channel&.close
    connection&.close
  end
end
