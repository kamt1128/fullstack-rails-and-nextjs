"use client";

import Link from "next/link";
import { useState } from "react";
import { createOrder } from "../../../lib/api";

type FormState = {
  customer_id: string;
  product_name: string;
  quantity: string;
  price: string;
  status: string;
};

export default function NewOrderPage() {
  const [form, setForm] = useState<FormState>({
    customer_id: "1",
    product_name: "",
    quantity: "1",
    price: "",
    status: "created"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await createOrder({
        customer_id: Number(form.customer_id),
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
    <div className="layout">
      <section className="hero">
        <h1 className="hero__title">Crear pedido</h1>
        <p className="hero__text">
          Envía un nuevo pedido al Order Service. El servicio consultará al
          Customer Service para completar los datos del cliente y publicará el
          evento en RabbitMQ.
        </p>
        <div className="nav">
          <Link className="button" href="/orders">
            Volver al listado
          </Link>
          <Link className="button" href="/">
            Inicio
          </Link>
        </div>
      </section>

      <section className="panel form">
        <div className="form__field">
          <label className="form__label" htmlFor="customer">
            Customer ID
          </label>
          <input
            className="form__input"
            id="customer"
            value={form.customer_id}
            onChange={(event) => updateField("customer_id", event.target.value)}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="product">
            Producto
          </label>
          <input
            className="form__input"
            id="product"
            value={form.product_name}
            onChange={(event) => updateField("product_name", event.target.value)}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="quantity">
            Cantidad
          </label>
          <input
            className="form__input"
            id="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => updateField("quantity", event.target.value)}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="price">
            Precio
          </label>
          <input
            className="form__input"
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="status">
            Estado
          </label>
          <select
            className="form__select"
            id="status"
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            <option value="created">created</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div className="nav">
          <button
            className="button button--primary"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Crear pedido"}
          </button>
        </div>

        {message ? <p className="u-muted">{message}</p> : null}
        {error ? <p className="u-muted">{error}</p> : null}
      </section>
    </div>
  );
}
