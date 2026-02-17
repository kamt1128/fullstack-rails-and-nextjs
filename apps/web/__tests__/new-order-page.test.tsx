import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NewOrderPage from "../app/orders/new/page";

jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

describe("NewOrderPage", () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    }) as jest.Mock;
  });

  it("submits order payload", async () => {
    render(<NewOrderPage />);

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
