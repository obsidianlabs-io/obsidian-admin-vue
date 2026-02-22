import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { generatedRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

const sidebarMenuOrder: Partial<Record<string, number>> = {
  dashboard: 1,
  tenant: 2,
  role: 3,
  permission: 4,
  language: 5,
  'theme-config': 6,
  user: 7
};

function applyDefaultSidebarOrder(route: ElegantRoute): ElegantRoute {
  const fallbackOrder = sidebarMenuOrder[route.name];

  if (fallbackOrder === undefined || !route.meta || route.meta.order !== undefined) {
    return route;
  }

  return {
    ...route,
    meta: {
      ...route.meta,
      order: fallbackOrder
    }
  };
}

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customRoutes: CustomRoute[] = [];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  [...customRoutes, ...generatedRoutes].forEach(item => {
    const orderedRoute = applyDefaultSidebarOrder(item);

    if (orderedRoute.meta?.constant) {
      constantRoutes.push(orderedRoute);
    } else {
      authRoutes.push(orderedRoute);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  return transformElegantRoutesToVueRoutes(routes, layouts, views);
}
