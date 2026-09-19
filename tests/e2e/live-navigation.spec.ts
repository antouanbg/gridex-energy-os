import {test,expect} from '@playwright/test';

test('authenticated navigation, transient refresh outage, recovery and real expiry',async({page})=>{
  test.setTimeout(100000);
  let nonce='',refreshFailure=0,refreshes=0;
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  const jwt=(claims:object)=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'test'].join('.');
  await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:`window.__GRIDEX_CONFIG__={mode:'auto',authEnabled:true,apiBaseUrl:'https://api.example.invalid',oidcIssuer:'https://auth.example.invalid/auth/realms/gridex',realm:'gridex',oidcClientId:'gridex-portal',snapshotRefreshMs:5000};`}));
  await page.route('https://auth.example.invalid/**',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname.endsWith('/auth')) {
      nonce=url.searchParams.get('nonce')!;
      const callback=url.searchParams.get('redirect_uri')!+'#code=test-code&state='+url.searchParams.get('state');
      return route.fulfill({status:302,headers:{location:callback}});
    }
    if(url.pathname.endsWith('/token')) {
      if(route.request().postData()?.includes('refresh_token')) {
        refreshes++;
        if(refreshFailure)return route.fulfill({status:refreshFailure,json:{error:refreshFailure===400?'invalid_grant':'temporarily_unavailable'}});
      }
      const now=Math.floor(Date.now()/1000);
      const claims={sub:'test-user',iss:'https://auth.example.invalid/auth/realms/gridex',aud:'gridex-portal',iat:now,exp:now+35,nonce,session_state:'test-session',email:'owner@example.invalid',name:'Test Owner',preferred_username:'owner'};
      return route.fulfill({json:{access_token:jwt(claims),id_token:jwt(claims),refresh_token:jwt({...claims,exp:now+3600}),expires_in:35,token_type:'Bearer'}});
    }
    return route.fulfill({json:{username:'owner',email:'owner@example.invalid'}});
  });
  await page.route('https://api.example.invalid/**',route=>{
    const path=new URL(route.request().url()).pathname;
    if(path==='/api/v1/me')return route.fulfill({json:{subject:'test-user',roles:['administrator'],permissions:['site:read'],memberships:[]}});
    if(path==='/api/v1/sites')return route.fulfill({json:{sites:[{id:'test-site',name:'Test Lab',organisationId:'test-org'}]}});
    if(path.endsWith('/snapshot'))return route.fulfill({status:503,json:{error:'unavailable'}});
    if(path.endsWith('/hardware'))return route.fulfill({json:{configuration:{revision:1,status:'draft'},gateways:[{id:'rock',name:'Test ROCK Pi',hardwareModel:'ROCK Pi E',role:'controller',ports:[]},{id:'esp',name:'Test ESP32',hardwareModel:'ESP32',role:'device-node',ports:[]}],devices:[]}});
    if(path.endsWith('/device-setup'))return route.fulfill({json:{revision:0,configuration:{},imported:{pollMs:500,timeoutMs:400,devices:[{gatewayId:'rock',communication:'node-polling-and-local-modbus-listener'},{gatewayId:'esp',communication:'modbus-tcp-via-rockpi'}]}}});
    return route.fulfill({json:{invitations:[]}});
  });
  await page.goto('/');
  await page.locator('.demo-mode-notice button').first().click();
  await page.locator('.login-submit').click();
  await expect(page.locator('.backend-badge')).toHaveText('OPENREMOTE LIVE');
  for(const view of ['sites','devices','gateway','overview','customers','assets','battery','schedule','market','settlement','automation','loads','balance','supported','alarms','reports','settings','plans','about']) {
    await page.locator(`[data-view-id="${view}"]`).click();
    await expect(page.getByTestId('section-'+view)).toBeVisible();
    await expect(page.locator('.backend-badge')).toHaveText('OPENREMOTE LIVE');
    await expect(page.getByTestId('page-eyebrow')).not.toContainText('6 ОБЕКТА');
  }
  await page.locator('[data-view-id="sites"]').click();
  await expect(page.getByRole('heading',{name:'Test Lab'})).toBeVisible();
  await page.getByRole('button',{name:'Устройства →',exact:true}).click();
  await expect(page.getByTestId('section-devices')).toBeVisible();
  await expect(page.getByRole('region',{name:'Внесени устройства'})).toContainText('Test ROCK Pi');
  await expect(page.getByRole('region',{name:'Внесени устройства'})).toContainText('Test ESP32');
  await page.getByLabel('Устройство',{exact:true}).selectOption('rock');
  await expect(page.getByText('Не е необходим повторен provisioning.',{exact:false})).toBeVisible();
  await page.getByLabel('Устройство',{exact:true}).selectOption('esp');
  await expect(page.getByText('ESP32: Modbus TCP през ROCK Pi; DHCP резервация.',{exact:true})).toBeVisible();
  await page.locator('[data-view-id="assets"]').click();
  await page.getByRole('button',{name:'Отвори регистрираните устройства',exact:true}).click();
  await expect(page.getByRole('region',{name:'Внесени устройства'})).toContainText('Test ESP32');
  refreshFailure=503;
  await page.waitForTimeout(22000);
  expect(refreshes).toBeGreaterThan(0);
  await expect(page.locator('.backend-badge')).toHaveText('OPENREMOTE LIVE');
  refreshFailure=0;
  await page.waitForTimeout(21000);
  await expect(page.locator('.backend-badge')).toHaveText('OPENREMOTE LIVE');
  refreshFailure=400;
  await page.waitForTimeout(22000);
  await expect(page.locator('.backend-badge')).not.toHaveText('OPENREMOTE LIVE');
  expect(errors).toEqual([]);
});
