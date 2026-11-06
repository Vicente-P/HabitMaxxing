import { expect, test } from "@playwright/test";

test("the login page links an installable manifest, reachable without a session (PWA)", async ({ page, request }) => {
  await page.goto("/login");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", /manifest\.webmanifest/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#0F0F11");
  await expect(page.locator('meta[name="mobile-web-app-capable"], meta[name="apple-mobile-web-app-capable"]').first()).toHaveAttribute("content", "yes");

  const response = await request.get("/manifest.webmanifest");
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest).toMatchObject({ display: "standalone", start_url: "/dashboard", short_name: "HabitMaxxing" });

  for (const icon of manifest.icons as { src: string }[]) {
    const image = await request.get(icon.src);
    expect(image.status(), icon.src).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
  }
  expect((await request.get("/apple-icon")).status()).toBe(200);
});
