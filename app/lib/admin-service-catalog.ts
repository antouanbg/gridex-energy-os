import type { ServiceGrant } from './gridex-api';

// Owner-approved catalogue. Keep rows visible while permissions are loading;
// only a verified API grant can enable an action.
export const approvedServiceCodes = ['day_ahead','visualisations','analysis','meteorology','forecasting'] as const;
export function adminServiceRows(grants:ServiceGrant[]|null):ServiceGrant[] {
  return approvedServiceCodes.map(code=>grants?.find(item=>item.code===code)
    || {code,description:code,prerequisites:[],enabled:false,requestable:code==='day_ahead'||code==='visualisations'});
}
export function organisationServiceReady(service:ServiceGrant):boolean {
  return service.enabled && (service.code!=='day_ahead' || service.zones?.some(zone=>zone.country==='BG'&&zone.zone==='BG')===true);
}
