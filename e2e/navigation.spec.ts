import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { agenda, catalog, createHabit, expectNoHorizontalOverflow, mainNav, openHabits, openToday, registerUser } from "./helpers";

const shotsDir = "e2e/screenshots";
const viewports = [
  { width: 1280, height: 800 },
  { width: 375, height: 812 },
];

const sidebar = (page: Page) => page.getByRole("navigation", { name: "Navegación principal" });
const tabBar = (page: Page) => page.getByRole("navigation", { name: "Navegación móvil" });

async function shot(page: Page, name: string, width: number) {
  mkdirSync(shotsDir, { recursive: true });
  await page.screenshot({ path: `${shotsDir}/nav-${name}-${width}.png`, fullPage: true });
}

/** Shell checks shared by every page (S1, S2, S5): layout switch, no overflow, 44 px targets, nothing under the tab bar. */
async function expectShell(page: Page, width: number, current: "Hoy" | "Hábitos") {
  const desktop = width >= 1024;
  await expectNoHorizontalOverflow(page);

  if (desktop) {
    await expect(sidebar(page)).toBeVisible();
    await expect(tabBar(page)).toBeHidden();
    const aside = await page.getByRole("complementary").boundingBox();
    expect(aside?.width).toBe(232);
    await expect(page.getByRole("complementary").getByText("Usuario E2E")).toBeVisible();
  } else {
    await expect(sidebar(page)).toBeHidden();
    await expect(tabBar(page)).toBeVisible();
    await expect(page.getByRole("complementary")).toBeHidden();
  }

  await expect(mainNav(page).getByRole("link", { name: current })).toHaveAttribute("aria-current", "page");
  await expect(mainNav(page).locator("[aria-current]")).toHaveCount(1);

  const targets = [...(await mainNav(page).getByRole("link").all()), page.getByRole("button", { name: "Cerrar sesión" })];
  expect(targets.length).toBeGreaterThanOrEqual(3);
  for (const target of targets) {
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    expect(box, "shell target has a box").not.toBeNull();
    expect(box!.width, await target.innerText()).toBeGreaterThanOrEqual(44);
    expect(box!.height, await target.innerText()).toBeGreaterThanOrEqual(44);
  }

  if (!desktop) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const content = await page.locator("main").boundingBox();
    const create = await tabBar(page).getByRole("link", { name: "Crear hábito" }).boundingBox();
    const bar = await tabBar(page).boundingBox();
    expect(content && create && bar).toBeTruthy();
    expect(content!.y + content!.height).toBeLessThanOrEqual(Math.min(create!.y, bar!.y));
  }
}

for (const { width, height } of viewports) {
  test(`shell at ${width}px: Hoy, Hábitos and the detail (S1, S2, S4, S5)`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await registerUser(page);
    await createHabit(page, { name: "Meditar" });
    await createHabit(page, { name: "Correr", unit: "km" });

    await expectShell(page, width, "Hábitos");
    await shot(page, "habits", width);

    await openToday(page);
    await expect(agenda(page).getByRole("heading", { name: "Meditar" })).toBeVisible();
    await expectShell(page, width, "Hoy");
    await shot(page, "dashboard", width);

    await openHabits(page);
    await catalog(page).getByRole("link", { name: "Meditar" }).click();
    await expect(page.getByRole("heading", { name: "Actividad del mes" })).toBeVisible();
    await expectShell(page, width, "Hábitos");
    await shot(page, "detail", width);
  });
}

test("navigates Hoy ⇄ Hábitos with fresh data and from the detail back to Hábitos (S3)", async ({ page }) => {
  await registerUser(page);
  await expect(mainNav(page).getByRole("link", { name: "Hoy" })).toHaveAttribute("aria-current", "page");

  await openHabits(page);
  await expect(page.getByRole("form", { name: "Crear hábito" })).toBeVisible();
  await expect(catalog(page)).toBeVisible();
  await createHabit(page, { name: "Leer" });

  // Hoy shows the habit created a moment ago, without a reload.
  await openToday(page);
  await expect(agenda(page).getByRole("button", { name: "Completar Leer" })).toBeVisible();
  await expect(page.getByRole("form", { name: "Crear hábito" })).toHaveCount(0);

  await openHabits(page);
  await catalog(page).getByRole("link", { name: "Leer" }).click();
  await expect(page).toHaveURL(/\/habits\/[^/]+$/);
  await expect(mainNav(page).getByRole("link", { name: "Hábitos" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("link", { name: /Volver/ }).click();
  await expect(page).toHaveURL(/\/habits$/);
  await catalog(page).getByRole("link", { name: "Leer" }).click();
  await expect(page).toHaveURL(/\/habits\/[^/]+$/);
  await page.locator("main").getByRole("link", { name: "Hábitos", exact: true }).click();
  await expect(page).toHaveURL(/\/habits$/);
});

test("the mobile + button opens Hábitos and focuses Nombre (S3)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await registerUser(page);
  await tabBar(page).getByRole("link", { name: "Crear hábito" }).click();
  await expect(page).toHaveURL(/\/habits#crear-habito$/);
  await expect(page.getByLabel("Nombre", { exact: true })).toBeFocused();
});

test("Cerrar sesión in the shell ends the session; /habits needs a session (S1, S3)", async ({ page }) => {
  await registerUser(page);
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/habits");
  await expect(page).toHaveURL(/\/login/);
});
