import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OrdersClient from "../app/orders/orders-client";
import { SWRConfig } from "swr";

describe("OrdersClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { page: 1, per_page: 20, total: 0 }
      })
    }) as jest.Mock;
  });

  it("loads orders when clicking search", async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <OrdersClient />
      </SWRConfig>
    );

    fireEvent.click(screen.getByRole("button", { name: /buscar pedidos/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/orders?customer_id=1&page=1&per_page=20",
        expect.any(Object)
      );
    });
  });
});
