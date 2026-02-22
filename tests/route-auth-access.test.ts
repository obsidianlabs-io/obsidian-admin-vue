import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getRoutePermissionCodes,
  getRouteRoleCodes,
  hasRouteAccess,
  isRouteEnabled,
  isRouteNoTenantOnly,
  isRouteTenantOnly
} from '../src/store/modules/route/auth-access';

test('route auth helpers resolve meta and backend rules', () => {
  const routeRules: Api.Auth.RouteRuleMap = {
    user: {
      permissions: ['user.view'],
      roles: ['R_ADMIN'],
      noTenantOnly: false,
      tenantOnly: true,
      enabled: true
    }
  };

  assert.deepEqual(getRoutePermissionCodes('user', null, routeRules), ['user.view']);
  assert.deepEqual(getRouteRoleCodes('user', null, routeRules), ['R_ADMIN']);
  assert.equal(isRouteNoTenantOnly('user', routeRules), false);
  assert.equal(isRouteTenantOnly('user', routeRules), true);
  assert.equal(isRouteEnabled('user', routeRules), true);
});

test('hasRouteAccess respects role, permission and tenant scope', () => {
  const routeRules: Api.Auth.RouteRuleMap = {
    role: {
      permissions: ['role.view'],
      roles: ['R_ADMIN'],
      noTenantOnly: false,
      tenantOnly: true,
      enabled: true
    }
  };

  assert.equal(
    hasRouteAccess({
      routeName: 'role',
      context: {
        roles: ['R_ADMIN'],
        permissionCodes: ['role.view'],
        currentTenantId: '1',
        routeRules
      }
    }),
    true
  );

  assert.equal(
    hasRouteAccess({
      routeName: 'role',
      context: {
        roles: ['R_ADMIN'],
        permissionCodes: [],
        currentTenantId: '1',
        routeRules
      }
    }),
    false
  );
});
