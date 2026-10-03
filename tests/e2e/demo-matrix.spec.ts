import {test,expect} from '@playwright/test';
import catalogue from '../../app/lib/navigation-catalog.json' with {type:'json'};
import bg from '../../app/i18n/locales/bg.json' with {type:'json'};
import en from '../../app/i18n/locales/en.json' with {type:'json'};

for(const lang of ['bg','en'] as const)for(const width of [390,1440]){
  test('demo database matrix '+lang+' '+width,async({page},info)=>{
    test.setTimeout(90000);
    await page.setViewportSize({width,height:900});
    await page.route('**/gridex-config.js',route=>route.fulfill({contentType:'application/javascript',body:'window.__GRIDEX_CONFIG__={mode:"demo",authEnabled:false};'}));
    await page.route('**/api/v1/contact/challenge',route=>route.fulfill({status:503,json:{error:'test_challenge_unavailable'}}));
    const errors:string[]=[];const apiCalls:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(request.url().includes('/api/v1/')&&!request.url().endsWith('/contact/challenge'))apiCalls.push(request.url());});
    const labels=lang==='en'?en:bg;
    for(const row of catalogue){
      await page.goto((lang==='en'?'/en':'')+'/demo'+row.path);
      await expect(page.getByTestId('section-'+row.id)).toBeVisible();
      await expect(page.getByTestId('page-title')).toContainText(labels[row.label_key as keyof typeof labels]);
      const links=page.locator('.sidebar [data-view-id]');
      expect(await links.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-view-id')))).toEqual(catalogue.map(item=>item.id));
      await expect(page.locator('[data-view-id="'+row.id+'"]')).toHaveAttribute('href','/demo'+row.path);
      if(row.parent_id)await expect(page.locator('[data-view-id="'+row.id+'"]')).toHaveAttribute('data-parent',row.parent_id);
      await expect(page.locator('.page-help-link')).toHaveAttribute('href','https://doc.gridex.tech'+(lang==='en'?'/en':'')+'/demo-navigation/');
      const overflow=await page.evaluate(()=>({width:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('main *')].filter(el=>el.getBoundingClientRect().right>window.innerWidth+1).map(el=>el.className).slice(0,10)}));
      expect(overflow.width,JSON.stringify({view:row.id,...overflow})).toBeLessThanOrEqual(width+1);
      if(row.id==='inverter'||row.id==='evse'){
        await expect(page.locator('[data-demo-asset]')).toHaveCount(1);
        await expect(page.locator('[data-demo-asset]')).toHaveAttribute('data-demo-asset',row.id);
      }
      if(row.id==='assets')await expect(page.locator('[data-demo-asset]')).toHaveCount(4);
      if(row.id==='devices'){
        await expect(page.getByTestId('section-devices')).toContainText('ROCK Pi');
        await expect(page.getByTestId('section-devices')).toContainText('ESP32');
        await expect(page.getByTestId('section-devices')).not.toContainText('ABB Terra');
      }
      if(row.id==='visualisations'){
        await expect(page.locator('.telemetry-history')).toBeVisible();
        await expect(page.locator('.device-toolbar')).toBeHidden();
      }
      if(['assets','devices','visualisations','services'].includes(row.id))await page.screenshot({path:info.outputPath(row.id+'.png'),fullPage:true});
    }
    expect(errors).toEqual([]);expect(apiCalls).toEqual([]);
  });
}
