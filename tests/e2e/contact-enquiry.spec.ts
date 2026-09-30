import { test, expect } from '@playwright/test';

for (const width of [390, 1280]) test(`demo enquiry submits only after human check at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  let sent = 0;
  await page.route('**/gridex-config.js', route => route.fulfill({ contentType: 'application/javascript',
    body: `window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};` }));
  await page.route('https://api.example.invalid/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/contact/challenge') return route.fulfill({ json: { id: 'one-time', left: 4, right: 5, expiresInSeconds: 600 } });
    if (path === '/api/v1/contact/inquiries') {
      const body = route.request().postDataJSON();
      expect(body).toMatchObject({ topic: 'Оферта за SunStorage Pro 261', answer: 9, challengeId: 'one-time' });
      sent++;
      return route.fulfill({ status: 202, json: { status: 'queued' } });
    }
    return route.fulfill({ status: 503, json: { error: 'unavailable' } });
  });
  await page.goto('/demo/about/');
  await page.getByRole('button', { name: 'Поискай оферта' }).click();
  const form = page.locator('#contact-enquiry');
  await expect(form.getByRole('heading', { name: 'Запитване от демото' })).toBeVisible();
  await form.getByRole('textbox', { name: 'Име', exact: true }).fill('Visitor');
  await form.getByRole('textbox', { name: 'Имейл за отговор' }).fill('visitor@example.invalid');
  await form.getByRole('textbox', { name: 'Вашето запитване' }).fill('Please send details about the system.');
  await form.getByRole('spinbutton').fill('9');
  await form.getByRole('button', { name: 'Изпрати запитване' }).click();
  await expect(form.getByRole('status')).toContainText('прието за изпращане');
  expect(sent).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
