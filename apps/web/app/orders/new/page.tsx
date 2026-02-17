"use client";

import Link from "next/link";
import { useState } from "react";

const baseUrl = process.env.NEXT_PUBLIC_ORDER_API_URL ?? "http://localhost:3001";

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
      const response = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            customer_id: Number(form.customer_id),
            product_name: form.product_name,
            quantity: Number(form.quantity),
            price: Number(form.price),
            status: form.status
          }
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo crear el pedido.");
      }

      setMessage("Pedido creado y evento publicado.");
      setForm((prev) => ({ ...prev, product_name: "", price: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Crear pedido</h1>
        <p>
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

      <section className="card grid">
        <div className="field">
          <label htmlFor="customer">Customer ID</label>
          <input
            id="customer"
            value={form.customer_id}
            onChange={(event) => updateField("customer_id", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="product">Producto</label>
          <input
            id="product"
            value={form.product_name}
            onChange={(event) => updateField("product_name", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="quantity">Cantidad</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={(event) => updateField("quantity", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="price">Precio</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select
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
          <button className="button primary" onClick={submit} disabled={loading}>
            {loading ? "Enviando..." : "Crear pedido"}
          </button>
        </div>

        {message ? <p className="muted">{message}</p> : null}
        {error ? <p className="muted">{error}</p> : null}
      </section>
    </div>
  );
}
