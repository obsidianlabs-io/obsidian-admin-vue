# Auth Flows

## Current supported flows

The current frontend auth surface is aligned with the active Laravel backend contract.

Supported flows:

- password login
- register
- forgot password
- reset password
- TOTP-based 2FA setup / enable / disable
- token-backed session bootstrap after login or registration

Key files:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/service/api/auth.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/store/modules/auth/index.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/_builtin/login/index.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/_builtin/login/modules/pwd-login.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/_builtin/login/modules/register.vue`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/src/views/_builtin/login/modules/reset-pwd.vue`

## Intentional placeholders

These are not represented as real backend-backed flows yet:

- `code-login`
- `bind-wechat`

Those modules remain explicit placeholders until a real backend contract exists. They should not be documented or marketed as supported auth methods.

## Validation model

API-backed auth forms use the shared server-validation path:

- request config `handleValidationErrorLocally: true`
- `useNaiveForm()`
- field-level replay through `applyServerValidation(error)`

That keeps the auth UI backend-neutral while still supporting structured Laravel validation errors.

## Login flow behavior

The login store returns explicit states such as:

- `success`
- `2fa_required`
- `validation_error`
- `error`

This keeps the page layer thin and prevents login UI state from being inferred from raw response codes inside components.

## Pairing rule

The intended backend pair is:

- `/Users/zero/Documents/Project/WK/obsidian-admin-laravel/docs/compatibility-matrix.md`

When the backend auth contract changes, regenerate types first and treat the auth UI as contract-sensitive code.

## Testing coverage

Representative coverage exists in:

- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/tests/e2e/auth-flows.spec.ts`
- `/Users/zero/Documents/Project/WK/obsidian-admin-vue/tests/vue/pwd-login.spec.ts`

For real auth changes, `pnpm check:ci` is the minimum trustworthy gate.
