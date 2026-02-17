import Link from "next/link";

export default function Home() {
  return (
    <div className="layout">
      <section className="hero">
        <h1 className="hero__title">Order Console</h1>
        <p className="hero__text">
          Panel ligero para consultar y crear pedidos en el Order Service, con
          datos de clientes enriquecidos desde Customer Service.
        </p>
        <div className="nav">
          <Link className="button button--primary" href="/orders">
            Ver pedidos por cliente
          </Link>
          <Link className="button" href="/orders/new">
            Crear pedido
          </Link>
        </div>
        <p className="u-muted">
          API base actual:{" "}
          <strong>
            {process.env.NEXT_PUBLIC_ORDER_API_URL ??
              "http://localhost:3001"}
          </strong>
        </p>
      </section>

      <section className="panel stack">
        <h2>Flujo rápido</h2>
        <p className="u-muted">
          1. Busca pedidos con el ID de cliente que viene precargado en el
          Customer Service. 2. Crea pedidos nuevos y observa cómo aumenta el
          contador de órdenes del cliente mediante eventos RabbitMQ.
        </p>
      </section>
    </div>
  );
}
