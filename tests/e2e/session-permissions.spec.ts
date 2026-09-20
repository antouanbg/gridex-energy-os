import {test,expect} from '@playwright/test';

for(const loss of ['site','identity'] as const)test(`session rechecks roles and ${loss} access on resume`,async({page})=>{
  let nonce='',role='administrator',allowed=true;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await page.route('**/gridex-config.js',r=>r.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',r=>{
    const url=new URL(r.request().url());
    if(url.pathname.endsWith('/auth')){
      nonce=url.searchParams.get('nonce')!;
      return r.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});
    }
    const now=Math.floor(Date.now()/1000);
    const claims={sub:'owner',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,name:'Owner',email:'owner@example.invalid'};
    return r.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await page.route('https://api.example.invalid/**',r=>{
    const path=new URL(r.request().url()).pathname;
    if(path.endsWith('/me'))return !allowed&&loss==='identity'?r.fulfill({status:403,json:{error:'forbidden'}}):r.fulfill({json:{subject:'owner',roles:[role],permissions:[],memberships:[]}});
    if(path.endsWith('/sites'))return r.fulfill({json:{sites:allowed?[{id:'lab',name:'Private Lab'}]:[]}});
    if(path.endsWith('/hardware'))return r.fulfill({json:{inventorySource:'openremote',gateways:[{id:'rock',name:'Private ROCK',hardwareModel:'rock-pi-e',role:'controller',ports:[]}],devices:[]}});
    if(path.endsWith('/device-heartbeats'))return r.fulfill({json:{items:[]}});
    if(path.endsWith('/device-setup'))return r.fulfill({json:{revision:0,configuration:{}}});
    return r.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/sites/lab/devices/');
  await expect(page.getByRole('heading',{name:'Private ROCK',exact:true})).toBeVisible();
  await expect(page.locator('.profile small')).toHaveText('Администратор');
  role='customer';
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.locator('.profile small')).toHaveText('Клиент');
  allowed=false;
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await expect(page.locator('.quick-sign-in')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Private ROCK',exact:true})).toHaveCount(0);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','live');
  await expect(page.locator('.demo-mode-notice')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Private Lab');
});
