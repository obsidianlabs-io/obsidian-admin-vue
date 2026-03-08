# Realtime

## Current scope

Realtime support is present, but intentionally scoped.

The current frontend integration is designed for system-level refresh events, not for a generic event bus across every page.

Core entrypoint:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/websocket/index.ts`

## Transport model

The current stack uses:

- `laravel-echo`
- Reverb-compatible broadcaster mode
- backend-originated system events

Relevant runtime variables:

- `VITE_REALTIME_ENABLED`
- `VITE_REVERB_HOST`
- `VITE_REVERB_PORT`
- `VITE_REVERB_SCHEME`
- `VITE_REVERB_APP_KEY`

## Current event shape

The shared browser event emitted into the app is:

- `app:system-realtime-updated`

Source:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/constants/event.ts`

Backend broadcast source:

- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/app/Domains/System/Events/SystemRealtimeUpdated.php`

## Pages currently using realtime refresh

Representative consumers:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/feature-flag/index.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/audit-policy/composables/use-audit-policy.ts`

Current behavior includes:

- auto-refresh when safe
- user feedback toast after remote refresh
- protection against clobbering unsaved local edits

## Design rule

Realtime in this project is meant to improve consistency, not to create silent state corruption.

That is why pages should:

- refresh only when they can do so safely
- warn if local unsaved state would be overwritten
- keep realtime listeners scoped and removable

## Pairing rule

The intended backend pair is:

- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/docs/octane.md`
- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/composer.json`

The backend already ships the pieces needed for this stack:

- Reverb
- broadcast events for feature-flag and audit-policy changes
- Octane / RoadRunner runtime option

## Practical limit

Do not assume every admin page should become realtime.

Use it where remote state changes have clear operational value, such as:

- feature flags
- policy consoles
- system configuration pages
- lightweight notifications

For ordinary CRUD pages, explicit refresh is often still the better default.
