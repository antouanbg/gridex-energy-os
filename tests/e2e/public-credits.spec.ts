import {test,expect} from '@playwright/test';
for(const locale of ['bg','en'])test('public project privacy '+locale,async({page})=>{
  await page.addInitScript(lang=>localStorage.setItem('gridex.ui-language',lang),locale);
  await page.route('**/api/v1/contact/challenge',r=>r.fulfill({status:503,json:{error:'unavailable'}}));
  for(const route of ['/demo/about/','/demo/infrastructure/catalogue/']){
    await page.goto(route);
    await expect(page.getByTestId('page-title')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Antouan|Antuan|Angelov|Антуан|Ангелов/i);
    await expect(page.locator('a[href*="github.com/antouanbg"]')).toHaveCount(0);
    if(route.includes('about'))await expect(page.locator('body')).toContainText('OPEN SOURCE · MIT LICENSE');
  }
});
