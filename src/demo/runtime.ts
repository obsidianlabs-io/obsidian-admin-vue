import { isDemoRuntime } from '@/utils/runtime';
import { getDemoBackend, matchesDemoApiUrl, normalizeDemoFetchPath } from './backend';

let demoRuntimeInstalled = false;
let originalFetch: typeof globalThis.fetch | null = null;

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  sources.forEach(source => {
    if (!source) {
      return;
    }

    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  });

  return headers;
}

function toHeaderRecord(headers: Headers): Record<string, string> {
  const normalizedHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    normalizedHeaders[key] = value;
  });
  return normalizedHeaders;
}

async function readRequestBody(input: RequestInfo | URL, init?: RequestInit): Promise<Record<string, unknown>> {
  const explicitBody = init?.body;

  if (explicitBody) {
    if (typeof explicitBody === 'string') {
      try {
        return JSON.parse(explicitBody) as Record<string, unknown>;
      } catch {
        return {};
      }
    }

    if (typeof FormData !== 'undefined' && explicitBody instanceof FormData) {
      const parsed: Record<string, unknown> = {};
      explicitBody.forEach((value, key) => {
        parsed[key] = value;
      });
      return parsed;
    }

    if (typeof URLSearchParams !== 'undefined' && explicitBody instanceof URLSearchParams) {
      return Object.fromEntries(explicitBody.entries());
    }
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    try {
      const text = await input.clone().text();
      if (!text.trim()) {
        return {};
      }

      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return {};
}

function requestUrlOf(input: RequestInfo | URL): URL {
  if (input instanceof URL) {
    return input;
  }

  if (typeof Request !== 'undefined' && input instanceof Request) {
    return new URL(input.url, window.location.origin);
  }

  return new URL(String(input), window.location.origin);
}

export function installDemoRuntime() {
  if (
    demoRuntimeInstalled ||
    !isDemoRuntime(import.meta.env) ||
    typeof window === 'undefined' ||
    typeof globalThis.fetch !== 'function'
  ) {
    return;
  }

  const backend = getDemoBackend();
  originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = requestUrlOf(input);

    if (!matchesDemoApiUrl(url)) {
      return originalFetch!(input, init);
    }

    const requestHeaders = typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined;
    const headers = mergeHeaders(requestHeaders, init?.headers);
    const body = await readRequestBody(input, init);
    const response = await backend.handle({
      method: String(
        init?.method || (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET')
      ).toUpperCase(),
      path: normalizeDemoFetchPath(url.pathname),
      query: url.searchParams,
      headers: toHeaderRecord(headers),
      body
    });

    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: {
        'content-type': 'application/json',
        ...(response.headers ?? {})
      }
    });
  };

  demoRuntimeInstalled = true;
}

export function uninstallDemoRuntime() {
  if (!demoRuntimeInstalled || !originalFetch) {
    return;
  }

  globalThis.fetch = originalFetch;
  demoRuntimeInstalled = false;
  originalFetch = null;
}
