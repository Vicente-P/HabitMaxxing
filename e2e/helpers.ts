import { randomUUID } from "node:crypto";
import { expect, type Locator, type Page } from "@playwright/test";

export const PASSWORD = "Passw0rd-e2e-test";
export const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

export const agenda = (page: Page): Locator => page.getByRole("region", { name: "Agenda de hoy" });
export const catalog = (page: Page): Locator => page.getByRole("region", { name: "Mis hábitos" });

/** Index (0 = Sunday) of "today" as the server sees it: the app resolves the day in UTC. */
export const todayIndex = () => new Date().getUTCDay();

/** Registers a brand-new user through the UI and waits for the dashboard. Each test owns its user. */
export async function registerUser(page: Page): Promise<string> {
  const email = `e2e-${randomUUID()}@example.com`;
  await page.goto("/register");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Nombre (opcional)").fill("Usuario E2E");
  await page.getByLabel("Contraseña").fill(PASSWORD);
  await page.getByRole("button", { name: /^Crear cuenta/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  return email;
}

/** Creates a habit scheduled every day of the week, so "today" is always scheduled whatever the date. */
export async function createHabit(page: Page, habit: { name: string; unit?: string }) {
  const form = page.getByRole("form", { name: "Crear hábito" });
  await form.getByLabel("Nombre", { exact: true }).fill(habit.name);
  if (habit.unit !== undefined) {
    await form.getByLabel("Tipo").selectOption("NUMERIC");
    await form.getByLabel("Unidad").fill(habit.unit);
  }
  for (const day of weekdays) await form.getByRole("checkbox", { name: day }).check();
  await form.getByRole("button", { name: "Crear hábito" }).click();
  await expect(page.getByText("Hábito creado. Consulta Mis hábitos para verificarlo.")).toBeVisible();
  await expect(catalog(page).getByRole("link", { name: habit.name })).toBeVisible();
}

/** The agenda is fetched on load (creation only refreshes the catalog), so reload to see new habits there. */
export async function reloadAgenda(page: Page) {
  await page.reload();
  await expect(page.getByText("Cargando agenda…")).toBeHidden();
}

/** Page-level horizontal overflow: the document must not be wider than the viewport. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}
