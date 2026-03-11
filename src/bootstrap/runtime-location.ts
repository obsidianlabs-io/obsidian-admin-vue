import { getToken } from '@/store/modules/auth/shared';

const { VITE_BASE_URL = '/', VITE_ROUTER_HISTORY_MODE = 'history' } = import.meta.env;

function normalizeBaseUrl(baseUrl = VITE_BASE_URL) {
  const normalized = `/${String(baseUrl || '/').replace(/^\/+|\/+$/g, '')}/`;

  return normalized === '//' ? '/' : normalized;
}

function stripBaseUrl(pathname: string, baseUrl = VITE_BASE_URL) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  if (normalizedBaseUrl === '/' || !pathname.startsWith(normalizedBaseUrl)) {
    return pathname || '/';
  }

  const stripped = pathname.slice(normalizedBaseUrl.length - 1);

  return stripped || '/';
}

export function isGuestBootstrapPath(pathname = window.location.pathname) {
  if (getToken()) {
    return false;
  }

  const resolvedPath = stripBaseUrl(pathname);

  return (
    resolvedPath === '/' ||
    resolvedPath === '' ||
    resolvedPath === '/login' ||
    resolvedPath.startsWith('/login/') ||
    resolvedPath === '/403' ||
    resolvedPath === '/404' ||
    resolvedPath === '/500'
  );
}

export function buildAppHref(target: string) {
  const normalizedBaseUrl = normalizeBaseUrl();
  const normalizedTarget = target.startsWith('/') ? target : `/${target}`;

  if (VITE_ROUTER_HISTORY_MODE === 'hash') {
    return `${normalizedBaseUrl}#${normalizedTarget}`;
  }

  if (normalizedBaseUrl === '/') {
    return normalizedTarget;
  }

  return `${normalizedBaseUrl.replace(/\/$/, '')}${normalizedTarget}`;
}
