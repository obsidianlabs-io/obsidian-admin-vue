import type { RouteLocationNormalizedLoaded, RouteRecordRaw, _RouteRecordBase } from 'vue-router';
import type { ElegantConstRoute, LastLevelRouteKey, RouteKey, RouteMap } from '@elegant-router/types';
import { useSvgIcon } from '@/hooks/common/icon';
import { $t } from '@/locales';
import { type RouteAuthFilterContext, hasRouteAccess } from './auth-access';

export {
  type RouteAuthFilterContext,
  getRoutePermissionCodes,
  getRouteRoleCodes,
  hasRouteAccess,
  isRouteEnabled,
  isRouteNoTenantOnly,
  isRouteTenantOnly
} from './auth-access';

const MENU_I18N_FALLBACK_BY_KEY: Record<string, App.I18n.I18nKey> = {
  dashboard: 'route.dashboard',
  tenant: 'route.tenant',
  user: 'route.user',
  role: 'route.role',
  'audit-policy': 'route.audit-policy',
  audit: 'route.audit',
  permission: 'route.permission',
  language: 'route.language',
  'access-management': 'menu.accessManagement',
  'platform-settings': 'menu.systemSettings'
};

function resolveBackendMenuI18nKey(item: Api.Auth.MenuItem): App.I18n.I18nKey | undefined {
  if (item.i18nKey) {
    return item.i18nKey;
  }

  if (item.key && MENU_I18N_FALLBACK_BY_KEY[item.key]) {
    return MENU_I18N_FALLBACK_BY_KEY[item.key];
  }

  if (item.routeKey && MENU_I18N_FALLBACK_BY_KEY[item.routeKey]) {
    return MENU_I18N_FALLBACK_BY_KEY[item.routeKey];
  }

  return undefined;
}

/**
 * Filter auth routes by roles
 *
 * @param routes Auth routes
 * @param roles Roles
 * @param permissionCodes Permission codes
 * @param isSuperRole Whether current user is super role
 */
export function filterAuthRoutesByRoles(routes: ElegantConstRoute[], context: RouteAuthFilterContext) {
  return routes.flatMap(route => filterAuthRouteByRoles(route, context));
}

/**
 * Filter auth route by roles
 *
 * @param route Auth route
 * @param roles Roles
 * @param permissionCodes Permission codes
 * @param isSuperRole Whether current user is super role
 */
function filterAuthRouteByRoles(route: ElegantConstRoute, context: RouteAuthFilterContext): ElegantConstRoute[] {
  const filterRoute = { ...route };

  if (filterRoute.children?.length) {
    filterRoute.children = filterRoute.children.flatMap(item => filterAuthRouteByRoles(item, context));
  }

  // Exclude the route if it has no children after filtering
  if (filterRoute.children?.length === 0) {
    return [];
  }

  return hasRouteAccess({
    routeName: route.name,
    routeRoles: route.meta?.roles,
    routePermissionCodes: route.meta?.permissions,
    context
  })
    ? [filterRoute]
    : [];
}

/**
 * sort route by order
 *
 * @param route route
 */
function sortRouteByOrder(route: ElegantConstRoute) {
  if (route.children?.length) {
    route.children.sort((next, prev) => (Number(next.meta?.order) || 0) - (Number(prev.meta?.order) || 0));
    route.children.forEach(sortRouteByOrder);
  }

  return route;
}

/**
 * sort routes by order
 *
 * @param routes routes
 */
export function sortRoutesByOrder(routes: ElegantConstRoute[]) {
  routes.sort((next, prev) => (Number(next.meta?.order) || 0) - (Number(prev.meta?.order) || 0));
  routes.forEach(sortRouteByOrder);

  return routes;
}

/**
 * Get global menus by auth routes
 *
 * @param routes Auth routes
 */
export function getGlobalMenusByAuthRoutes(routes: ElegantConstRoute[]) {
  const menus: App.Global.Menu[] = [];

  routes.forEach(route => {
    if (!route.meta?.hideInMenu) {
      const menu = getGlobalMenuByBaseRoute(route);

      if (route.children?.some(child => !child.meta?.hideInMenu)) {
        menu.children = getGlobalMenusByAuthRoutes(route.children);
      }

      menus.push(menu);
    }
  });

  return menus;
}

/**
 * Build global menus from backend metadata.
 *
 * @param items Backend menu items
 */
export function getGlobalMenusByBackend(items: Api.Auth.MenuItem[]) {
  const { SvgIconVNode } = useSvgIcon();

  const transform = (menuItems: Api.Auth.MenuItem[]): App.Global.Menu[] => {
    return [...menuItems]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => {
        const i18nKey = resolveBackendMenuI18nKey(item);
        const icon = item.icon ? SvgIconVNode({ icon: item.icon, fontSize: 20 }) : undefined;
        const children = item.children?.length ? transform(item.children) : undefined;

        return {
          key: item.key,
          label: i18nKey ? $t(i18nKey) : item.label,
          i18nKey,
          routeKey: item.routeKey || undefined,
          routePath: item.routePath || undefined,
          icon,
          children
        };
      });
  };

  return transform(items);
}

/**
 * Update locale of global menus
 *
 * @param menus
 */
export function updateLocaleOfGlobalMenus(menus: App.Global.Menu[]) {
  const result: App.Global.Menu[] = [];

  menus.forEach(menu => {
    const { i18nKey, key, label, children } = menu;
    const resolvedI18nKey = i18nKey || MENU_I18N_FALLBACK_BY_KEY[key];

    const newLabel = resolvedI18nKey ? $t(resolvedI18nKey) : label;

    const newMenu: App.Global.Menu = {
      ...menu,
      i18nKey: resolvedI18nKey || undefined,
      label: newLabel
    };

    if (children?.length) {
      newMenu.children = updateLocaleOfGlobalMenus(children);
    }

    result.push(newMenu);
  });

  return result;
}

/**
 * Get global menu by route
 *
 * @param route
 */
function getGlobalMenuByBaseRoute(route: RouteLocationNormalizedLoaded | ElegantConstRoute) {
  const { SvgIconVNode } = useSvgIcon();

  const { name, path } = route;
  const { title, i18nKey, icon = import.meta.env.VITE_MENU_ICON, localIcon, iconFontSize } = route.meta ?? {};

  const label = i18nKey ? $t(i18nKey) : title!;

  const menu: App.Global.Menu = {
    key: name as string,
    label,
    i18nKey,
    routeKey: name as RouteKey,
    routePath: path as RouteMap[RouteKey],
    icon: SvgIconVNode({ icon, localIcon, fontSize: iconFontSize || 20 })
  };

  return menu;
}

/**
 * Get cache route names
 *
 * @param routes Vue routes (two levels)
 */
export function getCacheRouteNames(routes: RouteRecordRaw[]) {
  const cacheNames: LastLevelRouteKey[] = [];

  routes.forEach(route => {
    // only get last two level route, which has component
    route.children?.forEach(child => {
      if (child.component && child.meta?.keepAlive) {
        cacheNames.push(child.name as LastLevelRouteKey);
      }
    });
  });

  return cacheNames;
}

/**
 * Is route exist by route name
 *
 * @param routeName
 * @param routes
 */
export function isRouteExistByRouteName(routeName: RouteKey, routes: ElegantConstRoute[]) {
  return routes.some(route => recursiveGetIsRouteExistByRouteName(route, routeName));
}

/**
 * Recursive get is route exist by route name
 *
 * @param route
 * @param routeName
 */
function recursiveGetIsRouteExistByRouteName(route: ElegantConstRoute, routeName: RouteKey) {
  let isExist = route.name === routeName;

  if (isExist) {
    return true;
  }

  if (route.children && route.children.length) {
    isExist = route.children.some(item => recursiveGetIsRouteExistByRouteName(item, routeName));
  }

  return isExist;
}

/**
 * Get selected menu key path
 *
 * @param selectedKey
 * @param menus
 */
export function getSelectedMenuKeyPathByKey(selectedKey: string, menus: App.Global.Menu[]) {
  const keyPath: string[] = [];

  menus.some(menu => {
    const path = findMenuPath(selectedKey, menu);

    const find = Boolean(path?.length);

    if (find) {
      keyPath.push(...path!);
    }

    return find;
  });

  return keyPath;
}

/**
 * Get route key by selected menu key.
 *
 * @param selectedKey
 * @param menus
 */
export function getRouteKeyByMenuKey(selectedKey: string, menus: App.Global.Menu[]): RouteKey | null {
  for (const menu of menus) {
    const result = findRouteKeyByMenuKey(selectedKey, menu);

    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Find menu path
 *
 * @param targetKey Target menu key
 * @param menu Menu
 */
function findMenuPath(targetKey: string, menu: App.Global.Menu): string[] | null {
  const path: string[] = [];

  function dfs(item: App.Global.Menu): boolean {
    path.push(item.key);

    if (item.key === targetKey) {
      return true;
    }

    if (item.children) {
      for (const child of item.children) {
        if (dfs(child)) {
          return true;
        }
      }
    }

    path.pop();

    return false;
  }

  if (dfs(menu)) {
    return path;
  }

  return null;
}

/**
 * Find route key by menu key.
 *
 * @param targetKey Target menu key
 * @param menu Menu
 */
function findRouteKeyByMenuKey(targetKey: string, menu: App.Global.Menu): RouteKey | null {
  if (menu.key === targetKey) {
    return menu.routeKey || null;
  }

  if (menu.children) {
    for (const child of menu.children) {
      const routeKey = findRouteKeyByMenuKey(targetKey, child);

      if (routeKey) {
        return routeKey;
      }
    }
  }

  return null;
}

/**
 * Transform menu to breadcrumb
 *
 * @param menu
 */
function transformMenuToBreadcrumb(menu: App.Global.Menu) {
  const { children, ...rest } = menu;

  const breadcrumb: App.Global.Breadcrumb = {
    ...rest
  };

  if (children?.length) {
    breadcrumb.options = children.map(transformMenuToBreadcrumb);
  }

  return breadcrumb;
}

/**
 * Get breadcrumbs by route
 *
 * @param route
 * @param menus
 */
export function getBreadcrumbsByRoute(
  route: RouteLocationNormalizedLoaded,
  menus: App.Global.Menu[]
): App.Global.Breadcrumb[] {
  const key = route.name as string;
  const activeKey = route.meta?.activeMenu;

  for (const menu of menus) {
    if (menu.key === key) {
      return [transformMenuToBreadcrumb(menu)];
    }

    if (menu.key === activeKey) {
      const ROUTE_DEGREE_SPLITTER = '_';

      const parentKey = key.split(ROUTE_DEGREE_SPLITTER).slice(0, -1).join(ROUTE_DEGREE_SPLITTER);

      const breadcrumbMenu = getGlobalMenuByBaseRoute(route);
      if (parentKey !== activeKey) {
        return [transformMenuToBreadcrumb(breadcrumbMenu)];
      }

      return [transformMenuToBreadcrumb(menu), transformMenuToBreadcrumb(breadcrumbMenu)];
    }

    if (menu.children?.length) {
      const result = getBreadcrumbsByRoute(route, menu.children);
      if (result.length > 0) {
        return [transformMenuToBreadcrumb(menu), ...result];
      }
    }
  }

  return [];
}

/**
 * Transform menu to searchMenus
 *
 * @param menus - menus
 * @param treeMap
 */
export function transformMenuToSearchMenus(menus: App.Global.Menu[], treeMap: App.Global.Menu[] = []) {
  if (menus && menus.length === 0) return [];
  return menus.reduce((acc, cur) => {
    if (!cur.children && cur.routePath) {
      acc.push(cur);
    }
    if (cur.children && cur.children.length > 0) {
      transformMenuToSearchMenus(cur.children, treeMap);
    }
    return acc;
  }, treeMap);
}
