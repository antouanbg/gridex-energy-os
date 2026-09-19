import {test,expect} from '@playwright/test';

for(const [locale,title] of [['fr-FR','Vous préférez le français ?'],['es-ES','¿Prefieres español?'],['de-DE','Lieber auf Deutsch?'],['it-IT','Preferisci l’italiano?']]) {
  test.describe(locale,()=>{
    test.use({locale});
    test('offers optional browser translation and remembers dismissal',async({page},testInfo)=>{
      const outbound:string[]=[];
      page.on('request',r=>{if(/translate\.google|deepl|ipapi|geoip/.test(r.url()))outbound.push(r.url());});
      await page.goto('/');
      const notice=page.getByRole('complementary',{name:title});
      await expect(notice).toBeVisible();
      await notice.getByRole('button').first().click();
      await expect(page.locator('#translation-guidance')).toBeVisible();
      await page.screenshot({path:testInfo.outputPath('translation-guidance.png')});
      await notice.getByRole('button').last().click();
      await page.reload();
      await expect(page.locator('.translation-suggestion')).toHaveCount(0);
      expect(outbound).toEqual([]);
    });
  });
}
test.describe('language preference',()=>{
  test.use({locale:'fr-FR'});
  test('manual BG overrides browser language and persists',async({page})=>{
    await page.goto('/');
    await expect(page.getByRole('button',{name:'Language'})).toHaveText('BG');
    await page.getByRole('button',{name:'Language'}).click();
    await expect(page.locator('.translation-suggestion')).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('button',{name:'Language'})).toHaveText('EN');
    await expect(page.locator('.translation-suggestion')).toHaveCount(0);
  });
  test('explicit English route suppresses suggestion',async({page})=>{
    await page.goto('/en/');
    await expect(page.locator('.translation-suggestion')).toHaveCount(0);
  });
});
