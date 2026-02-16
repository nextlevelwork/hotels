# Gostinets — Hotel Booking Platform

## What's Built
- [x] Hotel search with filtering (price, rating, noise dB, WiFi Mbps, workspace)
- [x] Detailed hotel pages with gallery, AI-summarized reviews, video verification
- [x] Full booking flow: room selection → guest data → payment → voucher
- [x] YooKassa payments (cards, SBP, cash on arrival)
- [x] OAuth: Google, Yandex + email/password (NextAuth v5)
- [x] Loyalty/bonus program with earn/spend mechanics
- [x] Price negotiation ("bidding") system
- [x] Favorites (localStorage-based)
- [x] Email notifications with unsubscribe (Nodemailer)
- [x] Admin panel (loyalty management)
- [x] SEO: JSON-LD, Open Graph, sitemap, robots, canonical URLs
- [x] Security: XSS sanitization, HSTS, CSP, rate limiting, bcrypt
- [x] Zod env validation at startup
- [x] Vitest unit tests for API routes (auth, bookings, payments, favorites)
- [x] Docker Compose (PostgreSQL + Next.js)
- [x] 50 demo hotels across 5 Russian cities

## What's Missing
- [ ] **CI/CD** — no GitHub Actions (use `nw add ci`, frontend-nextjs job)
- [ ] **E2E tests** — no Playwright/Cypress
- [ ] **Centralized logging** — console.error only, needs Sentry
- [ ] **Real hotel data** — Ostrovok API integrated but mock mode is default
- [ ] **CDN** — no image optimization/CDN for hotel photos
- [ ] **Analytics** — GA4 config referenced but not implemented

## Stack
- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Prisma + PostgreSQL, NextAuth v5 (Prisma adapter)
- Zustand (booking, favorites, toast), Framer Motion, Swiper
- React Hook Form + Zod validation
- YooKassa, Nodemailer, Ostrovok/ETG B2B API

## Key Paths
- Pages: `src/app/` (App Router)
- API routes: `src/app/api/` (auth, bookings, payments, reviews, admin)
- Components: `src/components/` (home, hotel, search, booking, auth, ui)
- Stores: `src/store/` (booking, favorites, toast, search)
- Lib: `src/lib/` (auth, prisma, email, rate-limit, env, yookassa, loyalty)
- Data: `src/data/` (50 mock hotels, rooms, reviews, cities)
- Schema: `prisma/schema.prisma` (6 migrations)
- Tests: `src/app/api/**/**.test.ts`

## GitHub
Repo: `nextlevelwork/hotels` (note: different from directory name)

## Blueprints & Packages to Use
- Toast: `@nw/stores` (createToastStore) — already matches existing pattern
- CI: `nw add ci` (frontend-nextjs job)
- **Component tests**: `nw add react-testing` (vitest config, setup, component patterns)
- **E2E tests**: `nw add e2e` (Playwright config, auth setup, booking CRUD spec)

## Deployment
- **Domain**: gostinetz.ru (158.160.223.240)
- **Deploy**: `ssh servix` → `cd ~/gostinets && git pull && docker compose up -d --build`
- **Ports**: app 3002, PG 5435 (localhost only)
- **Logs**: `ssh servix "cd ~/gostinets && docker compose logs app --tail=50"`
- **SSL**: `sudo certbot --nginx -d gostinetz.ru -d www.gostinetz.ru` (after DNS setup)

## DB Access
- Local: PostgreSQL `gostinets` (user `andrey`), env in `.env.local`
- Production: `ssh servix "cd ~/gostinets && docker compose exec -T db psql -U gostinets -d gostinets"`
- Test user: `test@example.com` / `test123` (role: admin)
