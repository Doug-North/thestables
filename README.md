# Bradford-on-Avon Website

Town guide + holiday let site with:
- a free local jobs bulletin board
- paid sponsored ad slots for local businesses
- admin moderation workflow
- Cloudflare D1 as the source of truth

## Stack

- Astro (server output)
- Cloudflare Pages/Workers runtime
- Cloudflare D1 (`DB` binding)

## Local setup

1. Install dependencies:
```sh
npm install
```

2. Create D1 database (once):
```sh
wrangler d1 create boa_site
```

3. Copy the returned `database_id` into `wrangler.toml`.

4. Run schema migration:
```sh
wrangler d1 execute boa_site --file=db/schema.sql --local
```

5. Set admin auth vars in Cloudflare env (recommended) or in `wrangler.toml` vars:
- `ADMIN_EMAIL_ALLOWLIST`: comma-separated emails allowed to use `/admin`.
  Example: `owner@example.com,manager@example.com`
6. Configure Cloudflare Access for `/admin*` with Google as identity provider.
   Access must forward `cf-access-authenticated-user-email` to the app.

7. Start local dev:
```sh
npm run cf:dev
```

## Deploy

```sh
npm run d1:migrate
npm run cf:deploy
```

## Data retention (30 days max)

Manual cleanup commands:

```sh
npm run d1:cleanup:local
npm run d1:cleanup:remote
```

`db/cleanup.sql` deletes any `job_posts` and `ad_requests` older than 30 days.

### Automated cleanup with Cloudflare cron trigger

This repo includes a dedicated scheduled worker:
- Worker source: `workers/cleanup.js`
- Worker config: `wrangler.cleanup.toml`
- Cron: daily at `03:17 UTC` (`17 3 * * *`)

Setup once:

1. Copy your real D1 `database_id` into `wrangler.cleanup.toml`.
2. Deploy the cleanup worker:
```sh
npm run cf:deploy:cleanup
```

After that, retention is automatic.
You can inspect logs with:
```sh
npm run cf:tail:cleanup
```

## Features

### Jobs board (`/jobs`)
- Free job submissions by businesses.
- Jobs stay pending until approved in admin.
- Only approved jobs are publicly visible.

### Sponsored ads (`/jobs`)
- Businesses can request paid ad spots.
- Admin can approve, reject, and mark paid/live.
- Only ads with `status=live` and `payment_status=paid` are public.

### Admin (`/admin`)
- Protected with Cloudflare Access (Google SSO).
- Only emails in `ADMIN_EMAIL_ALLOWLIST` can moderate content.
- Moderate pending jobs.
- Moderate ad requests and activate live ads.

## Database schema

See `db/schema.sql`:
- `job_posts`
- `ad_requests`

Both are designed for growth and can be extended with audit logs, multi-admin users, and billing records.

## Note on Google Ads

This implementation uses direct sponsored listings you control. Google AdSense can be added later for generic inventory, but local business campaigns are usually better managed via direct sponsored slots + manual or Stripe invoicing.
