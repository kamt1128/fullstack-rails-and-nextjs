import OrdersClient from "./orders-client";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="container orders">
      <section className="hero orders__hero">
        <div className="hero__inner">
          <div className="hero__top">
            <div className="hero__brand">
              <h1 className="hero__title">Pedidos por cliente</h1>
              <p className="hero__subtitle">
                Consulta los pedidos asociados a un cliente específico. La vista
                está paginada a 20 resultados por página.
              </p>
            </div>
            <div>
              <span className="pill">
                <span className="kbd">GET</span>{" "}
                <span className="mono">/orders?customer_id=1</span>
              </span>
            </div>
          </div>

          <div className="nav" style={{ marginTop: 16 }}>
            <Link className="btn" href="/">
              <svg className="icon" aria-hidden="true">
                <use href="#i-home" />
              </svg>
              Volver al inicio
            </Link>
            <Link className="btn btn--primary" href="/orders/new">
              <svg className="icon" aria-hidden="true">
                <use href="#i-plus" />
              </svg>
              Crear pedido
            </Link>
          </div>
        </div>
      </section>

      <OrdersClient />

      <div className="footer-note">
        Tip: usa <span className="kbd">Tab</span> para navegar los campos.
      </div>
    </div>
  );
}
