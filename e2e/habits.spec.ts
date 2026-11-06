import { expect, test } from "@playwright/test";
import { agenda, catalog, createHabit, registerUser, reloadAgenda, todayIndex, weekdays } from "./helpers";

test("registers a new account and lands on the dashboard (S3)", async ({ page }) => {
  await registerUser(page);
  await expect(page.getByRole("heading", { name: "Agenda de hoy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Mis hábitos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  await expect(agenda(page).getByText("Crea tu primer hábito para comenzar")).toBeVisible();
});

test("creates a binary and a numeric habit, marks the binary one and registers 5 km (S3)", async ({ page }) => {
  await registerUser(page);
  await createHabit(page, { name: "Meditar" });
  await createHabit(page, { name: "Correr", unit: "km" });

  const list = catalog(page);
  await expect(list.getByText("Binario", { exact: true })).toBeVisible();
  await expect(list.getByText("Numérico · km")).toBeVisible();

  await reloadAgenda(page);
  const check = agenda(page).getByRole("button", { name: "Completar Meditar" });
  await expect(check).toHaveAttribute("aria-pressed", "false");
  await check.click();
  await expect(check).toHaveAttribute("aria-pressed", "true");

  await agenda(page).getByRole("spinbutton", { name: "Valor de Correr" }).fill("5");
  await agenda(page).getByRole("button", { name: "Registrar Correr" }).click();
  await expect(agenda(page).getByText("5 km", { exact: true })).toBeVisible();

  // The logs survive a reload (they were persisted, not only shown).
  await reloadAgenda(page);
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toHaveAttribute("aria-pressed", "true");
  await expect(agenda(page).getByText("5 km", { exact: true })).toBeVisible();
});

test("edits a habit from Mis hábitos and warns when removing a day that has a log (S3)", async ({ page }) => {
  await registerUser(page);
  await createHabit(page, { name: "Meditar" });
  await reloadAgenda(page);
  await agenda(page).getByRole("button", { name: "Completar Meditar" }).click();
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toHaveAttribute("aria-pressed", "true");

  await catalog(page).getByRole("button", { name: "Editar Meditar" }).click();
  const form = page.getByRole("form", { name: "Editar hábito" });
  await expect(form.getByLabel("Nombre", { exact: true })).toHaveValue("Meditar");
  await expect(form.getByText("Tipo: Binario")).toBeVisible();
  for (const day of weekdays) await expect(form.getByRole("checkbox", { name: day })).toBeChecked();

  await form.getByLabel("Nombre", { exact: true }).fill("Meditar 10 min");
  await form.getByRole("checkbox", { name: weekdays[todayIndex()] }).uncheck();
  await form.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Cambios guardados.")).toBeVisible();
  await expect(page.getByText(/Los registros de ese día no serán eliminados/)).toBeVisible();
  await expect(catalog(page).getByRole("link", { name: "Meditar 10 min" })).toBeVisible();
  // Today is no longer scheduled, so the habit leaves the agenda.
  await expect(agenda(page).getByText("No tienes hábitos programados para este día")).toBeVisible();
});

test("opens the detail page from the catalog and shows streak, completion and the day panel (S3)", async ({ page }) => {
  await registerUser(page);
  await createHabit(page, { name: "Meditar" });
  await reloadAgenda(page);
  await agenda(page).getByRole("button", { name: "Completar Meditar" }).click();
  await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toHaveAttribute("aria-pressed", "true");

  await catalog(page).getByRole("link", { name: "Meditar" }).click();
  await expect(page).toHaveURL(/\/habits\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "Meditar", level: 1 })).toBeVisible();
  await expect(page.getByText("Racha actual", { exact: true })).toBeVisible();
  await expect(page.getByText("Racha actual: 1 día")).toBeVisible();
  await expect(page.getByText("Cumplimiento mensual", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Actividad del mes" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Detalle del día" })).toHaveCount(0);

  // Buttons exist only for days up to today, so the last one is today.
  await page.getByRole("button", { name: /^\d+ de \p{L}+ de \d{4}: /u }).last().click();
  const panel = page.getByRole("region", { name: "Detalle del día" });
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Cumplido")).toBeVisible();
});

test("deletes a habit only after confirming; Cancelar keeps it (S3)", async ({ page }) => {
  await registerUser(page);
  await createHabit(page, { name: "Meditar" });
  await reloadAgenda(page);
  await expect(agenda(page).getByRole("heading", { name: "Meditar" })).toBeVisible();

  const dialog = page.getByRole("dialog", { name: "¿Estás seguro? Esta acción no se puede deshacer" });
  await catalog(page).getByRole("button", { name: "Eliminar Meditar" }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toBeHidden();
  await expect(catalog(page).getByRole("link", { name: "Meditar" })).toBeVisible();
  await expect(agenda(page).getByRole("heading", { name: "Meditar" })).toBeVisible();

  await catalog(page).getByRole("button", { name: "Eliminar Meditar" }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Eliminar" }).click();
  await expect(dialog).toBeHidden();
  await expect(catalog(page).getByRole("link", { name: "Meditar" })).toHaveCount(0);
  await expect(agenda(page).getByRole("heading", { name: "Meditar" })).toHaveCount(0);
  await expect(catalog(page).getByText("Crea tu primer hábito para comenzar")).toBeVisible();
});
