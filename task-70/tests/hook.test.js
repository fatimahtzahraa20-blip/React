import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { create, act } from 'react-test-renderer';
import { useDedupedRequest } from '../src/hooks/useDedupedRequest.js';
import { clearResponseCache, request } from '../src/api/httpClient.js';

test('hook protects latest state, cancels and handles unmount', async () => {
  clearResponseCache();
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = (_url, options) => new Promise((resolve) => calls.push({ options, resolve: (data) => resolve(new Response(JSON.stringify(data))) }));
  let hook; let tree;
  function Harness() { hook = useDedupedRequest(); return null; }
  try {
    await act(async () => { tree = create(React.createElement(Harness)); });
    // Keep the old fetch alive through another subscriber, exercising the generation guard.
    const keeper = request('/old');
    let old; let fresh;
    await act(async () => { old = hook.call('/old'); });
    await act(async () => { fresh = hook.call('/new'); });
    await act(async () => { calls[1].resolve('new'); await fresh; });
    await act(async () => { calls[0].resolve('old'); await keeper.promise; await old; });
    assert.equal(hook.data, 'new');
    await act(async () => { void hook.call('/cancel'); });
    await act(async () => { hook.cancel(); });
    assert.equal(hook.loading, false); assert.equal(calls[2].options.signal.aborted, true);
    await act(async () => { void hook.call('/unmount'); });
    await act(async () => { tree.unmount(); });
    assert.equal(calls[3].options.signal.aborted, true);
    calls[2].resolve('ignored'); calls[3].resolve('ignored');
  } finally { globalThis.fetch = original; }
});

