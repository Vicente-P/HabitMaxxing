import { expect, test, type Page } from "@playwright/test";
import { agenda, controlled, createHabit, openToday, registerUser } from "./helpers";

const check = (page: Page, name: string) => agenda(page).getByRole("button", { name: `Completar ${name}` });
const banner = (page: Page) => page.getByRole("status");

/** Registers a user, creates habits, loads Hoy online once with the worker in control, then cuts the network. */
async function goOffline(page: Page, context: { setOffline(value: boolean): Promise<void> }, habits: { name: string; unit?: string }[]) {
  await registerUser(page);
  for (const habit of habits) await createHabit(page, habit);
  await controlled(page);
  await openToday(page);
  await page.reload();
  await expect(agenda(page).getByRole("heading", { name: habits[0].name })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(agenda(page).getByRole("heading", { name: habits[0].name })).toBeVisible();
}

test("a habit marked offline shows at once, survives a reload and syncs when the connection returns (HU-20)", async ({ page, context }) => {
  await goOffline(page, context, [{ name: "Meditar" }]);

  // CA-01: the change is visible immediately and marked as pending.
  await check(page, "Meditar").click();
  await expect(check(page, "Meditar")).toHaveAttribute("aria-pressed", "true");
  await expect(agenda(page).getByText("Pendiente de sincronizar")).toBeVisible();
  await expect(banner(page)).toContainText("1 cambio pendiente de sincronizar.");

  // The queue lives in IndexedDB, so it survives a reload while still offline.
  await page.reload();
  await expect(check(page, "Meditar")).toHaveAttribute("aria-pressed", "true");
  await expect(agenda(page).getByText("Pendiente de sincronizar")).toBeVisible();

  // CA-02: back online it syncs by itself, with no duplicate and nothing unmarked.
  await context.setOffline(false);
  await expect(agenda(page).getByText("Pendiente de sincronizar")).toHaveCount(0);
  await expect(banner(page)).toHaveCount(0);
  await expect(check(page, "Meditar")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(check(page, "Meditar")).toHaveAttribute("aria-pressed", "true");
});

test("marking and unmarking offline keeps only the final state, so nothing is unmarked by the sync (HU-20)", async ({ page, context }) => {
  await goOffline(page, context, [{ name: "Meditar" }, { name: "Leer" }]);

  await check(page, "Meditar").click();
  await check(page, "Meditar").click();
  await check(page, "Leer").click();
  await expect(check(page, "Meditar")).toHaveAttribute("aria-pressed", "false");
  await expect(banner(page)).toContainText("2 cambios pendientes de sincronizar.");

  await context.setOffline(false);
  await expect(banner(page)).toHaveCount(0);
  await page.reload();
  await expect(check(page, "Meditar")).toHaveAttribute("aria-pressed", "false");
  await expect(check(page, "Leer")).toHaveAttribute("aria-pressed", "true");
});

test("a numeric value registered offline syncs when the connection returns (HU-20)", async ({ page, context }) => {
  await goOffline(page, context, [{ name: "Correr", unit: "km" }]);

  await agenda(page).getByRole("spinbutton", { name: "Valor de Correr" }).fill("5");
  await agenda(page).getByRole("button", { name: "Registrar Correr" }).click();
  await expect(agenda(page).getByText("5 km", { exact: true })).toBeVisible();
  await expect(agenda(page).getByText("Pendiente de sincronizar")).toBeVisible();

  await context.setOffline(false);
  await expect(banner(page)).toHaveCount(0);
  await page.reload();
  await expect(agenda(page).getByText("5 km", { exact: true })).toBeVisible();
});

test("logging out with unsynced changes warns first and only discards after a second confirmation (HU-20)", async ({ page, context }) => {
  await goOffline(page, context, [{ name: "Meditar" }]);
  await check(page, "Meditar").click();
  await expect(banner(page)).toContainText("1 cambio pendiente de sincronizar.");

  // Back online, but the server keeps failing, so the change stays pending.
  await page.route("**/api/habits/*/logs", (route) => route.request().method() === "POST" ? route.fulfill({ status: 503, body: "{}" }) : route.continue());
  await context.setOffline(false);
  await expect(banner(page)).toContainText("1 cambio pendiente de sincronizar.");

  const logout = page.getByRole("button", { name: "Cerrar sesión" }).first();
  await logout.click();
  await expect(page.getByRole("alert").filter({ hasText: "sin sincronizar" })).toContainText("Si cierras sesión se perderán.");
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("button", { name: "Cerrar sesión y descartar" }).first().click();
  await expect(page).toHaveURL(/\/login/);
});
