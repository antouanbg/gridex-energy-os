import {test,expect} from '@playwright/test';

test('verified invited member joins automatically without another accept button',async({page,context})=>{
  let nonce='',accepted=false,accepts=0;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await context.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:
    "window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};"}));
  await context.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')){
      nonce=url.searchParams.get('nonce')||'';
      return route.fulfill({status:302,headers:{location:`${url.searchParams.get('redirect_uri')}#code=fixture&state=${url.searchParams.get('state')}`}});
    }
    const now=Math.floor(Date.now()/1000),claims={sub:'member',iss:'https://auth.example.invalid/auth/realms/novacom',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'member@example.invalid',email_verified:true};
    return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await context.route('https://api.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/api/v1/me')return route.fulfill({json:{subject:'member',realm:'novacom',email:'member@example.invalid',name:'Member',
      roles:accepted?['viewer']:[],permissions:accepted?['site:read']:[],memberships:accepted?[{organisationId:'org',role:'viewer',allSites:false}]:[]}});
    if(url.pathname==='/api/v1/me/organisation-onboarding')return route.fulfill({json:{invitations:[]}});
    if(url.pathname==='/api/v1/me/invitations')return route.fulfill({json:{invitations:accepted?[]:[{id:'11111111-1111-4111-8111-111111111111',organisationId:'org',role:'viewer',siteIds:[],expiresAt:new Date(Date.now()+3600000).toISOString()}]}});
    if(url.pathname==='/api/v1/invitations/11111111-1111-4111-8111-111111111111/accept'){
      accepts++;accepted=true;return route.fulfill({json:{accepted:true,organisationId:'org'}});
    }
    if(url.pathname==='/api/v1/sites')return route.fulfill({json:{sites:[]}});
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/profile/?realm=novacom');
  await expect.poll(()=>accepts).toBe(1);
  await expect(page.getByRole('button',{name:'Приеми покана'})).toHaveCount(0);
  await page.goto('/login/?realm=novacom');
  await expect(page).toHaveURL(/\/login\/\?realm=novacom/);
  await expect(page.getByLabel('Имейл',{exact:true})).toBeVisible();
  await expect(page.getByTestId('section-overview')).toHaveCount(0);
  await page.reload();
  await expect.poll(()=>accepts).toBe(1);
});
