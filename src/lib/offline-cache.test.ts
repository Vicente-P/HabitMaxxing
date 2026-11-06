import { afterEach, describe, expect, it, vi } from "vitest";
import { clearOfflineCaches, OFFLINE_CACHE_PREFIX } from "./offline-cache";

afterEach(() => vi.unstubAllGlobals());

describe("clearOfflineCaches", () => {
  it("deletes only the app's own caches, so no habit data survives a logout", async () => {
    const del = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("caches", { keys: vi.fn().mockResolvedValue([`${OFFLINE_CACHE_PREFIX}api-v1`, `${OFFLINE_CACHE_PREFIX}pages-v1`, "other-app"]), delete: del });
    await clearOfflineCaches();
    expect(del.mock.calls.map(([name]) => name)).toEqual([`${OFFLINE_CACHE_PREFIX}api-v1`, `${OFFLINE_CACHE_PREFIX}pages-v1`]);
  });

  it("does nothing when the Cache API is unavailable", async () => {
    vi.stubGlobal("caches", undefined);
    await expect(clearOfflineCaches()).resolves.toBeUndefined();
  });

  it("never throws, so a storage failure cannot block logout or login", async () => {
    vi.stubGlobal("caches", { keys: vi.fn().mockRejectedValue(new Error("denied")), delete: vi.fn() });
    await expect(clearOfflineCaches()).resolves.toBeUndefined();
  });
});
