"use client";

import { useMemo, useState } from "react";
import AsyncSelect from "react-select/async";
import Link from "next/link";
import useSWR from "swr";
import { getOrders, type Order } from "../../lib/api";

type Meta = {
  page: number;
  per_page: number;
  total: number;
};

type Customer = {
  id: number;
  customer_name: string;
};

type CustomerOption = {
  value: string;
  label: string;
};

const customerBaseUrl =
  process.env.NEXT_PUBLIC_CUSTOMER_API_URL ?? "http://localhost:3002";

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "paid":
      return "badge--ok";
    case "shipped":
      return "badge--ok";
    case "cancelled":
      return "badge--err";
    default:
      return "badge--warn";
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case "paid":
      return "Pagado";
    case "shipped":
      return "Enviado";
    case "cancelled":
      return "Cancelado";
    case "created":
      return "Creado";
    default:
      return status;
  }
};

export default function OrdersClient() {
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);
  const [customersError, setCustomersError] = useState("");
  const [queryCustomerId, setQueryCustomerId] = useState("");
  const [page, setPage] = useState(1);
  const [formError, setFormError] = useState("");

  const customerId = selectedCustomer?.value ?? "";
  const menuPortalTarget =
    typeof window === "undefined" ? undefined : document.body;

  const { data, error, isValidating } = useSWR(
    queryCustomerId ? ["orders", queryCustomerId, page] : null,
    ([, currentCustomerId, currentPage]) =>
      getOrders(String(currentCustomerId), Number(currentPage))
  );

  const orders: Order[] = data?.data ?? [];
  const meta: Meta = data?.meta ?? { page: 1, per_page: 20, total: 0 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.per_page));
  const isLoading = isValidating && !data;
  const hasQuery = Boolean(queryCustomerId);

  const summary = useMemo(() => {
    if (orders.length === 0) {
      return null;
    }

    const latestOrder = orders.reduce((latest, order) => {
      if (!latest) {
        return order;
      }
      const latestDate = new Date(latest.created_at).getTime();
      const orderDate = new Date(order.created_at).getTime();
      return orderDate > latestDate ? order : latest;
    }, orders[0]);

    return {
      customerName: latestOrder.customer_name ?? "Cliente",
      customerAddress: latestOrder.customer_address ?? "Dirección no disponible",
      lastOrder: new Date(latestOrder.created_at).toLocaleString()
    };
  }, [orders]);

  const loadCustomerOptions = async (inputValue: string) => {
    setCustomersError("");
    try {
      const url = new URL("/customers", customerBaseUrl);
      if (inputValue.trim()) {
        url.searchParams.set("q", inputValue.trim());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de clientes.");
      }

      const body = await response.json();
      const list: Customer[] = body.data ?? [];
      const options = list.map((customer) => ({
        value: String(customer.id),
        label: `${customer.id} - ${customer.customer_name}`
      }));

      if (!selectedCustomer && options.length > 0 && !inputValue.trim()) {
        setSelectedCustomer(options[0]);
      }

      return options;
    } catch (err) {
      setCustomersError(err instanceof Error ? err.message : "Error inesperado.");
      return [];
    }
  };

  const handleSearch = () => {
    if (!customerId.trim()) {
      setFormError("Debes seleccionar un cliente.");
      return;
    }

    setFormError("");
    setQueryCustomerId(customerId.trim());
    setPage(1);
  };

  return (
    <>
      <section className="grid orders__grid">
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">Filtros</h2>
            <span className="pill">Paginado: 20 por página</span>
          </div>
          <div className="card__divider"></div>
          <div className="card__body card__body--padding-top">
            <form className="form">
              <div className="field">
                <label className="field__label" htmlFor="customer-select">
                  Cliente
                </label>
                <AsyncSelect
                  inputId="customer-select"
                  className="select"
                  classNamePrefix="select"
                  placeholder="Busca por ID o nombre"
                  cacheOptions
                  defaultOptions
                  menuPortalTarget={menuPortalTarget}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  loadOptions={loadCustomerOptions}
                  value={selectedCustomer}
                  onChange={(option) =>
                    setSelectedCustomer(option as CustomerOption | null)
                  }
                  noOptionsMessage={() => "Sin resultados"}
                />
                <span className="field__helper">
                  Busca pedidos asociados a un cliente específico.
                </span>
              </div>

              <div className="form__actions">
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-search" />
                  </svg>
                  {isLoading ? "Cargando..." : "Buscar pedidos"}
                </button>
                <Link className="btn" href="/orders/new">
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-plus" />
                  </svg>
                  Crear pedido
                </Link>
              </div>
            </form>

            {customersError ? (
              <p className="footer-note">{customersError}</p>
            ) : null}
            {formError ? <p className="footer-note">{formError}</p> : null}
            {error ? (
              <p className="footer-note">
                {error instanceof Error ? error.message : "Error inesperado."}
              </p>
            ) : null}
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h2 className="card__title">Resumen</h2>
            <span className={`badge ${orders.length ? "badge--ok" : "badge--warn"}`}>
              <span className="badge__dot"></span>
              {orders.length} resultado{orders.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="card__divider"></div>
          <div className="card__body">
            {summary ? (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <div className="pill">
                  <span className="kbd">Cliente</span> {summary.customerName} ·{" "}
                  <span className="mono">#{customerId || "-"}</span>
                </div>
                <div className="pill">
                  <span className="kbd">Dirección</span> {summary.customerAddress}
                </div>
                <div className="pill">
                  <span className="kbd">Última orden</span> {summary.lastOrder}
                </div>
              </div>
            ) : (
              <p className="footer-note">
                Selecciona un cliente y consulta para ver el resumen.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="card__header">
          <h2 className="card__title">Listado</h2>
          <span className="pill">
            Ordenado por: <span className="mono">creado_desc</span>
          </span>
        </div>
        <div className="card__divider"></div>
        <div className="card__body" style={{ paddingTop: 10 }}>
          {!hasQuery ? (
            <p className="footer-note">
              Selecciona un cliente y consulta para ver los pedidos.
            </p>
          ) : orders.length > 0 ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th className="table__heading" style={{ width: 70 }}>
                      ID
                    </th>
                    <th className="table__heading">Producto</th>
                    <th className="table__heading" style={{ width: 120 }}>
                      Cantidad
                    </th>
                    <th className="table__heading" style={{ width: 140 }}>
                      Precio
                    </th>
                    <th className="table__heading" style={{ width: 140 }}>
                      Estado
                    </th>
                    <th className="table__heading">Cliente</th>
                    <th className="table__heading" style={{ width: 200 }}>
                      Creado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="table__cell mono">{order.id}</td>
                      <td className="table__cell">{order.product_name}</td>
                      <td className="table__cell">{order.quantity}</td>
                      <td className="table__cell mono">$ {order.price}</td>
                      <td className="table__cell">
                        <span className={`badge ${statusBadgeClass(order.status)}`}>
                          <span className="badge__dot"></span>
                          {statusLabel(order.status)}
                        </span>
                      </td>
                      <td className="table__cell">
                        <div style={{ fontWeight: 700 }}>
                          {order.customer_name ?? "-"}
                        </div>
                        <div className="field__helper">
                          {order.customer_address ?? ""}
                        </div>
                      </td>
                      <td className="table__cell">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button
                  className="btn btn--small"
                  type="button"
                  onClick={() => setPage(Math.max(1, meta.page - 1))}
                  disabled={isLoading || meta.page <= 1}
                >
                  Anterior
                </button>
                <div className="pagination__center">
                  Página <b>{meta.page}</b> de <b>{totalPages}</b>
                </div>
                <button
                  className="btn btn--small"
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, meta.page + 1))}
                  disabled={isLoading || meta.page >= totalPages}
                >
                  Siguiente
                </button>
              </div>
            </>
          ) : (
            <p className="footer-note">
              No hay pedidos para este cliente todavía. Crea uno nuevo para verlo
              aquí.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
