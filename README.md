# Exporium (Monorepo)

Full‑stack sneaker e‑commerce app.

## Repo structure

- `client/` — React + Vite + TypeScript + TailwindCSS (Render Static Site)
- `server/` — Node.js + Express + TypeScript + MongoDB (Render Web Service)

## Local development

### 1) Server

1. Create `server/.env` from `server/.env.example`
2. Install + run:

```bash
cd server
npm install
npm run dev
```

Server health check:

- `GET http://localhost:5000/health` → `{ ok: true }`

### 2) Client

1. Create `client/.env` from `client/.env.example`
2. Install + run:

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`.

### 3) Seed database

```bash
cd server
npm run seed
```

This creates:
- An admin user from `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`
- 8–12 sneaker products with placeholder images

## MongoDB Atlas setup

- Create a cluster and database user.
- Copy your connection string into `MONGO_URI`.
- In **Network Access**, allow `0.0.0.0/0` (required for Render).

## Stripe (test mode)

- Set `STRIPE_SECRET_KEY` from your Stripe dashboard (test key).
- Webhook:
  - Add an endpoint pointing to: `https://<your-server-url>/api/webhooks/stripe`
  - Subscribe to event: `checkout.session.completed`
  - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Cloudinary

Create a Cloudinary account and set:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Admin upload endpoint:
- `POST /api/admin/upload` with `multipart/form-data` field `images` (multiple).

## Render deployment

### Server (Render Web Service)

- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Env Vars:
  - `PORT` (Render sets this automatically; keep code using `process.env.PORT`)
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_URL` (your Render static site URL)
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `SEED_ADMIN_EMAIL`
  - `SEED_ADMIN_PASSWORD`

### Client (Render Static Site)

- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Env Vars:
  - `VITE_API_URL` (your Render server base URL)
  - `VITE_STRIPE_PUBLISHABLE_KEY` (optional for Checkout redirect flow; server creates sessions)

## Key API endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Products:
- `GET /api/products`
- `GET /api/products/:id`

Wishlist:
- `GET /api/wishlist`
- `POST /api/wishlist/:productId`
- `DELETE /api/wishlist/:productId`

Checkout + Webhook:
- `POST /api/checkout/create-session`
- `POST /api/webhooks/stripe`

Orders:
- `GET /api/orders/my`
- `GET /api/orders/:id`

Admin:
- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/orders/:id/tracking-events`
- `GET /api/admin/customers`
- `POST /api/admin/upload`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

Tracking:
- `GET /api/tracking/:trackingId`
