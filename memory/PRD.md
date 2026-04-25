# SweetNest — PRD

## Original problem statement
Build a 3D with motion-graphic production-ready full-stack website for "SweetNest" (sweet shop). Modern, premium, mobile-first with product browsing, multi-item cart, WhatsApp ordering (no payment), Supabase backend, admin dashboard, strong logo branding.

## Architecture
- React (CRA) frontend — no custom backend needed
- Supabase (Postgres + Auth + RLS) for data + admin auth
- `@supabase/supabase-js` called directly from frontend
- `framer-motion` for 3D parallax hero and micro-interactions
- Tailwind + Shadcn UI components, custom cream+maroon brand theme
- Cart in localStorage
- WhatsApp deep-link ordering (wa.me)

## User personas
1. **Customer** — browses sweets, adds to cart, orders via WhatsApp
2. **Admin (shop owner)** — manages orders, products (CRUD), approves reviews

## Core static requirements
- Brand palette: cream `#F5E6B8` + maroon `#5C1A0B` + gold `#D4AF37`
- Logo used AS-IS in Navbar, Hero, Footer, Favicon
- Mobile-first responsive layout
- Lazy-loaded images
- Supabase-only backend (no FastAPI, no Lovable Cloud)

## Implemented (v1 — 2026-02-23)
- Hero with 3D parallax logo + floating sweet thumbnails + mouse-tracking parallax
- Product grid with weight selector (250g/500g/1kg), category filter, price computed per weight
- Cart drawer (slide-over) with qty controls, totals, name+phone capture
- Orders persisted to Supabase then WhatsApp deep-link fired
- Reviews: public submit (pending), public read approved, rating stars
- Contact section with Google Maps embed + WhatsApp CTA
- Admin login (sign-up + sign-in) with auto-admin trigger on configured email
- Admin dashboard: orders table + status update, product CRUD, review approval
- Branded footer with logo, nav, contact, admin link
- SQL schema + RLS policies + seed data + admin-role trigger in `/app/supabase_schema.sql`

## Prioritised backlog
- **P0**: User must run `/app/supabase_schema.sql` in Supabase SQL editor (one-time)
- **P1**: End-to-end testing via testing agent once schema applied
- **P1**: Image upload for admin (instead of URL paste) via Supabase Storage
- **P2**: Order search/filter, CSV export, analytics dashboard
- **P2**: Festival collections, gift boxes, minimum order banner
- **P2**: PWA install + offline cache

## Next tasks
1. User runs SQL schema
2. User signs up admin at `/admin/login` — trigger grants admin automatically
3. Run testing agent for full end-to-end validation
