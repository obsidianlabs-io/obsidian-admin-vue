const MENU_I18N_FALLBACK_BY_KEY: Record<string, App.I18n.I18nKey> = {
  dashboard: 'route.dashboard',
  tenant: 'route.tenant',
  user: 'route.user',
  role: 'route.role',
  'audit-policy': 'route.audit-policy',
  audit: 'route.audit',
  permission: 'route.permission',
  language: 'route.language',
  'access-management': 'menu.accessManagement',
  'platform-settings': 'menu.systemSettings'
};

export function resolveBackendMenuI18nKey(item: Api.Auth.MenuItem): App.I18n.I18nKey | undefined {
  if (item.i18nKey) {
    return item.i18nKey;
  }

  if (item.key && MENU_I18N_FALLBACK_BY_KEY[item.key]) {
    return MENU_I18N_FALLBACK_BY_KEY[item.key];
  }

  if (item.routeKey && MENU_I18N_FALLBACK_BY_KEY[item.routeKey]) {
    return MENU_I18N_FALLBACK_BY_KEY[item.routeKey];
  }

  return undefined;
}

export function resolveMenuI18nFallbackByKey(key: string): App.I18n.I18nKey | undefined {
  return MENU_I18N_FALLBACK_BY_KEY[key];
}
