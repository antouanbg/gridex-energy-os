import { test, expect } from '@playwright/test';

test('super-admin Market stays visible with PostgreSQL ISO delivery date and on refresh', async ({ page }) => {
  let nonce = '';
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const jwt = (claims: object) => [Buffer.from('{}').toString('base64url'),
    Buffer.from(JSON.stringify(claims)).toString('base64url'), 'test'].join('.');
  await page.route('**/gridex-config.js', route => route.fulfill({ contentType: 'application/javascript', body:
    `window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};` }));
  await page.route('https://auth.example.invalid/**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/auth')) {
      nonce = url.searchParams.get('nonce') || '';
      return route.fulfill({ status: 302, headers: { location: url.searchParams.get('redirect_uri') + '#code=fixture&state=' + url.searchParams.get('state') } });
    }
    const now = Math.floor(Date.now() / 1000);
    const claims = { sub: 'platform-owner', iss: 'https://auth.example.invalid/auth/realms/gridex',
      aud: 'gridex-portal', iat: now, exp: now + 600, nonce };
    return route.fulfill({ json: { access_token: jwt(claims), id_token: jwt(claims),
      refresh_token: jwt(claims), expires_in: 600, token_type: 'Bearer' } });
  });
  await page.route('https://api.example.invalid/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/me')) return route.fulfill({ json: { subject: 'platform-owner', realm: 'gridex',
      roles: ['administrator'], permissions: ['platform:manage'], memberships: [] } });
    if (path.endsWith('/me/services')) return route.fulfill({ json: { services: [] } });
    if (path.endsWith('/me/grafana-launch')) return route.fulfill({ json: {
      url: 'https://api.example.invalid/grafana/launch?ticket=fixture', expiresInSeconds: 60,
    } });
    if (path.endsWith('/sites')) return route.fulfill({ json: { sites: [] } });
    if (path.endsWith('/market/status')) return route.fulfill({ json: { provider: 'ENTSO-E', zones: [{
      zone: 'BG', country: 'BG', status: 'partial', lastAttemptAt: new Date().toISOString(),
      lastSuccessAt: '2026-09-29T20:10:00.000Z',
      latestDeliveryDate: '2026-09-29T21:00:00.000Z', errorCode: null,
    }] } });
    if (path.endsWith('/platform/market/zones')) return route.fulfill({ json: { zones: [{ country: 'BG', zone: 'BG', enabled: true }] } });
    return route.fulfill({ status: 503, json: { error: 'unavailable' } });
  });
  await page.goto('/market/');
  await expect(page.getByRole('heading', { name: 'Пазарни данни' })).toBeVisible();
  await expect(page.getByText('30 септември 2026 г.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Проверките към ENTSO-E работят' })).toBeVisible();
  await expect(page.getByText(/ENTSO-E връща само част от интервалите/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Пазарни данни' })).toBeVisible();
  await expect(page.getByText('30 септември 2026 г.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Проверките към ENTSO-E работят' })).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.getByLabel('Период на графиката').selectOption('week');
  await page.getByRole('button',{name:'Покажи избрания период'}).click();
  await expect(page.getByTitle('Grafana дашборд за цени ден напред в България'))
    .toHaveAttribute('src',/range=week/);
  await page.getByLabel('Период на графиката').selectOption('custom');
  await page.getByLabel('От дата на доставка').fill('2026-09-30');
  await page.getByLabel('До дата на доставка').fill('2026-10-01');
  await page.getByRole('button',{name:'Покажи избрания период'}).click();
  await expect(page.getByTitle('Grafana дашборд за цени ден напред в България'))
    .toHaveAttribute('src',/range=custom.*fromDay=2026-09-30.*toDay=2026-10-01/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(pageErrors).toEqual([]);
});
