import { effectScope, nextTick, onScopeDispose, ref, watch } from 'vue';
import { breakpointsTailwind, useBreakpoints, useEventListener, useTitle } from '@vueuse/core';
import { defineStore } from 'pinia';
import { useBoolean } from '@sa/hooks';
import { appEvent } from '@/constants/event';
import { router } from '@/router';
import { fetchGetRuntimeLocales, fetchUpdateLocale } from '@/service/api';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { $t, loadRuntimeLocaleMessages, setLocale } from '@/locales';
import { setDayjsLocale } from '@/locales/dayjs';
import { resolvePreferredLocale } from '@/locales/default-locale';
import { getToken } from '../auth/shared';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { useThemeStore } from '../theme';

export const useAppStore = defineStore(SetupStoreId.App, () => {
  const themeStore = useThemeStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const scope = effectScope();
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const { bool: themeDrawerVisible, setTrue: openThemeDrawer, setFalse: closeThemeDrawer } = useBoolean();
  const { bool: reloadFlag, setBool: setReloadFlag } = useBoolean(true);
  const { bool: fullContent, toggle: toggleFullContent } = useBoolean();
  const { bool: contentXScrollable, setBool: setContentXScrollable } = useBoolean();
  const { bool: siderCollapse, setBool: setSiderCollapse, toggle: toggleSiderCollapse } = useBoolean();
  const {
    bool: mixSiderFixed,
    setBool: setMixSiderFixed,
    toggle: toggleMixSiderFixed
  } = useBoolean(localStg.get('mixSiderFixed') === 'Y');

  /** Is mobile layout */
  const isMobile = breakpoints.smaller('sm');

  /**
   * Reload page
   *
   * @param duration Duration time
   */
  async function reloadPage(duration = 300) {
    setReloadFlag(false);

    const d = themeStore.page.animate ? duration : 40;

    await new Promise(resolve => {
      setTimeout(resolve, d);
    });

    setReloadFlag(true);
    routeStore.resetRouteCache();
  }

  const locale = ref<App.I18n.LangType>(resolvePreferredLocale());
  const localeOptions = ref<App.I18n.LangOption[]>([]);

  function ensureCurrentLocaleOption() {
    if (!localeOptions.value.some(option => option.key === locale.value)) {
      localeOptions.value = [{ key: locale.value, label: locale.value }, ...localeOptions.value];
    }
  }

  async function refreshLocaleOptions() {
    const { data, error } = await fetchGetRuntimeLocales();

    if (error) {
      ensureCurrentLocaleOption();
      return;
    }

    const options = data.records
      .map(item => {
        return {
          key: item.locale as App.I18n.LangType,
          label: `${item.localeName} (${item.locale})`
        } satisfies App.I18n.LangOption;
      })
      .filter(item => item.key.trim() !== '' && ['en-US', 'zh-CN'].includes(item.key));

    if (options.length === 0) {
      ensureCurrentLocaleOption();
      return;
    }

    localeOptions.value = options;

    if (!localeOptions.value.some(option => option.key === locale.value)) {
      const nextLocale = (data.records.find(item => item.isDefault)?.locale ||
        localeOptions.value[0].key) as App.I18n.LangType;
      await applyLocale(nextLocale, Boolean(getToken()));
    }
  }

  async function applyLocale(lang: App.I18n.LangType, syncProfile: boolean) {
    localStg.set('lang', lang);
    await loadRuntimeLocaleMessages(lang);
    locale.value = lang;
    setLocale(lang);

    if (syncProfile && getToken()) {
      try {
        await fetchUpdateLocale(lang);
      } catch {
        // Keep locale switching responsive even when profile sync fails.
      }
    }
  }

  async function changeLocale(lang: App.I18n.LangType) {
    if (lang === locale.value) {
      return;
    }

    await applyLocale(lang, true);
  }

  /** Update document title by locale */
  function updateDocumentTitleByLocale() {
    const { i18nKey, title } = router.currentRoute.value.meta;

    const documentTitle = i18nKey ? $t(i18nKey) : title;

    useTitle(documentTitle);
  }

  function init() {
    setDayjsLocale(locale.value);
    ensureCurrentLocaleOption();
    refreshLocaleOptions().catch(() => {});
  }

  // watch store
  scope.run(() => {
    // watch isMobile, if is mobile, collapse sider
    watch(
      isMobile,
      newValue => {
        if (newValue) {
          // backup theme setting before is mobile
          localStg.set('backupThemeSettingBeforeIsMobile', {
            layout: themeStore.layout.mode,
            siderCollapse: siderCollapse.value
          });

          themeStore.setThemeLayout('vertical');
          setSiderCollapse(true);
        } else {
          // when is not mobile, recover the backup theme setting
          const backup = localStg.get('backupThemeSettingBeforeIsMobile');

          if (backup) {
            nextTick(() => {
              themeStore.setThemeLayout(backup.layout);
              setSiderCollapse(backup.siderCollapse);

              localStg.remove('backupThemeSettingBeforeIsMobile');
            });
          }
        }
      },
      { immediate: true }
    );

    // watch locale
    watch(locale, () => {
      // update document title by locale
      updateDocumentTitleByLocale();

      // update global menus by locale
      routeStore.updateGlobalMenusByLocale();

      // update tabs by locale
      tabStore.updateTabsByLocale();

      // set dayjs locale
      setDayjsLocale(locale.value);
    });

    useEventListener(window, appEvent.localeSync, event => {
      const customEvent = event as CustomEvent<{ lang?: string }>;
      const lang = customEvent.detail?.lang;

      if (!lang || lang === locale.value) {
        return;
      }

      const targetLocale = lang as App.I18n.LangType;
      applyLocale(targetLocale, false).catch(() => {});
    });
  });

  // cache mixSiderFixed
  useEventListener(window, 'beforeunload', () => {
    localStg.set('mixSiderFixed', mixSiderFixed.value ? 'Y' : 'N');
  });

  /** On scope dispose */
  onScopeDispose(() => {
    scope.stop();
  });

  // init
  init();

  return {
    isMobile,
    reloadFlag,
    reloadPage,
    fullContent,
    locale,
    localeOptions,
    changeLocale,
    refreshLocaleOptions,
    themeDrawerVisible,
    openThemeDrawer,
    closeThemeDrawer,
    toggleFullContent,
    contentXScrollable,
    setContentXScrollable,
    siderCollapse,
    setSiderCollapse,
    toggleSiderCollapse,
    mixSiderFixed,
    setMixSiderFixed,
    toggleMixSiderFixed
  };
});
