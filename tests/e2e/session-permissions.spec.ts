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
  if(loss==='identity')await expect(page.locator('.quick-sign-in')).toBeVisible();
  else await expect(page.locator('.profile small')).toHaveText('Клиент');
  await expect(page.getByRole('heading',{name:'Private ROCK',exact:true})).toHaveCount(0);
  await expect(page.locator('.app-shell')).toHaveAttribute('data-mode',loss==='identity'?'demo':'live');
  if(loss==='identity')await expect(page).toHaveURL(/\/demo\/$/);
  else await expect(page.locator('.demo-mode-notice')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Private Lab');
});

test('a temporary API failure clears without manual refresh or losing the signed-in viewer',async({page})=>{
  let nonce='',failMe=1,failResume=false;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await page.route('**/gridex-config.js',r=>r.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',r=>{
    const url=new URL(r.request().url());
    if(url.pathname.endsWith('/auth')){nonce=url.searchParams.get('nonce')!;return r.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});}
    const now=Math.floor(Date.now()/1000);
    const claims={sub:'viewer',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,name:'Viewer',email:'viewer@example.invalid'};
    return r.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await page.route('https://api.example.invalid/**',r=>{
    const path=new URL(r.request().url()).pathname;
    if(path.endsWith('/me')){
      if(failMe-->0||failResume)return r.fulfill({status:503,json:{error:'temporarily_unavailable'}});
      return r.fulfill({json:{subject:'viewer',roles:['viewer'],permissions:['site:read'],memberships:[{organisationId:'org',role:'viewer',allSites:false}]}});
    }
    if(path.endsWith('/sites'))return r.fulfill({json:{sites:[]}});
    return r.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/overview/');
  await expect(page.getByText('Проверката на сесията временно е недостъпна.',{exact:false})).toBeVisible();
  await expect(page.locator('.profile small')).toHaveText('Клиент',{timeout:10000});
  await expect(page.getByText('Проверката на сесията временно е недостъпна.',{exact:false})).toHaveCount(0);
  failResume=true;
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('Проверката на сесията временно е недостъпна.',{exact:false})).toBeVisible();
  await page.locator('[data-view-id="overview"]').click();
  await expect(page.locator('.profile small')).toHaveText('Клиент');
  failResume=false;
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));
  await expect(page.getByText('Проверката на сесията временно е недостъпна.',{exact:false})).toHaveCount(0);
  await expect(page.locator('.quick-sign-in')).toHaveCount(0);
});
