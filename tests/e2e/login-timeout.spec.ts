import {test,expect} from '@playwright/test';

test('a stalled callback times out and a new sign-in can open the provider',async({page})=>{
  let attempts=0;
  await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,backendTimeoutMs:1000,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')) {
      attempts++;
      if(attempts>1)return route.fulfill({contentType:'text/html',body:'<h1>Retry sign-in</h1>'});
      return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')!+'#code=stalled&state='+url.searchParams.get('state')}});
    }
    return new Promise<void>(()=>{});
  });
  await page.goto('/');
  await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','demo');
  await page.locator('.quick-sign-in').click();
  await expect(page.getByRole('heading',{name:'Данните от акаунта са недостъпни'})).toBeVisible();
  await expect(page.locator('.demo-mode-notice')).toHaveCount(0);
  await expect(page.locator('.quick-sign-in')).toBeEnabled();
  await expect(page.locator('main')).not.toContainText('Свързване…');
  await page.locator('.quick-sign-in').click();
  await expect(page.getByRole('heading',{name:'Retry sign-in'})).toBeVisible();
});
