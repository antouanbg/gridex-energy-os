import { test, expect } from '@playwright/test';

test('a customer realm in browser storage cannot select the platform login in another tab', async ({ context }) => {
  await context.route('**/gridex-config.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`,
  }));
  await context.route('https://auth.example.invalid/**', route => route.fulfill({
    contentType: 'text/html', body: '<h1>Identity sign-in</h1>',
  }));
  await context.route('https://api.example.invalid/api/v1/auth/login-realm',route=>route.fulfill({json:{realms:['novacom','gridex']}}));
  const customerTab = await context.newPage();
  await customerTab.goto('/login/?realm=novacom');
  await expect(customerTab.locator('.quick-sign-in')).toBeEnabled();
  expect(await customerTab.evaluate(() => sessionStorage.getItem('gridex.selected-realm'))).toBe('novacom');

  const platformTab = await context.newPage();
  await platformTab.addInitScript(() => localStorage.setItem('gridex.selected-realm', 'novacom'));
  await platformTab.goto('/login/');
  await expect(platformTab.locator('.quick-sign-in')).toBeEnabled();
  expect(await platformTab.evaluate(() => localStorage.getItem('gridex.selected-realm'))).toBeNull();
  expect(await platformTab.evaluate(() => sessionStorage.getItem('gridex.selected-realm'))).toBeNull();
  await platformTab.locator('.quick-sign-in').click();
  await expect(platformTab).toHaveURL(/\/login\/$/);
  await platformTab.getByLabel('Имейл',{exact:true}).fill('shared@example.invalid');
  await platformTab.getByRole('button',{name:/Продължи към защитения вход/}).click();
  await platformTab.getByRole('button',{name:'gridex',exact:true}).click();
  await expect(platformTab.getByRole('heading', { name: 'Identity sign-in' })).toBeVisible();
  expect(new URL(platformTab.url()).pathname).toBe('/auth/realms/gridex/protocol/openid-connect/auth');

  await customerTab.getByRole('link', { name: /основния GrideX акаунт/ }).click();
  await expect(customerTab).toHaveURL(/\/login\/\?realm=gridex$/);
  expect(await customerTab.evaluate(() => sessionStorage.getItem('gridex.selected-realm'))).toBe('gridex');
});
