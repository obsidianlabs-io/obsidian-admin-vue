# Full-Stack Evaluation

Use this page when you want the shortest realistic path to evaluate the Obsidian admin stack as a paired backend + frontend system.

## Option 1. Frontend-only public preview

Use this when you want to inspect UX, drawer flows, tenant switching, audit pages, and runtime behavior without booting Laravel locally.

- docs site: [https://obsidianlabs-io.github.io/obsidian-admin-vue/](https://obsidianlabs-io.github.io/obsidian-admin-vue/)
- preview: [https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/](https://obsidianlabs-io.github.io/obsidian-admin-vue/preview/)

This mode runs the real Vue application shell against the built-in demo backend.

Use it to answer:

- does the UI architecture feel maintainable?
- do tenant-aware flows behave coherently?
- do CRUD drawers, audit pages, and feature flags feel production-oriented?

## Option 2. Backend-only runtime evaluation

Use this when you want to inspect the Laravel runtime, tenant model, OpenAPI contract, release image path, and multi-tenant API behavior without pairing the Vue app yet.

Start with:

- backend docs: [Obsidian Admin Laravel](https://obsidianlabs-io.github.io/obsidian-admin-laravel/)
- runtime guide: `docs/production-runtime.md`
- Octane guide: `docs/octane.md`

Fastest local path:

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-laravel.git
cd obsidian-admin-laravel
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec app php artisan key:generate
docker compose -f docker-compose.dev.yml exec app php artisan migrate --force --seed
```

Then probe:

```bash
curl http://127.0.0.1:8080/api/health/live
```

## Option 3. Full local pairing

Use this when you want to validate the real frontend/backend contract relationship.

### Step 1. Start the backend

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-laravel.git
cd obsidian-admin-laravel
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml exec app php artisan key:generate
docker compose -f docker-compose.dev.yml exec app php artisan migrate --force --seed
```

### Step 2. Start the frontend

```bash
git clone https://github.com/obsidianlabs-io/obsidian-admin-vue.git
cd obsidian-admin-vue
pnpm install
pnpm dev
```

### Step 3. Verify frontend contract sync

In the frontend repository:

```bash
pnpm typecheck:api
```

If this command fails, do not treat the current pair as validated until generated API files are synced.

### Step 4. Run the automated pairing smoke

In the frontend repository:

```bash
pnpm test:fullstack
```

This boots the real Vue app in test mode and verifies:

- login with the seeded `Super / 123456` account
- tenant switching from platform scope to `Main Tenant`
- access to the real `/user` page
- opening the add-user drawer and loading role options from the real backend


## Recommended evaluation order

Use this order if you are evaluating adoption:

1. frontend public preview
2. backend runtime and docs
3. full local pairing
4. release artifact and supply-chain inspection

This keeps setup cost low while still giving you a real view of the stack's architecture and operating model.
