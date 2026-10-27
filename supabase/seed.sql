-- LOCAL DEV ONLY (`supabase db reset` runs this). Never run against production.
-- Admin login: admin@local.test / admin123

do $$
declare
  admin_id uuid := '00000000-0000-4000-8000-000000000001';
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
    'admin@local.test', extensions.crypt('admin123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), admin_id, admin_id::text,
          jsonb_build_object('sub', admin_id::text, 'email', 'admin@local.test'),
          'email', now(), now(), now());

  insert into public.admins (user_id) values (admin_id);
end $$;

-- One delivery per status, to see the admin list ordering.
insert into public.pages (id, slug, title, client_name, client_email, event_date, status, expires_at) values
  ('10000000-0000-4000-8000-000000000001', 'ana-e-bruno', 'Casamento Ana & Bruno', 'Ana Souza', 'ana@example.com', '2026-09-12', 'published', now() + interval '60 days'),
  ('10000000-0000-4000-8000-000000000002', 'carla-15-anos', '15 anos da Carla', 'Carla Lima', null, '2026-10-03', 'draft', now() + interval '90 days'),
  ('10000000-0000-4000-8000-000000000003', 'diego-e-elisa', 'Casamento Diego & Elisa', 'Diego Alves', 'diego@example.com', '2026-05-20', 'published', now() - interval '3 days'),
  ('10000000-0000-4000-8000-000000000004', 'beatriz-formatura', 'Formatura da Beatriz', 'Beatriz Rocha', null, '2026-08-30', 'published', now() + interval '5 days');

insert into public.sections (id, page_id, name, "order") values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Cerimônia', 0),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Festa', 1);

-- Fake media rows (keys don't exist in R2) so the totals have something to show.
insert into public.media (page_id, section_id, type, original_key, size_bytes, original_name, "order")
select '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'photo',
       'pages/fake/' || i || '/original.jpg', 6500000, 'IMG_' || i || '.jpg', i
from generate_series(1, 24) i;

insert into public.media (page_id, section_id, type, original_key, size_bytes, original_name, "order") values
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'video',
   'pages/fake/v1/original.mp4', 480000000, 'festa.mp4', 0);
