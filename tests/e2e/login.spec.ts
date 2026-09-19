import { test, expect } from '@playwright/test';

for (const width of [390, 1280]) {
test(`one-click PKCE login at ${width}px without API health or hidden SSO`, async ({ page }) => {
  await page.setViewportSize({width,height:900});
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.route('**/gridex-config.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `window.__GRIDEX_CONFIG__ = { mode: 'auto', authEnabled: true,
      apiBaseUrl: 'https://api.example.invalid', realm: 'gridex',
      oidcIssuer: 'https://auth.example.invalid/auth/realms/gridex',
      oidcClientId: 'gridex-portal' };`,
  }));
  await page.route('https://auth.example.invalid/**', route => route.fulfill({
    contentType: 'text/html', body: '<h1>Identity provider sign-in</h1>',
  }));
  await page.goto('/');
  const login = page.locator('.quick-sign-in');
  await expect(login).toBeEnabled();
  await expect(page.locator('.header-actions .backend-badge')).toHaveCount(0);
  await expect(page.locator('.header-actions .open-source-badge')).toHaveCount(0);
  await expect(page.getByLabel('Работна роля',{exact:true})).toHaveCount(0);
  await expect(page.getByLabel('Период',{exact:true})).toHaveCount(0);
  expect(requests.filter(url => /\/health|3p-cookies|login-status-iframe|silent-check-sso/.test(url))).toEqual([]);
  await login.click();
  await expect(page.getByRole('heading', { name: 'Identity provider sign-in' })).toBeVisible();
  const redirect = new URL(page.url());
  expect(redirect.origin).toBe('https://auth.example.invalid');
  expect(redirect.searchParams.get('client_id')).toBe('gridex-portal');
  expect(redirect.searchParams.get('response_type')).toBe('code');
  expect(redirect.searchParams.get('code_challenge_method')).toBe('S256');
  expect(redirect.searchParams.get('code_challenge')).toHaveLength(43);
  expect(redirect.searchParams.get('state')).toBeTruthy();
  expect(redirect.searchParams.get('nonce')).toBeTruthy();
});
}
