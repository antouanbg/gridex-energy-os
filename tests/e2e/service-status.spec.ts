import {test,expect} from '@playwright/test';

for(const lang of ['bg','en'])for(const width of [1440,390])for(const scenario of ['admin-missing','admin-enabled','viewer']){
  test(`service levels ${scenario} ${lang} ${width}`,async({page},testInfo)=>{
    const admin=scenario!=='viewer',enabled=scenario==='admin-enabled';
    await page.setViewportSize({width,height:900});
    await page.addInitScript(language=>localStorage.setItem('gridex.ui-language',language),lang);
    let nonce='';
    const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
    await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:
      "window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal'};"}));
    await page.route('https://auth.example.invalid/**',route=>{
      const url=new URL(route.request().url());
      if(url.pathname.endsWith('/auth')){nonce=url.searchParams.get('nonce')||'';return route.fulfill({status:302,headers:{location:url.searchParams.get('redirect_uri')+'#code=fixture&state='+url.searchParams.get('state')}});}
      const now=Math.floor(Date.now()/1000),claims={sub:'person',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+600,nonce};
      return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt(claims),expires_in:600,token_type:'Bearer'}});
    });
    await page.route('https://api.example.invalid/**',route=>{
      const path=new URL(route.request().url()).pathname;
      if(path.endsWith('/me'))return route.fulfill({json:{subject:'person',realm:'gridex',roles:[admin?'administrator':'viewer'],permissions:['site:read'],memberships:[{organisationId:'org',role:admin?'administrator':'viewer',allSites:true}]}});
      if(path.endsWith('/me/services'))return route.fulfill({json:{services:enabled?[{code:'visualisations',organisationId:'org'}]:[]}});
      if(path.endsWith('/service-requests'))return route.fulfill({json:{requests:[]}});
      if(path.endsWith('/services')||path.endsWith('/service-catalog'))return route.fulfill({json:{services:[{code:'visualisations',description:'Graphs',requestable:true,enabled:true}]}});
      if(path.endsWith('/sites'))return route.fulfill({json:{sites:[{id:'lab',organisationId:'org',name:'Lab'}]}});
      if(path.endsWith('/visualisations/history'))return enabled
        ?route.fulfill({json:{siteId:'lab',items:[]}})
        :route.fulfill({status:403,json:{error:'service_not_enabled',details:{missing:'member',organisationEnabled:true,memberEnabled:false}}});
      return route.fulfill({status:503,json:{error:'unavailable'}});
    });
    await page.goto('/sites/lab/services/visualisations/');
    if(enabled)await expect(page.getByText(lang==='en'?'No configured OpenRemote measurements for this Site yet.':'За този Обект още няма настроени измервания в OpenRemote.')).toBeVisible();
    else{
      await expect(page.getByText(lang==='en'?'Approved for the organisation':'Одобрена за организацията',{exact:true})).toBeVisible();
      await expect(page.getByText(lang==='en'?'Not enabled for you':'Не е разрешена за Вас',{exact:true})).toBeVisible();
      await expect(page.locator('.site-visualisations a.secondary-btn')).toHaveAttribute('href',admin?'/settings/users/':'/services/');
    }
    await page.screenshot({path:testInfo.outputPath('graphs.png'),fullPage:true});
    await page.goto('/services/');
    const row=page.locator('.service-grant-row').filter({hasText:lang==='en'?'Graphs':'Графики'});
    if(admin&&!enabled){
      await expect(row).toContainText(lang==='en'?'Approved for the organisation · not enabled for you':'Одобрена за организацията · не е разрешена за Вас');
      await expect(row.getByRole('link')).toHaveAttribute('href','/settings/users/');
      await expect(row.getByRole('button',{name:lang==='en'?'Request':'Заяви',exact:true})).toHaveCount(0);
    }else if(enabled)await expect(row).toContainText(lang==='en'?'Enabled for you':'Разрешена за Вас');
    else await expect(row.getByRole('button',{name:lang==='en'?'Request':'Заяви',exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath('catalogue.png'),fullPage:true});
  });
}
