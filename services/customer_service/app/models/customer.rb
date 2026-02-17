class Customer < ApplicationRecord
  validates :customer_name, :address, presence: true
  validates :orders_count, numericality: { greater_than_or_equal_to: 0 }
end
