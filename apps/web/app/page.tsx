import Link from "next/link";

export default function Home() {
  const baseUrl =
    process.env.NEXT_PUBLIC_ORDER_API_URL ?? "http://localhost:3001";

  return (
    <div className="container home">
      <section className="hero home__hero">
        <div className="hero__inner">
          <div className="hero__top">
            <div className="hero__brand">
              <h1 className="hero__title">Gestor de Ordenes</h1>
              <p className="hero__subtitle">
                Panel ligero para consultar y crear pedidos en el Order Service,
                con datos de clientes enriquecidos desde Customer Service.
              </p>
            </div>
            <div>
              <span className="pill">
                <span className="kbd">API</span>
                base actual: <span className="mono">{baseUrl}</span>
              </span>
            </div>
          </div>

          <div className="nav" style={{ marginTop: 16 }}>
            <Link className="btn btn--primary" href="/">
              <svg className="icon" aria-hidden="true">
                <use href="#i-home" />
              </svg>
              Inicio
            </Link>
            <Link className="btn" href="/orders">
              <svg className="icon" aria-hidden="true">
                <use href="#i-list" />
              </svg>
              Ver pedidos por cliente
            </Link>
            <Link className="btn" href="/orders/new">
              <svg className="icon" aria-hidden="true">
                <use href="#i-plus" />
              </svg>
              Crear pedido
            </Link>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <svg className="icon" aria-hidden="true" style={{ verticalAlign: -3 }}>
                <use href="#i-bolt" />
              </svg>{" "}
              Flujo rápido
            </h2>
            <span className="pill">
              Microservicios · Customer Service + Order Service · RabbitMQ
            </span>
          </div>
          <div className="card__divider"></div>
          <div className="card__body">
            <ol style={{ margin: "12px 0 0", paddingLeft: 18, color: "var(--muted)", lineHeight: 1.8 }}>
              <li>
                Busca pedidos con el ID de cliente precargado en el Customer
                Service.
              </li>
              <li>
                Crea pedidos nuevos y observa cómo aumenta el contador de órdenes
                del cliente mediante eventos (RabbitMQ).
              </li>
            </ol>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h2 className="card__title">Estado del entorno</h2>
            <span className="badge badge--ok">
              <span className="badge__dot"></span> Online
            </span>
          </div>
          <div className="card__divider"></div>
          <div className="card__body">
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              <div className="pill">
                <span className="kbd">Order</span> Service:{" "}
                <span className="mono">/orders</span>
              </div>
              <div className="pill">
                <span className="kbd">Customer</span> Service:{" "}
                <span className="mono">/customers</span>
              </div>
              <div className="pill">
                <span className="kbd">Events</span> RabbitMQ:{" "}
                <span className="mono">orders.created</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="footer-note">
        Tip: usa <span className="kbd">Tab</span> para navegar los campos.
      </div>
    </div>
  );
}
