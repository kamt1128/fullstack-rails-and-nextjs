"use client";

import Link from "next/link";
import { useState } from "react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { createOrder } from "../../../lib/api";

const customerBaseUrl =
  process.env.NEXT_PUBLIC_CUSTOMER_API_URL ?? "http://localhost:3002";

type FormState = {
  product_name: string;
  quantity: string;
  price: string;
  status: string;
};

type Customer = {
  id: number;
  customer_name: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const statusOptions: SelectOption[] = [
  { value: "created", label: "Creado" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Enviado" },
  { value: "cancelled", label: "Cancelado" }
];

export default function NewOrderPage() {
  const [form, setForm] = useState<FormState>({
    product_name: "",
    quantity: "1",
    price: "",
    status: "created"
  });
  const [selectedCustomer, setSelectedCustomer] =
    useState<SelectOption | null>(null);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [customersError, setCustomersError] = useState("");

  const customerId = selectedCustomer?.value ?? "";
  const menuPortalTarget =
    typeof window === "undefined" ? undefined : document.body;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

      setCustomerOptions(options);

      if (!selectedCustomer && options.length > 0 && !inputValue.trim()) {
        setSelectedCustomer(options[0]);
      }

      return options;
    } catch (err) {
      setCustomersError(err instanceof Error ? err.message : "Error inesperado.");
      setCustomerOptions([]);
      return [];
    }
  };

  const submit = async () => {
    const fallbackCustomerId =
      customerId || (customerOptions[0]?.value ?? "");

    if (!fallbackCustomerId) {
      setError("Debes seleccionar un cliente.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await createOrder({
        customer_id: Number(fallbackCustomerId),
        product_name: form.product_name,
        quantity: Number(form.quantity),
        price: Number(form.price),
        status: form.status
      });

      setMessage("Pedido creado y evento publicado.");
      setForm((prev) => ({ ...prev, product_name: "", price: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container order-form">
      <section className="hero order-form__hero">
        <div className="hero__inner">
          <div className="hero__top">
            <div className="hero__brand">
              <h1 className="hero__title">Crear pedido</h1>
              <p className="hero__subtitle">
                Envía un nuevo pedido al Order Service. El servicio consultará al
                Customer Service para completar los datos del cliente y publicará
                el evento en RabbitMQ.
              </p>
            </div>
            <div>
              <span className="pill">
                <span className="kbd">UI</span> Formulario · Validación básica
              </span>
            </div>
          </div>

          <div className="nav" style={{ marginTop: 16 }}>
            <Link className="btn" href="/orders">
              <svg className="icon" aria-hidden="true">
                <use href="#i-list" />
              </svg>
              Volver al listado
            </Link>
            <Link className="btn" href="/">
              <svg className="icon" aria-hidden="true">
                <use href="#i-home" />
              </svg>
              Inicio
            </Link>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">Nuevo pedido</h2>
            <span className="pill">
              <span className="kbd">POST</span> <span className="mono">/orders</span>
            </span>
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
                    setSelectedCustomer(option as SelectOption | null)
                  }
                  noOptionsMessage={() => "Sin resultados"}
                />
              </div>

              {customersError ? (
                <span className="field__helper">{customersError}</span>
              ) : null}

              <div className="field">
                <label className="field__label" htmlFor="product">
                  Producto
                </label>
                <input
                  className="field__control"
                  id="product"
                  value={form.product_name}
                  onChange={(event) =>
                    updateField("product_name", event.target.value)
                  }
                  placeholder="Ej: Teclado mecánico"
                />
              </div>

              <div className="form__row">
                <div className="field">
                  <label className="field__label" htmlFor="quantity">
                    Cantidad
                  </label>
                  <input
                    className="field__control"
                    id="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) =>
                      updateField("quantity", event.target.value)
                    }
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="price">
                    Precio
                  </label>
                  <input
                    className="field__control"
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    placeholder="Ej: 2000"
                  />
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="status">
                  Estado
                </label>
                <Select
                  inputId="status"
                  className="select"
                  classNamePrefix="select"
                  menuPortalTarget={menuPortalTarget}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  options={statusOptions}
                  value={statusOptions.find((option) => option.value === form.status)}
                  onChange={(option) =>
                    updateField("status", (option as SelectOption).value)
                  }
                />
                <span className="field__helper">
                  El estado inicial normalmente es <span className="mono">created</span>.
                </span>
              </div>

              <div className="form__actions">
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={submit}
                  disabled={loading}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-plus" />
                  </svg>
                  {loading ? "Enviando..." : "Crear pedido"}
                </button>
                <Link className="btn" href="/orders">
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-list" />
                  </svg>
                  Volver al listado
                </Link>
              </div>

              {message ? <p className="footer-note">{message}</p> : null}
              {error ? <p className="footer-note">{error}</p> : null}
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h2 className="card__title">Qué pasa al enviar</h2>
            <span className="badge">
              <span className="badge__dot"></span> Async
            </span>
          </div>
          <div className="card__divider"></div>
          <div className="card__body">
            <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "var(--muted)", lineHeight: 1.8 }}>
              <li>
                Order Service consulta Customer Service para enriquecer{" "}
                <span className="mono">customer_name</span> y dirección.
              </li>
              <li>
                Se publica el evento <span className="mono">orders.created</span>{" "}
                en RabbitMQ.
              </li>
              <li>
                El listado por cliente refleja la nueva orden (consistencia
                eventual).
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="footer-note">
        Tip: usa <span className="kbd">Tab</span> para navegar los campos.
      </div>
    </div>
  );
}
