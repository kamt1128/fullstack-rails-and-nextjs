require "bunny"
require "json"

class OrderCreatedConsumer
  def self.start!
    connection = Bunny.new(rabbitmq_url)
    connection.start
    channel = connection.create_channel

    exchange = channel.direct(exchange_name, durable: true)
    queue = channel.queue(queue_name, durable: true)
    queue.bind(exchange, routing_key: routing_key)

    queue.subscribe(block: true, manual_ack: true) do |delivery_info, _properties, payload|
      handle_message(channel, delivery_info, payload)
    end
  ensure
    connection&.close
  end

  def self.handle_message(channel, delivery_info, payload)
    data = JSON.parse(payload)
    handled = OrderCreatedHandler.call(data)

    if handled
      channel.ack(delivery_info.delivery_tag)
    else
      channel.nack(delivery_info.delivery_tag, false, false)
    end
  rescue JSON::ParserError
    channel.nack(delivery_info.delivery_tag, false, false)
  rescue StandardError
    channel.nack(delivery_info.delivery_tag, false, true)
  end

  def self.exchange_name
    ENV.fetch("RABBITMQ_EXCHANGE", "orders")
  end

  def self.routing_key
    ENV.fetch("RABBITMQ_ROUTING_KEY", "order.created")
  end

  def self.queue_name
    ENV.fetch("RABBITMQ_QUEUE", "orders.order_created")
  end

  def self.rabbitmq_url
    ENV.fetch("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
  end
end
