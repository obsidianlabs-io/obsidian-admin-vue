import assert from 'node:assert/strict';
import test from 'node:test';
import { handleDynamicAuthRouteInitFailure } from '../src/store/modules/route/init-failover';

test('handleDynamicAuthRouteInitFailure waits for resetStore completion', async () => {
  let finished = false;

  await handleDynamicAuthRouteInitFailure(async () => {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        finished = true;
        resolve();
      }, 5);
    });
  });

  assert.equal(finished, true);
});
