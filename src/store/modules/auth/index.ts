import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { appEvent } from '@/constants/event';
import { fetchGetUserInfo, fetchLogin, fetchLogout, fetchUpdateLocale } from '@/service/api';
import { connectRealtime, disconnectRealtime } from '@/service/websocket';
import { useRouterPush } from '@/hooks/common/router';
import { localStg } from '@/utils/storage';
import { createDefaultThemeConfig } from '@/utils/theme-config';
import { SetupStoreId } from '@/enum';
import { $t, loadRuntimeLocaleMessages, setLocale } from '@/locales';
import { getStoredLocale, resolvePreferredLocale } from '@/locales/default-locale';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import {
  clearAuthStorage,
  getRefreshToken,
  getToken,
  setAuthTokens,
  setCurrentTenantId,
  setRememberMe
} from './shared';

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin, routerPushByKey } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();
  let logoutPromise: Promise<void> | null = null;

  const token = ref('');

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    locale: resolvePreferredLocale(),
    timezone: 'UTC',
    themeSchema: null,
    themeConfig: createDefaultThemeConfig(),
    roles: [],
    buttons: [],
    currentTenantId: '',
    currentTenantName: '',
    tenants: [],
    menuScope: 'platform',
    menus: [],
    routeRules: {}
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();
    disconnectRealtime();

    clearAuthStorage();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  async function logout(options: { notifyBackend?: boolean } = {}) {
    const { notifyBackend = true } = options;

    if (logoutPromise) {
      await logoutPromise;
      return;
    }

    logoutPromise = (async () => {
      const currentToken = token.value || getToken();
      const refreshToken = getRefreshToken();

      if (notifyBackend && currentToken) {
        try {
          await fetchLogout(refreshToken || undefined);
        } catch {
          // keep logout UX resilient even if backend logout fails
        }
      }

      await resetStore();
    })();

    try {
      await logoutPromise;
    } finally {
      logoutPromise = null;
    }
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    // Store current user ID locally for next login comparison
    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  /**
   * Login
   *
   * @param userName User name
   * @param password Password
   * @param options Login options
   * @param options.redirect Whether to redirect after login. Default is `true`
   * @param options.rememberMe Whether to keep login across browser sessions
   */
  async function login(
    userName: string,
    password: string,
    options: {
      redirect?: boolean;
      rememberMe?: boolean;
      otpCode?: string;
    } = {}
  ): Promise<'2fa_required' | null> {
    const { redirect = true, rememberMe = true, otpCode } = options;
    const loginSelectedLocale = getStoredSupportedLocale();

    startLoading();

    const { data: loginToken, error } = await fetchLogin({
      userName,
      password,
      rememberMe,
      otpCode,
      locale: loginSelectedLocale
    });

    if (
      error?.code === '4020' ||
      (error as any)?.response?.data?.code === 4020 ||
      (error as any)?.response?.data?.code === '4020'
    ) {
      endLoading();
      return '2fa_required';
    }

    if (!error) {
      const pass = await loginByToken(loginToken, rememberMe, loginSelectedLocale);

      if (pass) {
        // Check if the tab needs to be cleared
        const isClear = checkTabClear();
        let needRedirect = redirect;

        if (isClear) {
          // If the tab needs to be cleared,it means we don't need to redirect.
          needRedirect = false;
        }
        await redirectFromLogin(needRedirect);

        window.$notification?.success({
          title: $t('page.login.common.loginSuccess'),
          content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
          duration: 4500
        });
      }
    } else {
      resetStore();
    }

    endLoading();

    return null;
  }

  async function loginByToken(
    loginToken: Api.Auth.LoginToken,
    rememberMe: boolean,
    loginSelectedLocale: App.I18n.LangType | null
  ) {
    // 1. stored in the localStorage, the later requests need it in headers
    setRememberMe(rememberMe);
    setAuthTokens(loginToken, rememberMe);
    token.value = loginToken.token;

    // 2. get user info
    const pass = await getUserInfo();

    if (pass) {
      await syncLoginSelectedLocale(loginSelectedLocale);

      return true;
    }

    return false;
  }

  async function getUserInfo() {
    const { data: info, error } = await fetchGetUserInfo();

    if (!error) {
      // update store
      Object.assign(userInfo, info);
      setCurrentTenantId(info.currentTenantId || '');
      await syncLocale(info.locale || info.preferredLocale);
      window.dispatchEvent(new CustomEvent(appEvent.themeSchemaSync, { detail: { themeSchema: info.themeSchema } }));
      window.dispatchEvent(new CustomEvent(appEvent.themeConfigSync, { detail: { themeConfig: info.themeConfig } }));
      connectRealtime(token.value);

      return true;
    }

    return false;
  }

  function getStoredSupportedLocale(): App.I18n.LangType | null {
    return getStoredLocale();
  }

  async function syncLoginSelectedLocale(loginSelectedLocale: App.I18n.LangType | null) {
    if (!loginSelectedLocale || loginSelectedLocale === userInfo.locale) {
      return;
    }

    const { error } = await fetchUpdateLocale(loginSelectedLocale);
    if (error) {
      return;
    }

    userInfo.locale = loginSelectedLocale;
    userInfo.preferredLocale = loginSelectedLocale;
    await syncLocale(loginSelectedLocale);
  }

  async function syncLocale(locale?: App.I18n.LangType) {
    if (!locale || !String(locale).trim()) {
      return;
    }

    localStg.set('lang', locale);

    try {
      await loadRuntimeLocaleMessages(locale);
    } catch {
      // Keep auth flow resilient if runtime locale messages fail to load.
    }

    setLocale(locale);
    window.dispatchEvent(new CustomEvent(appEvent.localeSync, { detail: { lang: locale } }));
  }

  async function switchTenant(tenantId: string) {
    const nextTenantId = tenantId || '';
    const previousTenantId = userInfo.currentTenantId || '';

    if (nextTenantId === previousTenantId) {
      return true;
    }

    setCurrentTenantId(nextTenantId);

    const pass = await getUserInfo();

    if (!pass) {
      setCurrentTenantId(previousTenantId);
      return false;
    }

    localStg.remove('globalTabs');
    await tabStore.clearTabs();
    routeStore.setIsInitAuthRoute(false);
    await routeStore.initAuthRoute();
    routeStore.updateGlobalMenusByLocale();
    await routerPushByKey('root');

    window.dispatchEvent(new CustomEvent(appEvent.tenantChanged, { detail: { tenantId: nextTenantId } }));

    return true;
  }

  async function initUserInfo() {
    const maybeToken = getToken();

    if (maybeToken) {
      token.value = maybeToken;
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    logout,
    resetStore,
    login,
    initUserInfo,
    switchTenant
  };
});
