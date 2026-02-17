require "faraday"
require "json"

class CustomerServiceClient
  class Error < StandardError; end

  def self.fetch_customer(customer_id)
    response = connection.get("/customers/#{customer_id}")
    return nil if response.status == 404

    unless response.success?
      raise Error, "Customer service returned status #{response.status}"
    end

    JSON.parse(response.body)
  rescue Faraday::Error => e
    raise Error, e.message
  end

  def self.connection
    Faraday.new(url: base_url) do |f|
      f.request :json
      f.adapter Faraday.default_adapter
    end
  end

  def self.base_url
    ENV.fetch("CUSTOMER_SERVICE_URL", "http://localhost:3002")
  end
end
