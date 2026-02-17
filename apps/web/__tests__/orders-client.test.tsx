import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import OrdersClient from "../app/orders/orders-client";

jest.mock("next/link", () => {
  return ({ children }: { children: ReactNode }) => children;
});

describe("OrdersClient", () => {
  beforeEach(() => {
    const createJsonResponse = (data: unknown) =>
      ({
        ok: true,
        json: async () => data
      } as Response);

    const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn(
      async (input: RequestInfo | URL) => {
        const url = input.toString();

        if (url.includes("/customers")) {
          return createJsonResponse({
            data: [{ id: 1, customer_name: "Ana Morales" }]
          });
        }

        return createJsonResponse({
          data: [],
          meta: { page: 1, per_page: 20, total: 0 }
        });
      }
    );

    global.fetch = fetchMock;
  });

  it("loads orders when clicking search", async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <OrdersClient />
      </SWRConfig>
    );

    await screen.findByText("1 - Ana Morales");

    fireEvent.click(screen.getByRole("button", { name: /buscar pedidos/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/orders?customer_id=1&page=1&per_page=20",
        expect.any(Object)
      );
    });
  });
});
