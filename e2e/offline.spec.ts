import { expect, test } from "@playwright/test";
import { agenda, catalog, controlled, createHabit, openHabits, openToday, registerUser } from "./helpers";

test("opens and navigates offline with the last saved data and warns it may be stale (HU-19)", async ({ page, context }) => {
  await registerUser(page);
  await createHabit(page, { name: "Meditar" });
  await controlled(page);

  // Visit both screens online once with the worker in control, so their pages and data are saved.
  await openToday(page);
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toBeVisible();
  await openHabits(page);
  await expect(catalog(page).getByText("Meditar")).toBeVisible();
  await page.reload();
  await expect(catalog(page).getByText("Meditar")).toBeVisible();
  await openToday(page);
  await page.reload();
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);

  await context.setOffline(true);

  // CA-01: opens offline and still shows today's agenda. CA-02: with a stale-data warning.
  await page.reload();
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Sin conexión: puede que los datos no estén al día.");

  // Moving between screens offline keeps working (the router falls back to a full navigation).
  await page.getByRole("link", { name: "Hábitos" }).first().click();
  await expect(page.getByRole("heading", { name: "Mis hábitos" })).toBeVisible();
  await expect(catalog(page).getByText("Meditar")).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("a screen never opened before shows the offline notice instead of a browser error (HU-19)", async ({ page, context }) => {
  await registerUser(page);
  await controlled(page);
  await context.setOffline(true);
  const response = await page.goto("/habits");
  expect(response?.status()).toBe(503);
  await expect(page.getByRole("heading", { name: "Sin conexión" })).toBeVisible();
});

test("logging out deletes every saved copy of the user's data (HU-19)", async ({ page }) => {
  await registerUser(page);
  await createHabit(page, { name: "Meditar" });
  await controlled(page);
  await openToday(page);
  await page.reload();
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toBeVisible();
  expect(await page.evaluate(async () => (await caches.keys()).filter((n) => n.startsWith("hm-")).length)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Cerrar sesión" }).first().click();
  await expect(page).toHaveURL(/\/login/);
  expect(await page.evaluate(async () => (await caches.keys()).filter((n) => n.startsWith("hm-")))).toEqual([]);
});
