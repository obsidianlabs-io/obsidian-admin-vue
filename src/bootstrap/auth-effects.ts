import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { appEvent } from '@/constants/event';
import { localStg } from '@/utils/storage';
import { buildAppHref } from './runtime-location';
import { isGuestBootstrapMode } from './runtime-state';

let websocketModulePromise: Promise<typeof import('@/service/websocket')> | null = null;
let routeStorePromise: Promise<ReturnType<(typeof import('@/store/modules/route'))['useRouteStore']>> | null = null;
let tabStorePromise: Promise<ReturnType<(typeof import('@/store/modules/tab'))['useTabStore']>> | null = null;
let routerPushHelpersPromise: Promise<ReturnType<(typeof import('@/hooks/common/router'))['useRouterPush']>> | null =
  null;

async function resolveWebsocketModule() {
  if (!websocketModulePromise) {
    websocketModulePromise = import('@/service/websocket');
  }

  return websocketModulePromise;
}

async function resolveRouteStore() {
  if (!routeStorePromise) {
    routeStorePromise = import('@/store/modules/route').then(({ useRouteStore }) => useRouteStore());
  }

  return routeStorePromise;
}

async function resolveTabStore() {
  if (!tabStorePromise) {
    tabStorePromise = import('@/store/modules/tab').then(({ useTabStore }) => useTabStore());
  }

  return tabStorePromise;
}

async function resolveRouterPushHelpers() {
  if (!routerPushHelpersPromise) {
    routerPushHelpersPromise = import('@/hooks/common/router').then(({ useRouterPush }) => useRouterPush(false));
  }

  return routerPushHelpersPromise;
}

export function dispatchAuthUserNameSync(userName?: string | null) {
  window.dispatchEvent(new CustomEvent(appEvent.authUserNameSync, { detail: { userName: userName ?? '' } }));
}

export async function connectAuthRealtime(token: string) {
  const websocketModule = await resolveWebsocketModule();

  websocketModule.connectRealtime(token);
}

export async function disconnectAuthRealtime() {
  const websocketModule = await resolveWebsocketModule();

  websocketModule.disconnectRealtime();
}

export async function redirectToLoginIfNeeded(route: RouteLocationNormalizedLoaded) {
  if (isGuestBootstrapMode()) {
    if (!route.meta.constant) {
      window.location.assign(buildAppHref('/login'));
    }

    return true;
  }

  if (!route.meta.constant) {
    const { toLogin } = await resolveRouterPushHelpers();
    await toLogin();
  }

  return false;
}

export async function resetWorkspaceAfterLogout() {
  const [tabStore, routeStore] = await Promise.all([resolveTabStore(), resolveRouteStore()]);

  tabStore.cacheTabs();
  routeStore.resetStore();
}

export async function clearTabsForNewUser() {
  localStg.remove('globalTabs');
  const tabStore = await resolveTabStore();

  await tabStore.clearTabs();
}

export async function redirectAfterSessionInitialized(route: RouteLocationNormalizedLoaded, needRedirect: boolean) {
  if (isGuestBootstrapMode()) {
    const redirectTarget =
      needRedirect && typeof route.query?.redirect === 'string' ? route.query.redirect : '/dashboard';

    if (import.meta.env.VITE_ROUTER_HISTORY_MODE === 'hash') {
      window.location.hash = redirectTarget.startsWith('/') ? redirectTarget : `/${redirectTarget}`;
      window.location.reload();
    } else {
      window.location.assign(buildAppHref(redirectTarget));
    }

    return;
  }

  const { redirectFromLogin } = await resolveRouterPushHelpers();
  await redirectFromLogin(needRedirect);
}

export async function refreshWorkspaceAfterTenantSwitch() {
  const [tabStore, routeStore] = await Promise.all([resolveTabStore(), resolveRouteStore()]);
  const { routerPushByKey } = await resolveRouterPushHelpers();

  await tabStore.clearTabs();
  routeStore.setIsInitAuthRoute(false);
  await routeStore.initAuthRoute();
  routeStore.updateGlobalMenusByLocale();
  await routerPushByKey('root');
}
