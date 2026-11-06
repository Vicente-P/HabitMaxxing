import { expect, test } from "@playwright/test";
import { agenda, catalog, createHabit, openToday, registerUser } from "./helpers";

// Regressions found by reviewing the E2E screenshots against the mockup (odd/tasks/e2e-playwright.md, L4).

test("the daily agenda shows a habit created on Hábitos as soon as you go to Hoy, without reloading", async ({ page }) => {
  await registerUser(page);
  await createHabit(page, { name: "Leer" });
  await openToday(page);
  await expect(agenda(page).getByRole("button", { name: "Completar Leer" })).toBeVisible();
});

test.describe("habit detail page", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await registerUser(page);
    await createHabit(page, { name: "Meditar" });
    await catalog(page).getByRole("link", { name: "Meditar" }).click();
    await expect(page.getByRole("heading", { name: "Meditar", level: 1 })).toBeVisible();
  });

  test("the flame icon of the current streak line is painted", async ({ page }) => {
    const icon = page.getByText(/^Racha actual: /).locator("xpath=..").locator("svg").first();
    await expect(icon).toBeVisible();
    const paint = await icon.evaluate((svg) => {
      const style = getComputedStyle(svg);
      return { fill: style.fill, strokeWidth: style.strokeWidth, stroke: style.stroke };
    });
    const painted = paint.fill !== "none" || (paint.stroke !== "none" && parseFloat(paint.strokeWidth) > 0);
    expect(painted, `fill=${paint.fill} stroke=${paint.stroke} stroke-width=${paint.strokeWidth}`).toBe(true);
  });

  test("the month grid spans the width of the Actividad card", async ({ page }) => {
    const card = page.getByRole("heading", { name: "Actividad del mes" }).locator("xpath=../..");
    const grid = card.locator("div.grid").first();
    const widths = await card.evaluate((element, gridElement) => {
      const style = getComputedStyle(element);
      const inner = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      return { inner, grid: (gridElement as HTMLElement).getBoundingClientRect().width };
    }, await grid.elementHandle());
    expect(widths.grid).toBeGreaterThanOrEqual(widths.inner * 0.95);
  });
});
