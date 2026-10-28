# Event Moments — Guest MVP (front-end only, mock data)

Web app to deliver photos and videos from events (weddings, etc.) to the couple who hired the work.
**This phase builds only what the client receives**: the guest-facing screens, running entirely in the
browser with **fictitious data**. No backend, no database, no admin, no real uploads.
UI language: **Portuguese (pt-BR)**. Code, identifiers and comments: English.

## Goal of this phase

A clickable, deployable front-end that looks and behaves like the final guest experience, so the design
(made first in Figma) can be validated on real phones. Everything that will later come from the API comes
from a **mock data layer** with the same shape the API will return, so swapping to the real NestJS API later
means replacing one module, not rewriting screens.

## Non-negotiable constraints

1. **Mobile-first.** Design and test on a phone viewport (375×812) first, then tablet/desktop.
2. **Zero cost.** Only free tools/hosting. No paid services.
3. **Swappable data layer.** Screens never import mock files directly; they go through `src/services/`.
4. **Respect `prefers-reduced-motion`** for every animation.
5. **noindex** on everything (this is a private product; mock pages must not be indexed either).

## Stack

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Framework | React + Vite |
| Routing | React Router |
| Data fetching | TanStack Query (React Query), against the mock service |
| Styling | Tailwind CSS (tokens below as theme variables) — can be swapped for CSS Modules if preferred |
| Fonts | Cormorant + Inter, self-hosted via `@fontsource` (no external font requests) |
| ZIP download | `client-zip` (streaming ZIP in the browser) |
| Tests | Vitest (unit) + Playwright (E2E, phone viewport) |
| Hosting (optional) | Cloudflare Pages free (`*.pages.dev`) |

Not in this phase: NestJS, Supabase, R2, Sentry, e-mail. Do not add them.

## Screens & routes

```
/                 Minimal public home: business name, logo, contact, button "Acessar seu conteúdo"
/access           Access-code form
/p/:slug          Invitation letter → delivery landing page (requires a valid mock session)
*                 404 in the same visual language
```

### Guest flow

1. **`/access`** — single input for the code + submit. States: idle, loading (simulate ~600 ms latency),
   error "Código inválido", expired page ("Esta entrega expirou" + contact), success → navigate to `/p/:slug`.
2. **Invitation letter** (first view of `/p/:slug`): dark blurred photo background (cover image), logo on top,
   light paper card with eyebrow "UMA CARTA PARA VOCÊS", couple's names, italic message, signature
   "Com carinho, <business>" with a short rule before it; pill button "Abrir minha entrega →" below.
   Fade in from black. Opening it transitions to the landing (no route change).
3. **Landing page** (vertical scroll):
   - **Hero** (100dvh): background video (muted, loop, `playsInline`) over the cover image with slow Ken Burns;
     row of 4 small portrait thumbnails; eyebrow "<BUSINESS> APRESENTA"; names in large serif (each word animates in);
     event date in uppercase; relative "seu dia foi há X dias"; primary pill "Assistir ao vídeo de abertura"
     (opens the opening video in the lightbox); "ROLE PARA VER" cue at the bottom.
   - **Collection**: parallax banner image fading to black with eyebrow "SUA COLEÇÃO" and title
     "Os vídeos da sua história"; grid of **featured** videos (16:9 thumb, gradient, centered round play button,
     serif title, max 2 lines); secondary pill "Ver todos os arquivos (N)".
   - **Moments** (sections): one block per section ("Cerimônia", "Festa", "Making of"...) with a preview
     strip and "Ver momento" → opens the gallery filtered to that section.
   - **Closing** (100dvh): big italic quote (same letter message) + signature, buttons
     "Compartilhar este momento" (Web Share API, fallback copy link) and "Rever desde o começo"
     (scroll to top + replay letter), logo, tiny footer with business contact.
4. **Gallery sheet "Todos os arquivos"** — full-screen overlay (not a route; close with back button/Esc and the
   browser back gesture via history state):
   - Header: "← Voltar", title "Todos os arquivos", counter "N ARQUIVOS".
   - Segmented filter **Tudo / Vídeos / Fotos** with counts; section chips below (Todas, Cerimônia, Festa...).
   - Helper text + **"Baixar tudo"** (changes with the filter: "Baixar as fotos", "Baixar este momento").
   - Grid: 2 columns on phone, 3 on tablet, 5 on desktop; videos 16:9, photos portrait; caption under each.
   - Paginate: show 20, then "Ver mais"; `loading="lazy"` on images; staggered entry animation.
5. **Lightbox**: dark backdrop, media centered (~12 px radius, native aspect ratio), close button, prev/next
   (buttons + swipe on touch + arrow keys), counter "3 / 120", title, **"Baixar"** menu with
   "Versão web" / "Original".

### Downloads (simulated but real)

- Single file: `<a download>` / fetch + Blob for cross-origin files.
- "Baixar tudo" / "Baixar este momento": build a ZIP **in the browser** with `client-zip`, show progress,
  name it `<slug>-<filter>.zip`. Ask for "web" or "original" before starting.
- Test early on iPhone Safari with a large ZIP; if it fails, fall back to sequential single downloads.

## Design tokens (from the reference + Figma)

The visual reference is the UZG Creative delivery page (analysis in the Claude Project doc
`claude/referencia-uzg-entrega.md`). Once the Figma file exists, **Figma wins** over this table.

| Token | Value | Use |
|---|---|---|
| ink | `#0B0B0B` | main background |
| ink-soft | `#161513` | alternate section background |
| charcoal | `#3B3B3B` | card surfaces (use with opacity) |
| cream | `#F5F0EB` | text and primary buttons on dark |
| paper | `#FBF9F6` | letter card |
| muted | `#8A8175` | signatures, warm secondary text |
| accent | `#AAB0B8` | eyebrow labels |
| line-dark | `#2A2826` | dividers on dark |

- **Type:** Cormorant 300 (italic for messages) for names/titles/quotes; Inter 400/500 for UI.
  Eyebrows: Inter ~10 px, UPPERCASE, letter-spacing 0.35–0.5em. Scale: 72/36/30/20/18 serif (names 48 on phone),
  14/12/11 sans. Cream text opacities: 85/70/55/45 %; borders 25/20/10 %.
- **Buttons:** always pill. Primary = solid cream + ink text; secondary = cream 20 % border + charcoal 40 % fill.
  Touch targets ≥ 44 px.
- **Radii:** 6 px thumbnails, 14 px cards (`--radius-card`), 16 px letter / vertical cards.
- **Motion:** Ken Burns (hero), parallax (collection banner), reveal on scroll (IntersectionObserver),
  staggered gallery entry. All disabled or reduced under `prefers-reduced-motion`.
- **Safe areas:** `viewport-fit=cover` + `env(safe-area-inset-*)` paddings for iPhone notches.

Theme values live in one place (`src/theme/tokens.ts` + Tailwind theme) and are also read from the page's
`theme` field, so a page can override colors later.

## Data contract (mirror of the future API)

Define these in `src/types/` and treat them as the API contract. The mock must return exactly these shapes.

```ts
type MediaType = 'photo' | 'video';

interface MediaItem {
  id: string;
  type: MediaType;
  sectionId: string | null;
  title: string | null;          // e.g. "Cerimônia completa", "Dança do vestido"
  featured: boolean;             // appears in the landing "collection"
  thumbUrl: string;              // ~400px (photos) / poster frame (videos)
  webUrl: string;                // ~2048px photo / playable MP4
  originalUrl: string;           // full-quality file for download
  width: number;
  height: number;
  durationSec?: number;          // videos only
  sizeBytes: number;             // original size, to show before downloading
}

interface Section { id: string; name: string; order: number; }

interface PageContent {
  slug: string;
  coupleNames: string;           // "Marina & Lucas"
  eventDate: string;             // ISO date
  letterMessage: string;
  coverImageUrl: string;
  openingVideoId: string | null; // hero "Assistir ao vídeo de abertura"
  heroThumbIds: string[];        // 4 small thumbnails in the hero
  theme: Partial<ThemeTokens> | null;
  expiresAt: string;             // ISO; used to show "disponível até ..."
  sections: Section[];
  media: MediaItem[];
}

interface Business { name: string; logoUrl: string; contact: { whatsapp?: string; email?: string; instagram?: string }; }

type AccessResult =
  | { ok: true; slug: string; token: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'rate_limited' };
```

## Mock data layer

```
src/services/
  contentService.ts     interface ContentService { validateCode(code): Promise<AccessResult>;
                                                    getPageContent(slug, token): Promise<PageContent>;
                                                    getBusiness(): Promise<Business> }
  mockContentService.ts implementation backed by src/mocks/
  index.ts              exports the active implementation (later: apiContentService)
src/mocks/
  business.ts
  pages/marina-lucas.ts
  pages/julia-pedro.ts
  pages/expired-event.ts
```

Rules:
- Simulate latency (300–800 ms) and errors so loading/error states get built for real.
- **Fake session:** `validateCode` returns a fake token; store `{ slug, token, exp }` in memory + `sessionStorage`
  (same behavior the real API will have). `/p/:slug` without a valid session for that slug → redirect to `/access`.
- Simulate rate limiting: after 5 wrong codes in a minute, return `rate_limited` for 60 s.
- Codes in the mock are plain strings in the mock files. **Never** design the real API this way; the real one
  will store only an HMAC.

### Fictitious data to create

All names and texts invented — **never** reuse names, photos or texts from the reference site or real clients.

| Slug | Couple | Code | State | Content |
|---|---|---|---|---|
| `marina-lucas` | Marina & Lucas | `AURORA2026K` | active | 4 sections, ~6 featured videos, ~60 photos, ~20 videos |
| `julia-pedro` | Júlia & Pedro | `MAREVIVA7Q` | active | small set: 2 sections, 2 videos, 12 photos (tests few-items layouts) |
| `bia-rafa` | Bia & Rafa | `OUTONO48XZ` | expired | expired → shows the "expirou" screen |

Business (fictitious): "Estúdio Aurora", placeholder logo (simple SVG wordmark), fake WhatsApp/e-mail/Instagram.

Media sources:
- **Photos:** `https://picsum.photos/seed/<id>/<w>/<h>` for thumb/web/original sizes (deterministic by seed,
  free, CORS-enabled). Mix portrait and landscape.
- **Videos:** put a few small MP4 (H.264) files in `public/mock/videos/` (self-recorded or from a free
  stock site whose license allows it) and reuse them across items; posters from picsum.
- If any remote source fails (offline, CORS), fall back to files in `public/mock/`.
- Generate large lists with a small seeded helper (`src/mocks/factory.ts`), not by hand.

## Link preview & indexing (front-end part)

- `index.html`: `<meta name="robots" content="noindex, nofollow">`, generic Open Graph tags
  (business name, "Suas memórias estão prontas", generic image in `public/og-image.jpg`).
- `public/_headers` (Cloudflare Pages): `X-Robots-Tag: noindex, nofollow` for `/*`.
- Per-couple preview with the couple's photo is a **later phase** (needs the server). Don't fake it here.

## Accessibility

- Semantic headings per section; buttons are `<button>`, links are `<a>`.
- Lightbox and gallery sheet: focus trap, `Esc` closes, focus returns to the trigger, `aria-modal`.
- Every image has `alt` (title or "Foto N de <couple>"); play buttons have `aria-label`.
- Contrast: check cream-on-ink opacities used for text meet WCAG AA at their sizes.

## Repository layout

```
src/
  app/            router, providers (QueryClient), layout
  pages/          Home, Access, ClientPage (letter + landing), NotFound
  components/
    landing/      Letter, Hero, Collection, Moments, Closing
    gallery/      GallerySheet, FilterBar, MediaGrid, MediaTile
    lightbox/     Lightbox, DownloadMenu
    ui/           Button (primary/secondary pill), Eyebrow, Spinner, Sheet
  hooks/          useSession, useReducedMotion, useInView, usePagination
  lib/            zip.ts (client-zip), download.ts, share.ts, dates.ts ("há X dias", pt-BR formats)
  services/       ContentService interface + mock implementation
  mocks/          fictitious data + factory
  theme/          tokens.ts
  types/          API contract types
public/
  _headers  og-image.jpg  mock/
tests/
  unit/           dates, session, pagination, mock service
  e2e/            Playwright, phone viewport
```

## Build order

1. Scaffold Vite + React + TS + Router + React Query + Tailwind; fonts; tokens; base layout; noindex.
2. Types (data contract) + `ContentService` interface + mock implementation + factory + the 3 fictitious pages.
3. `/access` with all states + fake session + redirect guard on `/p/:slug`.
4. Invitation letter.
5. Hero (video, Ken Burns, thumbs, names animation, relative date).
6. Collection + moments + closing.
7. Gallery sheet (filters, sections, pagination, lazy images).
8. Lightbox (navigation, swipe, keyboard, focus trap).
9. Downloads: single file (web/original) + ZIP with progress.
10. Share button, 404, expired screen, minimal home.
11. Reduced motion, accessibility pass, safe areas.
12. Unit tests + E2E: code → letter → landing → open gallery → open photo → download.
13. Test on real phones (iPhone Safari + Android Chrome); optional deploy to Cloudflare Pages.

## Definition of done for this MVP

- [ ] Valid code opens the right couple; invalid, expired and rate-limited states shown correctly
- [ ] Refreshing `/p/:slug` keeps the session; opening it directly without a session goes to `/access`
- [ ] Letter → landing transition, hero video plays inline on iPhone
- [ ] Collection, moments and closing render from data (no hardcoded content in components)
- [ ] Gallery: filters, sections, pagination, lightbox with swipe
- [ ] Single download (web/original) and ZIP download work on phone
- [ ] Layout good at 375 px, 768 px and 1280 px; reduced motion respected
- [ ] No mock import outside `src/services/` and `src/mocks/`
- [ ] E2E test green in phone viewport

## Out of scope for this phase

Admin panel, NestJS API, database, real auth/codes (HMAC), uploads, media processing, metadata watermark,
e-mail invite, per-couple Open Graph with the couple's photo, Sentry, cleanup jobs, LGPD.
Those are already designed for later phases; keep the data contract compatible with them.

## Working style

The developer learns by doing and prefers guidance, references, and review over large generated
solutions. Explain the reasoning, point to docs, and keep generated code focused on the step at hand
unless asked for more.
