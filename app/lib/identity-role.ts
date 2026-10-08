import type {GridexUser} from './gridex-api';
import {translate, type TranslationKey} from '../i18n/catalog';

const keys:Record<string,TranslationKey>={
  administrator:'role.organisation',viewer:'role.viewer',operator:'role.operator',
  energy_manager:'role.energyManager',integrator:'role.integrator',
};
// Presentation only. API authorization remains the authority; never infer
// platform rights from an email or a loosely matched OIDC role string.
export function identityRole(identity:GridexUser,lang:string):string {
  if(identity.permissions.includes('platform:manage'))return translate(lang,'role.platform');
  const roles=[...new Set(identity.memberships?.map(member=>member.role)||[])];
  return roles.length?roles.map(role=>translate(lang,keys[role]||'role.unknown')).join(' · ')
    :translate(lang,'role.unknown');
}
