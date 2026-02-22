import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import { localStg } from '@/utils/storage';
import { getServiceBaseURL } from '@/utils/service';
import { resolvePreferredLocale } from './default-locale';
import messages from './locale';

type RuntimeLocaleCache = Partial<
  Record<
    App.I18n.LangType,
    {
      version: string;
      messages: Record<string, string>;
    }
  >
>;

const runtimeLocaleCacheKey = 'runtimeLocaleCache';
const successCode = import.meta.env.VITE_SERVICE_SUCCESS_CODE;
const i18n = createI18n({
  locale: resolvePreferredLocale(),
  fallbackLocale: 'en-US',
  messages,
  legacy: false
});

function getRuntimeLocaleCache(): RuntimeLocaleCache {
  return (localStg.get(runtimeLocaleCacheKey) || {}) as RuntimeLocaleCache;
}

function setRuntimeLocaleCache(cache: RuntimeLocaleCache) {
  localStg.set(runtimeLocaleCacheKey, cache);
}

function cloneBaseMessages(locale: App.I18n.LangType): App.I18n.Schema {
  return JSON.parse(JSON.stringify(messages[locale])) as App.I18n.Schema;
}

function setNestedMessage(target: Record<string, unknown>, path: string, value: string) {
  const keys = path.split('.').filter(Boolean);
  if (!keys.length) return;

  let cursor: Record<string, unknown> = target;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }

    const next = cursor[key];
    if (typeof next !== 'object' || next === null || Array.isArray(next)) {
      cursor[key] = {};
    }

    cursor = cursor[key] as Record<string, unknown>;
  });
}

function applyLocaleMessages(locale: App.I18n.LangType, flatMessages: Record<string, string>) {
  const merged = cloneBaseMessages(locale) as unknown as Record<string, unknown>;

  Object.entries(flatMessages).forEach(([key, value]) => {
    if (!key.trim()) return;
    setNestedMessage(merged, key, value);
  });

  i18n.global.setLocaleMessage(locale, merged as App.I18n.Schema);
}

function getServiceBaseUrl() {
  const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
  const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

  return baseURL;
}

async function fetchRuntimeLocaleMessages(
  locale: App.I18n.LangType,
  version?: string
): Promise<Api.Language.RuntimeMessagesPayload | null> {
  try {
    const query = new URLSearchParams();
    query.set('locale', locale);
    if (version) {
      query.set('version', version);
    }

    const url = `${getServiceBaseUrl()}/language/messages?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as App.Service.Response<Api.Language.RuntimeMessagesPayload>;
    if (String(payload.code) !== String(successCode)) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

/**
 * Setup plugin i18n
 *
 * @param app
 */
export async function setupI18n(app: App) {
  await loadRuntimeLocaleMessages(getLocale());
  app.use(i18n);
}

export const $t = i18n.global.t as App.I18n.$T;

export async function loadRuntimeLocaleMessages(locale: App.I18n.LangType, force = false) {
  const cache = getRuntimeLocaleCache();
  const cached = cache[locale];
  const runtimePayload = await fetchRuntimeLocaleMessages(locale, force ? undefined : cached?.version);

  if (runtimePayload) {
    if (runtimePayload.notModified) {
      applyLocaleMessages(locale, cached?.messages || {});
      return;
    }

    const nextMessages = runtimePayload.messages || {};
    cache[locale] = {
      version: runtimePayload.version || '',
      messages: nextMessages
    };

    setRuntimeLocaleCache(cache);
    applyLocaleMessages(locale, nextMessages);
    return;
  }

  applyLocaleMessages(locale, cached?.messages || {});
}

export async function refreshRuntimeLocaleMessages(locale?: App.I18n.LangType) {
  const targetLocale = locale || getLocale();
  await loadRuntimeLocaleMessages(targetLocale, true);
}

export function setLocale(locale: App.I18n.LangType) {
  i18n.global.locale.value = locale;

  document?.querySelector('html')?.setAttribute('lang', locale);
}

export function getLocale(): App.I18n.LangType {
  return i18n.global.locale.value as App.I18n.LangType;
}
