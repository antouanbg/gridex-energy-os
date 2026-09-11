import { expect, test, type Page } from "@playwright/test";

const sections = [
  "overview",
  "customers",
  "sites",
  "assets",
  "battery",
  "schedule",
  "market",
  "settlement",
  "automation",
  "loads",
  "balance",
  "gateway",
  "supported",
  "devices",
  "alarms",
  "reports",
  "settings",
  "plans",
  "about",
] as const;

const phoneWidths = [360, 390, 430] as const;

test.use({ timezoneId: "Europe/Sofia" });

async function openSection(page: Page, section: (typeof sections)[number]) {
  await page.locator(`[data-view-id="${section}"]`).evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.getByTestId(`section-${section}`)).toBeVisible();
  await expect(page.getByRole("status", { name: /зареждане|loading/i })).toHaveCount(0);
}

for (const width of phoneWidths) {
  test.describe(`${width}px mobile viewport`, () => {
    test.use({ viewport: { width, height: 900 }, isMobile: true, hasTouch: true });

    test(`all ${sections.length} portal sections stay inside the viewport`, async ({ page }) => {
      await page.goto("/");

      for (const section of sections) {
        await openSection(page, section);
        const overflow = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect.soft(
          Math.max(overflow.document, overflow.body),
          `${section} overflows at ${width}px`,
        ).toBeLessThanOrEqual(overflow.viewport + 1);
      }
    });
  });
}

test("all 19 sections render through the lazy module boundary", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");

  const seenTitles = new Set<string>();
  for (const section of sections) {
    await openSection(page, section);
    await expect(page.getByTestId("page-eyebrow")).not.toHaveText("");
    await expect(page.getByTestId("page-title")).not.toHaveText("");
    seenTitles.add(`${await page.getByTestId("page-eyebrow").innerText()}|${await page.getByTestId("page-title").innerText()}`);
  }

  expect(seenTitles.size).toBe(sections.length);
  expect(errors).toEqual([]);
});

test("navigation updates translated headings and interactive range values", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("page-title")).toHaveText("Соларен парк Изток");

  await page.getByRole("button", { name: "Language" }).click();
  await expect(page.getByTestId("page-title")).toHaveText("Solar Park East");

  await openSection(page, "automation");
  const firstRange = page.locator(".mode-range input[type=range]").first();
  const rangeValue = page.locator(".mode-range strong").first();
  const before = await rangeValue.innerText();
  await firstRange.focus();
  await firstRange.press("ArrowLeft");
  await expect(rangeValue).not.toHaveText(before);
});

test("uses English outside Bulgaria and remembers an explicit language choice", async ({ browser }) => {
  const foreignContext = await browser.newContext({ timezoneId: "Europe/London" });
  const foreignPage = await foreignContext.newPage();
  await foreignPage.goto("/");
  await expect(foreignPage.getByTestId("page-title")).toHaveText("Solar Park East");
  await foreignContext.close();

  const bgContext = await browser.newContext({ timezoneId: "Europe/Sofia" });
  const bgPage = await bgContext.newPage();
  await bgPage.goto("/");
  await expect(bgPage.getByTestId("page-title")).toHaveText("Соларен парк Изток");
  await bgPage.getByRole("button", { name: "Language" }).click();
  await expect(bgPage.getByTestId("page-title")).toHaveText("Solar Park East");
  await bgPage.reload();
  await expect(bgPage.getByTestId("page-title")).toHaveText("Solar Park East");
  await bgContext.close();
});
