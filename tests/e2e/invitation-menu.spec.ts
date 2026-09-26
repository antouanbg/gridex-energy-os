import { test, expect, type BrowserContext } from '@playwright/test';

const org='11111111-1111-4111-8111-111111111111';
const site='22222222-2222-4222-8222-222222222222';

async function mockSession(context: BrowserContext, administrator: boolean, onInvite: (body: unknown) => void) {
  let nonce='';
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await context.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await context.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')){
      nonce=url.searchParams.get('nonce')||'';
      return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});
    }
    const now=Math.floor(Date.now()/1000);
    const claims={sub:'user',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'owner@example.com',email_verified:true};
    return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await context.route('https://api.example.invalid/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path===`/api/v1/organisations/${org}/invitations`&&route.request().method()==='POST'){
      onInvite(route.request().postDataJSON());
      return route.fulfill({status:201,json:{id:'invite',state:'sent'}});
    }
    if(path==='/api/v1/me')return route.fulfill({json:{subject:'user',realm:'gridex',email:'owner@example.com',roles:[administrator?'administrator':'viewer'],permissions:['site:read'],memberships:[{organisationId:org,role:administrator?'administrator':'viewer',allSites:true}]}});
    if(path==='/api/v1/sites')return route.fulfill({json:{sites:[{id:site,organisationId:org,name:'Test Lab'}]}});
    if(path==='/api/v1/me/invitations')return route.fulfill({json:{invitations:[]}});
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
}

test('organisation administrator has a deep-linked invitation submenu and explicit role/Site grant',async({page,context})=>{
  let invited:unknown=null;
  await mockSession(context,true,body=>{invited=body;});
  await page.goto('/customers/users/');
  await expect(page.getByTestId('section-members').getByRole('heading',{name:'Потребители и покани'})).toBeVisible();
  await expect(page.locator('[data-view-id="members"]')).toHaveAttribute('aria-current','page');
  await page.getByLabel('Служебен имейл').fill('new@example.com');
  await page.getByLabel('Роля').selectOption('operator');
  await page.getByLabel('Test Lab').check();
  await page.getByRole('button',{name:'Изпрати покана'}).click();
  await expect.poll(()=>invited).toEqual({email:'new@example.com',role:'operator',siteIds:[site]});
  await page.reload();
  await expect(page).toHaveURL(/\/customers\/users\/$/);
  await expect(page.getByTestId('section-members').getByRole('heading',{name:'Потребители и покани'})).toBeVisible();
});

test('non-admin has no invitation submenu and cannot use its direct URL',async({page,context})=>{
  await mockSession(context,false,()=>{throw new Error('viewer sent invitation');});
  await page.goto('/customers/users/');
  await expect(page.locator('[data-view-id="members"]')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Изпрати покана'})).toHaveCount(0);
  await expect(page.getByText('Само администратор на организация може да кани членове.')).toBeVisible();
});

test('platform administrator can prepare a separate-realm invitation from the approved submenu',async({page,context},testInfo)=>{
  let nonce='';
  let submitted: unknown;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await context.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await context.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')){
      nonce=url.searchParams.get('nonce')||'';
      return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});
    }
    const now=Math.floor(Date.now()/1000);
    const claims={sub:'global-admin',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'owner@example.com',email_verified:true};
    return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await context.route('https://api.example.invalid/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/v1/me')return route.fulfill({json:{subject:'global-admin',email:'owner@example.com',roles:['platform_admin'],permissions:['platform:manage'],memberships:[]}});
    if(path==='/api/v1/sites')return route.fulfill({json:{sites:[]}});
    if(path==='/api/v1/me/invitations')return route.fulfill({json:{invitations:[]}});
    if(path==='/api/v1/platform/organisation-invitations'&&route.request().method()==='GET')return route.fulfill({json:{enabled:true,invitations:[]}});
    if(path==='/api/v1/platform/organisation-invitations'&&route.request().method()==='POST'){
      submitted=route.request().postDataJSON();
      return route.fulfill({status:201,json:{id:'new-org',realm:'fixture-co',state:'sent',expiresInSeconds:86400}});
    }
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/customers/users/');
  await expect(page.getByRole('heading',{name:'Нова организация'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('platform-invitation-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('platform-invitation-mobile.png'),fullPage:true});
  await page.getByLabel('Име на организацията').fill('Fixture Company');
  await page.getByLabel('Кратък код (realm)').fill('fixture-co');
  await page.getByLabel('Имейл на първия администратор').fill('admin@example.com');
  await page.getByRole('button',{name:'Изпрати покана'}).click();
  await expect.poll(()=>submitted).toEqual({name:'Fixture Company',realm:'fixture-co',email:'admin@example.com'});
  await expect(page.getByText('Организацията и правата ще се активират едва след приемане и проверки.',{exact:false})).toBeVisible();
});

test('invitation page keeps the approved look, documentation link and mobile viewport',async({page,context},testInfo)=>{
  await mockSession(context,true,()=>{});
  await page.goto('/customers/users/');
  await expect(page.locator('.invitation-hero')).toBeVisible();
  await expect(page.locator('.page-help-link')).toHaveAttribute('href','https://doc.gridex.tech/organisations-and-access/');
  await expect(page.locator('.invitation-panel')).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('invitations-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.invitation-hero')).toBeVisible();
  await expect(page.locator('.page-help-link')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await expect(page.getByRole('button',{name:'Изпрати покана'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('invitations-mobile.png'),fullPage:true});
});
