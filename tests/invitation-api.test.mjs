import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../app/lib/gridex-api.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { GridexApiClient } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('invitation API sends bearer identity and explicit scope; rejects unavailable enrollment', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: 'invite', state: 'sent', accepted: true, revoked: true }), { status: 200 });
  };
  try {
    const client = new GridexApiClient({ mode: 'auto', apiBaseUrl: '' }, async () => 'synthetic-token');
    await client.invite('org', { email: 'user@example.invalid', role: 'viewer', siteIds: ['site'] });
    assert.equal(calls[0].url, '/api/v1/organisations/org/invitations');
    assert.equal(calls[0].init.headers.get('Authorization'), 'Bearer synthetic-token');
    assert.deepEqual(JSON.parse(calls[0].init.body).siteIds, ['site']);
    await client.acceptInvitation('invite');
    assert.equal(calls[1].url, '/api/v1/invitations/invite/accept');
    await client.revokeInvitation('org', 'invite');
    assert.equal(calls[2].url, '/api/v1/organisations/org/invitations/invite/revoke');
    globalThis.fetch = async () => new Response('{}', { status: 503 });
    await assert.rejects(client.invitations(), { status: 503 });
  } finally { globalThis.fetch = original; }
});
