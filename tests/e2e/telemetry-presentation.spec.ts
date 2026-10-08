import {test,expect} from '@playwright/test';
import {telemetryRows,telemetryValue} from '../../app/lib/telemetry-presentation';

test('telemetry deduplicates only identical source/metric, retaining separate sensors',()=>{
  const items=telemetryRows([
    {assetId:'a',metric:'cpuTemperatureC',unit:'Cel',points:[{x:1,y:40}]},
    {assetId:'a',metric:'cpuTemperatureC',unit:'Cel',points:[{x:2,y:41},{x:3,y:NaN}]},
    {assetId:'b',metric:'cpuTemperatureC',unit:'Cel',points:[{x:2,y:38}]},
  ]);
  expect(items).toHaveLength(2);
  expect(items[0].points).toEqual([{x:1,y:40},{x:2,y:41}]);
  expect(telemetryValue(1048576,'bytes','en-GB')).toBe('1 MiB');
  expect(telemetryValue(5400,'s','bg-BG')).toBe('1,5 h');
});
