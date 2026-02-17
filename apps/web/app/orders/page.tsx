import OrdersClient from "./orders-client";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="layout">
      <section className="hero">
        <h1 className="hero__title">Pedidos por cliente</h1>
        <p className="hero__text">
          Consulta los pedidos asociados a un cliente específico. La vista está
          paginada a 20 resultados por página.
        </p>
        <div className="nav">
          <Link className="button" href="/">
            Volver al inicio
          </Link>
          <Link className="button button--primary" href="/orders/new">
            Crear pedido
          </Link>
        </div>
      </section>

      <OrdersClient />
    </div>
  );
}
