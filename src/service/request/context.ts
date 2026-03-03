export interface RequestContextInput {
  authorization: string | null;
  locale: string;
  tenantId?: string | number | null | undefined;
}

export interface ServiceCodeConfig {
  successCode: string;
  logoutCodes: string[];
  modalLogoutCodes: string[];
  expiredTokenCodes: string[];
}

export function parseServiceCodeList(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(code => code.trim())
    .filter(Boolean);
}

export function resolveServiceCodeConfig(env: Partial<Env.ImportMeta>): ServiceCodeConfig {
  return {
    successCode: String(env.VITE_SERVICE_SUCCESS_CODE || '0000'),
    logoutCodes: parseServiceCodeList(env.VITE_SERVICE_LOGOUT_CODES),
    modalLogoutCodes: parseServiceCodeList(env.VITE_SERVICE_MODAL_LOGOUT_CODES),
    expiredTokenCodes: parseServiceCodeList(env.VITE_SERVICE_EXPIRED_TOKEN_CODES)
  };
}

export function buildRequestContextHeaders(
  context: RequestContextInput,
  initialHeaders: Record<string, unknown> = {}
): Record<string, unknown> {
  const headers = { ...initialHeaders };

  Object.assign(headers, {
    Authorization: context.authorization,
    'Accept-Language': context.locale,
    'X-Locale': context.locale
  });

  if (context.tenantId) {
    headers['X-Tenant-Id'] = String(context.tenantId);
  } else {
    delete headers['X-Tenant-Id'];
  }

  return headers;
}
