import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
  await page.route('**/gridex-config.js',r=>r.fulfill({contentType:'application/javascript',body:'window.__GRIDEX_CONFIG__={mode:"demo",authEnabled:false};'}));
});
for(const width of [390,1440]){
  test('approved navigation and help at '+width,async({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/demo/services/');
    await expect(page.getByTestId('page-title')).toHaveText('Услуги');
    await expect(page.locator('[data-view-id="devices"]')).toHaveAttribute('href','/demo/infrastructure/');
    await expect(page.locator('[data-view-id="supported"]')).toHaveCount(0);
    await expect(page.locator('[data-view-id="market"]')).toHaveAttribute('data-parent','services');
    await page.goto('/demo/settings/market/tariff/');
    await expect(page.getByTestId('page-title')).toContainText('Тарифа');
    await expect(page.locator('[data-view-id="settlement"]')).toHaveAttribute('data-parent','market-settings');
    await expect(page.locator('.section-loading')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    await page.screenshot({path:'test-results/approved-navigation-'+width+'.png',fullPage:true});
    await page.goto('/demo/market/');
    await expect(page.getByTestId('page-title')).toHaveText('Услуги→Цени ден напред');
  });
}
