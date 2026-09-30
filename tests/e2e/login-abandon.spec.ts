import {test,expect} from '@playwright/test';

for(const width of [390,1280])test(`unfinished login returns to demo without refresh at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  const identityRequests:string[]=[];
  await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',route=>{identityRequests.push(route.request().url());return route.abort();});
  await page.goto('/demo/');
  await page.locator('.demo-sign-in').click();
  await expect(page).toHaveURL(/\/login\/$/);
  const email=page.getByLabel('Имейл',{exact:true});
  const box=await email.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeLessThan(550);
  if(width<681)await page.locator('.mobile-menu-toggle').click();
  await expect(page.locator('[data-view-id="battery"]')).toHaveAttribute('href','/demo/battery/');
  await page.locator('[data-view-id="battery"]').click();
  await expect(page).toHaveURL(/\/demo\/battery\/$/);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','demo');
  await expect(page.getByTestId('section-battery')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Данните от акаунта са недостъпни'})).toHaveCount(0);
  expect(identityRequests).toEqual([]);
  await page.locator('.demo-sign-in').click();
  await page.locator('.login-demo-return').click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByTestId('section-overview')).toBeVisible();
});
