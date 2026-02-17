"use client";

import { useState } from "react";
import useSWR from "swr";
import { getOrders } from "../../lib/api";

export default function OrdersClient() {
  const [customerIdInput, setCustomerIdInput] = useState("1");
  const [queryCustomerId, setQueryCustomerId] = useState("");
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");

  const { data, error, isValidating } = useSWR(
    queryCustomerId ? ["orders", queryCustomerId, page] : null,
    ([, customerId, currentPage]) => getOrders(String(customerId), Number(currentPage))
  );

  const orders = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, per_page: 20, total: 0 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.per_page));
  const isLoading = isValidating && !data;
  const hasQuery = Boolean(queryCustomerId);

  const handleSearch = () => {
    if (!customerIdInput.trim()) {
      setFormError("Debes ingresar un customer_id.");
      return;
    }

    setFormError("");
    setQueryCustomerId(customerIdInput.trim());
    setPage(1);
  };

  return (
    <section className="panel stack orders">
      <div className="form__field">
        <label className="form__label" htmlFor="customer">
          Customer ID
        </label>
        <input
          className="form__input"
          id="customer"
          value={customerIdInput}
          onChange={(event) => setCustomerIdInput(event.target.value)}
          placeholder="Ej: 1"
        />
      </div>

      <div className="nav">
        <button
          className="button button--primary"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Buscar pedidos"}
        </button>
      </div>

      {formError ? <p className="u-muted">{formError}</p> : null}
      {error ? <p className="u-muted">{error.message}</p> : null}

      {!hasQuery ? (
        <p className="u-muted">Ingresa un customer_id y presiona buscar.</p>
      ) : orders.length > 0 ? (
        <>
          <table className="orders__table">
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
                    <span className="orders__status">{order.status}</span>
                  </td>
                  <td>
                    <div>{order.customer_name ?? "-"}</div>
                    <div className="u-muted">{order.customer_address ?? ""}</div>
                  </td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pager">
            <button
              className="button"
              onClick={() => setPage(Math.max(1, meta.page - 1))}
              disabled={isLoading || meta.page <= 1}
            >
              Anterior
            </button>
            <span className="u-muted">
              Página {meta.page} de {totalPages}
            </span>
            <button
              className="button"
              onClick={() => setPage(Math.min(totalPages, meta.page + 1))}
              disabled={isLoading || meta.page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <p className="u-muted">
          No hay pedidos para este cliente todavía. Crea uno nuevo para verlo
          aquí.
        </p>
      )}
    </section>
  );
}
