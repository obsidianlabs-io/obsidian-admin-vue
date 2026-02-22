import { localStg, sessionStg } from '@/utils/storage';

function getRememberMeDefault() {
  const rememberMe = localStg.get('rememberMe');

  return rememberMe !== false;
}

/** Get token */
export function getToken() {
  return localStg.get('token') || sessionStg.get('token') || '';
}

/** Get refresh token */
export function getRefreshToken() {
  return localStg.get('refreshToken') || sessionStg.get('refreshToken') || '';
}

/** Get remember me option */
export function getRememberMe() {
  return getRememberMeDefault();
}

/** Get current tenant id */
export function getCurrentTenantId() {
  return localStg.get('currentTenantId') || '';
}

/** Persist current tenant id */
export function setCurrentTenantId(tenantId: string) {
  if (tenantId) {
    localStg.set('currentTenantId', tenantId);
  } else {
    localStg.remove('currentTenantId');
  }
}

/** Persist remember me option */
export function setRememberMe(rememberMe: boolean) {
  localStg.set('rememberMe', rememberMe);
}

/** Persist auth tokens based on remember me option */
export function setAuthTokens(loginToken: Api.Auth.LoginToken, rememberMe: boolean) {
  clearAuthTokens();

  const storage = rememberMe ? localStg : sessionStg;
  storage.set('token', loginToken.token);
  storage.set('refreshToken', loginToken.refreshToken);
}

/** Persist auth tokens using current remember me option */
export function updateAuthTokens(loginToken: Api.Auth.LoginToken) {
  setAuthTokens(loginToken, getRememberMeDefault());
}

/** Clear token and refresh token from all storages */
function clearAuthTokens() {
  localStg.remove('token');
  localStg.remove('refreshToken');
  sessionStg.remove('token');
  sessionStg.remove('refreshToken');
}

/** Clear auth storage */
export function clearAuthStorage() {
  clearAuthTokens();
  localStg.remove('rememberMe');
  localStg.remove('currentTenantId');
}
