import {test,expect} from '@playwright/test';

for(const scenario of ['same-realm','cross-realm','stale-identity','callback-failure'] as const)test(`same-browser account switch ${scenario}`,async({page,context})=>{
  const staleSecondIdentity=scenario==='stale-identity';
  let nonce='',issuedEmail='first@example.invalid',issuedRealm='gridex',silentChecks=0,secondLogin=false;
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await context.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:
    "window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};"}));
  await context.route('https://auth.example.invalid/**',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')){
      if(url.searchParams.get('prompt')==='none')silentChecks++;
      nonce=url.searchParams.get('nonce')||'';
      const hint=url.searchParams.get('login_hint')||'';
      if(hint==='second@example.invalid')secondLogin=true;
      issuedEmail=secondLogin&&staleSecondIdentity?'first@example.invalid':hint||issuedEmail;
      issuedRealm=url.pathname.split('/realms/')[1]?.split('/')[0]||'gridex';
      return route.fulfill({status:302,headers:{location:`${url.searchParams.get('redirect_uri')}#code=fixture&state=${url.searchParams.get('state')}`}});
    }
    if(secondLogin&&scenario==='callback-failure')return route.fulfill({status:503,json:{error:'identity_unavailable'}});
    const now=Math.floor(Date.now()/1000);
    const claims={sub:issuedEmail,iss:`https://auth.example.invalid/auth/realms/${issuedRealm}`,aud:'gridex-portal',iat:now,exp:now+600,nonce,name:issuedEmail,email:issuedEmail};
    return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
  });
  await context.route('https://api.example.invalid/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/v1/auth/login-realm'){
      const email=(route.request().postDataJSON() as {email:string}).email;
      return route.fulfill({json:{realms:[email==='second@example.invalid'&&scenario==='cross-realm'?'novacom':'gridex']}});
    }
    if(path==='/api/v1/me')return route.fulfill({json:{subject:issuedEmail,realm:issuedRealm,email:issuedEmail,name:issuedEmail,roles:['viewer'],permissions:['site:read'],memberships:[{organisationId:'org',role:'viewer',allSites:true}]}});
    if(path==='/api/v1/sites')return route.fulfill({json:{sites:[{id:issuedEmail.startsWith('first')?'first-site':'second-site',name:issuedEmail.startsWith('first')?'First private Site':'Second private Site'}]}});
    if(path==='/api/v1/me/services')return route.fulfill({json:{services:[]}});
    return route.fulfill({status:503,json:{error:'unavailable'}});
  });

  await page.goto('/demo/');
  await page.locator('.demo-sign-in').click();
  await page.getByLabel('Имейл',{exact:true}).fill('first@example.invalid');
  await page.locator('.login-submit').click();
  await expect(page.getByTestId('section-overview')).toBeVisible();
  await expect(page.locator('.profile strong')).toHaveText('first@example.invalid');

  // Opening generic Login for another person must not silently restore the
  // first person's server session just because this browser has a release hint.
  await page.goto('/login/');
  await expect(page.getByLabel('Имейл',{exact:true})).toBeVisible();
  await expect(page.locator('.profile strong')).not.toHaveText('first@example.invalid');
  expect(silentChecks).toBe(0);
  await page.getByLabel('Имейл',{exact:true}).fill('second@example.invalid');
  await page.locator('.login-submit').click();

  if(scenario==='callback-failure'){
    await expect(page).toHaveURL(/\/login\/\?error=identity-init$/);
    await expect(page.getByText('Новият вход не можа да се провери',{exact:false})).toBeVisible();
    await expect(page.locator('.profile strong')).not.toHaveText('first@example.invalid');
    expect(await page.evaluate(()=>localStorage.getItem('gridex.session-release'))).toBeNull();
  }else if(staleSecondIdentity){
    await expect(page).toHaveURL(/\/login\/\?error=account-mismatch$/);
    await expect(page.getByText('Върна се предишният акаунт',{exact:false})).toBeVisible();
    await expect(page.locator('.profile strong')).not.toHaveText('first@example.invalid');
    expect(await page.evaluate(()=>localStorage.getItem('gridex.session-release'))).toBeNull();
  }else{
    await expect(page.getByTestId('section-overview')).toBeVisible();
    await expect(page.locator('.profile strong')).toHaveText('second@example.invalid');
    await page.locator('[data-view-id="sites"]').click();
    await expect(page.getByText('Second private Site')).toBeVisible();
    await expect(page.getByText('First private Site')).toHaveCount(0);
  }
  expect(silentChecks).toBe(0);
});
