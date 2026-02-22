import type { RouteKey } from '@elegant-router/types';

type RouteRuleMap = Api.Auth.RouteRuleMap;

export interface RouteAuthFilterContext {
  roles: string[];
  permissionCodes?: string[];
  currentTenantId?: string;
  routeRules?: RouteRuleMap;
}

interface RouteAccessOptions {
  routeName?: string | symbol | null;
  routeRoles?: string[] | null;
  routePermissionCodes?: string[] | null;
  context: RouteAuthFilterContext;
}

function getRouteRule(routeName?: string | symbol | null, routeRules?: RouteRuleMap): Api.Auth.RouteRule | null {
  if (!routeRules || typeof routeName !== 'string') {
    return null;
  }

  return routeRules[routeName as RouteKey] || null;
}

export function getRoutePermissionCodes(
  routeName?: string | symbol | null,
  routePermissions?: string[] | null,
  routeRules?: RouteRuleMap
): string[] {
  if (routePermissions?.length) {
    return routePermissions;
  }

  return getRouteRule(routeName, routeRules)?.permissions || [];
}

export function getRouteRoleCodes(
  routeName?: string | symbol | null,
  routeRoles?: string[] | null,
  routeRules?: RouteRuleMap
): string[] {
  if (routeRoles?.length) {
    return routeRoles;
  }

  return getRouteRule(routeName, routeRules)?.roles || [];
}

export function isRouteNoTenantOnly(routeName?: string | symbol | null, routeRules?: RouteRuleMap): boolean {
  return Boolean(getRouteRule(routeName, routeRules)?.noTenantOnly);
}

export function isRouteTenantOnly(routeName?: string | symbol | null, routeRules?: RouteRuleMap): boolean {
  return Boolean(getRouteRule(routeName, routeRules)?.tenantOnly);
}

export function isRouteEnabled(routeName?: string | symbol | null, routeRules?: RouteRuleMap): boolean {
  const rule = getRouteRule(routeName, routeRules);

  if (!rule) {
    return true;
  }

  return rule.enabled !== false;
}

export function hasRouteAccess(options: RouteAccessOptions): boolean {
  const { routeName, routeRoles, routePermissionCodes, context } = options;
  const { roles, permissionCodes = [], currentTenantId = '', routeRules } = context;

  const requiredRoles = getRouteRoleCodes(routeName, routeRoles, routeRules);
  const requiredPermissionCodes = getRoutePermissionCodes(routeName, routePermissionCodes, routeRules);
  const noTenantOnly = isRouteNoTenantOnly(routeName, routeRules);
  const tenantOnly = isRouteTenantOnly(routeName, routeRules);
  const enabled = isRouteEnabled(routeName, routeRules);

  const hasRoleAuth = requiredRoles.length === 0 || requiredRoles.some(role => roles.includes(role));
  const hasPermissionAuth =
    requiredPermissionCodes.length === 0 || requiredPermissionCodes.some(code => permissionCodes.includes(code));
  const hasTenantScopeAuth = (!noTenantOnly || !currentTenantId) && (!tenantOnly || Boolean(currentTenantId));

  return enabled && hasRoleAuth && hasPermissionAuth && hasTenantScopeAuth;
}
