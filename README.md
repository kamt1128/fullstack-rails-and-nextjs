# Monokera FullStack Test

Repositorio monorepo con dos microservicios Rails y una webapp Next.js.

## Arquitectura
- `services/order_service` crea y consulta pedidos.
- `services/customer_service` expone datos de clientes y consume eventos.
- `apps/web` interfaz Next.js para consultar y crear pedidos.

Flujo principal:
```
Web (Next.js) --> Order Service (Rails) --> Customer Service (Rails)
                             |
                             +--> RabbitMQ (exchange orders, routing order.created)
                                               |
                                               +--> Customer Service consumer -> update orders_count
```

## Requisitos
- Ruby 4.0.x + Rails 8.1.x
- Node.js 18+
- PostgreSQL
- RabbitMQ (con management opcional)

Opcional: Docker para Postgres y RabbitMQ.

## Servicios de infraestructura (Docker)
```bash
docker compose up -d
```

## Order Service (Rails)
```bash
cd services/order_service
bundle install
bin/rails db:create db:migrate
bin/rails server -p 3001
```

Variables recomendadas:
- `CUSTOMER_SERVICE_URL` (default `http://localhost:3002`)
- `RABBITMQ_URL` (default `amqp://guest:guest@localhost:5672`)
- `RABBITMQ_EXCHANGE` (default `orders`)
- `RABBITMQ_ROUTING_KEY` (default `order.created`)
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

## Customer Service (Rails)
```bash
cd services/customer_service
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server -p 3002
```

Consumidor de eventos:
```bash
ruby bin/consume_orders
```

## Web (Next.js)
```bash
cd apps/web
npm install
npm run dev
```

Variables recomendadas:
- `NEXT_PUBLIC_ORDER_API_URL` (default `http://localhost:3001`)
- `NEXT_PUBLIC_CUSTOMER_API_URL` (default `http://localhost:3002`)

## Pruebas
Order Service:
```bash
cd services/order_service
bundle exec rspec
```

Customer Service:
```bash
cd services/customer_service
bundle exec rspec
```

Frontend:
```bash
cd apps/web
npm test
```

Notas de pruebas:
- Hay pruebas de integración HTTP con un servidor local embebido (Order -> Customer).
- La prueba de RabbitMQ se salta automáticamente si el broker no está disponible.

## Notas Windows
Si ves warnings de `VIPS` al ejecutar Rails o RSpec, son módulos opcionales de
`image_processing` en Windows. No afectan la ejecución del API. Puedes
ignorarlos o instalar libvips si quieres eliminarlos.

## Datos seed
Customer Service crea clientes con IDs 1..5 listos para usar.

## Endpoints
Order Service:
- `POST /orders`
- `GET /orders?customer_id=1&page=1&per_page=20`

Customer Service:
- `GET /customers`
- `GET /customers/:id`
