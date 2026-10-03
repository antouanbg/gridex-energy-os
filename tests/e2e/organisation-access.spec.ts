import {test,expect,type Page} from '@playwright/test';
async function session(page:Page,platform:boolean, state:{suspended:boolean;status:string;revision:number;mailState:string;operationId:string|null;writes:number}) {
  let nonce='';
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await page.route('**/gridex-config.js',r=>r.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await page.route('https://auth.example.invalid/**',r=>{
    const url=new URL(r.request().url());
    if(url.pathname.endsWith('/auth')){nonce=url.searchParams.get('nonce')!;return r.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});}
    const now=Math.floor(Date.now()/1000),claims={sub:'owner',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce};
    return r.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await page.route('https://api.example.invalid/**',r=>{
    const path=new URL(r.request().url()).pathname;
    if(state.suspended)return r.fulfill({status:403,json:{error:'organisation_suspended'}});
    if(path.endsWith('/me'))return r.fulfill({json:{subject:'owner',realm:'gridex',roles:['administrator'],permissions:platform?['platform:manage']:[],memberships:[]}});
    if(path.endsWith('/sites'))return r.fulfill({json:{sites:[{id:'lab',name:'Private Lab'}]}});
    if(path.endsWith('/hardware'))return r.fulfill({json:{inventorySource:'openremote',gateways:[{id:'rock',name:'Private ROCK',hardwareModel:'rock-pi-e',role:'controller',ports:[]}],devices:[]}});
    if(path.endsWith('/snapshot'))return r.fulfill({json:{siteId:'lab',siteName:'Private Lab',timestamp:new Date().toISOString(),quality:'INVALID',battery:null,power:{gridKw:null,batteryKw:null,pvKw:null,siteLoadKw:null},strategy:null,devices:[],batteryEconomicsToday:{available:false}}});
    if(path.endsWith('/device-heartbeats'))return r.fulfill({json:{items:[]}});
    if(path.endsWith('/device-setup'))return r.fulfill({json:{revision:0,configuration:{}}});
    if(path.endsWith('/organisation-invitations'))return r.fulfill({json:{enabled:true,invitations:[]}});
    if(path.endsWith('/platform/organisations'))return r.fulfill({json:{organisations:[{id:'11111111-1111-4111-8111-111111111111',name:'Example customer',realm:'customer',status:state.status,revision:state.revision,operationId:state.operationId,operationState:state.operationId?'applied':null,mailState:state.mailState||null}]}});
    if(path.endsWith('/access')){state.writes++;const input=r.request().postDataJSON();state.status=input.status;state.revision++;state.operationId=input.operationId;state.mailState=input.status==='suspended'?'queued':'not_required';return r.fulfill({json:{status:state.status,mailState:state.mailState}});}
    if(path.endsWith('/delivery')){state.mailState='delivered';return r.fulfill({json:{mailState:'delivered'}});}
    return r.fulfill({status:503,json:{error:'unavailable'}});
  });
}
const initial=()=>({suspended:false,status:'active',revision:0,mailState:'',operationId:null as string|null,writes:0});

test('approved platform layout shares organisation selection with read-only roster',async({page},info)=>{
  await session(page,true,initial());
  const first='11111111-1111-4111-8111-111111111111',second='22222222-2222-4222-8222-222222222222';
  await page.route('https://api.example.invalid/api/v1/platform/organisations',r=>r.fulfill({json:{organisations:[first,second].map((id,i)=>({id,name:'Organisation '+(i+1),realm:'org'+i,status:'active',revision:0}))}}));
  await page.route('**/platform/organisations/*/members*',r=>{
    const id=new URL(r.request().url()).pathname.split('/')[5];
    return r.fulfill({json:{members:[{subject:id,email:(id===first?'first':'second')+'@example.com',firstName:'Test',lastName:id===first?'First':'Second',role:'viewer',allSites:false,siteIds:[],verifiedSiteIds:[],services:[]}],sites:[],nextOffset:null,total:1}});
  });
  await page.goto('/settings/users/');
  const sections=['.admin-organisation-choice','.platform-service-workspace>.service-grants','.platform-service-workspace>[aria-label="Заявки за услуги"]','.platform-service-workspace>.organisation-members','.invitation-platform','.platform-invitation-history'];
  const positions=[];
  for(const selector of sections){await expect(page.locator(selector)).toBeVisible();positions.push((await page.locator(selector).boundingBox())!.y);}
  expect(positions).toEqual([...positions].sort((a,b)=>a-b));
  await expect(page.locator('.member-register')).toContainText('first@example.com');
  await page.locator('.admin-organisation-choice select').selectOption(second);
  await expect(page.locator('.member-register')).toContainText('second@example.com');
  await expect(page.locator('.member-register')).not.toContainText('first@example.com');
  await expect(page.locator('.member-register th')).toHaveCount(5);
  await page.screenshot({path:info.outputPath('approved-platform-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('approved-platform-mobile.png'),fullPage:true});
});
for(const en of [false,true]) {
  test(`platform suspend, delivery and restore ${en?'EN':'BG'}`,async({page},info)=>{
    if(en)await page.addInitScript(()=>localStorage.setItem('gridex.ui-language','en'));
    const state=initial();await session(page,true,state);
    await page.goto('/customers/users/');
    await page.getByRole('button',{name:en?'Suspend organisation':'Спри организацията',exact:true}).click();
    expect(state.writes).toBe(0);
    await page.getByRole('button',{name:en?'Confirm':'Потвърди',exact:true}).click();
    await expect(page.getByRole('button',{name:en?'Restore access':'Възстанови достъпа',exact:true})).toBeVisible();
    expect(state.writes).toBe(1);
    await page.getByRole('button',{name:en?'Check delivery':'Провери доставката',exact:true}).click();
    await expect(page.getByText(en?'Suspension email: Delivered':'Имейл за спиране: Доставено')).toBeVisible();
    expect(state.writes).toBe(1);
    await page.setViewportSize({width:390,height:844});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await page.screenshot({path:info.outputPath('organisation-access.png'),fullPage:true});
    await page.getByRole('button',{name:en?'Restore access':'Възстанови достъпа',exact:true}).click();
    await page.getByRole('button',{name:en?'Confirm':'Потвърди',exact:true}).click();
    await expect(page.getByRole('button',{name:en?'Suspend organisation':'Спри организацията',exact:true})).toBeVisible();
    expect(state.writes).toBe(2);
  });
  test(`authenticated null battery dashboard ${en?'EN':'BG'}`,async({page})=>{
    if(en)await page.addInitScript(()=>localStorage.setItem('gridex.ui-language','en'));
    await session(page,false,initial());await page.goto('/sites/lab/devices/');
    await expect(page.getByRole('heading',{name:'Private ROCK',exact:true})).toBeVisible();
    await page.locator('[data-view-id="overview"]').click();
    await expect(page.getByText('SOH —',{exact:true})).toBeVisible();
    await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','live');
    await expect(page.locator('main')).not.toContainText('NaN');
    await expect(page.locator('main')).not.toContainText('0.0 kW');
  });
  test(`existing session clears private content on suspension ${en?'EN':'BG'}`,async({page})=>{
    if(en)await page.addInitScript(()=>localStorage.setItem('gridex.ui-language','en'));
    const state=initial();await session(page,false,state);
    await page.goto('/sites/lab/devices/');
    await expect(page.getByRole('heading',{name:'Private ROCK',exact:true})).toBeVisible();
    const second=await page.context().newPage();
    if(en)await second.addInitScript(()=>localStorage.setItem('gridex.ui-language','en'));
    await session(second,false,state);await second.goto('/sites/lab/devices/');
    await expect(second.getByRole('heading',{name:'Private ROCK',exact:true})).toBeVisible();
    state.suspended=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    await expect(second.getByRole('heading',{name:'Private ROCK',exact:true})).toHaveCount(0);
    await expect(second.getByText(en?'Your organisation is temporarily suspended. Contact the super administrator.':'Организацията е временно спряна. Свържете се със супер администратора.',{exact:true})).toBeVisible();
    await second.close();
    await expect(page.getByRole('heading',{name:'Private ROCK',exact:true})).toHaveCount(0);
    await expect(page.getByText(en?'Your organisation is temporarily suspended. Contact the super administrator.':'Организацията е временно спряна. Свържете се със супер администратора.',{exact:true})).toBeVisible();
    await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','live');
    await expect(page.locator('main')).not.toContainText('Private Lab');
    await expect(page.getByRole('button',{name:en?'Suspend organisation':'Спри организацията',exact:true})).toHaveCount(0);
  });
}

for (const unavailable of [false,true]) test(`approved organisation list distinguishes ${unavailable?'unavailable':'empty'}`,async({page})=>{
  await session(page,true,initial());
  await page.route('https://api.example.invalid/api/v1/platform/organisations',route=>unavailable
    ? route.fulfill({status:503,json:{error:'organisation_access_unavailable'}})
    : route.fulfill({json:{organisations:[]}}));
  await page.goto('/customers/users/');
  await expect(page.getByText(unavailable?'Управлението на достъпа е недостъпно.':'Няма одобрени клиентски организации.',{exact:true})).toBeVisible();
  if(unavailable)await expect(page.getByText('Няма одобрени клиентски организации.',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Спри организацията',exact:true})).toHaveCount(0);
});

test('platform service catalogue separates approved, available and future; removal needs confirmation',async({page},info)=>{
  const state=initial();await session(page,true,state);
  const organisationId='11111111-1111-4111-8111-111111111111';
  const approved=new Set(['day_ahead']);let writes=0;
  await page.route(new RegExp(`^https://api\\.example\\.invalid/api/v1/platform/organisations/${organisationId}/services(?:/[^/]+)?$`),route=>{
    const code=new URL(route.request().url()).pathname.split('/').at(-1);
    if(route.request().method()==='PUT'){
      writes++;const enabled=Boolean((route.request().postDataJSON() as {enabled:boolean}).enabled);
      if(enabled)approved.add(code!);else approved.delete(code!);
      return route.fulfill({json:{code,enabled}});
    }
    return route.fulfill({json:{services:[
      {code:'day_ahead',description:'Day-ahead',prerequisites:[],requestable:true,enabled:approved.has('day_ahead')},
      {code:'visualisations',description:'Visualisations',prerequisites:[],requestable:true,enabled:approved.has('visualisations')},
      {code:'analysis',description:'Analysis',prerequisites:[],requestable:false,enabled:false},
    ]}});
  });
  await page.route(`https://api.example.invalid/api/v1/platform/organisations/${organisationId}/market-zones`,route=>route.fulfill({json:{zones:[{country:'BG',zone:'BG',collected:true,enabled:true}]}}));
  await page.goto('/customers/users/');
  await expect(page.getByRole('heading',{name:'Услуги за организацията',exact:true})).toBeVisible();
  await expect(page.locator('.platform-service-workspace [data-service-code]')).toHaveCount(5);
  await expect(page.locator('.platform-service-workspace [data-service-code="analysis"]')).toContainText('Предстои');
  await expect(page.locator('[role="tab"]')).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'Нова покана за организация',exact:true})).toBeVisible();
  await page.screenshot({path:info.outputPath('platform-services-desktop.png'),fullPage:true});
  await page.locator('.platform-service-workspace .admin-service-row').filter({hasText:'Графики и визуализации'}).getByRole('button',{name:'Разреши и уведоми'}).click();
  await expect(page.locator('.platform-service-workspace .admin-service-row').filter({hasText:'Графики и визуализации'}).getByRole('button',{name:'Отнеми'})).toBeVisible();
  expect(writes).toBe(1);
  await page.locator('.platform-service-workspace .admin-service-row').filter({hasText:'Графики и визуализации'}).getByRole('button',{name:'Отнеми'}).click();
  expect(writes).toBe(1);
  await page.getByRole('button',{name:'Потвърди отнемането'}).click();
  expect(writes).toBe(2);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('platform-services-mobile.png'),fullPage:true});
});

test('organisation admin sees unavailable services but may grant only approved services to members',async({page})=>{
  await session(page,false,initial());
  const organisationId='11111111-1111-4111-8111-111111111111';
  let memberWrites=0;
  await page.route('https://api.example.invalid/api/v1/me',route=>route.fulfill({json:{subject:'owner',realm:'gridex',roles:['administrator'],permissions:[],memberships:[{organisationId,role:'administrator'}]}}));
  await page.route('https://api.example.invalid/api/v1/me/invitations',route=>route.fulfill({json:{invitations:[]}}));
  await page.route('https://api.example.invalid/api/v1/me/service-catalog',route=>route.fulfill({json:{services:[
    {code:'day_ahead',description:'Day-ahead',requestable:true},
    {code:'visualisations',description:'Visualisations',requestable:true},
    {code:'analysis',description:'Analysis',requestable:false},
  ]}}));
  await page.route(`https://api.example.invalid/api/v1/organisations/${organisationId}/services`,route=>route.fulfill({json:{services:[
    {code:'visualisations',description:'Visualisations',prerequisites:[],requestable:true,enabled:true},
  ]}}));
  await page.route(new RegExp(`^https://api\\.example\\.invalid/api/v1/organisations/${organisationId}/services/visualisations/members(?:/[^/]+)?$`),route=>{
    if(route.request().method()==='PUT'){memberWrites++;return route.fulfill({json:{enabled:true}});}
    return route.fulfill({json:{members:[{subject:'viewer',email:'viewer@example.invalid',role:'viewer',enabled:false}]}});
  });
  await page.route(`https://api.example.invalid/api/v1/organisations/${organisationId}/service-requests`,route=>route.fulfill({json:{requests:[]}}));
  await page.route(`https://api.example.invalid/api/v1/organisations/${organisationId}/invitations`,route=>route.fulfill({json:{invitations:[]}}));
  await page.route(new RegExp(`^https://api\\.example\\.invalid/api/v1/organisations/${organisationId}/members(?:\\?.*)?$`),route=>route.fulfill({json:{members:[{subject:'viewer',email:'viewer@example.invalid',firstName:'Иван',lastName:'Иванов',role:'viewer',allSites:false,siteIds:[],verifiedSiteIds:[],services:[],lastLoginAt:null}],sites:[],nextOffset:null,total:1}}));
  await page.goto('/customers/users/');
  await expect(page.getByRole('heading',{name:'Одобрени потребители и услуги'})).toBeVisible();
  const detail=page.locator('.organisation-member-detail');
  await detail.locator('summary').click();
  await expect(detail.locator('[data-service-code="day_ahead"]')).toContainText('Не е одобрена за организацията');
  await expect(detail.locator('[data-service-code="day_ahead"]').getByRole('button',{name:'Разреши и уведоми'})).toBeDisabled();
  await detail.locator('[data-service-code="visualisations"]').getByRole('button',{name:'Разреши и уведоми'}).click();
  await expect(detail.locator('[data-service-code="visualisations"]').getByRole('button',{name:'Отнеми достъпа'})).toBeVisible();
  await expect(page.getByText('Услугата е разрешена.',{exact:false})).toBeVisible();
  expect(memberWrites).toBe(1);
  await expect(detail.locator('[data-service-code="day_ahead"]').getByRole('button',{name:'Разреши и уведоми'})).toBeDisabled();
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
