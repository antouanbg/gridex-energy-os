import {test,expect} from '@playwright/test';

for (const status of [403,503]) {
  test(`successful identity with API ${status} never falls back to demo`,async({page})=>{
    let nonce='';
    const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
    await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
    await page.route('https://auth.example.invalid/**',route=>{
      const url=new URL(route.request().url());
      if(url.pathname.endsWith('/auth')) {
        nonce=url.searchParams.get('nonce')!;
        return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')!+'#code=test&state='+url.searchParams.get('state')}});
      }
      const now=Math.floor(Date.now()/1000);
      const claims={sub:'test-user',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'test@example.invalid'};
      return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
    });
    await page.route('https://api.example.invalid/**',route=>route.fulfill({status,json:{error:'unavailable'}}));
    await page.goto('/');
    await page.locator('.quick-sign-in').click();
    await expect(page.getByRole('heading',{name:'Данните от акаунта са недостъпни'})).toBeVisible();
    for(const view of ['overview','sites','market','devices']) {
      await page.locator(`[data-view-id="${view}"]`).click();
      await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','live');
      await expect(page.locator('.demo-mode-notice')).toHaveCount(0);
      await expect(page.locator('.nav-badge')).toHaveCount(0);
      await expect(page.locator('main')).not.toContainText('Solar Park East');
      await expect(page.locator('main')).not.toContainText('248.6');
    }
  });
}
