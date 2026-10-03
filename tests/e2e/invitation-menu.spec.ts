import { test, expect, type BrowserContext } from '@playwright/test';
import {navItems} from '../../app/lib/navigation';

const org='11111111-1111-4111-8111-111111111111';
const site='22222222-2222-4222-8222-222222222222';
const memberInvite='33333333-3333-4333-8333-333333333333';

async function mockSession(context: BrowserContext, administrator: boolean, onInvite: (body: unknown) => void,
  onMemberUpdate?: (body: unknown) => void) {
  let nonce='';
  let outgoing: {id:string;email:string;role:string;siteIds:string[];state:string;createdAt:string;expiresAt:string}[]=[];
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
      const body=route.request().postDataJSON();onInvite(body);
      outgoing=[{id:memberInvite,...body,state:'sent',createdAt:'2026-09-29T00:00:00Z',expiresAt:'2026-09-30T00:00:00Z'},...outgoing];
      return route.fulfill({status:201,json:{id:memberInvite,state:'sent'}});
    }
    if(path===`/api/v1/organisations/${org}/invitations`&&route.request().method()==='GET')return route.fulfill({json:{invitations:outgoing}});
    if(path===`/api/v1/organisations/${org}/members`&&route.request().method()==='GET')return route.fulfill({json:{
      members:[{subject:'member-1',email:'member@example.com',firstName:'Иван',lastName:'Иванов',role:'viewer',
        allSites:false,siteIds:[],verifiedSiteIds:[],services:[],lastLoginAt:null}],
      sites:[{id:site,name:'Test Lab'}],nextOffset:null}});
    if(path===`/api/v1/organisations/${org}/members/member-1`&&route.request().method()==='PUT'){
      const body=route.request().postDataJSON();onMemberUpdate?.(body);
      return route.fulfill({json:{subject:'member-1',...body}});
    }
    if(path===`/api/v1/organisations/${org}/services`&&route.request().method()==='GET')return route.fulfill({json:{services:[]}});
    if(path===`/api/v1/organisations/${org}/service-requests`&&route.request().method()==='GET')return route.fulfill({json:{requests:[]}});
    if(path===`/api/v1/organisations/${org}/invitations/${memberInvite}/resend`){
      outgoing=outgoing.map(item=>({...item,expiresAt:'2026-10-01T00:00:00Z'}));
      return route.fulfill({json:{id:memberInvite,state:'sent',expiresAt:'2026-10-01T00:00:00Z'}});
    }
    if(path==='/api/v1/me')return route.fulfill({json:{subject:'user',realm:'gridex',email:'owner@example.com',roles:[administrator?'administrator':'viewer'],permissions:['site:read'],memberships:[{organisationId:org,role:administrator?'administrator':'viewer',allSites:true}]}});
    if(path==='/api/v1/me/navigation')return route.fulfill({json:{subject:'user',realm:'gridex',items:navItems.map(([id],sortOrder)=>({id,sortOrder,visible:administrator||!['members','plans','market-settings','settlement','balance'].includes(id),state:'available'}))}});
    if(path==='/api/v1/sites')return route.fulfill({json:{sites:[{id:site,organisationId:org,name:'Test Lab'}]}});
    if(path==='/api/v1/me/invitations')return route.fulfill({json:{invitations:[]}});
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
}

test('organisation administrator has a deep-linked invitation submenu and explicit role/Site grant',async({page,context})=>{
  let invited:unknown=null;
  await mockSession(context,true,body=>{invited=body;});
  await page.goto('/customers/users/');
  await expect(page.getByTestId('section-members').getByRole('heading',{name:'Услуги за организацията'})).toBeVisible();

  await expect(page.locator('[data-view-id="members"]')).toHaveAttribute('aria-current','page');
  await page.getByLabel('Собствено име').fill('Мария');
  await page.getByLabel('Фамилно име').fill('Петрова');
  await page.getByLabel('Служебен имейл').fill('new@example.com');
  await page.locator('.invitation-panel form select').last().selectOption('operator');
  await page.locator('.invitation-panel form').getByLabel('Test Lab').check();
  await page.getByRole('button',{name:'Изпрати покана',exact:true}).click();
  await expect.poll(()=>invited).toEqual({firstName:'Мария',lastName:'Петрова',email:'new@example.com',role:'operator',siteIds:[site]});
  await expect(page.getByText('Изпращането е потвърдено.',{exact:false})).toBeVisible();
  await expect(page.getByText('new@example.com')).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/customers\/users\/$/);
  await expect(page.getByTestId('section-members').getByRole('heading',{name:'Услуги за организацията'})).toBeVisible();

  await expect(page.getByText('new@example.com')).toBeVisible();
  await page.getByRole('button',{name:'Изпрати поканата наново'}).click();
  await expect(page.getByText('Нов линк за покана е изпратен')).toBeVisible();
});

test('organisation administrator sees approved members and saves a role with an explicit Site',async({page,context})=>{
  let updated:unknown=null;
  await mockSession(context,true,()=>{},body=>{updated=body;});
  await page.goto('/customers/users/');
  await expect(page.getByRole('heading',{name:'Потребители на организацията'})).toBeVisible();
  await page.getByRole('button',{name:/Иван Иванов/}).click();
  await page.getByLabel('Роля в организацията').selectOption('operator');
  await page.locator('.organisation-member-detail').getByRole('group',{name:'Разрешени Обекти'}).getByLabel('Test Lab').check();
  await page.getByRole('button',{name:'Преглед на промените',exact:true}).click();
  await page.getByRole('button',{name:'Запази роля и Обекти'}).click();
  await expect.poll(()=>updated).toEqual({role:'operator',siteIds:[site]});
});

test('zero organisation grants keep every service and disabled grant controls visible',async({page,context})=>{
  await mockSession(context,true,()=>{});
  await page.goto('/customers/users/');
  const detail=page.locator('.organisation-member-detail');
  await page.getByRole('button',{name:/Права и услуги: Иван Иванов/}).click();
  await expect(detail.locator('[data-service-code]')).toHaveCount(5);
  await expect(detail.locator('[data-service-code="day_ahead"]')).toContainText('Не е одобрена за организацията');
  await expect(detail.locator('[data-service-code="visualisations"]')).toContainText('Не е одобрена за организацията');
  await expect(detail.getByRole('button',{name:'Разреши и уведоми'})).toHaveCount(2);
  for(const button of await detail.getByRole('button',{name:'Разреши и уведоми'}).all())await expect(button).toBeDisabled();
  await expect(detail.getByRole('button',{name:'Заяви за организацията'})).toHaveCount(2);
  await expect(page.getByRole('button',{name:/Иван Иванов/})).toBeVisible();
});

test('a service failure does not hide approved members or the catalogue',async({page,context})=>{
  await mockSession(context,true,()=>{});
  await context.route(`https://api.example.invalid/api/v1/organisations/${org}/services`,route=>route.fulfill({status:503,json:{error:'unavailable'}}));
  await page.goto('/customers/users/');
  await expect(page.getByRole('button',{name:/Иван Иванов/})).toBeVisible();
  await expect(page.locator('.organisation-member-detail [data-service-code]')).toHaveCount(5);
  await page.getByRole('button',{name:/Права и услуги: Иван Иванов/}).click();
  await expect(page.getByText('Правата за услуги не можаха да се проверят.',{exact:false})).toBeVisible();
});

test('organisation administrator requests a service without granting it and cancels their pending request',async({page,context})=>{
  await mockSession(context,true,()=>{});
  let pending=false,submissions=0,cancellations=0;
  const id='44444444-4444-4444-8444-444444444444';
  await context.route(`https://api.example.invalid/api/v1/organisations/${org}/service-requests`,route=>{
    if(route.request().method()==='POST'){pending=true;submissions++;expect(route.request().postDataJSON()).toEqual({serviceCode:'day_ahead',country:'BG',zone:'BG'});return route.fulfill({status:201,json:{id,created:true}});}
    return route.fulfill({json:{requests:pending?[{id,organisationId:org,organisationName:'Example',subject:'user',email:'owner@example.com',serviceCode:'day_ahead',requestScope:'organisation',state:'open',stage:'awaiting_platform',events:[],createdAt:'2026-10-02T00:00:00Z'}]:[]}});
  });
  await context.route(`https://api.example.invalid/api/v1/organisations/${org}/service-requests/${id}/cancel`,route=>{pending=false;cancellations++;return route.fulfill({json:{id,stage:'cancelled'}});});
  await page.goto('/customers/users/');

  const catalogue=page.locator('.organisation-service-workspace');
  await expect(catalogue.locator('[data-service-code]')).toHaveCount(5);
  const price=catalogue.locator('[data-service-code="day_ahead"]');
  await price.getByRole('button',{name:'Заяви',exact:true}).click();
  await expect(price.getByRole('button',{name:'Отмени заявката'})).toBeVisible();
  expect(submissions).toBe(1);
  await price.getByRole('button',{name:'Отмени заявката'}).click();
  await expect(price.getByRole('button',{name:'Заяви',exact:true})).toBeVisible();
  expect(cancellations).toBe(1);
  await expect(price).toContainText('Не е одобрена за организацията');
});

test('non-admin has no invitation submenu and cannot use its direct URL',async({page,context})=>{
  await mockSession(context,false,()=>{throw new Error('viewer sent invitation');});
  await page.goto('/customers/users/');
  await expect(page.locator('[data-view-id="members"]')).toHaveCount(0);
  await expect(page.locator('[data-view-id="customers"]')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Изпрати покана'})).toHaveCount(0);
  await expect(page.getByText('Нужни са администраторски права')).toBeVisible();
  await page.goto('/sites/');
  await expect(page.locator('[data-view-id="sites"]')).toBeVisible();
});

test('platform administrator can prepare a separate-realm invitation from the approved submenu',async({page,context},testInfo)=>{
  let nonce='';
  let submitted: unknown;
  let resent=false;
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
    if(path==='/api/v1/platform/organisation-invitations'&&route.request().method()==='GET')return route.fulfill({json:{enabled:true,invitations:[{id:'11111111-1111-4111-8111-111111111111',realm:'fixture-co',name:'Fixture Company',email:'admin@example.com',state:'sent',createdAt:'2026-09-28T00:00:00Z',expiresAt:'2026-09-29T00:00:00Z'}]}});
    if(path==='/api/v1/platform/organisation-invitations/11111111-1111-4111-8111-111111111111/resend'){
      resent=route.request().method()==='POST';
      return route.fulfill({json:{id:'11111111-1111-4111-8111-111111111111',state:'sent',expiresAt:'2026-09-30T00:00:00Z'}});
    }
    if(path==='/api/v1/platform/organisation-invitations'&&route.request().method()==='POST'){
      submitted=route.request().postDataJSON();
      return route.fulfill({status:201,json:{id:'new-org',realm:'fixture-co',state:'sent',expiresInSeconds:86400}});
    }
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/customers/users/');
  await expect(page.getByRole('heading',{name:'Нова покана за организация'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Изпрати поканата наново'})).toBeVisible();
  await page.getByRole('button',{name:'Изпрати поканата наново'}).click();
  await expect.poll(()=>resent).toBe(true);
  await expect(page.getByText('Срокът е подновен за 24 часа.',{exact:false})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('platform-invitation-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('platform-invitation-mobile.png'),fullPage:true});
  await page.getByLabel('Име на организацията').fill('Fixture Company');
  await page.getByLabel('Кратък код (realm)').fill('fixture-co');
  await page.getByLabel('Имейл на първия администратор').fill('admin@example.com');
  await page.getByLabel('Собствено име').fill('Мария');
  await page.getByLabel('Фамилно име').fill('Петрова');
  await page.getByRole('button',{name:'Изпрати покана',exact:true}).click();
  await expect.poll(()=>submitted).toEqual({name:'Fixture Company',realm:'fixture-co',email:'admin@example.com',firstName:'Мария',lastName:'Петрова'});
  await expect(page.getByText('Организацията и правата ще се активират след потвърждаване на имейла, задаване на парола, вход и проверка от сървъра.',{exact:false})).toBeVisible();
});

test('invitation page keeps the approved look, documentation link and mobile viewport',async({page,context},testInfo)=>{
  await mockSession(context,true,()=>{});
  await page.goto('/customers/users/');
  await expect(page.locator('.invitation-hero')).toBeVisible();
  await expect(page.locator('.invitation-page [role=tab]')).toHaveCount(0);
  const sections=['.organisation-service-workspace','#new-member-invitation','.member-invitation-history','#approved-organisation-members'];
  const positions=[];
  for(const selector of sections){await expect(page.locator(selector)).toBeVisible();positions.push((await page.locator(selector).boundingBox())!.y);}
  expect(positions).toEqual([...positions].sort((a,b)=>a-b));
  await expect(page.locator('.organisation-service-workspace [data-service-code]')).toHaveCount(5);
  expect(await page.locator('.organisation-service-workspace .admin-panel').first().evaluate(el=>{
    const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius,padding:s.padding};
  })).toEqual({background:'rgb(255, 255, 255)',radius:'15px',padding:'17px'});
  await expect(page.locator('.organisation-service-workspace [data-service-code="day_ahead"]').getByRole('button',{name:'Заяви',exact:true})).toBeEnabled();
  expect(await page.locator('.organisation-service-workspace .primary-btn').first().evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(11, 66, 48)');
  await expect(page.locator('.page-help-link')).toHaveAttribute('href','https://doc.gridex.tech/organisations-and-access/');
  await expect(page.getByRole('region',{name:'Потребители на организацията'})).toBeVisible();
  const listBox=await page.locator('.organisation-members-list').boundingBox();
  const detailBox=await page.locator('.organisation-member-detail').boundingBox();
  expect(detailBox!.y).toBeGreaterThan(listBox!.y+listBox!.height);
  await expect(page.getByRole('region',{name:'Администрация в OpenRemote'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Отвори OpenRemote Manager'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('invitations-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.invitation-hero')).toBeVisible();
  await expect(page.locator('.page-help-link')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const mobileList=await page.locator('.organisation-members-list').boundingBox();
  const mobileDetail=await page.locator('.organisation-member-detail').boundingBox();
  expect(mobileDetail!.y).toBeGreaterThan(mobileList!.y+mobileList!.height);
  await expect(page.locator('.organisation-member-detail [data-service-code]')).toHaveCount(5);
  await expect(page.getByRole('button',{name:'Отвори OpenRemote Manager'})).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('invitations-mobile.png'),fullPage:true});

  await expect(page.getByRole('button',{name:'Изпрати покана',exact:true})).toBeVisible();
});
