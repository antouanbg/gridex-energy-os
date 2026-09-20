import {test,expect} from '@playwright/test';

test('deep link, refresh, SSO restore, history, release re-login and explicit logout',async({page})=>{
  let signedIn=true,nonce='',forceLogins=0,logins=0,serverRestart=false;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await page.route('**/gridex-config.js',r=>r.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',r=>{
    const url=new URL(r.request().url());
    if(url.pathname.endsWith('/auth')) {
      nonce=url.searchParams.get('nonce')!;
      if(url.searchParams.get('prompt')==='login'){forceLogins++;signedIn=true;}
      if(url.searchParams.get('prompt')!=='none')logins++;
      return r.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#'+(signedIn?'code=fixture':'error=login_required')+'&state='+url.searchParams.get('state')}});
    }
    if(url.pathname.endsWith('/logout')) {signedIn=false;return r.fulfill({status:302,headers:{location:url.searchParams.get('post_logout_redirect_uri')!}});}
    const now=Math.floor(Date.now()/1000);
    const claims={sub:'owner',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce};
    return r.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await page.route('https://api.example.invalid/**',r=>{
    const path=new URL(r.request().url()).pathname;
    if(serverRestart&&forceLogins<2)return r.fulfill({status:401,json:{error:'reauthentication_required'}});
    if(path.endsWith('/me'))return r.fulfill({json:{subject:'owner',roles:['administrator'],permissions:[],memberships:[]}});
    if(path.endsWith('/sites'))return r.fulfill({json:{sites:[{id:'lab',name:'Lab'}]}});
    if(path.endsWith('/hardware'))return r.fulfill({json:{gateways:[{id:'rock',name:'ROCK',hardwareModel:'rock-pi-e',role:'controller',ports:[]}],devices:[]}});
    if(path.endsWith('/device-heartbeats'))return r.fulfill({json:{items:[]}});
    if(path.endsWith('/device-setup'))return r.fulfill({json:{revision:0,configuration:{}}});
    return r.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/sites/lab/devices/');
  await expect(page.getByRole('heading',{name:'ROCK',exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/sites\/lab\/devices\/$/);
  await page.reload();
  await expect(page.getByRole('heading',{name:'ROCK',exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/sites\/lab\/devices\/$/);
  expect(logins).toBe(0);
  await page.getByTestId('mode-link').click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','demo');
  await page.locator('[data-view-id="devices"]').click();
  await expect(page).toHaveURL(/\/demo\/devices\/$/);
  await expect(page.locator('main')).not.toContainText('LIVE ·');
  await page.getByTestId('mode-link').click();
  await expect(page).toHaveURL(/\/sites\/lab\/devices\/$/);
  await expect(page.getByRole('heading',{name:'ROCK',exact:true})).toBeVisible();
  expect(logins).toBe(0);
  await expect(page.locator('[data-view-id="battery"]')).toHaveAttribute('href','/sites/lab/battery/');
  await page.locator('[data-view-id="market"]').click();
  await expect(page).toHaveURL(/\/market\/$/);
  await page.goBack();
  await expect(page.getByRole('heading',{name:'ROCK',exact:true})).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('gridex.session-release','old-release'));
  await page.reload();
  await expect(page.getByRole('heading',{name:'ROCK',exact:true})).toBeVisible();
  expect(forceLogins).toBe(1);
  serverRestart=true;
  await page.reload();
  await expect(page.getByRole('heading',{name:'ROCK',exact:true})).toBeVisible();
  expect(forceLogins).toBe(2);
  await expect(page).toHaveURL(/\/sites\/lab\/devices\/$/);
  await page.locator('.profile').click();
  await page.locator('.account-menu-logout').click();
  await expect(page.locator('.quick-sign-in')).toBeVisible();
  await page.reload();
  await expect(page.locator('.quick-sign-in')).toBeVisible();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.locator('.demo-mode-notice')).toBeVisible();
  expect(forceLogins).toBe(2);
});
