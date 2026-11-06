// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET, generateStaticParams } from "./[variant]/route";

const call = (variant: string) => GET(new Request(`http://localhost/icons/${variant}`), { params: Promise.resolve({ variant }) });

async function pngSize(response: Response) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  expect(Array.from(bytes.slice(0, 8))).toEqual(signature);
  const view = new DataView(bytes.buffer);
  return [view.getUint32(16), view.getUint32(20)];
}

describe("PWA icon route", () => {
  it.each([["192", 192], ["512", 512], ["maskable", 512]])("serves a %s PNG of %i px", async (variant, size) => {
    const response = await call(variant);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(await pngSize(response)).toEqual([size, size]);
  });

  it("answers 404 for an unknown variant", async () => {
    expect((await call("64")).status).toBe(404);
  });

  it("prerenders exactly the known variants", () => {
    expect(generateStaticParams()).toEqual([{ variant: "192" }, { variant: "512" }, { variant: "maskable" }]);
  });
});
