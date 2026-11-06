import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OfflineBanner from "./offline-status";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const setOnline = (value: boolean) => vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(value);

describe("OfflineBanner", () => {
  it("renders nothing while online", () => {
    setOnline(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("warns that the data may be out of date when the app starts offline (CA-02)", () => {
    setOnline(false);
    render(<OfflineBanner />);
    expect(screen.getByRole("status")).toHaveTextContent("Sin conexión: puede que los datos no estén al día.");
  });

  it("appears and disappears as the connection changes", () => {
    const online = setOnline(true);
    render(<OfflineBanner />);
    online.mockReturnValue(false);
    act(() => { window.dispatchEvent(new Event("offline")); });
    expect(screen.getByRole("status")).toBeInTheDocument();
    online.mockReturnValue(true);
    act(() => { window.dispatchEvent(new Event("online")); });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
