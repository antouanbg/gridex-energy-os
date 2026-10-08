import { test, expect } from '@playwright/test';

test('failed human check has a visible retry, and invalid form submission explains what is missing', async ({ page }) => {
  let challenges = 0;
  await page.route('**/gridex-config.js', route => route.fulfill({ contentType: 'application/javascript',
    body: `window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};` }));
  await page.route('https://api.example.invalid/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/contact/challenge') {
      challenges++;
      return challenges === 1 ? route.fulfill({ status: 503, json: { error: 'contact_unavailable' } })
        : route.fulfill({ json: { id: 'second', left: 4, right: 5, expiresInSeconds: 600 } });
    }
    return route.fulfill({ status: 503, json: { error: 'unavailable' } });
  });
  await page.goto('/demo/about/');
  const form = page.locator('#contact-enquiry');
  await expect(form).toContainText('Проверката не се зареди.');
  await expect(form.getByRole('button', { name: 'Изпрати запитване' })).toBeEnabled();
  await form.getByRole('button', { name: 'Изпрати запитване' }).click();
  await expect(form.locator('..').getByRole('alert')).toContainText('Въведете име');
  await form.getByRole('button', { name: 'Опитай проверката отново' }).click();
  await expect(form).toContainText('Проверка: колко е 4 + 5?');
  expect(challenges).toBe(2);
});

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
      expect(body).toMatchObject({ topic: 'Оферта за SunStorage Pro 261', email: 'visitor@example.invalid', replyEmail: 'visitor@example.invalid', answer: 9, challengeId: 'one-time' });
      sent++;
      return route.fulfill({ status: 202, json: { status: 'queued' } });
    }
    return route.fulfill({ status: 503, json: { error: 'unavailable' } });
  });
  await page.goto('/demo/about/');
  await expect(page.locator('.suntech-gallery-slide')).toHaveCount(2);
  await page.getByRole('button', { name: 'Следваща снимка' }).click();
  await expect(page.locator('.suntech-gallery-controls')).toContainText('2 / 2');
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

test('signed-in member can edit the reply address while retaining verified account identity', async ({ page, context }) => {
  let nonce = '';
  const jwt = (claims: object) => [Buffer.from('{}').toString('base64url'), Buffer.from(JSON.stringify(claims)).toString('base64url'), 'test'].join('.');
  await context.route('**/gridex-config.js', route => route.fulfill({ contentType: 'application/javascript',
    body: `window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};` }));
  await context.route('https://auth.example.invalid/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/auth')) {
      nonce = url.searchParams.get('nonce') || '';
      return route.fulfill({ status: 302, headers: { location: url.searchParams.get('redirect_uri') + '#code=fixture&state=' + url.searchParams.get('state') } });
    }
    const now = Math.floor(Date.now() / 1000);
    const claims = { sub: 'owner', iss: 'https://auth.example.invalid/auth/realms/gridex', aud: 'gridex-portal', iat: now, exp: now + 600,
      nonce, email: 'owner@example.invalid', email_verified: true };
    return route.fulfill({ json: { access_token: jwt(claims), id_token: jwt(claims), refresh_token: jwt(claims), expires_in: 600, token_type: 'Bearer' } });
  });
  let sent = 0;
  await context.route('https://api.example.invalid/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/auth/login-realm') return route.fulfill({ json: { realms: ['gridex'] } });
    if (path === '/api/v1/me') return route.fulfill({ json: { subject: 'owner', email: 'owner@example.invalid', name: 'Owner', roles: ['administrator'], permissions: [], memberships: [{organisationId:'own',role:'administrator',allSites:true}] } });
    if (path === '/api/v1/sites') return route.fulfill({ json: { sites: [] } });
    if (path === '/api/v1/contact/challenge') return route.fulfill({ json: { id: 'one-time', left: 4, right: 5, expiresInSeconds: 600 } });
    if (path === '/api/v1/contact/inquiries') {
      expect(route.request().postDataJSON()).toMatchObject({ email: 'owner@example.invalid', replyEmail: 'reply@example.invalid', answer: 9 });
      sent++;
      return route.fulfill({ status: 202, json: { status: 'queued' } });
    }
    return route.fulfill({ status: 503, json: { error: 'unavailable' } });
  });
  await page.goto('/demo/about/');
  await page.locator('.demo-sign-in').click();
  await page.getByLabel('Имейл', { exact: true }).fill('owner@example.invalid');
  await page.locator('.login-submit').click();
  await expect(page.locator('.profile small')).toHaveText('Администратор на организация');
  await page.goto('/about/');
  const form = page.locator('#contact-enquiry');
  const reply = form.getByRole('textbox', { name: 'Имейл за отговор' });
  await expect(reply).toHaveValue('owner@example.invalid');
  await reply.fill('reply@example.invalid');
  await form.getByRole('textbox', { name: 'Име', exact: true }).fill('Owner');
  await form.getByRole('textbox', { name: 'Тема' }).fill('Product question');
  await form.getByRole('textbox', { name: 'Вашето запитване' }).fill('Please send details about the system.');
  await form.getByRole('spinbutton').fill('9');
  await form.getByRole('button', { name: 'Изпрати запитване' }).click();
  await expect(form.getByRole('status')).toBeVisible();
  expect(sent).toBe(1);
});
