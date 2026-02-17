export type Order = {
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

export type OrdersResponse = {
  data: Order[];
  meta: {
    page: number;
    per_page: number;
    total: number;
  };
};

export type CreateOrderPayload = {
  customer_id: number;
  product_name: string;
  quantity: number;
  price: number;
  status: string;
};

const baseUrl = process.env.NEXT_PUBLIC_ORDER_API_URL ?? "http://localhost:3001";

class ApiError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetchWithTimeout(`${baseUrl}${path}`, init);
  const contentType = response.headers?.get
    ? response.headers.get("Content-Type") ?? ""
    : "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = body?.error || "Error en la solicitud.";
    throw new ApiError(message, response.status, body?.details);
  }

  return body as T;
};

export const getOrders = (customerId: string, page: number, perPage = 20) => {
  const params = new URLSearchParams({
    customer_id: customerId,
    page: String(page),
    per_page: String(perPage)
  });
  return requestJson<OrdersResponse>(`/orders?${params.toString()}`);
};

export const createOrder = (payload: CreateOrderPayload) =>
  requestJson<Order>("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order: payload })
  });

export type { ApiError };
