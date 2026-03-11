import { computed, effectScope, onScopeDispose, ref, shallowRef, toRefs, watch } from 'vue';
import type { Ref } from 'vue';
import { useDateFormat, useEventListener, useNow, usePreferredColorScheme } from '@vueuse/core';
import { defineStore } from 'pinia';
import { getPaletteColorByNumber } from '@sa/color';
import { appEvent } from '@/constants/event';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import type { useAuthStore } from '../auth';
import { getToken } from '../auth/shared';
import { isThemeScheme } from './remote-utils';
import {
  applyRemoteThemeConfig as applyRemoteThemeConfigToStore,
  applyRemoteThemeSchema as applyRemoteThemeSchemaToStore
} from './remote-apply';
import {
  addThemeVarsToGlobal,
  createThemeToken,
  getNaiveTheme,
  initThemeSettings,
  toggleAuxiliaryColorModes,
  toggleCssDarkMode
} from './shared';

/** Theme store */
export const useThemeStore = defineStore(SetupStoreId.Theme, () => {
  const scope = effectScope();
  const osTheme = usePreferredColorScheme();
  const authStoreRef = shallowRef<ReturnType<typeof useAuthStore> | null>(null);
  const authApiModuleRef = shallowRef<typeof import('@/service/api/auth') | null>(null);
  const authUserName = ref('');

  /** Theme settings */
  const settings: Ref<App.Theme.ThemeSetting> = ref(initThemeSettings());
  const applyingRemoteThemeScheme = ref(false);
  const lastSyncedThemeScheme = ref<UnionKey.ThemeScheme | null>(null);
  let themeSchemaSyncTimer: ReturnType<typeof setTimeout> | null = null;

  /** Optional NaiveUI theme overrides from preset */
  const naiveThemeOverrides: Ref<App.Theme.NaiveUIThemeOverride | undefined> = ref(undefined);

  /** Watermark time instance with controls */
  const { now: watermarkTime, pause: pauseWatermarkTime, resume: resumeWatermarkTime } = useNow({ controls: true });

  /** Dark mode */
  const darkMode = computed(() => {
    if (settings.value.themeScheme === 'auto') {
      return osTheme.value === 'dark';
    }
    return settings.value.themeScheme === 'dark';
  });

  /** grayscale mode */
  const grayscaleMode = computed(() => settings.value.grayscale);

  /** colourWeakness mode */
  const colourWeaknessMode = computed(() => settings.value.colourWeakness);

  /** Theme colors */
  const themeColors = computed(() => {
    const { themeColor, otherColor, isInfoFollowPrimary } = settings.value;
    const colors: App.Theme.ThemeColor = {
      primary: themeColor,
      ...otherColor,
      info: isInfoFollowPrimary ? themeColor : otherColor.info
    };
    return colors;
  });

  /** Naive theme */
  const naiveTheme = computed(() => getNaiveTheme(themeColors.value, settings.value, naiveThemeOverrides.value));

  /**
   * Settings json
   *
   * It is for copy settings
   */
  const settingsJson = computed(() => JSON.stringify(settings.value));

  /** Watermark time date formatter */
  const formattedWatermarkTime = computed(() => {
    const { watermark } = settings.value;
    const date = useDateFormat(watermarkTime, watermark.timeFormat);
    return date.value;
  });

  /** Watermark content */
  const watermarkContent = computed(() => {
    const { watermark } = settings.value;
    const userName = authUserName.value;

    if (watermark.enableUserName && userName) {
      return userName;
    }

    if (watermark.enableTime) {
      return formattedWatermarkTime.value;
    }

    return watermark.text;
  });

  /** Reset store */
  function resetStore() {
    const themeStore = useThemeStore();

    themeStore.$reset();
  }

  function syncAuthUserName(userName?: string | null) {
    authUserName.value = userName ?? '';
  }

  async function resolveAuthStore() {
    if (!authStoreRef.value) {
      const { useAuthStore: useResolvedAuthStore } = await import('../auth');
      authStoreRef.value = useResolvedAuthStore();
      syncAuthUserName(authStoreRef.value.userInfo?.userName);
      applyRemoteThemeSchema(authStoreRef.value.userInfo?.themeSchema);
      applyRemoteThemeConfig(authStoreRef.value.userInfo?.themeConfig);
    }

    return authStoreRef.value;
  }

  async function resolveAuthApiModule() {
    if (!authApiModuleRef.value) {
      authApiModuleRef.value = await import('@/service/api/auth');
    }

    return authApiModuleRef.value;
  }

  function applyRemoteThemeSchema(themeSchema?: UnionKey.ThemeScheme | null) {
    applyRemoteThemeSchemaToStore(
      {
        settings,
        applyingRemoteThemeScheme,
        lastSyncedThemeScheme
      },
      themeSchema
    );
  }

  function applyRemoteThemeConfig(config?: Api.Theme.Config | null) {
    applyRemoteThemeConfigToStore(
      {
        settings,
        applyingRemoteThemeScheme,
        lastSyncedThemeScheme
      },
      config
    );
  }

  /**
   * Set theme scheme
   *
   * @param themeScheme
   */
  function setThemeScheme(themeScheme: UnionKey.ThemeScheme) {
    settings.value.themeScheme = themeScheme;
  }

  /**
   * Set grayscale value
   *
   * @param isGrayscale
   */
  function setGrayscale(isGrayscale: boolean) {
    settings.value.grayscale = isGrayscale;
  }

  /**
   * Set colourWeakness value
   *
   * @param isColourWeakness
   */
  function setColourWeakness(isColourWeakness: boolean) {
    settings.value.colourWeakness = isColourWeakness;
  }

  /** Toggle theme scheme */
  function toggleThemeScheme() {
    const themeSchemes: UnionKey.ThemeScheme[] = ['light', 'dark', 'auto'];

    const index = themeSchemes.findIndex(item => item === settings.value.themeScheme);

    const nextIndex = index === themeSchemes.length - 1 ? 0 : index + 1;

    const nextThemeScheme = themeSchemes[nextIndex];

    setThemeScheme(nextThemeScheme);
  }

  /**
   * Update theme colors
   *
   * @param key Theme color key
   * @param color Theme color
   */
  function updateThemeColors(key: App.Theme.ThemeColorKey, color: string) {
    let colorValue = color;

    if (settings.value.recommendColor) {
      // get a color palette by provided color and color name, and use the suitable color

      colorValue = getPaletteColorByNumber(color, 500, true);
    }

    if (key === 'primary') {
      settings.value.themeColor = colorValue;
    } else {
      settings.value.otherColor[key] = colorValue;
    }
  }

  /**
   * Set theme layout
   *
   * @param mode Theme layout mode
   */
  function setThemeLayout(mode: UnionKey.ThemeLayoutMode) {
    settings.value.layout.mode = mode;
  }

  /** Setup theme vars to global */
  function setupThemeVarsToGlobal() {
    const { themeTokens, darkThemeTokens } = createThemeToken(
      themeColors.value,
      settings.value.tokens,
      settings.value.recommendColor
    );
    addThemeVarsToGlobal(themeTokens, darkThemeTokens);
  }

  /**
   * Set watermark enable user name
   *
   * @param enable Whether to enable user name watermark
   */
  function setWatermarkEnableUserName(enable: boolean) {
    settings.value.watermark.enableUserName = enable;

    if (enable) {
      settings.value.watermark.enableTime = false;
    }
  }

  /**
   * Set watermark enable time
   *
   * @param enable Whether to enable time watermark
   */
  function setWatermarkEnableTime(enable: boolean) {
    settings.value.watermark.enableTime = enable;

    if (enable) {
      settings.value.watermark.enableUserName = false;
    }
  }

  /**
   * Set NaiveUI theme overrides
   *
   * @param overrides NaiveUI theme overrides or undefined to clear
   */
  function setNaiveThemeOverrides(overrides?: App.Theme.NaiveUIThemeOverride) {
    naiveThemeOverrides.value = overrides;
  }

  /** Only run timer when watermark is visible and time display is enabled */
  function updateWatermarkTimer() {
    const { watermark } = settings.value;
    const shouldRunTimer = watermark.visible && watermark.enableTime;

    if (shouldRunTimer) {
      resumeWatermarkTime();
    } else {
      pauseWatermarkTime();
    }
  }

  /** Cache theme settings */
  function cacheThemeSettings() {
    const isProd = import.meta.env.PROD;

    if (!isProd) return;

    localStg.set('themeSettings', settings.value);
  }

  // cache theme settings when page is closed or refreshed
  useEventListener(window, 'beforeunload', () => {
    cacheThemeSettings();
  });

  // watch store
  scope.run(() => {
    useEventListener(window, appEvent.themeSchemaSync, event => {
      const customEvent = event as CustomEvent<{ themeSchema?: UnionKey.ThemeScheme | null }>;
      applyRemoteThemeSchema(customEvent.detail?.themeSchema);
    });

    useEventListener(window, appEvent.themeConfigSync, event => {
      const customEvent = event as CustomEvent<{ themeConfig?: Api.Theme.Config | null }>;
      applyRemoteThemeConfig(customEvent.detail?.themeConfig);
    });

    useEventListener(window, appEvent.authUserNameSync, event => {
      const customEvent = event as CustomEvent<{ userName?: string | null }>;
      syncAuthUserName(customEvent.detail?.userName);
    });

    if (getToken()) {
      resolveAuthStore().catch(() => {});
    }

    // watch dark mode
    watch(
      darkMode,
      val => {
        toggleCssDarkMode(val);
        localStg.set('darkMode', val);
      },
      { immediate: true }
    );

    watch(
      [grayscaleMode, colourWeaknessMode],
      val => {
        toggleAuxiliaryColorModes(val[0], val[1]);
      },
      { immediate: true }
    );

    // themeColors change, update css vars and storage theme color
    watch(
      themeColors,
      val => {
        setupThemeVarsToGlobal();
        localStg.set('themeColor', val.primary);
      },
      { immediate: true }
    );

    // watch watermark settings to control timer
    watch(
      () => [settings.value.watermark.visible, settings.value.watermark.enableTime],
      () => {
        updateWatermarkTimer();
      },
      { immediate: true }
    );

    watch(
      () => settings.value.themeScheme,
      themeScheme => {
        if (applyingRemoteThemeScheme.value || !getToken()) {
          return;
        }

        if (!isThemeScheme(themeScheme) || themeScheme === lastSyncedThemeScheme.value) {
          return;
        }

        if (themeSchemaSyncTimer) {
          clearTimeout(themeSchemaSyncTimer);
        }

        themeSchemaSyncTimer = setTimeout(() => {
          resolveAuthApiModule()
            .then(({ fetchUpdateUserPreferences }) => fetchUpdateUserPreferences({ themeSchema: themeScheme }))
            .then(async ({ error }) => {
              if (!error) {
                lastSyncedThemeScheme.value = themeScheme;
                const authStore = await resolveAuthStore().catch(() => null);

                if (authStore?.userInfo) {
                  authStore.userInfo.themeSchema = themeScheme;
                }
              }
            })
            .catch(() => {});
        }, 250);
      }
    );
  });

  /** On scope dispose */
  onScopeDispose(() => {
    if (themeSchemaSyncTimer) {
      clearTimeout(themeSchemaSyncTimer);
      themeSchemaSyncTimer = null;
    }
    scope.stop();
  });

  return {
    ...toRefs(settings.value),
    darkMode,
    themeColors,
    naiveTheme,
    settingsJson,
    watermarkContent,
    setGrayscale,
    setColourWeakness,
    resetStore,
    setThemeScheme,
    toggleThemeScheme,
    updateThemeColors,
    setThemeLayout,
    setWatermarkEnableUserName,
    setWatermarkEnableTime,
    setNaiveThemeOverrides,
    applyRemoteThemeConfig
  };
});
