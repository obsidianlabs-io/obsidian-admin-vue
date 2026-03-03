import type { ElegantConstRoute } from '@elegant-router/types';

export function dedupeRoutesByName(routes: ElegantConstRoute[]): ElegantConstRoute[] {
  const routeMap = new Map<string, ElegantConstRoute>();

  routes.forEach(route => {
    routeMap.set(route.name, route);
  });

  return Array.from(routeMap.values());
}
