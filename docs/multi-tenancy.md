# Multi-Tenancy

## Tenant model in the frontend

This frontend is tenant-aware, but it is not tenant-authoritative.

The backend remains the source of truth for:

- effective tenant scope
- tenant-scoped menus and route rules
- tenant-safe validation and resource visibility

The frontend is responsible for:

- carrying tenant context in requests
- reacting to tenant changes
- refreshing tenant-sensitive pages correctly

## Request context

Tenant context is attached in the request layer, not ad-hoc in page code.

Relevant file:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/request/context.ts`

When a tenant is selected, the request layer emits:

- `X-Tenant-Id`

Business code should not handcraft this header.

## Tenant switch flow

The visible tenant switcher lives in:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/layouts/modules/global-header/components/tenant-switcher.vue`

Frontend tenant-change broadcast uses:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/constants/event.ts`
- event name: `tenant-changed`

Reusable hook:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/hooks/business/tenant-change.ts`

Pages that care about tenant changes should react through that hook instead of inventing local event wiring.

## Pages already wired to tenant changes

Representative pages:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/user/index.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/audit/index.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/organization/index.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/team/index.vue`

The intended behavior is:

- reload tenant-sensitive options
- reset stale state where needed
- refresh list data from the newly active tenant context

## Pairing rule

This frontend is designed to pair with:

- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/docs/multi-tenancy.md`

That backend provides the actual enforcement logic. The frontend only reflects scope and handles UX updates.

## Design rule

Do not hide tenant state inside random composables or page-local headers.

Keep tenant behavior in three places only:

1. auth / app state
2. request context builder
3. explicit tenant-changed reactions for tenant-sensitive pages

That is the difference between a tenant-aware admin frontend and a collection of pages with accidental header hacks.
