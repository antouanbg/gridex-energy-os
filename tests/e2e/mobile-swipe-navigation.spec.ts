import {test,expect} from '@playwright/test';

for(const width of [360,390,430])test.describe(`swipe navigation ${width}`,()=>{
  test.use({viewport:{width,height:900},isMobile:true,hasTouch:true});
  test('three visible sections, touch scroll and every destination remain reachable',async({page},testInfo)=>{
    await page.goto('/demo/');
    const nav=page.locator('#main-navigation');
    await expect(nav.locator('[data-view-id]')).toHaveCount(18);
    const dimensions=await nav.evaluate(el=>({width:el.clientWidth,item:el.querySelector('a')!.getBoundingClientRect().width}));
    expect(Math.abs(dimensions.width-(dimensions.item*3+6))).toBeLessThan(2);
    const box=(await nav.boundingBox())!;
    const client=await page.context().newCDPSession(page);
    const y=box.y+box.height/2;
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-15,y}]});
    for(let i=1;i<=10;i++){
      await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-15-i*(box.width-30)/10,y}]});
      await page.waitForTimeout(20);
    }
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect.poll(()=>nav.evaluate(el=>el.scrollLeft)).toBeGreaterThan(40);
    await expect(page).toHaveURL(/\/demo\/$/);
    const ids=await nav.locator('[data-view-id]').evaluateAll(els=>els.map(el=>el.getAttribute('data-view-id')!));
    for(const id of ids){
      const link=nav.locator(`[data-view-id="${id}"]`);
      await link.scrollIntoViewIfNeeded();
      await link.tap();
      await expect(link).toHaveAttribute('aria-current','page');
    }
    await page.reload();
    await expect(nav.locator('[data-view-id="about"]')).toBeInViewport();
    await page.screenshot({path:testInfo.outputPath('mobile-bottom-swipe.png')});
    await page.locator('.mobile-menu-toggle').tap();
    await expect(nav.locator('[data-view-id="devices"]')).toBeVisible();
    await page.locator('.mobile-menu-toggle').tap();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
});
