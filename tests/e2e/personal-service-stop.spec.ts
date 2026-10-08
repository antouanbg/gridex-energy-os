import {test,expect} from '@playwright/test';
for(const lang of ['bg','en'] as const)test('personal cancel and stop persist through refresh '+lang,async({page,context},info)=>{
  let nonce='';let granted=true;let state='open';let stopped=0;let cancelled=0;
  const org='11111111-1111-4111-8111-111111111111';
  const jwt=(c:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(c)).toString('base64url'),'test'].join('.');
  await page.addInitScript(l=>localStorage.setItem('gridex.ui-language',l),lang);
  await context.route('**/gridex-config.js',r=>r.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await context.route('https://auth.example.invalid/**',r=>{
    const u=new URL(r.request().url());if(u.pathname.endsWith('/auth')){nonce=u.searchParams.get('nonce')||'';return r.fulfill({status:302,headers:{location:u.searchParams.get('redirect_uri')+'#code=test&state='+u.searchParams.get('state')}});}
    const now=Math.floor(Date.now()/1000),c={sub:'member',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'member@example.com',email_verified:true};
    return r.fulfill({json:{access_token:jwt(c),id_token:jwt(c),refresh_token:jwt(c),expires_in:600}});
  });
  await context.route('https://api.example.invalid/**',async r=>{
    const p=new URL(r.request().url()).pathname;
    if(p.endsWith('/stop')){expect(r.request().postDataJSON()).toEqual({organisationId:org});granted=false;stopped++;return r.fulfill({json:{enabled:false,changed:true}});}
    if(p.endsWith('/cancel')){state='cancelled';cancelled++;return r.fulfill({json:{stage:'cancelled'}});}
    if(p.endsWith('/me'))return r.fulfill({json:{subject:'member',realm:'gridex',email:'member@example.com',roles:['viewer'],permissions:[],memberships:[{organisationId:org,role:'viewer'}]}});
    if(p.endsWith('/me/navigation'))return r.fulfill({json:{subject:'member',realm:'gridex',items:[{id:'services',visible:true}]}});
    if(p.endsWith('/me/service-catalog'))return r.fulfill({json:{services:[{code:'day_ahead',requestable:true},{code:'visualisations',requestable:true}]}});
    if(p.endsWith('/me/services'))return r.fulfill({json:{services:granted?[{organisationId:org,code:'day_ahead'}]:[]}});
    if(p.endsWith('/me/service-requests'))return r.fulfill({json:{requests:[{id:'request-one',organisationId:org,serviceCode:'visualisations',state,stage:state==='open'?'awaiting_organisation':'cancelled',createdAt:'2026-10-03T10:00:00Z',events:[]}]}});
    if(p.endsWith('/sites'))return r.fulfill({json:{sites:[]}});
    return r.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/services/');
  await page.getByRole('button',{name:lang==='bg'?'Отмени заявката':'Cancel request',exact:true}).click();
  await expect(page.getByRole('button',{name:lang==='bg'?'Отмени заявката':'Cancel request',exact:true})).toHaveCount(0);
  expect(cancelled).toBe(1);
  await page.getByRole('button',{name:lang==='bg'?'Спри услугата':'Stop service',exact:true}).click();
  expect(stopped).toBe(0);
  await page.getByRole('button',{name:lang==='bg'?'Потвърди спирането':'Confirm stop',exact:true}).click();
  await expect(page.getByRole('button',{name:lang==='bg'?'Спри услугата':'Stop service',exact:true})).toHaveCount(0);
  expect(stopped).toBe(1);
  await page.reload();
  await expect(page.locator('.service-catalog')).toBeVisible();
  await expect(page.getByRole('button',{name:lang==='bg'?'Заяви':'Request',exact:true})).toHaveCount(2);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const row=page.locator('.service-catalog .service-grant-row').first();
  expect(await row.locator('strong').evaluate(el=>getComputedStyle(el).display)).toBe('block');
  await page.screenshot({path:info.outputPath('personal-services-mobile-'+lang+'.png'),fullPage:true});
});
