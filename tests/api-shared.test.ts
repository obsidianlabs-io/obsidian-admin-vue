import assert from 'node:assert/strict';
import test from 'node:test';
import { buildResourceItemUrl } from '../src/service/api/url';

test('buildResourceItemUrl encodes id path segment', () => {
  const encoded = buildResourceItemUrl('/user', 'a/b c?x=1');
  assert.equal(encoded, '/user/a%2Fb%20c%3Fx%3D1');
});

test('buildResourceItemUrl handles numeric id', () => {
  const encoded = buildResourceItemUrl('/tenant', 42);
  assert.equal(encoded, '/tenant/42');
});
