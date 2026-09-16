import assert from 'node:assert/strict';
import test from 'node:test';
import { getEvaluation, signIn } from '../src/api.js';

const originalFetch = globalThis.fetch;
test.after(() => { globalThis.fetch = originalFetch; });

test('signIn sends credentials and returns the authenticated user payload', async () => {
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ token: 'jwt-token', user: { name: 'Arjun' } }) };
  };

  const result = await signIn('admin@foodwise.in', 'foodwise123');

  assert.equal(request.url, '/api/auth/login');
  assert.deepEqual(JSON.parse(request.options.body), { email: 'admin@foodwise.in', password: 'foodwise123' });
  assert.equal(result.token, 'jwt-token');
});

test('getEvaluation includes the stored JWT and returns backtest metrics', async () => {
  globalThis.fetch = async (_, options) => ({ ok: true, json: async () => ({ reductionPercent: 32.8, targetAchieved: true, authorization: options.headers.Authorization }) });

  const result = await getEvaluation('jwt-token');

  assert.equal(result.authorization, 'Bearer jwt-token');
  assert.equal(result.targetAchieved, true);
});

test('signIn reports the server error for rejected credentials', async () => {
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Invalid email or password' }) });

  await assert.rejects(() => signIn('wrong@example.com', 'wrong'), /Invalid email or password/);
});
