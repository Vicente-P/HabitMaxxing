import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { init, sync } = vi.hoisted(() => ({ init: vi.fn(), sync: vi.fn() }));
vi.mock("@/lib/offline-logs/pending-runtime", () => ({ pendingRuntime: { init, sync } }));
import OfflineSync from "./offline-sync";

afterEach(() => { cleanup(); vi.resetAllMocks(); vi.restoreAllMocks(); });

const setVisibility = (state: DocumentVisibilityState) => vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("OfflineSync", () => {
  it("renders nothing", () => {
    init.mockResolvedValue(undefined);
    const { container } = render(<OfflineSync ownerId="u1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("initializes the queue for the owner and then syncs on mount", async () => {
    const order: string[] = [];
    init.mockImplementation(async () => { await Promise.resolve(); order.push("init"); });
    sync.mockImplementation(async () => { order.push("sync"); });
    render(<OfflineSync ownerId="u1" />);
    await flush();
    expect(init).toHaveBeenCalledExactlyOnceWith("u1");
    expect(order).toEqual(["init", "sync"]);
  });

  it("syncs when the connection comes back", async () => {
    init.mockResolvedValue(undefined);
    render(<OfflineSync ownerId="u1" />);
    await flush();
    sync.mockClear();
    window.dispatchEvent(new Event("online"));
    expect(sync).toHaveBeenCalledOnce();
  });

  it("syncs when the page becomes visible but not when it becomes hidden", async () => {
    init.mockResolvedValue(undefined);
    render(<OfflineSync ownerId="u1" />);
    await flush();
    sync.mockClear();
    const visibility = setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(sync).not.toHaveBeenCalled();
    visibility.mockReturnValue("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(sync).toHaveBeenCalledOnce();
  });

  it("removes its listeners on unmount", async () => {
    init.mockResolvedValue(undefined);
    const view = render(<OfflineSync ownerId="u1" />);
    await flush();
    view.unmount();
    sync.mockClear();
    setVisibility("visible");
    window.dispatchEvent(new Event("online"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(sync).not.toHaveBeenCalled();
  });

  it("does not sync after unmounting before init finishes", async () => {
    let finishInit!: () => void;
    init.mockImplementation(() => new Promise<void>((resolve) => { finishInit = resolve; }));
    const view = render(<OfflineSync ownerId="u1" />);
    view.unmount();
    finishInit();
    await flush();
    expect(sync).not.toHaveBeenCalled();
  });
});
