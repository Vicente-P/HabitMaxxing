import { expect, test } from "@playwright/test";
import { registerUser } from "./helpers";

const html = (page: import("@playwright/test").Page) => page.locator("html");

test("switches to light, keeps it after a reload and goes back to dark (HU-16)", async ({ page }) => {
  await registerUser(page);
  await expect(html(page)).not.toHaveAttribute("data-hm-theme", "light");
  const darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  await page.getByRole("button", { name: "Cambiar a modo claro" }).click();
  await expect(html(page)).toHaveAttribute("data-hm-theme", "light");
  // Every element transitions colors for 200 ms, so poll until the light background settles.
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(darkBg);

  await page.reload();
  await expect(html(page)).toHaveAttribute("data-hm-theme", "light");
  await expect(page.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeVisible();

  await page.getByRole("button", { name: "Cambiar a modo oscuro" }).click();
  await expect(html(page)).toHaveAttribute("data-hm-theme", "dark");
  await page.reload();
  await expect(html(page)).toHaveAttribute("data-hm-theme", "dark");
});

test("mobile exposes the toggle on Hábitos only (HU-16)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await registerUser(page);
  await expect(page.getByRole("button", { name: /Cambiar a modo/ })).toBeHidden();
  await page.getByRole("link", { name: "Hábitos" }).click();
  await page.getByRole("button", { name: "Cambiar a modo claro" }).click();
  await expect(html(page)).toHaveAttribute("data-hm-theme", "light");
});
