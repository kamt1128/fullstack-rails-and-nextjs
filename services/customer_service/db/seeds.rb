customers = [
  { id: 1, customer_name: "Ana Morales", address: "Av. Siempre Viva 123" },
  { id: 2, customer_name: "Luis García", address: "Calle 45 #12-30" },
  { id: 3, customer_name: "María Pérez", address: "Cra 7 #80-55" },
  { id: 4, customer_name: "Carlos López", address: "Av. Libertad 456" },
  { id: 5, customer_name: "Sofía Rodríguez", address: "Diagonal 10 #5-20" }
]

customers.each do |attrs|
  customer = Customer.find_or_initialize_by(id: attrs[:id])
  customer.assign_attributes(attrs.except(:id))
  customer.save!
end
