import {test,expect} from '@playwright/test';
import {localeCatalogs,translate,resolveLocale,formatNumber} from '../../app/i18n/catalog';
import {navItems,navigationLabel} from '../../app/lib/navigation';

test('BG/EN catalogues have identical nonempty keys and cover approved navigation',()=>{
  expect(Object.keys(localeCatalogs.en).sort()).toEqual(Object.keys(localeCatalogs.bg).sort());
  for(const catalog of Object.values(localeCatalogs))for(const text of Object.values(catalog))expect(text.trim()).not.toBe('');
  for(const [section] of navItems){
    expect(navigationLabel(section,'bg')).not.toBe(section);
    expect(navigationLabel(section,'en')).not.toBe(section);
  }
});
test('locale resolution and permission messages distinguish denial from failure',()=>{
  expect(resolveLocale('en-GB')).toBe('en');
  expect(resolveLocale('bg-BG')).toBe('bg');
  expect(resolveLocale('fr-FR')).toBe('bg');
  expect(translate('en','access.denied')).not.toBe(translate('en','access.unavailable'));
  expect(translate('bg','access.denied')).not.toBe(translate('bg','access.unavailable'));
  expect(formatNumber(1234.5,'en')).toBe('1,234.5');
});
