-- Initial schema + RLS. See CLAUDE.md "Data model" and "RLS".

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  client_name text not null,          -- who the delivery is for (shown in the admin list)
  client_email text,                  -- where the invite goes; optional (WhatsApp fallback)
  event_date date,
  -- HMAC-SHA256(code, ACCESS_CODE_SECRET). Null until the admin generates a code.
  access_code_lookup text unique,
  theme jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  expires_at timestamptz not null default now() + interval '90 days',
  media_deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages on delete cascade,
  name text not null,
  "order" int not null default 0
);
create index on public.sections (page_id);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages on delete cascade,
  section_id uuid references public.sections on delete set null,
  type text not null check (type in ('photo', 'video')),
  original_key text not null,
  web_key text,
  thumb_key text,
  size_bytes bigint not null default 0,  -- sum of all variants (storage budget)
  original_name text,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.media (page_id);

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages on delete cascade,  -- null = public home
  type text not null,
  "order" int not null default 0,
  content jsonb not null default '{}'
);
create index on public.blocks (page_id);

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default '',
  contact jsonb not null default '{}',
  theme jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (key, window_start)
);

-- ---------------------------------------------------------------------------
-- Admin check used by every policy. SECURITY DEFINER so it can read `admins`
-- regardless of the caller's own policies; search_path pinned for safety.
-- ---------------------------------------------------------------------------

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- RLS: admin = everything; anon = home blocks + site_settings only.
-- Guests read client data only through Edge Functions (service role bypasses RLS).
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.pages enable row level security;
alter table public.sections enable row level security;
alter table public.media enable row level security;
alter table public.blocks enable row level security;
alter table public.site_settings enable row level security;
alter table public.rate_limits enable row level security;  -- no policies: service role only

create policy "user sees own admin row" on public.admins
  for select to authenticated using (user_id = auth.uid());

create policy "admin all" on public.pages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.blocks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads home blocks" on public.blocks
  for select to anon, authenticated using (page_id is null);
create policy "public reads site settings" on public.site_settings
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Admin list/detail: one row per page with media totals.
-- security_invoker = the caller's RLS applies (anon sees nothing).
-- ---------------------------------------------------------------------------

create view public.page_summaries with (security_invoker = true) as
select
  p.id, p.slug, p.title, p.client_name, p.client_email, p.event_date,
  p.status, p.expires_at, p.media_deleted_at, p.created_at,
  p.access_code_lookup is not null as has_code,
  count(m.id) filter (where m.type = 'photo')::int as photo_count,
  count(m.id) filter (where m.type = 'video')::int as video_count,
  coalesce(sum(m.size_bytes), 0)::bigint as total_bytes
from public.pages p
left join public.media m on m.page_id = p.id
group by p.id;

-- ---------------------------------------------------------------------------
-- Rate limit counter (see supabase/functions/_shared/rateLimit.ts).
-- Atomic insert-or-increment; callable only by the service role.
-- ---------------------------------------------------------------------------

create function public.rate_limit_hit(p_key text, p_window_start timestamptz)
returns int
language sql
as $$
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start) do update set count = r.count + 1
  returning r.count;
$$;

revoke execute on function public.rate_limit_hit(text, timestamptz) from public, anon, authenticated;
