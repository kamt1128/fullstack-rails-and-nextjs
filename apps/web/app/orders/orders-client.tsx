"use client";

import { useState } from "react";

type Order = {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_address?: string;
  product_name: string;
  quantity: number;
  price: string;
  status: string;
  created_at: string;
};

type Meta = {
  page: number;
  per_page: number;
  total: number;
};

const baseUrl = process.env.NEXT_PUBLIC_ORDER_API_URL ?? "http://localhost:3001";

export default function OrdersClient() {
  const [customerId, setCustomerId] = useState("1");
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, per_page: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.per_page));

  const loadOrders = async (page = 1) => {
    if (!customerId.trim()) {
      setError("Debes ingresar un customer_id.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = new URL("/orders", baseUrl);
      url.searchParams.set("customer_id", customerId);
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", "20");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de pedidos.");
      }
      const body = await response.json();
      setOrders(body.data ?? []);
      setMeta(body.meta ?? { page: 1, per_page: 20, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card grid">
      <div className="field">
        <label htmlFor="customer">Customer ID</label>
        <input
          id="customer"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          placeholder="Ej: 1"
        />
      </div>

      <div className="nav">
        <button
          className="button primary"
          onClick={() => loadOrders(1)}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Buscar pedidos"}
        </button>
      </div>

      {error ? <p className="muted">{error}</p> : null}

      {orders.length > 0 ? (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.product_name}</td>
                  <td>{order.quantity}</td>
                  <td>${order.price}</td>
                  <td>
                    <span className="status">{order.status}</span>
                  </td>
                  <td>
                    <div>{order.customer_name ?? "-"}</div>
                    <div className="muted">{order.customer_address ?? ""}</div>
                  </td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              className="button"
              onClick={() => loadOrders(Math.max(1, meta.page - 1))}
              disabled={loading || meta.page <= 1}
            >
              Anterior
            </button>
            <span className="muted">
              Página {meta.page} de {totalPages}
            </span>
            <button
              className="button"
              onClick={() => loadOrders(Math.min(totalPages, meta.page + 1))}
              disabled={loading || meta.page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <p className="muted">
          No hay pedidos para este cliente todavía. Crea uno nuevo para verlo
          aquí.
        </p>
      )}
    </section>
  );
}
