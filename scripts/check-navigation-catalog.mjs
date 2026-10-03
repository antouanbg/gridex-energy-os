// Read-only release check. Only public presentation metadata is queried.
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const expected=JSON.parse(readFileSync(new URL('../app/lib/navigation-catalog.json',import.meta.url),'utf8'));
const sql='SELECT json_agg(n ORDER BY sort_order) FROM (SELECT id,parent_id,path,label_key,sort_order,requirement,revision FROM navigation_catalog) n';
const result=spawnSync('docker',['exec','gridex-mac-gridex-db-1','psql','-U','gridex','-d','gridex','-Atc',sql],{encoding:'utf8',timeout:15000});
if(result.status!==0)throw Error('Navigation database check unavailable; not verified.');
assert.deepEqual(expected,JSON.parse(result.stdout.trim()),'Public navigation snapshot differs from the database. Reconcile the approved catalogue before publication.');
console.log('NAVIGATION_CATALOG_MATCH: '+expected.length+' entries; no personal data queried.');
