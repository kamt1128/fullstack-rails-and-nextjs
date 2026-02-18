# Monokera FullStack Test

Repositorio monorepo con dos microservicios Rails y una webapp Next.js.

**Arquitectura y flujo de eventos**
- `apps/web` (Next.js) UI para crear y consultar pedidos.
- `services/order_service` (Rails) API de pedidos. Enriquece datos consultando Customer Service y publica eventos.
- `services/customer_service` (Rails) API de clientes. Consume eventos para actualizar `orders_count`.


**Flujo principal**

![Main flow](docs/main-flow.png)


**Base de datos (relación lógica entre servicios)**

Cada microservicio mantiene su propia base de datos. La relación entre `orders.customer_id` y `customers.id`
es lógica (no hay FK cruzado entre servicios).

![DB diagram](docs/db-diagram.png)


**Requisitos**
- Ruby 4.0.x + Rails 8.1.x
- Node.js 18+
- PostgreSQL
- RabbitMQ (con management opcional)
- Docker (opcional, recomendado para Postgres y RabbitMQ)


**Configuración y ejecución (local)**
1. Levanta la infraestructura:
   ```bash
   docker compose up -d
   ```
2. Order Service:
   ```bash
   cd services/order_service
   bundle install
   bin/rails db:create db:migrate
   bin/rails server -p 3001
   ```
3. Customer Service:
   ```bash
   cd services/customer_service
   bundle install
   bin/rails db:create db:migrate db:seed
   bin/rails server -p 3002
   ```
4. Consumidor de eventos (Customer Service, en otra terminal):
   ```bash
   cd services/customer_service
   bin/consume_orders
   ```
5. Web (Next.js):
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```


**Variables de entorno**
Order Service:
- `CUSTOMER_SERVICE_URL` (default `http://localhost:3002`)
- `RABBITMQ_URL` (default `amqp://guest:guest@localhost:5672`)
- `RABBITMQ_EXCHANGE` (default `orders`)
- `RABBITMQ_ROUTING_KEY` (default `order.created`)
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

Customer Service:
- `RABBITMQ_URL` (default `amqp://guest:guest@localhost:5672`)
- `RABBITMQ_EXCHANGE` (default `orders`)
- `RABBITMQ_ROUTING_KEY` (default `order.created`)
- `RABBITMQ_QUEUE` (default `orders.order_created`)
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

Web:
- `NEXT_PUBLIC_ORDER_API_URL` (default `http://localhost:3001`)
- `NEXT_PUBLIC_CUSTOMER_API_URL` (default `http://localhost:3002`)



**Pruebas**

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


**Pantallazos**

Tabla de pantallas:

| Pantalla | URL | Archivo | Descripción |
| --- | --- | --- | --- |
| Inicio | `http://localhost:3000/` | `docs/screenshots/01-home.png` | Dashboard con accesos rápidos y estado de servicios. |
| Pedidos por cliente | `http://localhost:3000/orders` | `docs/screenshots/02-orders.png` | Filtros, resumen y listado paginado de pedidos. |
| Crear pedido | `http://localhost:3000/orders/new` | `docs/screenshots/03-new-order.png` | Formulario para crear pedidos y disparar el evento. |

Inicio:

![Inicio](docs/screenshots/01-home.png)

Pedidos por cliente:

![Pedidos por cliente](docs/screenshots/02-orders.png)

Crear pedido:

![Crear pedido](docs/screenshots/03-new-order.png)


**Notas Windows**

Si ves warnings de `VIPS` al ejecutar Rails o RSpec, son módulos opcionales de `image_processing` en Windows. No afectan la ejecución del API. Puedes ignorarlos o instalar libvips si quieres eliminarlos.


**Datos seed**

Customer Service incluye datos de prueba con clientes (IDs 1 a 5) listos para usar.


**Endpoints principales**

Order Service:
- `POST /orders`
- `GET /orders?customer_id=1&page=1&per_page=20`

Customer Service:
- `GET /customers`
- `GET /customers/:id`
