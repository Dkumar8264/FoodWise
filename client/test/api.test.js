import assert from 'node:assert/strict';
import test from 'node:test';
import { deleteLatestServiceLog, generatePredictions, getEvaluation, getLatestServiceLog, signIn } from '../src/api.js';

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

test('generatePredictions requests a fresh authenticated preparation plan', async () => {
  let request;
  globalThis.fetch = async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ predictions: [], metrics: { model: 'Random Forest' } }) }; };

  const result = await generatePredictions('jwt-token', { event: 'Exam' });

  assert.equal(request.url, '/api/predictions/generate');
  assert.equal(request.options.headers.Authorization, 'Bearer jwt-token');
  assert.deepEqual(JSON.parse(request.options.body), { event: 'Exam' });
  assert.equal(result.metrics.model, 'Random Forest');
});

test('latest log preview and deletion use authenticated log endpoints', async () => {
  const requests = [];
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return { ok: true, json: async () => options.method === 'DELETE' ? { message: 'Latest service log deleted.', log: { dish: 'Idli' } } : { dish: 'Idli' } };
  };

  const preview = await getLatestServiceLog('jwt-token');
  const removed = await deleteLatestServiceLog('jwt-token');

  assert.equal(preview.dish, 'Idli');
  assert.equal(removed.log.dish, 'Idli');
  assert.deepEqual(requests.map(({ url, options }) => [url, options.method || 'GET', options.headers.Authorization]), [
    ['/api/logs/latest', 'GET', 'Bearer jwt-token'],
    ['/api/logs/latest', 'DELETE', 'Bearer jwt-token']
  ]);
});

test('signIn reports the server error for rejected credentials', async () => {
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Invalid email or password' }) });

  await assert.rejects(() => signIn('wrong@example.com', 'wrong'), /Invalid email or password/);
});
