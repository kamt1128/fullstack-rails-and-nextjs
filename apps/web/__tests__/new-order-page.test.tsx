import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NewOrderPage from "../app/orders/new/page";

jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

describe("NewOrderPage", () => {
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

        return createJsonResponse({});
      }
    );

    global.fetch = fetchMock;
  });

  it("submits order payload", async () => {
    render(<NewOrderPage />);

    await screen.findByText("1 - Ana Morales");

    fireEvent.change(screen.getByLabelText(/producto/i), {
      target: { value: "Tablet" }
    });
    fireEvent.change(screen.getByLabelText(/precio/i), {
      target: { value: "199.99" }
    });

    fireEvent.click(screen.getByRole("button", { name: /crear pedido/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
