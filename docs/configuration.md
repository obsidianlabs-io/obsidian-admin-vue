# Configuration

## Configuration model

This project is configured primarily through Vite environment variables and a small number of repository-level conventions.

The canonical frontend env types live in:

- `src/typings/vite-env.d.ts`

## Core application variables

These variables define the app shell and router behavior:

- `VITE_BASE_URL`: frontend base path
- `VITE_APP_RUNTIME`: `backend` or `demo`
- `VITE_APP_TITLE`: document title / product title
- `VITE_APP_DESC`: app description
- `VITE_ROUTER_HISTORY_MODE`: `hash`, `history`, or `memory`
- `VITE_ROUTE_HOME`: frontend default route key

## Backend service variables

These variables control how the frontend talks to backend services:

- `VITE_SERVICE_BASE_URL`: primary backend base URL
- `VITE_OTHER_SERVICE_BASE_URL`: optional JSON map of secondary services
- `VITE_SERVICE_SUCCESS_CODE`: backend success code
- `VITE_SERVICE_LOGOUT_CODES`: codes that force logout
- `VITE_SERVICE_MODAL_LOGOUT_CODES`: codes that force modal logout
- `VITE_SERVICE_EXPIRED_TOKEN_CODES`: codes that trigger token refresh logic
- `VITE_HTTP_PROXY`: enable local Vite proxy mode in development

When `VITE_APP_RUNTIME=demo`, the request layer is intercepted by the in-app demo backend. The same application shell still runs, but the runtime no longer depends on a live Laravel API.

These values are consumed by:

- `src/service/request/index.ts`
- `src/service/request/context.ts`
- `src/utils/service.ts`

## Auth and route variables

These variables affect route generation and permission behavior:

- `VITE_AUTH_ROUTE_MODE`: `static` or `dynamic`
- `VITE_STATIC_SUPER_ROLE`: special role for static-route mode
- `VITE_MENU_ICON`: fallback menu icon

If you pair this frontend with Obsidian Admin Laravel, the intended mode is usually backend-driven route and menu metadata.

## Realtime variables

Realtime behavior is optional and controlled by:

- `VITE_REALTIME_ENABLED`
- `VITE_REVERB_HOST`
- `VITE_REVERB_PORT`
- `VITE_REVERB_SCHEME`
- `VITE_REVERB_APP_KEY`

These are used by:

- `src/service/websocket/index.ts`

## UX and storage variables

These are useful but not deployment-critical:

- `VITE_STORAGE_PREFIX`
- `VITE_AUTOMATICALLY_DETECT_UPDATE`
- `VITE_ICONIFY_URL`
- `VITE_SOURCE_MAP`
- `VITE_PROXY_LOG`
- `VITE_DEVTOOLS_LAUNCH_EDITOR`

## Recommended configuration discipline

Keep these rules:

1. treat `src/typings/vite-env.d.ts` as the canonical env contract
2. do not add undocumented `VITE_*` variables casually
3. do not encode backend-specific behavior in random page code
4. keep backend API behavior in the request layer or API facades
5. update docs when a new runtime-critical variable is introduced

## Configuration review before release

Before shipping a release, confirm:

- base URL matches deployment path
- backend service URL matches the deployed environment
- success / logout / refresh codes match backend behavior
- realtime variables are explicitly enabled or intentionally disabled
- generated API contract is in sync with the deployed backend
