class Order < ApplicationRecord
  validates :customer_id, :product_name, :quantity, :price, :status, presence: true
  validates :quantity, numericality: { greater_than: 0 }
  validates :price, numericality: { greater_than_or_equal_to: 0 }
end
