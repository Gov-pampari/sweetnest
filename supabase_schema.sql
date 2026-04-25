-- =====================================================================
-- SweetNest — Supabase schema, RLS policies, seed data, admin trigger
-- Run this ENTIRE file in the Supabase SQL Editor.
-- =====================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- =========================
-- Tables
-- =========================

-- Products
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  price numeric(10,2) not null,                -- legacy base price (kept for back-compat; usually = price_500g)
  price_250g numeric(10,2),
  price_500g numeric(10,2),
  price_1kg  numeric(10,2),
  quantity text not null default '500g',       -- display weight (e.g. "500g", "1kg")
  image_url text not null,
  category text not null default 'Traditional',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  customer_phone text not null,
  items jsonb not null,            -- [{id,name,price,weight,qty,subtotal}]
  total numeric(10,2) not null,
  status text not null default 'new' check (status in ('new','confirmed','delivered','cancelled')),
  notes text default '',
  created_at timestamptz not null default now()
);

-- User roles
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

-- =========================
-- Row Level Security
-- =========================

alter table public.products    enable row level security;
alter table public.reviews     enable row level security;
alter table public.orders      enable row level security;
alter table public.user_roles  enable row level security;

-- Helper to check admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Products: public read active; admin full
drop policy if exists "products_read_public" on public.products;
create policy "products_read_public"  on public.products for select  using (is_active = true or public.is_admin());
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all"    on public.products for all     using (public.is_admin()) with check (public.is_admin());

-- Reviews: public insert pending; public read approved; admin full
drop policy if exists "reviews_insert_public" on public.reviews;
create policy "reviews_insert_public" on public.reviews for insert  with check (status = 'pending');
drop policy if exists "reviews_read_approved" on public.reviews;
create policy "reviews_read_approved" on public.reviews for select  using (status = 'approved' or public.is_admin());
drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all"     on public.reviews for all     using (public.is_admin()) with check (public.is_admin());

-- Orders: public insert; admin read/update/delete
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"  on public.orders for insert  with check (true);
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all"      on public.orders for all     using (public.is_admin()) with check (public.is_admin());

-- user_roles: admin can manage
drop policy if exists "user_roles_admin_all" on public.user_roles;
create policy "user_roles_admin_all"  on public.user_roles for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "user_roles_self_read" on public.user_roles;
create policy "user_roles_self_read"  on public.user_roles for select using (auth.uid() = user_id);

-- =========================
-- Auto-grant admin on signup for the configured brand email
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.email = 'sweetnestmalkajgiri@gmail.com' then
    insert into public.user_roles(user_id, role)
    values (NEW.id, 'admin')
    on conflict (user_id) do nothing;
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================
-- Seed data
-- =========================
insert into public.products (name, description, price, quantity, image_url, category, is_active) values
('Kaju Katli',        'Premium cashew diamonds delicately sweetened with cardamom and pure ghee.', 650, '500g', 'https://images.pexels.com/photos/10514163/pexels-photo-10514163.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Dry Fruit Sweets', true),
('Gulab Jamun',       'Golden milk dumplings soaked in fragrant rose-cardamom syrup.',              420, '500g', 'https://images.pexels.com/photos/15014918/pexels-photo-15014918.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Traditional',        true),
('Rasgulla',          'Soft spongy chenna balls in light saffron sugar syrup.',                     380, '500g', 'https://images.pexels.com/photos/36460898/pexels-photo-36460898.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Bengali',            true),
('Motichoor Ladoo',   'Tiny boondi pearls bound with ghee and garnished with pistachios.',          480, '500g', 'https://images.pexels.com/photos/28437003/pexels-photo-28437003.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Traditional',        true),
('Milk Barfi',        'Classic milk fudge topped with silver varq and almond slivers.',             520, '500g', 'https://images.pexels.com/photos/7182054/pexels-photo-7182054.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Barfi',              true),
('Soan Papdi',        'Flaky golden strands that melt on your tongue with pistachio hints.',        360, '500g', 'https://images.pexels.com/photos/14723140/pexels-photo-14723140.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Traditional',        true),
('Jalebi',            'Crisp saffron spirals dipped in warm sugar syrup — best served fresh.',      280, '500g', 'https://images.pexels.com/photos/36551398/pexels-photo-36551398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'Traditional',        true),
('Mysore Pak',        'Rich ghee-laden gram flour fudge from royal Mysore kitchens.',               550, '500g', 'https://images.pexels.com/photos/5864767/pexels-photo-5864767.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940', 'South Indian',       true)
on conflict (name) do nothing;

-- Seed a few approved reviews
insert into public.reviews (name, rating, comment, status) values
('Ananya R.',  5, 'The Kaju Katli tastes exactly like my grandmother used to make. Absolutely divine!', 'approved'),
('Rohit K.',   5, 'Ordered for Diwali — melt-in-mouth Motichoor Ladoos, packaging was beautiful.',       'approved'),
('Priya S.',   4, 'Fresh, fragrant and delivered quickly via WhatsApp order. Will order again.',        'approved')
on conflict (name, comment) do nothing;
