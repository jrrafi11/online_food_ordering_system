# Online Food Ordering System

A full-stack monorepo with a Foodpanda-inspired customer storefront and role-based operations.

## Highlights (Phase 1 Delivered)

- Customer storefront redesign:
  - discovery/search/filter/sort/pagination
  - premium restaurant cards and promo banners
  - polished menu, cart, checkout, orders, and tracking UX
- Customer-first auth:
  - dedicated customer signup endpoint
  - separate partner onboarding flow for restaurant/rider
- Storefront-ready restaurant metadata:
  - delivery ETA, fee, min order, rating aggregate/count, featured flag, media URLs
- Maps:
  - restaurant location map
  - rider live location map
- Role dashboards remain functional with refreshed styling

## Tech Stack

- Backend: Node.js, Express, Sequelize, MySQL/SQLite fallback, Socket.IO, JWT
- Frontend: React (Vite), Tailwind CSS, React Router, React Leaflet
- Testing: Vitest + Supertest (backend)

## Project Structure

- `backend/` Express API and data layer
- `frontend/` React application
- `PHASE2_BLUEPRINT.md` planned multi-restaurant checkout architecture

## Quick Start

1. Install dependencies:
   - `npm run install:all`
2. Backend setup:
   - copy `backend/.env.example` to `backend/.env`
   - default config uses MySQL (`DB_DIALECT=mysql`)
   - for Linux server bootstrap, run:
     - `mysql -u root -p < backend/scripts/mysql_linux_setup.sql`
3. Start both apps:
   - `npm run dev`
4. API docs:
   - `http://localhost:5000/api-docs`

## Optional Demo Seed

- `npm run seed --workspace backend`

## Demo Credentials (from seed)

- Admin: `admin@food.local` / `admin123`
- User: `user@food.local` / `user1234`
- Restaurant: `restaurant@food.local` / `rest1234`
- Rider: `rider@food.local` / `rider123`

## Key API Routes

- Auth:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/register-customer`
  - `POST /api/v1/auth/login`
- Restaurants:
  - `GET /api/v1/restaurants?q=&cuisine=&sort=&featured=&page=&limit=`
  - `GET /api/v1/restaurants/:restaurantId`
  - `GET /api/v1/restaurants/:restaurantId/menu`
- Orders:
  - `GET /api/v1/orders`
  - `POST /api/v1/orders`
  - `GET /api/v1/orders/:orderId/tracking`

## Notes

- Real-time order updates are enabled via Socket.IO rooms (`join-order-room`).
- Payments are mocked (`cod`, `stripe_mock`) for development flow.
- Phase 2 multi-restaurant checkout is planned and documented in `PHASE2_BLUEPRINT.md`.
