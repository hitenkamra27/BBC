# Kirana Corner — E-commerce Demo

A working prototype storefront + admin panel for a shop selling stationery,
toys, books, notebooks, gifts, and sports items — with retail vs wholesale
pricing.

## Setting up Supabase (shared database)

The app now syncs to a real database instead of one browser's `localStorage`, so all your devices and customers see the same live data.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor → New query**, paste the contents of `supabase-schema.sql` (included in this repo), and run it. This creates the `kv_store` table, a `banners` Storage bucket (for the homepage poster carousel), and their access policies.
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**.
4. Locally: copy `.env.example` to `.env` and fill in those two values.
5. On Render (or wherever you deploy): add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your Web Service's settings, then trigger a redeploy. (These are baked in at build time by Vite, so the site needs to rebuild after you add or change them.)

If these aren't set, the app still works using `localStorage` as a fallback — handy for quick local testing — but data won't sync across devices until Supabase is configured.

**Prefer not to touch environment variables?** Admin → Settings → Supabase connection lets you paste the same Project URL and anon key directly in the app. This is a per-browser override (saved in that browser's `localStorage`) — it doesn't change Render's actual environment variables, so it's best for local testing; for the live site, setting the env vars in step 5 is still the real fix so every visitor connects properly.

## Setting up password-reset & order emails (Resend)

Both the customer sign-in and the admin login have a "Forgot password?" link that emails a 6-digit code, and customers get emailed when their wholesale account is approved, when an order is paid or booked for pick-up, and when an order is packed.

These all go through **Resend's SMTP relay**, via a small relay that's **already built into this app** (`server.js`, at `POST /api/send-email` → sends via `smtp.resend.com` using `nodemailer`) — you don't need to deploy a separate backend or serverless function.

1. Create a [Resend](https://resend.com) account and verify a sending domain (or use Resend's shared test address for quick testing).
2. Create an API key in Resend (resend.com → API Keys).
3. In Admin → Website content → Integrations, fill in:
   - **SMTP host** — defaults to `smtp.resend.com`
   - **SMTP port** — defaults to `465`
   - **API key** — your Resend API key (used as the SMTP password)
   - **From name** / **From email address** — must be on the domain you verified with Resend

That's it — no environment variables or redeploy needed for this option.

**Prefer to keep the API key out of the app's database?** This store's data (including whatever's typed into Admin → Website content) is stored in a table set up for public read access — see `supabase-schema.sql` — so the API key above isn't fully private. Instead, leave the **API key** field blank and set `RESEND_API_KEY` (and optionally `RESEND_SMTP_HOST` / `RESEND_SMTP_PORT`) as environment variables on your host (e.g. Render → your service → Environment). Environment variables always take priority over the Admin-panel fields, so the real secret never has to touch the browser or database.

Until an API key is configured (either way), "Forgot password?" and the other emails show a clear message / are silently skipped instead of failing the action that triggered them.

## Run it locally

```bash
npm install
npm run dev
```

This starts a dev server (Vite) at **http://localhost:3000** with hot-reload — use this while making changes.

To test the actual production build (what Render runs):

```bash
npm run build
npm start
```

## What's included

- **Storefront**: category browsing, search, a full product page (photo
  gallery, reviews, "more like this"), cart, checkout (address + payment
  method), sign up / login (email or mobile number), order history, and a
  mobile-friendly bottom nav bar (Home / Categories / Cart / Account).
- **Multiple product photos**: up to 6 photos per product, with a gallery
  and thumbnail strip on the product page.
- **Reviews**: signed-in customers can rate (1–5 stars) and review any
  product; the average rating shows on the product card and product page.
- **Promotional banners**: Admin → Banners — upload poster images (offers,
  sales, etc.), recommended size 1200×400px, shown as an auto-advancing
  carousel on the homepage with an admin-configurable timing interval.
  Images upload to Supabase Storage when configured.
- **Forgot password**: both customer sign-in and the admin login have a
  "Forgot password?" link that emails a 6-digit reset code via Resend
  (uses the same email setup as order/approval notifications below).
- **Retail vs wholesale pricing**: customers choose an account type at
  signup. Wholesale pricing only applies once an admin approves the account.
- **Admin panel — hidden route, no visible button.** There is no "Admin
  login" link anywhere on the storefront. Go to `yoursite.com/admin`
  (locally: `http://localhost:3000/admin`) to open the login prompt.
  Demo password: `admin123` — **change this before going live** (see
  `ADMIN_PASSWORD` near the top of `src/App.jsx`). From the panel: dashboard
  overview, product & stock management, order & payment status management,
  category management, customer/wholesale approval, and editable website
  content (store name, banner, contact info, social links, banners).
- **Editable branding & contact info** (Admin → Website content): store
  name (shown in the header, footer and browser tab title), shop address,
  contact phone, contact email, WhatsApp number, and Instagram/Facebook
  links — all editable without touching code.
- **Floating WhatsApp button**: once a WhatsApp number is saved in Website
  content, a chat button appears in the corner of every page so customers
  can message the shop directly.
- Catalog expanded with extra products across every category (backpack,
  crayons, board games, cricket bat, yoga mat, sketchbook, and more).

### Deploying the hidden `/admin` route

Because this is a single-page app, visiting `/admin` directly (not by
clicking a link inside the app) needs the host to serve `index.html` for
that path too, otherwise you'll see a 404.

- **Vercel**: `vercel.json` (rewrites all paths to `index.html`) — already
  configured, no extra setup needed.
- **Netlify**: `public/_redirects` — already configured, no extra setup
  needed.
- **Render**: this repo is set up as a **Web Service**, not a static site.
  `npm start` runs `server.js`, a small Express server that serves the
  built app (falling back to `index.html` for any unknown path — including
  `/admin`) and also exposes `POST /api/send-email`, the built-in Resend
  relay (see the Resend section above). On Render, set: Build Command
  `npm install && npm run build`, Start Command `npm start`, and add the
  `RESEND_API_KEY` environment variable. (Vercel/Netlify don't run a Node
  server the same way, so on those platforms the built-in email relay
  won't run — you'd need a Vercel/Netlify function instead if deploying
  there.)

## Important limitations of this prototype

Data storage now syncs through Supabase (see setup above) instead of being trapped in one browser. Two things are still **not production-ready** and you'll want to address them before taking real customer payments at scale:

1. **Payments.** Checkout currently *simulates* an online payment (a fake
   "processing" spinner that always succeeds) plus a working cash-on-delivery
   option. No real money moves. To accept real online payments you need:
   - A backend server that can hold a secret API key.
   - A payment gateway integration — for India, **Razorpay** or **Cashfree**
     are common choices; **Stripe** works well if you also serve
     international customers.
   - The gateway's checkout SDK wired into `CheckoutModal` in `src/App.jsx`,
     with your backend verifying payment confirmation before marking an
     order "paid."

2. **Passwords.** Customer passwords are currently stored as plain text for
   simplicity. A real backend should hash passwords (e.g. bcrypt) and never
   store them in plain text.

## Project structure

```
shop-app/
  src/
    App.jsx            # entire storefront + admin panel UI and logic
    main.jsx           # React entry point
    supabaseClient.js  # Supabase connection (reads .env)
  supabase-schema.sql  # run once in Supabase's SQL editor
  .env.example
  index.html
  package.json
  vite.config.js
```

## Suggested next steps toward a production build

1. Add real authentication (hashed passwords, sessions — or migrate to
   Supabase Auth) instead of the current browser-checked passwords.
2. Integrate a payment gateway (Razorpay/Stripe) via a small backend/
   serverless function, same pattern as the Cashfree notes above.
3. Add real product photography instead of emoji placeholders.
4. Deploy the frontend as a static site (Vercel/Netlify/Render).
