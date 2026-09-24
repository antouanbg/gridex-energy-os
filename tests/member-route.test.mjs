import test from 'node:test';
import assert from 'node:assert/strict';
import { readRoute, sectionHref } from '../app/lib/routes.ts';

test('organisation invitation submenu has a stable deep link outside Site context', () => {
  assert.equal(sectionHref('members','site-id'),'/customers/users/');
  assert.deepEqual(readRoute('/customers/users/'),{view:'members',siteId:''});
  assert.equal(sectionHref('members','',true),'/demo/customers/users/');
});
