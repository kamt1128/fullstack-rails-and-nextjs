require "bunny"
require "json"

class OrderEventPublisher
  def self.publish_order_created(order)
    payload = {
      event: "order.created",
      data: {
        id: order.id,
        customer_id: order.customer_id,
        product_name: order.product_name,
        quantity: order.quantity,
        price: order.price.to_s,
        status: order.status,
        created_at: order.created_at&.iso8601
      }
    }.to_json

    with_channel do |channel|
      exchange = channel.direct(exchange_name, durable: true)
      exchange.publish(payload, routing_key: routing_key, persistent: true)
    end
  end

  def self.with_channel
    connection = Bunny.new(rabbitmq_url)
    connection.start
    channel = connection.create_channel
    yield channel
  ensure
    channel&.close
    connection&.close
  end

  def self.exchange_name
    ENV.fetch("RABBITMQ_EXCHANGE", "orders")
  end

  def self.routing_key
    ENV.fetch("RABBITMQ_ROUTING_KEY", "order.created")
  end

  def self.rabbitmq_url
    ENV.fetch("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
  end
end
