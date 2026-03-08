import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeDemoFetchPath, resetDemoBackend } from '../src/demo/backend';

test('normalizeDemoFetchPath strips api prefixes and maps dynamic segments', () => {
  assert.equal(normalizeDemoFetchPath('/api/v1/user/42'), '/user/:id');
  assert.equal(
    normalizeDemoFetchPath('/proxy-default/auth/sessions/demo-session-1/alias'),
    '/auth/sessions/:sessionId/alias'
  );
});

test('demo backend login and bootstrap flows return contract-shaped payloads', async () => {
  const backend = resetDemoBackend();

  const bootstrap = await backend.handle({
    method: 'GET',
    path: '/system/bootstrap',
    query: new URLSearchParams(),
    headers: {},
    body: {}
  });

  assert.equal(bootstrap.status, 200);
  assert.equal(bootstrap.body.code, '0000');
  const bootstrapData = bootstrap.body.data as { defaultLocale?: string };
  assert.equal(bootstrapData.defaultLocale, 'en-US');

  const login = await backend.handle({
    method: 'POST',
    path: '/auth/login',
    query: new URLSearchParams(),
    headers: {},
    body: {
      userName: 'Admin',
      password: '123456'
    }
  });

  assert.equal(login.status, 200);
  assert.equal(login.body.code, '0000');
  const loginData = login.body.data as { token?: string };
  assert.equal(loginData.token, 'demo-access-user-2');

  const userInfo = await backend.handle({
    method: 'GET',
    path: '/auth/getUserInfo',
    query: new URLSearchParams(),
    headers: {
      authorization: 'Bearer demo-access-user-2',
      'x-tenant-id': '1'
    },
    body: {}
  });

  assert.equal(userInfo.status, 200);
  const userInfoData = userInfo.body.data as {
    userName?: string;
    currentTenantId?: string;
    themeConfig?: { themeColor?: string };
  };

  assert.equal(userInfoData.userName, 'Admin');
  assert.equal(userInfoData.currentTenantId, '1');
  assert.equal(userInfoData.themeConfig?.themeColor, '#5b8cff');
});
