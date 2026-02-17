class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.bigint :customer_id, null: false
      t.string :customer_name
      t.string :customer_address
      t.string :product_name, null: false
      t.integer :quantity, null: false
      t.decimal :price, precision: 12, scale: 2, null: false
      t.string :status, null: false

      t.timestamps
    end

    add_index :orders, :customer_id
  end
end
