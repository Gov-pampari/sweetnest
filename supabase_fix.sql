-- =====================================================================
-- SweetNest — one-time cleanup after initial seed ran twice
-- Run in Supabase SQL Editor
-- =====================================================================

-- 1) De-duplicate products (keep earliest row per name)
delete from public.products p
using public.products p2
where p.name = p2.name
  and p.created_at > p2.created_at;

-- 2) Prevent future duplicates
alter table public.products
  add constraint products_name_unique unique (name);

-- 3) Clean up any leftover test rows from the QA run
delete from public.reviews where name = 'TEST_Reviewer';
delete from public.orders  where customer_name = 'TestUser';

-- 4) Ensure the admin user has the admin role in user_roles (safe to run repeatedly)
--    Requires the auth user to already exist (Authentication → Users in Dashboard).
insert into public.user_roles (user_id, role)
select u.id, 'admin'
from auth.users u
where u.email = 'sweetnestmalkajgiri@gmail.com'
on conflict (user_id) do nothing;
