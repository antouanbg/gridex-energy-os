import { test, expect } from '@playwright/test';

test('profile explains and persists email preference; help is reachable on desktop and phone',async({page,context})=>{
  let nonce='';let enabled=false;let saves=0;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await context.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};`}));
  await context.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')){
      nonce=url.searchParams.get('nonce')||'';
      return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});
    }
    const now=Math.floor(Date.now()/1000);
    const claims={sub:'owner',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce,email:'owner@example.com',email_verified:true};
    return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await context.route('https://api.example.invalid/**',async route=>{
    const path=new URL(route.request().url()).pathname;
    if(path.endsWith('/me/email-notifications')){
      if(route.request().method()==='PUT'){
        enabled=Boolean((route.request().postDataJSON() as {enabled:boolean}).enabled);saves++;
      }
      return route.fulfill({json:{enabled,email:'owner@example.com',scope:'all_events'}});
    }
    if(path.endsWith('/me'))return route.fulfill({json:{subject:'owner',email:'owner@example.com',name:'Owner',roles:['administrator'],permissions:[],memberships:[]}});
    if(path.endsWith('/sites'))return route.fulfill({json:{sites:[{id:'lab',name:'Lab'}]}});
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });
  await page.goto('/profile/');
  await expect(page.getByRole('heading',{name:'Имейл известия'})).toBeVisible();
  await expect(page.locator('.integration-warning')).toHaveCount(0);
  await expect(page.getByText('owner@example.com').first()).toBeVisible();
  const preference=page.getByRole('checkbox',{name:'Получавай имейл за всички бъдещи събития'});
  await expect(preference).toBeEnabled();
  await expect(preference).not.toBeChecked();
  await preference.click();
  await expect(preference).toBeChecked();
  expect(saves).toBe(1);
  await page.reload();
  await expect(preference).toBeChecked();
  await page.getByRole('link',{name:/Как работят известията/}).click();
  await expect(page).toHaveURL(/\/help\/#email-notifications$/);
  await expect(page.getByRole('heading',{name:'Какво прави отметката'})).toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await page.goto('/profile/');
  await expect(page.getByRole('heading',{name:'Имейл известия'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.locator('.mobile-menu-toggle').click();
  await page.locator('.sidebar.mobile-nav-open .profile').click();
  await page.getByRole('menuitem',{name:/Документация/}).click();
  await expect(page).toHaveURL(/\/help\/$/);
  await expect(page.getByRole('heading',{name:'Ръководство за профила'})).toBeVisible();
});

test('first-party profile guide is readable without a login',async({page})=>{
  await page.goto('/demo/help/');
  await expect(page.getByRole('heading',{name:'Ръководство за профила'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Какво прави отметката'})).toBeVisible();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-mode','demo');
});
