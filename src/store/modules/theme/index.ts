import { computed, effectScope, onScopeDispose, ref, toRefs, watch } from 'vue';
import type { Ref } from 'vue';
import { useDateFormat, useEventListener, useNow, usePreferredColorScheme } from '@vueuse/core';
import { defineStore } from 'pinia';
import { getPaletteColorByNumber } from '@sa/color';
import { appEvent } from '@/constants/event';
import { fetchUpdateUserPreferences } from '@/service/api';
import { localStg } from '@/utils/storage';
import { SetupStoreId } from '@/enum';
import { useAuthStore } from '../auth';
import { getToken } from '../auth/shared';
import {
  applyBooleanSetting,
  applyEnumSetting,
  clampInteger,
  isLayoutMode,
  isPageAnimateMode,
  isScrollMode,
  isThemeScheme
} from './remote-utils';
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
  const authStore = useAuthStore();

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
    const userName = authStore.userInfo?.userName;

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

  function applyRemoteThemeSchema(themeSchema?: UnionKey.ThemeScheme | null) {
    if (!isThemeScheme(themeSchema)) {
      return;
    }

    applyingRemoteThemeScheme.value = true;
    lastSyncedThemeScheme.value = themeSchema;
    settings.value.themeScheme = themeSchema;

    queueMicrotask(() => {
      applyingRemoteThemeScheme.value = false;
    });
  }

  function applyRemoteThemeConfig(config?: Api.Theme.Config | null) {
    if (!config) {
      return;
    }

    applyingRemoteThemeScheme.value = true;

    applyEnumSetting(config.themeScheme, isThemeScheme, nextThemeScheme => {
      settings.value.themeScheme = nextThemeScheme;
      lastSyncedThemeScheme.value = nextThemeScheme;
    });

    const nextThemeColor = String(config.themeColor || '').trim();
    if (/^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(nextThemeColor)) {
      settings.value.themeColor = nextThemeColor;
    }

    const themeRadius = clampInteger(config.themeRadius, 0, 16);
    if (themeRadius !== null) {
      settings.value.themeRadius = themeRadius;
    }

    const headerHeight = clampInteger(config.headerHeight, 48, 80);
    if (headerHeight !== null) {
      settings.value.header.height = headerHeight;
    }

    const siderWidth = clampInteger(config.siderWidth, 180, 320);
    if (siderWidth !== null) {
      settings.value.sider.width = siderWidth;
    }

    const siderCollapsedWidth = clampInteger(config.siderCollapsedWidth, 48, 120);
    if (siderCollapsedWidth !== null) {
      settings.value.sider.collapsedWidth = siderCollapsedWidth;
    }

    const footerHeight = clampInteger(config.footerHeight, 32, 96);
    if (footerHeight !== null) {
      settings.value.footer.height = footerHeight;
    }

    applyEnumSetting(config.layoutMode, isLayoutMode, nextMode => {
      settings.value.layout.mode = nextMode;
    });

    applyEnumSetting(config.scrollMode, isScrollMode, nextScrollMode => {
      settings.value.layout.scrollMode = nextScrollMode;
    });

    applyEnumSetting(config.pageAnimateMode, isPageAnimateMode, nextPageAnimateMode => {
      settings.value.page.animateMode = nextPageAnimateMode;
    });

    applyBooleanSetting(config.darkSider, next => {
      settings.value.sider.inverted = next;
    });
    applyBooleanSetting(config.themeSchemaVisible, next => {
      settings.value.header.themeSchema.visible = next;
    });
    applyBooleanSetting(config.headerFullscreenVisible, next => {
      settings.value.header.fullscreen.visible = next;
    });
    applyBooleanSetting(config.tabVisible, next => {
      settings.value.tab.visible = next;
    });
    applyBooleanSetting(config.tabFullscreenVisible, next => {
      settings.value.tab.fullscreen.visible = next;
    });
    applyBooleanSetting(config.breadcrumbVisible, next => {
      settings.value.header.breadcrumb.visible = next;
    });
    applyBooleanSetting(config.footerVisible, next => {
      settings.value.footer.visible = next;
    });
    applyBooleanSetting(config.multilingualVisible, next => {
      settings.value.header.multilingual.visible = next;
    });
    applyBooleanSetting(config.globalSearchVisible, next => {
      settings.value.header.globalSearch.visible = next;
    });
    applyBooleanSetting(config.themeConfigVisible, next => {
      settings.value.header.themeConfig.visible = next;
    });
    applyBooleanSetting(config.pageAnimate, next => {
      settings.value.page.animate = next;
    });
    applyBooleanSetting(config.fixedHeaderAndTab, next => {
      settings.value.fixedHeaderAndTab = next;
    });

    queueMicrotask(() => {
      applyingRemoteThemeScheme.value = false;
    });
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

    watch(
      () => authStore.userInfo?.themeSchema,
      themeSchema => {
        applyRemoteThemeSchema(themeSchema);
      },
      { immediate: true }
    );

    watch(
      () => authStore.userInfo?.themeConfig,
      themeConfig => {
        applyRemoteThemeConfig(themeConfig);
      },
      { immediate: true, deep: true }
    );

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
          fetchUpdateUserPreferences({ themeSchema: themeScheme })
            .then(({ error }) => {
              if (!error) {
                lastSyncedThemeScheme.value = themeScheme;
                if (authStore.userInfo) {
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
