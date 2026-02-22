import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';

const FALLBACK_DEFAULT_LOCALE: App.I18n.LangType = 'en-US';

let runtimeDefaultLocale: App.I18n.LangType = FALLBACK_DEFAULT_LOCALE;
let hydrated = false;

interface BootstrapPayload {
  defaultLocale?: string;
}

interface BootstrapResponse {
  code?: string | number;
  data?: BootstrapPayload;
}

function normalizeLocale(locale: unknown): App.I18n.LangType | null {
  if (typeof locale !== 'string') {
    return null;
  }

  const normalized = locale.trim().replace('_', '-').toLowerCase();
  if (normalized === 'zh' || normalized === 'zh-cn') {
    return 'zh-CN';
  }

  if (normalized === 'en' || normalized === 'en-us') {
    return 'en-US';
  }

  return null;
}

function resolveServiceBaseUrl() {
  const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';

  return getServiceBaseURL(import.meta.env, isHttpProxy).baseURL;
}

function ensureStoredLocale() {
  if (getStoredLocale()) {
    return;
  }

  localStg.set('lang', runtimeDefaultLocale);
}

export function getStoredLocale(): App.I18n.LangType | null {
  return normalizeLocale(localStg.get('lang'));
}

export function getDefaultLocale(): App.I18n.LangType {
  return runtimeDefaultLocale;
}

export function resolvePreferredLocale(): App.I18n.LangType {
  return getStoredLocale() || runtimeDefaultLocale;
}

export async function hydrateDefaultLocale() {
  if (hydrated) {
    ensureStoredLocale();
    return;
  }

  hydrated = true;

  try {
    const response = await fetch(`${resolveServiceBaseUrl()}/system/bootstrap`, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (response.ok) {
      const payload = (await response.json()) as BootstrapResponse;
      const successCode = String(import.meta.env.VITE_SERVICE_SUCCESS_CODE);

      if (String(payload.code) === successCode) {
        const locale = normalizeLocale(payload.data?.defaultLocale);
        if (locale) {
          runtimeDefaultLocale = locale;
        }
      }
    }
  } catch {
    // Fallback locale remains available even if bootstrap endpoint is unavailable.
  }

  ensureStoredLocale();
}
