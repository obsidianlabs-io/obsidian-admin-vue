import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRequestContextHeaders,
  parseServiceCodeList,
  resolveServiceCodeConfig
} from '../src/service/request/context';

test('parseServiceCodeList trims values and removes empties', () => {
  const result = parseServiceCodeList(' 4010, 4020 ,,5000 ');

  assert.deepEqual(result, ['4010', '4020', '5000']);
});

test('resolveServiceCodeConfig provides defaults', () => {
  const config = resolveServiceCodeConfig({
    VITE_SERVICE_SUCCESS_CODE: '1000',
    VITE_SERVICE_LOGOUT_CODES: '7001,7002',
    VITE_SERVICE_MODAL_LOGOUT_CODES: '8001',
    VITE_SERVICE_EXPIRED_TOKEN_CODES: '9001'
  });

  assert.equal(config.successCode, '1000');
  assert.deepEqual(config.logoutCodes, ['7001', '7002']);
  assert.deepEqual(config.modalLogoutCodes, ['8001']);
  assert.deepEqual(config.expiredTokenCodes, ['9001']);
});

test('buildRequestContextHeaders applies locale and tenant headers consistently', () => {
  const withTenant = buildRequestContextHeaders(
    {
      authorization: 'Bearer token',
      locale: 'en-US',
      tenantId: '12'
    },
    {
      'X-Trace-Id': 'trace-1'
    }
  );

  assert.equal(withTenant.Authorization, 'Bearer token');
  assert.equal(withTenant['Accept-Language'], 'en-US');
  assert.equal(withTenant['X-Locale'], 'en-US');
  assert.equal(withTenant['X-Tenant-Id'], '12');
  assert.equal(withTenant['X-Trace-Id'], 'trace-1');

  const withoutTenant = buildRequestContextHeaders(
    {
      authorization: null,
      locale: 'zh-CN',
      tenantId: ''
    },
    {
      'X-Tenant-Id': 'legacy'
    }
  );

  assert.equal(withoutTenant.Authorization, null);
  assert.equal(withoutTenant['Accept-Language'], 'zh-CN');
  assert.equal(withoutTenant['X-Locale'], 'zh-CN');
  assert.equal('X-Tenant-Id' in withoutTenant, false);
});
