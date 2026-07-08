import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker";

describe("registerServiceWorker", () => {
  it("does nothing when service workers are unsupported", () => {
    expect(() => registerServiceWorker({ navigator: {} })).not.toThrow();
  });

  it("registers the app service worker when supported", () => {
    const register = vi.fn().mockResolvedValue(undefined);

    registerServiceWorker({
      navigator: {
        serviceWorker: {
          register,
        },
      },
    });

    expect(register).toHaveBeenCalledWith("/service-worker.js");
  });
});
