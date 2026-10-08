import {test,expect} from '@playwright/test';

test('Site visualisations retain their URL and show only measured history on desktop and mobile',async({page},testInfo)=>{
  let nonce='';
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:
    `window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')){nonce=url.searchParams.get('nonce')||'';return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});}
    const now=Math.floor(Date.now()/1000),claims={sub:'viewer',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce};
    return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await page.route('https://api.example.invalid/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path.endsWith('/me'))return route.fulfill({json:{subject:'viewer',realm:'gridex',roles:['viewer'],permissions:['site:read'],memberships:[{organisationId:'org',role:'viewer',allSites:true}]}});
    if(path.endsWith('/me/services'))return route.fulfill({json:{services:[{code:'visualisations',organisationId:'org'},{code:'day_ahead',organisationId:'foreign-org'}]}});
    if(path.endsWith('/hardware'))return route.fulfill({json:{inventorySource:'openremote',configuration:null,gateways:[{id:'rock',name:'Test ROCK',ports:[]}],devices:[]}});
    if(path.endsWith('/sites'))return route.fulfill({json:{sites:[{id:'lab',organisationId:'org',name:'Measured Lab'}]}});
    if(path.endsWith('/visualisations/history'))return route.fulfill({json:{siteId:'lab',from:Date.now()-86400000,to:Date.now(),items:[{assetId:'or-rock',metric:'cpuTemperatureC',unit:'Cel',points:[{x:Date.now()-3600000,y:42.5},{x:Date.now()-60000,y:43.25}]}]}});
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/sites/');
  await expect(page.locator('.site-summary')).toContainText('Test ROCK');
  await expect(page.locator('.site-summary')).toContainText('Графики и визуализации');
  await expect(page.locator('.site-summary')).not.toContainText('Цени ден напред');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('site-summary-mobile.png'),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.setViewportSize({width:1280,height:900});
  await page.getByRole('link',{name:'Визуализации →'}).click();
  await expect(page).toHaveURL(/\/sites\/lab\/services\/visualisations\/$/);
  await expect(page.getByText('43,25 °C',{exact:true})).toBeVisible();
  await expect(page.getByRole('img',{name:'Измерена история за последните 24 часа'})).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Представителни демо данни');
  await page.setViewportSize({width:390,height:844});
  await page.reload();
  await expect(page.getByText('43,25 °C',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.route('**/visualisations/history',route=>route.fulfill({status:403,json:{error:'service_not_enabled'}}));
  await page.reload();
  await expect(page.getByText('Заявете услугата в „Услуги“. Нужни са активни права за организацията и за Вашия акаунт.')).toBeVisible();
  await page.route('**/visualisations/history',route=>route.fulfill({status:403,json:{error:'permission_denied'}}));
  await page.reload();
  await expect(page.getByRole('heading',{name:'Няма потвърден достъп до измерванията на Обекта'})).toBeVisible();
  await expect(page.getByText('43,25 °C',{exact:true})).toHaveCount(0);
});
