import {test,expect} from '@playwright/test';

const siteId='11111111-1111-4111-8111-111111111111';
const organisationId='22222222-2222-4222-8222-222222222222';
const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'fixture'].join('.');

for(const [size,viewport] of [['desktop',{width:1365,height:850}],['mobile',{width:390,height:844}]] as const){
  test(`customer administrator creates Site and approved ROCK from existing screens (${size})`,async({page,context})=>{
    await page.setViewportSize(viewport);
    let nonce='',siteCreated=false,rockCreated=false;
    await context.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:
      "window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};"}));
    await context.route('https://auth.example.invalid/**',route=>{
      const url=new URL(route.request().url());
      if(url.pathname.endsWith('/auth')){
        nonce=url.searchParams.get('nonce')||'';
        return route.fulfill({status:302,headers:{location:`${url.searchParams.get('redirect_uri')}#code=fixture&state=${url.searchParams.get('state')}`}});
      }
      const now=Math.floor(Date.now()/1000),claims={sub:'customer-admin',iss:'https://auth.example.invalid/auth/realms/novacom',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'admin@example.invalid',email_verified:true};
      return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
    });
    await context.route('https://api.example.invalid/**',route=>{
      const url=new URL(route.request().url()),request=route.request();
      if(url.pathname==='/api/v1/me')return route.fulfill({json:{subject:'customer-admin',realm:'novacom',email:'admin@example.invalid',roles:['administrator'],permissions:['site:read','asset:read'],memberships:[{organisationId,role:'administrator',allSites:true}]}});
      if(url.pathname==='/api/v1/sites'){
        if(request.method()==='POST'){
          const body=request.postDataJSON();
          expect(body).toMatchObject({organisationId,name:'Customer Site',timezone:'Europe/Sofia'});
          expect(request.headers()['idempotency-key']).toBeTruthy();
          siteCreated=true;
          return route.fulfill({status:201,json:{id:siteId,organisationId,name:'Customer Site',timezone:'Europe/Sofia',status:'commissioning'}});
        }
        return route.fulfill({json:{sites:siteCreated?[{id:siteId,organisationId,name:'Customer Site',timezone:'Europe/Sofia',status:'commissioning'}]:[]}});
      }
      if(url.pathname===`/api/v1/sites/${siteId}/gateways`&&request.method()==='POST'){
        expect(request.postDataJSON()).toMatchObject({name:'ROCK One',hardwareModel:'rock-pi-e'});
        expect(request.headers()['idempotency-key']).toBeTruthy();rockCreated=true;
        return route.fulfill({status:201,json:{id:'rock-one',siteId,name:'ROCK One',hardwareModel:'rock-pi-e',role:'controller'}});
      }
      if(url.pathname===`/api/v1/sites/${siteId}/hardware`)return route.fulfill({json:{inventorySource:'openremote',configuration:rockCreated?{id:'draft',revision:1,status:'draft'}:null,
        gateways:rockCreated?[{id:'rock-one',name:'ROCK One',hardwareModel:'rock-pi-e',role:'controller',ports:[]}]:[],devices:[]}});
      if(url.pathname==='/api/v1/me/invitations')return route.fulfill({json:{invitations:[]}});
      if(url.pathname.endsWith('/device-heartbeats'))return route.fulfill({json:{items:[]}});
      if(url.pathname.endsWith('/history'))return route.fulfill({json:{from:0,to:0,items:[]}});
      return route.fulfill({status:503,json:{error:'unavailable'}});
    });
    await page.goto('/devices/?realm=novacom');
    await expect(page.getByText('Още няма Обект. Създайте го от раздел „Обекти“.')).toBeVisible();
    await expect(page.getByRole('button',{name:'Създай Обект'})).toHaveCount(0);
    await page.goto('/sites/?realm=novacom');
    await expect(page.getByRole('button',{name:'Създай Обект'})).toBeVisible();
    if(size==='mobile')expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
    await page.getByLabel('Име на Обекта').fill('Customer Site');
    await page.getByLabel('Часова зона').fill('Europe/Sofia');
    await page.getByRole('button',{name:'Създай Обект'}).click();
    await expect(page).toHaveURL(new RegExp(`/sites/${siteId}/infrastructure/`));
    await expect(page.getByRole('button',{name:'Добави устройство'})).toBeVisible();
    if(size==='mobile')expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
    await page.getByLabel('Име',{exact:true}).fill('ROCK One');
    await page.getByRole('button',{name:'Добави устройство'}).click();
    await expect(page.getByRole('heading',{name:'ROCK One'})).toBeVisible();
    expect(siteCreated&&rockCreated).toBeTruthy();
  });
}
