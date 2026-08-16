# CONTESSA

Boutique de maquillage et de prêt-à-porter féminin — Next.js + Convex, livrée partout en Algérie.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, CSS custom properties |
| Animation | Framer Motion |
| Backend + DB | Convex (data, file storage, live queries) |
| Hosting | Vercel |

---

## Running it locally

Two processes, two terminals. The backend must be running or the shop has no data.

Terminal 1 — Convex:

```bash
npm run dev:backend
```

Terminal 2 — Next.js:

```bash
npm run dev
```

Then open http://localhost:3000

First time on a fresh deployment, load the settings row and the 58 wilayas:

```bash
npm run seed
```

---

## The secret door

The dashboard lives at **`/atelier-contessa`**. Nothing links to it, it carries
`noindex`, and `robots.txt` disallows it.

There is also a hidden way in from the shop itself: **tap the small diamond
ornament in the footer five times** (within three seconds) and it opens the
login. Works with a thumb, looks like decoration.

The first visit asks you to create a password — that is the only time the
password can be set without knowing the current one.

**Moving the door:** change `ADMIN_PATH` in `src/lib/admin-path.ts` *and* rename
the folder `src/app/atelier-contessa` to match.

**Forgot the password:**

```bash
npx convex run admin:forgotPassword
```

Add `--prod` to run it against the live shop. It clears the password and every
open session, so the next visit shows the first-run screen again.

---

## What you control from the dashboard

| Page | What it does |
|---|---|
| Aperçu | Orders, revenue, stock warnings |
| Commandes | Full order detail, tap-to-call the customer, status workflow |
| Produits | Prices, descriptions, sizes, colours, cover + gallery photos, stock |
| Catégories | Create, reorder, hide, delete (refuses while products still use it) |
| Livraison | Home and desk price for every wilaya, per-wilaya availability, flat-rate tool |
| Thème | Every colour in both light and dark, corner radius, which mode visitors land on |
| Réglages | Shop name, announcement bar, contact links, free-delivery threshold, password |

Theme changes are stored in the database and applied on the next render — no
redeploy, no code change. The logo follows the mode automatically: rose-gold
artwork on light, gold artwork on dark.

---

## Delivery

Algeria has **58 wilayas** (48 until 2019, when 10 more were created). All 58 are
seeded with placeholder tariffs that you should replace with your carrier's
actual prices.

The list is data-driven, not hard-coded — add, rename or remove wilayas from the
dashboard if your carrier uses a different breakdown.

Each wilaya carries a **home** price and a **desk** price, and either mode can be
switched off individually where your carrier doesn't serve it.

---

## Deploying

Vercel builds with `npx convex deploy --cmd 'npm run build'` (already set in
`vercel.json`), which pushes the Convex functions to production and injects the
production `NEXT_PUBLIC_CONVEX_URL` into the Next.js build.

That command needs one environment variable in Vercel:

- `CONVEX_DEPLOY_KEY` — generate it in the Convex dashboard under
  **Settings → Deploy keys → Production**.

After the first production deploy, seed the live database once:

```bash
npx convex run seed:init --prod
```

Then open `https://your-domain/atelier-contessa` and set your password.

---

## Security notes

Convex functions are public HTTP endpoints — a hidden URL protects nothing on
its own. So:

- Every admin function calls `requireAdmin()` **server-side** before touching data.
- Order totals are recomputed from the database. The browser sends product ids
  and quantities only; a price arriving from the client would be a price the
  customer got to choose.
- Passwords are stored as PBKDF2-SHA256 (210k iterations, per-user salt) and
  compared in length-constant time.
- Sessions expire after 12 hours; changing the password revokes all of them.

---

## Layout

```
convex/
  schema.ts        tables + indexes
  admin.ts         login, sessions, password, recovery
  products.ts      catalogue reads and writes
  categories.ts    category CRUD
  wilayas.ts       delivery grid
  orders.ts        checkout — all pricing and validation lives here
  files.ts         upload URLs for product photos
  settings.ts      site config + the theme engine
  seed.ts          npx convex run seed:init
  lib/             auth helpers, slugs, defaults, the 58 wilayas

src/
  app/(storefront)/       shop, product, cart, checkout, confirmation
  app/atelier-contessa/   the secret door and dashboard
  components/storefront/  top bar, footer, product card, logo
  components/admin/       dashboard primitives, image uploader
  lib/                    cart, admin session, theme tokens, formatting
```
