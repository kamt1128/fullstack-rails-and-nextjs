import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Order Console</h1>
        <p>
          Panel ligero para consultar y crear pedidos en el Order Service, con
          datos de clientes enriquecidos desde Customer Service.
        </p>
        <div className="nav">
          <Link className="button primary" href="/orders">
            Ver pedidos por cliente
          </Link>
          <Link className="button" href="/orders/new">
            Crear pedido
          </Link>
        </div>
        <p className="muted">
          API base actual:{" "}
          <strong>
            {process.env.NEXT_PUBLIC_ORDER_API_URL ??
              "http://localhost:3001"}
          </strong>
        </p>
      </section>

      <section className="card grid">
        <h2>Flujo rápido</h2>
        <p className="muted">
          1. Busca pedidos con el ID de cliente que viene precargado en el
          Customer Service. 2. Crea pedidos nuevos y observa cómo aumenta el
          contador de órdenes del cliente mediante eventos RabbitMQ.
        </p>
      </section>
    </div>
  );
}
