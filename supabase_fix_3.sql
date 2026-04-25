-- =====================================================================
-- SweetNest fix-3: per-weight pricing columns on products
-- Run once in Supabase SQL Editor
-- =====================================================================

-- 1) Add optional per-weight price columns
alter table public.products
  add column if not exists price_250g numeric(10,2),
  add column if not exists price_500g numeric(10,2),
  add column if not exists price_1kg  numeric(10,2);

-- 2) Backfill existing rows using the previous multipliers so nothing breaks
update public.products
set
  price_250g = coalesce(price_250g, round(price * 0.55)),
  price_500g = coalesce(price_500g, price),
  price_1kg  = coalesce(price_1kg,  round(price * 1.9));
