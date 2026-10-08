// @vitest-environment node
import { describe, expect, it } from "vitest";
import { checkHabitRequest, readHabitBody } from "./habit-request";

const origin = "https://habit-maxxing.vercel.app";
function request(headers: HeadersInit = {}, body = "{}") {
  return new Request("https://untrusted.example/api/habits", { method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body });
}

describe("habit request protection", () => {
  it("uses configured origin rather than request URL or forwarded headers", () => {
    expect(checkHabitRequest(request({ host: "evil.example", "x-forwarded-host": "evil.example" }), origin)).toBeNull();
    expect(checkHabitRequest(request({ origin: "https://evil.example", "x-forwarded-host": "habit-maxxing.vercel.app" }), origin)?.status).toBe(403);
  });
  it.each(["", "null", "https://evil.example", `${origin}, ${origin}`, `${origin}/`, `${origin}:443`, `https://user@habit-maxxing.vercel.app`])("rejects origin %s", (value) => {
    expect(checkHabitRequest(request({ origin: value }), origin)?.status).toBe(403);
  });
  it("rejects missing origin", () => {
    const req = request(); req.headers.delete("origin");
    expect(checkHabitRequest(req, origin)?.status).toBe(403);
  });
  it.each([undefined, "", "null", "https://*.vercel.app", `${origin}/path`, `${origin}?x=1`, `${origin}#x`, `https://user:pass@habit-maxxing.vercel.app`, "http://public.example", "https://example.com\\evil", "https://example.com/../", " https://example.com "]) ("fails closed for config %s", (config) => {
    expect(checkHabitRequest(request(), config)?.status).toBe(500);
  });
  it.each(["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000", origin, `${origin}/`])("accepts exact configured origin %s", (config) => {
    expect(checkHabitRequest(request({ origin: new URL(config).origin }), config)).toBeNull();
  });
  it.each(["text/plain", "", "application/json; charset=latin1", "application/json; x=1", "application/json, text/plain"]) ("rejects media type %s", (type) => {
    expect(checkHabitRequest(request({ "content-type": type }), origin)?.status).toBe(415);
  });
  it.each(["application/json", "application/json; charset=utf-8", "Application/JSON; Charset=UTF-8"]) ("accepts JSON %s", (type) => {
    expect(checkHabitRequest(request({ "content-type": type }), origin)).toBeNull();
  });
});

describe("bounded body reading", () => {
  it("rejects missing bodies", async () => {
    expect(await readHabitBody(new Request("https://example.com", { method: "POST" }))).toMatchObject({ error: { status: 400 } });
  });
  it("rejects invalid UTF-8 instead of replacing bytes", async () => {
    const body = new Uint8Array([123, 34, 120, 34, 58, 34, 255, 34, 125]);
    expect(await readHabitBody(new Request("https://example.com", { method: "POST", body }))).toMatchObject({ error: { status: 400 } });
  });
  it("rejects a failed body stream", async () => {
    const body = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("transport failed")); } });
    const req = new Request("https://example.com", { method: "POST", body, duplex: "half" } as RequestInit);
    expect(await readHabitBody(req)).toMatchObject({ error: { status: 400 } });
  });
  it("accepts exactly 8192 bytes", async () => {
    const result = await readHabitBody(request({}, `{"name":"${"x".repeat(8181)}"}`));
    expect(result).toHaveProperty("data");
  });
  it.each(["", "{", "null", "[]", "1", '"text"']) ("rejects malformed or nonobject JSON %s", async (body) => {
    expect(await readHabitBody(request({}, body))).toMatchObject({ error: { status: 400 } });
  });
  it.each<Record<string, string>>([{}, { "content-length": "1" }, { "content-length": "99999" }])("rejects overflow regardless of length %j", async (headers) => {
    expect(await readHabitBody(request(headers, "é".repeat(4097)))).toMatchObject({ error: { status: 413 } });
  });
  it("cancels a chunked stream after overflow", async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({ pull(controller) { controller.enqueue(new Uint8Array(5000)); }, cancel() { cancelled = true; } });
    const req = new Request("https://example.com", { method: "POST", body, duplex: "half" } as RequestInit);
    expect(await readHabitBody(req)).toMatchObject({ error: { status: 413 } });
    expect(cancelled).toBe(true);
  });
});
