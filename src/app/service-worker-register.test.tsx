import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ServiceWorkerRegister from "./service-worker-register";

const register = vi.fn().mockResolvedValue(undefined);
afterEach(() => { cleanup(); register.mockClear(); vi.unstubAllEnvs(); });

function withServiceWorker() {
  Object.defineProperty(window.navigator, "serviceWorker", { value: { register }, configurable: true });
}

describe("ServiceWorkerRegister", () => {
  it("registers /sw.js with root scope in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    withServiceWorker();
    render(<ServiceWorkerRegister />);
    expect(register).toHaveBeenCalledExactlyOnceWith("/sw.js", { scope: "/", updateViaCache: "none" });
  });

  it("does not register outside production, so dev hot reload never serves cached code", () => {
    vi.stubEnv("NODE_ENV", "development");
    withServiceWorker();
    render(<ServiceWorkerRegister />);
    expect(register).not.toHaveBeenCalled();
  });

  it("swallows a registration failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    register.mockRejectedValueOnce(new Error("blocked"));
    withServiceWorker();
    expect(() => render(<ServiceWorkerRegister />)).not.toThrow();
    await Promise.resolve();
  });
});
