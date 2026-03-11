import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import type { RouteKey } from '@elegant-router/types';

/**
 * Router push
 *
 * Jump to the specified route, it can replace function router.push
 *
 * @param inSetup Whether is in vue script setup
 */
export function useRouterPush(inSetup = true) {
  const setupRouter = inSetup ? useRouter() : null;
  const setupRoute = inSetup ? useRoute() : null;

  async function resolveRouter() {
    if (setupRouter) {
      return setupRouter;
    }

    const { router } = await import('@/router');

    return router;
  }

  async function resolveCurrentRoute() {
    if (setupRoute) {
      return setupRoute;
    }

    const router = await resolveRouter();

    return router.currentRoute.value;
  }

  async function routerPush(routeLocation: RouteLocationRaw) {
    const router = await resolveRouter();

    return router.push(routeLocation);
  }

  async function routerBack() {
    const router = await resolveRouter();

    return router.back();
  }

  async function routerPushByKey(key: RouteKey, options?: App.Global.RouterPushOptions) {
    const { query, params } = options || {};
    const router = await resolveRouter();

    const routeLocation: RouteLocationRaw = {
      name: key
    };

    if (Object.keys(query || {}).length) {
      routeLocation.query = query;
    }

    if (Object.keys(params || {}).length) {
      routeLocation.params = params;
    }

    return router.push(routeLocation);
  }

  function routerPushByKeyWithMetaQuery(key: RouteKey) {
    return resolveRouter().then(router => {
      const allRoutes = router.getRoutes();
      const meta = allRoutes.find(item => item.name === key)?.meta || null;

      const query: Record<string, string> = {};

      meta?.query?.forEach(item => {
        query[item.key] = item.value;
      });

      return routerPushByKey(key, { query });
    });
  }

  async function toHome() {
    return routerPushByKey('root');
  }

  /**
   * Navigate to login page
   *
   * @param loginModule The login module
   * @param redirectUrl The redirect url, if not specified, it will be the current route fullPath
   */
  async function toLogin(loginModule?: UnionKey.LoginModule, redirectUrl?: string) {
    const route = await resolveCurrentRoute();
    const module = loginModule || 'pwd-login';

    const options: App.Global.RouterPushOptions = {
      params: {
        module
      }
    };

    const redirect = redirectUrl || route.fullPath;

    options.query = {
      redirect
    };

    return routerPushByKey('login', options);
  }

  /**
   * Toggle login module
   *
   * @param module
   */
  async function toggleLoginModule(module: UnionKey.LoginModule) {
    const route = await resolveCurrentRoute();
    const query = route.query as Record<string, string>;

    return routerPushByKey('login', { query, params: { module } });
  }

  /**
   * Redirect from login
   *
   * @param [needRedirect=true] Whether to redirect after login. Default is `true`
   */
  async function redirectFromLogin(needRedirect = true) {
    const route = await resolveCurrentRoute();
    const redirect = route.query?.redirect as string;

    if (needRedirect && redirect) {
      await routerPush(redirect);
    } else {
      await toHome();
    }
  }

  return {
    routerPush,
    routerBack,
    routerPushByKey,
    routerPushByKeyWithMetaQuery,
    toLogin,
    toggleLoginModule,
    redirectFromLogin
  };
}
