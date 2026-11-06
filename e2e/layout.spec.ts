import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { agenda, catalog, createHabit, expectNoHorizontalOverflow, openHabits, openToday, registerUser } from "./helpers";

const viewports = [
  { width: 1280, height: 800 },
  { width: 375, height: 812 },
];
const shotsDir = "e2e/screenshots";

async function shot(page: Page, name: string, width: number) {
  await page.screenshot({ path: `${shotsDir}/${name}-${width}.png`, fullPage: true });
}

for (const { width, height } of viewports) {
  test(`layout and screenshots at ${width}px: Hoy, edit mode, delete dialog, detail (S4, S5)`, async ({ page }) => {
    mkdirSync(shotsDir, { recursive: true });
    await page.setViewportSize({ width, height });
    await registerUser(page);
    await createHabit(page, { name: "Meditar" });
    await createHabit(page, { name: "Correr", unit: "km" });
    await openToday(page);
    await agenda(page).getByRole("button", { name: "Completar Meditar" }).click();
    await expect(agenda(page).getByRole("button", { name: "Completar Meditar" })).toHaveAttribute("aria-pressed", "true");
    await agenda(page).getByRole("spinbutton", { name: "Valor de Correr" }).fill("5");
    await agenda(page).getByRole("button", { name: "Registrar Correr" }).click();
    await expect(agenda(page).getByText("5 km", { exact: true })).toBeVisible();

    // Dashboard (Hoy)
    await expectNoHorizontalOverflow(page);
    await shot(page, "dashboard", width);

    // Edit mode (Hábitos)
    await openHabits(page);
    await catalog(page).getByRole("button", { name: "Editar Correr" }).click();
    await expect(page.getByRole("form", { name: "Editar hábito" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await shot(page, "edit-mode", width);
    await page.getByRole("button", { name: "Cancelar edición" }).click();
    await expect(page.getByRole("form", { name: "Crear hábito" })).toBeVisible();

    // Delete dialog: visible, inside the viewport, and its buttons usable.
    await catalog(page).getByRole("button", { name: "Eliminar Correr" }).click();
    const dialog = page.getByRole("dialog", { name: "¿Estás seguro? Esta acción no se puede deshacer" });
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await expectNoHorizontalOverflow(page);
    await expect(dialog.getByRole("button", { name: "Eliminar" })).toBeInViewport();
    await shot(page, "delete-dialog", width);
    await dialog.getByRole("button", { name: "Cancelar" }).click(); // usable: closes the dialog
    await expect(dialog).toBeHidden();

    // Detail page
    await catalog(page).getByRole("link", { name: "Meditar" }).click();
    await expect(page.getByRole("heading", { name: "Actividad del mes" })).toBeVisible();
    await page.getByRole("button", { name: /^\d+ de \p{L}+ de \d{4}: /u }).last().click();
    await expect(page.getByRole("region", { name: "Detalle del día" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await shot(page, "detail", width);
  });
}
