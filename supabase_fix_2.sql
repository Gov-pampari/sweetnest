-- =====================================================================
-- SweetNest fix-2: dedupe reviews + clean QA leftovers + idempotency
-- Run once in Supabase SQL Editor
-- =====================================================================

-- 1) De-duplicate reviews (keep earliest row per name+comment)
delete from public.reviews r
using public.reviews r2
where r.name = r2.name
  and r.comment = r2.comment
  and r.created_at > r2.created_at;

-- 2) Prevent future duplicates
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reviews_name_comment_unique'
  ) then
    alter table public.reviews
      add constraint reviews_name_comment_unique unique (name, comment);
  end if;
end $$;

-- 3) Clean up automation test rows from the QA runs
delete from public.reviews where name in ('AdminReview', 'AdminReject', 'TEST_Reviewer');
delete from public.orders  where customer_name in ('TestUser', 'AdminTest');
delete from public.products where name = 'Test Pedha';
