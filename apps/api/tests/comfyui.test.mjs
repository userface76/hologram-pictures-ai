import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ComfyUIClient } from '../dist/services/comfyuiClient.js';

test('ComfyUI pilot transport', async () => {
  process.env.COMFYUI_ENABLED = 'false';
  process.env.COMFYUI_BASE_URL = 'https://example.invalid';
  process.env.COMFYUI_API_TOKEN = 'mock-token';
  let calls = 0;
  const client = new ComfyUIClient(async (url, init) => {
    calls++;
    assert.equal(init.headers.get('Authorization'), 'Bearer mock-token');
    assert.equal(init.redirect, 'error');
    if (url.endsWith('/system_stats')) return Response.json({});
    if (url.endsWith('/prompt')) {
      assert.equal(init.method, 'POST');
      assert.ok(JSON.parse(init.body).prompt);
      return Response.json({prompt_id:'mock-id'});
    }
    if (url.endsWith('/history/mock-id')) return Response.json({'mock-id':{}});
    throw new Error('unexpected endpoint');
  });
  await assert.rejects(client.health(), /disabled/);
  assert.equal(calls, 0);
  process.env.COMFYUI_ENABLED = 'true';
  assert.deepEqual(await client.health(), {ok:true});
  assert.equal(await client.submit({}), 'mock-id');
  assert.deepEqual(await client.history('mock-id'), {'mock-id':{}});
  assert.equal(calls, 3);
  let failedCalls = 0;
  const failing = new ComfyUIClient(async () => { failedCalls++; throw new Error('timeout'); });
  await assert.rejects(failing.submit({}), /timeout/);
  assert.equal(failedCalls, 1);
  process.env.COMFYUI_BASE_URL = 'http://example.invalid';
  await assert.rejects(client.health(), /HTTPS/);
  assert.equal(calls, 3);
});
