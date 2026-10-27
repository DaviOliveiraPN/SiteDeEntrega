# Event Moments — Project Guide (MVP)

Web app to deliver photos and videos from events (weddings, etc.) to the people they belong to.
An admin (marketing professional) creates one private landing page per client. The client opens it
with an access code and views/downloads their media. UI language: **Portuguese (pt-BR)**.

## Non-negotiable constraints

1. **Zero cost.** Every service must run on a free plan, and the app must be built so it *cannot*
   exceed free limits by accident (see "Free-tier budget").
2. **Mobile-first.** Both the client landing page and the admin panel are used mainly on phones.
   Design and test on a phone viewport first.
3. **Private by default.** Client media is never public, never indexed, never in a preview card.

## Scope & scale

- One landing page per client/event, **one access code per page**, accessed by 1–3 people.
- Client pages live **2–3 months** (default 90 days), then expire.
- Public home (contact info + "Acessar seu conteúdo") and admin are **permanent**.
- One admin user.

## Stack (chosen for zero cost)

| Concern | Choice | Why |
|---|---|---|
| Frontend | React + Vite + TypeScript SPA, React Router | Static build, no server runtime needed |
| Hosting | **Cloudflare Pages** (free) | Commercial use allowed on free plan; Vercel Hobby is non-commercial only |
| Database + admin auth | **Supabase** free (Postgres, Auth, RLS) | |
| Server logic | **Supabase Edge Functions** (Deno), free 500k invocations/month | Code check, signed URLs, e-mail, cleanup |
| Media storage | **Cloudflare R2** free (10 GB, free egress) | Supabase free storage is only 1 GB |
| Error monitoring | **Sentry** free plan (`@sentry/react` + Sentry Deno SDK) | Required in MVP |
| Scheduled jobs | **GitHub Actions** scheduled workflow | Cleanup, keep-alive, DB backup |
| Domain | `*.pages.dev` subdomain at first | Custom domain costs money; buy later |

All media access goes through one module (`src/lib/storage.ts` on the client, `supabase/functions/_shared/r2.ts`
on the server) so the storage provider can be swapped later.

**Decision (confirmed by the developer): static SPA.** Do not introduce Next.js, SSR, or any server
runtime on Cloudflare. All server-side logic lives in Supabase Edge Functions.
Alternative rejected: Next.js on Cloudflare via the OpenNext adapter (free-plan Worker size limit of 3 MiB
and CPU limits); the static SPA + Edge Functions setup fits free limits with margin.

## Free-tier budget (must be enforced in code)

- **R2: 10 GB total.** Show storage used in the admin dashboard. **Block new uploads above a soft limit
  (e.g., 9 GB)** so the bill can never start. Expired-media cleanup is what keeps this budget alive.
- **Supabase free projects pause after 1 week of inactivity.** The daily GitHub Action (below) hits the
  database, which keeps the project active.
- **Supabase free has no automatic backups.** The weekly GitHub Action dumps the database.
- **Edge Functions:** 2 s CPU / 256 MB memory per request. Never process media or build ZIPs on the server.
- Verify current free-plan limits of every service before launch; they change.

## Routes (SPA)

```
/                    Public home: blocks + contact info from site_settings (permanent)
/access              Access-code form (the code alone identifies the page)
/p/:slug             Client landing page (requires a valid access token for that page)
/admin/login         Admin login (Supabase Auth)
/admin               Sidebar layout; redirects to /admin/entregas
/admin/entregas      "Entregas": active-page count, storage, grid of all pages
/admin/entregas/nova "Nova entrega": client name + initial data, starts as draft
/admin/entregas/:id  Delivery detail: totals, edit data, publish, media (sections, blocks, code, invite later)
/admin/site          Edit the public home: blocks and contact info
```

The admin panel is driven by a **sidebar** (drawer on phones). New admin feature = one sidebar item
(`NAV` in `AdminLayout.tsx`) + its child route.

**Delivery status (admin UI):** *ativa* = published and not expired · *em espera* = draft ·
*inativa* = expired. The grid sorts ativa → espera → inativa, then by client name.

Header items on the landing page ("Início", "Meus momentos", ...) are anchor links to sections of the same page.

## Data model (Postgres)

```sql
admins (user_id uuid pk -> auth.users)                 -- who is admin (used by RLS)

pages (
  id uuid pk,
  slug text unique,
  title text,
  client_name text not null,          -- who the delivery is for
  client_email text null,             -- invite destination (optional)
  event_date date null,
  access_code_lookup text unique null, -- HMAC-SHA256(code, ACCESS_CODE_SECRET); never store the plain code
  theme jsonb,                        -- colors, background images, fonts
  status text not null default 'draft' check (status in ('draft','published')),
  expires_at timestamptz not null,    -- default now() + 90 days; admin can change
  media_deleted_at timestamptz null,  -- set by cleanup job
  created_at timestamptz default now()
)

sections (                            -- "momentos": Cerimônia, Festa, Making of...
  id uuid pk,
  page_id uuid fk -> pages on delete cascade,
  name text,
  "order" int
)

media (
  id uuid pk,
  page_id uuid fk -> pages on delete cascade,
  section_id uuid fk -> sections null,
  type text check (type in ('photo','video')),
  original_key text,                  -- R2 object key, full quality
  web_key text null,                  -- photos: ~2048px version
  thumb_key text null,                -- photos: ~400px; videos: poster frame
  size_bytes bigint,                  -- sum of all variants, for the storage budget
  original_name text,
  "order" int,
  created_at timestamptz default now()
)

blocks (
  id uuid pk,
  page_id uuid fk -> pages null,      -- null = block of the public home
  type text,                          -- 'hero' | 'text' | 'gallery' | 'video' | 'downloads' | 'contact' ...
  "order" int,
  content jsonb                       -- block-specific data (a gallery block references section ids)
)

site_settings (                       -- single row
  id int pk check (id = 1),
  business_name text,
  contact jsonb,                      -- phone, WhatsApp, e-mail, Instagram...
  theme jsonb,
  updated_at timestamptz
)

rate_limits (
  key text,                           -- e.g. 'access:<ip>'
  window_start timestamptz,
  count int,
  primary key (key, window_start)
)
```

**Rendering rule:** a page renders its `blocks` ordered by `order`, one React component per `type`.
New kind of section = new `type` + new component, no schema change. The home uses the same renderer
with `page_id is null`.

### RLS

- Admin (user in `admins`): full access to all tables.
- Anonymous: **read only** `site_settings` and `blocks where page_id is null`.
- Anonymous: **no direct access** to `pages`, `sections`, `media`, page blocks. Guests read client data
  only through Edge Functions (service role on the server).

## Guest access flow

Guests are **not** Supabase Auth users. They hold a code.

1. Guest taps "Acessar seu conteúdo" on `/` → `/access`, or opens `/p/:slug` without a token → redirected to `/access`.
2. SPA calls Edge Function `access` with the code.
3. Function checks the rate limit, computes `HMAC-SHA256(code, ACCESS_CODE_SECRET)`, finds the page by
   `access_code_lookup`, checks `status = 'published'` and `expires_at`. A draft page behaves as "code not found".
4. If valid, it returns a **signed access token** (HS256 with `ACCESS_TOKEN_SECRET`, payload `{ page_id, exp }`,
   a few hours) and the slug. The SPA keeps it in memory + `sessionStorage`.
5. `/p/:slug` calls Edge Function `page-content` with the token. The function reads `page_id` **from the token**
   (never from a client parameter) and returns blocks, sections and media with **R2 presigned URLs**
   (see "Caching" for how they are signed and how long they last).
6. Expired page → friendly "esta página expirou" message with contact info from `site_settings`.

Why HMAC and not bcrypt: the form receives only the code, so the server must find the page from it.
Salted hashes can't be looked up; a keyed HMAC is deterministic but useless without the server secret.

Code rules: CSPRNG, ≥ 10 characters, alphabet without ambiguous characters (no 0/O, 1/l/I).

## Rate limiting (MVP, required)

On Edge Functions, counters must live in shared storage → the `rate_limits` table (no extra service).
Fixed window per key. Limits to start with:

- `access`: 5 attempts/min and 20/hour per IP (IP from `x-forwarded-for`).
- `send-invite`: per admin, e.g. 20/hour (protects the SMTP account).
- `upload-url`: per admin, generous (protects against a runaway client loop).

Old rows are deleted by the cleanup job.

## Admin flow

- Login with Supabase Auth (email + password).
- Create page → slug, title, theme, expiration (default 90 days). New pages start as **draft**.
- Create sections (momentos), add/reorder/edit blocks, upload media while the page is a draft.
- **Publish** the page when it's ready (`status = 'published'`); the code only works after that.
- **Generate code + send invite in the same step:** the plain code exists only at generation time
  (only the HMAC is stored). Regenerating a code invalidates the old one.
- **Fallback if the e-mail fails:** on the same screen, a **"Copiar mensagem"** button copies a ready-to-send
  text (link + code) so the admin can send it on WhatsApp. Show the code only on this screen, once.
- Deleting media or a page also deletes its R2 objects.
- See per-page and total storage usage.

## Admin auth hardening (MVP)

- **Disable public sign-ups** in Supabase Auth. The admin account is created manually and added to `admins`.
- **Custom SMTP in Supabase Auth settings** (Auth → SMTP) for password reset; the default sender is
  heavily rate-limited. This runs on Supabase's servers, not in Edge Functions, so port 587 works there.

## Media processing (in the admin's browser, before upload)

No server-side processing (free CPU limits + Supabase image transformations are paid-only).

- Photos: decode with `createImageBitmap` (respects EXIF orientation), produce via canvas:
  - **web** version ~2048px (JPEG/WebP, quality ~0.85)
  - **thumb** ~400px
  - keep the **original** untouched
- HEIC (iPhone): convert to JPEG in the browser with `heic-to` (libheif WASM) before the steps above.
- Videos: **no transcoding**. Generate a poster frame with `<video>` + canvas. Ask the admin to export
  **MP4 H.264**; warn when a file looks like HEVC (spotty browser support).
- Processing runs on a phone too: process files sequentially, show progress, keep memory low.

## Upload

- Browser uploads **directly to R2** with presigned URLs from Edge Function `upload-url`
  (admin JWT verified + rate limit + storage budget check).
- Large files (videos): **S3 multipart upload** to R2 so an interrupted upload can resume
  (look at Uppy's AWS S3 multipart plugin). Configure R2 CORS for the site origin.
- R2 object keys: `pages/<page_id>/<media_id>/{original|web|thumb}.<ext>`.
- Upload with `Cache-Control: private, max-age=31536000, immutable` (keys are unique and files never change).
- Insert the `media` row only after the upload completes; if the insert fails, delete the uploaded objects.

### Storage hygiene (protects the 10 GB budget)

- **R2 lifecycle rule:** abort incomplete multipart uploads after a few days (they occupy storage silently).
- **Daily reconciliation** in `cleanup-expired`: list R2 objects under `pages/` and delete any key with no
  matching `media` row (orphans from closed tabs or failed inserts). Recompute the real storage total.

## Downloads (MVP)

- **Two sizes per photo:** "web" and "original". Presigned GET URLs with
  `response-content-disposition: attachment`.
- **"Baixar tudo"** button, clearly visible at the top of the gallery, plus **"Baixar este momento"** per section.
- ZIP is built **in the guest's browser** (look at `client-zip`, streaming). R2 egress is free, so this costs nothing.
- Risk to test early: big ZIPs on iPhone Safari. If it fails, fall back to per-section ZIPs / sequential downloads.

## Caching (MVP)

The database is not the bottleneck (1–3 visitors per page). The goal of caching is speed and mobile data.

- **Client data:** TanStack Query (React Query) for all reads (dedupe + in-memory cache).
  Client page data: long `staleTime` (e.g., 10 min). Home: a few minutes.
- **Stable presigned URLs:** each new signature changes the URL, which defeats the browser cache and makes
  every reload re-download all thumbnails. Sign with an expiration **rounded to a fixed window**
  (e.g., end of the current hour + margin), so the same object gets the same URL within the window.
- **Different expirations:** thumbnails/web ~1–2 h; download URLs (single files and ZIP sources) longer
  (e.g., 6 h) so a slow "Baixar tudo" on a phone doesn't break halfway.
- Images in galleries use `loading="lazy"`.

## E-mail invite (MVP)

- Edge Function `send-invite` (admin only) sends link + code using the admin's **SMTP** account.
- **Supabase Edge Functions block outbound ports 25 and 587.** Use port **465 (implicit TLS)**, or the
  provider's HTTP API if 465 doesn't work. Validate this first, before building the invite UI.
- SMTP credentials live in Edge Function secrets, never in the client.

## WhatsApp / link preview (MVP)

The link will be shared on WhatsApp, which can't send the code and lands on `/access`.

- Static **generic Open Graph tags in `index.html`**: `og:title` (business name), `og:description`
  ("Suas memórias estão prontas"), `og:image` (logo / brand image in `/public`).
- **Never** a client photo in `og:image`. Since the SPA serves the same `index.html` for every route,
  every link shows the same generic card, which is exactly what we want.

## Block indexing (MVP)

- `public/_headers` (Cloudflare Pages): `X-Robots-Tag: noindex, nofollow` on `/p/*`, `/access`, `/admin/*`.
- **Do not** `Disallow` these paths in `robots.txt`: blocked crawling prevents search engines from
  reading the noindex.
- Real protection is still the access code / admin auth.

## Error monitoring (MVP, required)

- Sentry in the SPA (`@sentry/react`) and in Edge Functions.
- Capture: failed uploads, failed downloads/ZIP, code validation errors (without logging the code), invite failures.
- Never send codes, tokens, or personal data to Sentry.

## Expiration, cleanup, keep-alive, backup

GitHub Actions scheduled workflow (`.github/workflows/maintenance.yml`):

- **Daily:** call Edge Function `cleanup-expired` (secret header) → deletes R2 objects of pages expired
  more than a grace period ago (e.g., 7 days), sets `media_deleted_at`, prunes `rate_limits`,
  reconciles R2 orphans (see "Storage hygiene"). This also keeps the Supabase project from pausing.
- **Weekly:** `pg_dump` of the database, stored outside Supabase (e.g., a `backups/` prefix in R2).

Admin dashboard highlights pages close to expiring.

**Media backup:** the platform is **not** the source of truth. The admin keeps the originals on her
OneDrive (or S3 later). Outside the system for the MVP.

## Environments, testing, CI (MVP)

- **Local dev:** Supabase CLI (`supabase start`, needs Docker) for database, auth and Edge Functions;
  a separate R2 bucket for dev (`*-dev`). Never test against production data.
- **Unit tests** (Vitest / Deno test) for security-critical code: `hmac`, `token`, `rateLimit`, code generation.
- **E2E test** (Playwright, phone viewport): code → landing page → photo download. Run in CI.
- **Deploy:** Cloudflare Pages builds on push to `main`; a GitHub Action applies Supabase migrations and
  deploys Edge Functions on push to `main`.

## Repository layout

```
src/
  pages/            routes (Home, Access, ClientPage, admin/*)
  blocks/           one component per block type + renderer
  lib/              supabase client, storage, media processing, zip, sentry
public/
  _headers          noindex rules
  og-image.jpg      generic preview image
supabase/
  migrations/       schema + RLS
  functions/
    _shared/        r2.ts, hmac.ts, token.ts, rateLimit.ts, cors.ts
    access/
    page-content/
    upload-url/
    send-invite/
    cleanup-expired/
tests/
  unit/
  e2e/
.github/workflows/
  maintenance.yml   daily cleanup/keep-alive + weekly DB backup
  ci.yml            tests on every push/PR
  deploy.yml        migrations + Edge Functions on push to main
```

## Secrets / env

Client (`VITE_*`, public): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`.
Edge Functions (secrets): `ACCESS_CODE_SECRET`, `ACCESS_TOKEN_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`,
`SITE_URL`, `CRON_SECRET`, `SENTRY_DSN`.
Never expose the service role key or any secret to the browser.

## MVP checklist

- [ ] Public home editable by admin (home blocks + `site_settings`)
- [ ] Access by code (HMAC lookup) + signed access token
- [ ] Client landing page rendered from blocks, with sections (momentos)
- [ ] Downloads in two sizes (web / original)
- [ ] "Baixar tudo" + "Baixar este momento" (ZIP in the browser)
- [ ] Admin: pages, sections, blocks, code generation, expiration, draft/published
- [ ] Admin auth hardening (sign-ups disabled, custom SMTP for password reset)
- [ ] Browser-side media processing (web/thumb, HEIC, video poster)
- [ ] Direct-to-R2 upload, multipart for large files, storage budget guard
- [ ] Storage hygiene (lifecycle rule, orphan reconciliation, delete objects with media/page)
- [ ] Caching (React Query, stable presigned URLs, immutable Cache-Control, lazy images)
- [ ] E-mail invite via SMTP (port 465) + "Copiar mensagem" fallback
- [ ] Rate limiting (access, invite, upload-url)
- [ ] Generic Open Graph tags
- [ ] noindex headers
- [ ] Sentry (SPA + Edge Functions)
- [ ] Daily cleanup/keep-alive + weekly DB backup
- [ ] Mobile-first UI for guest and admin
- [ ] Local dev environment + unit tests + E2E test + CI/deploy workflows
- [ ] Deploy to Cloudflare Pages (`*.pages.dev`)

## Build order

1. Accounts + config: Supabase project (sign-ups off, custom Auth SMTP), R2 buckets dev/prod (+ CORS,
   lifecycle rule), Cloudflare Pages, Sentry. Check every free-plan limit.
2. Local dev environment (Supabase CLI) + CI with unit tests.
3. **Spike: SMTP from an Edge Function on port 465.** Confirm before relying on it.
4. Schema + RLS migrations.
5. Thin vertical slice: seed one page by hand → `/access` → token → `/p/:slug` showing photos from R2 via
   stable presigned URLs, with React Query. First E2E test.
6. Rate limiting on `access` + expired/draft states.
7. Admin login + create page + publish + generate code + expiration.
8. Media processing + direct upload to R2 + storage budget + delete objects with media/page.
9. Sections + blocks renderer + block editor (admin).
10. Downloads (sizes, per section, all).
11. Invite e-mail + "Copiar mensagem" fallback.
12. Public home + `/admin/site`.
13. OG tags, `_headers`, Sentry wiring.
14. GitHub Actions maintenance workflow (cleanup, orphan reconciliation, keep-alive, backup) + deploy workflow.
15. Test on real phones (iPhone Safari + Android Chrome), then deploy.

## Out of scope for the MVP

- LGPD work (privacy policy, retention statement, data deletion on request) — **next phase**.
- Download PIN, watermark, print store, face search.
- Favorites, download activity tracking, music block.
- Video transcoding / streaming (HLS).
- Custom domain.
- Random suffix in slugs (avoid exposing names in URLs; not a security issue since content needs a token).
- Showing dates in the America/Sao_Paulo time zone everywhere in the UI.
- Responsive images with `srcset` (thumb/web variants already exist).

## Open questions

- Which block types the admin needs at launch (start with hero, text, gallery, video, downloads, contact).
- Grace period before deleting expired media (7 days assumed).

## Working style

The developer learns by doing and prefers guidance, references, and review over large generated
solutions. Explain the reasoning, point to docs, and keep generated code focused on the step at hand
unless asked for more.
