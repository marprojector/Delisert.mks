# Delisert MVP + Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Delisert website to the PRD's Definition of Done — six public pages rendering correct prices and SEO from the server, plus a single-user admin dashboard for product/photo management.

**Architecture:** TanStack Start SSR on Cloudflare Workers with tRPC over D1. Public pages read products through tRPC loaders so crawlers and first paint get real HTML; admin writes through authenticated tRPC mutations guarded by a signed session cookie. Product photos live in an R2 bucket bound to the same Worker. Static business facts (schedule, address, delivery, social) stay as TypeScript constants per PRD §10.7.

**Tech Stack:** TanStack Start 1.169, TanStack Router 1.170, React 19, Tailwind 4, tRPC 11, Drizzle ORM 1.0.0-rc.5, Cloudflare D1 + R2, Alchemy 2.0.0-beta.84, Bun 1.4.4, Turborepo, Varlock 1.23, Bun test runner.

**Spec:** `docs/PRD.md` (primary), `docs/PRODUCT_REQUIREMENTS.md` (FR/NFR), `docs/TECHNICAL_ARCHITECTURE.md` (data model, API), `docs/OPEN_QUESTIONS.md` (verified business data), `docs/DESIGN_AUDIT.md` §2 (authoritative price list).

## Global Constraints

- **Prices are authoritative and must never be invented.** `docs/DESIGN_AUDIT.md` §2 is the single source of truth: Dubai Chewy Cookie Rp 30.000; Mango Sticky Rice Rp 30.000; Pancake Durian Rp 35.000 (flat, no isi-4/isi-8); Mochi 1 pcs Rp 8.000 / isi 4 Rp 30.000 / isi 8 Rp 50.000; Slice Cake 1 slice Rp 16.000 (Lotus Biscoff, Red Velvet, Coklat); Mille Crepes 1 slice Rp 16.000 (same three variants).
- **`price_cents` stores rupiah × 100.** Rp 8.000 ⇒ `8000`. Formatting divides by 100. Never display `Rp 0`; a null price renders "Harga menyusul".
- **CFD hours are 06.00–10.00 WITA** (confirmed, `docs/OPEN_QUESTIONS.md` Q-09). TikTok Live is Selasa–Sabtu 10:30–14:30 WITA. Senin closed. Never show "LIVE SEKARANG".
- **Never display a permanent store opening hours** for the operational address, and never call it a "toko"/"cabang". Postal code stays hidden until 90233 vs 90234 is confirmed.
- **No unverified claims:** no "100% HALAL" certification badge, no "Pelopor 1 Mochi", no ingredient origins (durian Medan, mango matang pohon), no specific storage temperatures.
- **WhatsApp:** `https://wa.me/6285190021421?text=<encoded>`. Instagram `@delisert.mks`, TikTok `@delisert.mkss`.
- **Language:** all UI copy in Bahasa Indonesia, `<html lang="id">`. Currency format `Rp 25.000` (Indonesian grouping).
- **Accessibility floor:** WCAG 2.1 AA — 4.5:1 normal text contrast, one `<h1>` per page, no skipped heading levels, visible focus, alt text on every image, availability never conveyed by color alone, skip-to-content link.
- **SEO floor:** unique `<title>` and `<meta name="description">` per page, exactly one `<link rel="canonical">` per page built from the production origin, Open Graph tags, JSON-LD `LocalBusiness` + `Product`, `sitemap.xml` and `robots.txt` with absolute URLs.
- **No new runtime dependencies** beyond what the scaffold already installs. Admin auth uses Web Crypto (`crypto.subtle`) — not a new auth library.
- **TypeScript strict.** `bun run check-types` must pass at the end of every task.
- **Commit per task.** Conventional commit prefixes; end every commit message with `Co-Authored-By: Claude Code <noreply@anthropic.com>`.
- **Do not deploy.** Deployment is prepared and documented, never executed by an executor.

## Review Focus

Failure modes no task's happy-path test exercises, most likely to bite first:

1. **A product with a null price** (Mille Crepes was one until 2026-10-31) — must render "Harga menyusul", never `Rp 0`, never a crash in `ProductPrice`, and must omit `offers` from Product JSON-LD.
2. **A product whose variants all share one price** — `ProductPrice` must collapse to a single `Rp 16.000`, not `Rp 16.000 – Rp 16.000`.
3. **Direct SSR request for an unknown slug** (`/menu/tidak-ada`) — must return a real 404 page with HTTP 404, not a 500 and not a blank shell.
4. **Admin session tampering** — a cookie whose signature is valid for a different payload, an expired cookie, or an unsigned cookie must all be rejected with 401, never grant access.
5. **Image upload abuse** — a non-image MIME type, a file over 5 MB, or a filename containing `../` must be rejected before any R2 write.

Each is pinned by a test in the task that owns the code; see Tasks 1, 6, 7, 12, 14.

---

## File Structure

**Created — `packages/api/src/`**
- `lib/price.ts` — `formatRupiah`, `ProductPrice` data shape helpers (pure, unit-testable)
- `lib/admin-session.ts` — HMAC-signed session token: `signSession`, `verifySession` (pure Web Crypto)
- `lib/image.ts` — upload validation: `validateImageUpload` (pure)
- `lib/whatsapp.ts` — `waLink`, `productOrderMessage` (pure)
- `routers/admin-product.ts` — admin CRUD procedures
- `routers/admin-auth.ts` — login/logout/session procedures

**Created — `packages/db/src/`**
- `schema/admin.ts` — no new tables; admin auth is stateless (see Task 12). This file is **not** created.

**Created — `apps/web/src/`**
- `server/session.ts` — server-only cookie read/write helpers
- `routes/admin.tsx` — admin layout route (pathless guard)
- `routes/admin.index.tsx` — dashboard
- `routes/admin.produk.tsx` — product list
- `routes/admin.produk.$id.tsx` — product editor
- `routes/admin.login.tsx` — login form
- `routes/sitemap[.]xml.ts` — dynamic sitemap server route
- `components/skip-link.tsx` — skip-to-content
- `utils/seo.ts` — rewritten origin resolution

**Modified — `apps/web/src/`**
- `router.tsx` — per-request tRPC client with absolute SSR origin
- `routes/index.tsx` — loader for featured products + categories
- `routes/menu.tsx` — loader + `h1`
- `routes/menu/$slug.tsx` — 404 handling, price formatting, variant selection
- `routes/tentang.tsx`, `routes/jadwal.tsx`, `routes/kontak.tsx` — `h1` via `SectionHeading as="h1"`
- `routes/__root.tsx` — skip link, footer, single canonical
- `components/header.tsx` — `nativeButton={false}` on link-rendering buttons

**Modified — `packages/ui/src/`**
- `components/product-card.tsx` — price formatting via shared helper
- `components/whatsapp-button.tsx` — `nativeButton={false}`
- `components/section-heading.tsx` — unchanged signature, used with `as="h1"`
- `styles/globals.css` — brand primary to rosewood

**Modified — `packages/db/src/`**
- `seed.ts` — null-safe re-seed (update existing rows, not skip)
- `migrations/` — new migration only if schema changes (none expected)

**Modified — `packages/infra/`**
- `alchemy.run.ts` — R2 bucket + binding, admin secrets

---

### Task 1: Price formatting is correct and centralised

**Files:**
- Create: `packages/api/src/lib/price.ts`
- Create: `packages/api/src/lib/price.test.ts`
- Modify: `packages/ui/src/components/product-card.tsx`
- Modify: `apps/web/src/routes/menu/$slug.tsx`
- Modify: `apps/web/src/utils/seo.ts`

**Interfaces:**
- Produces: `formatRupiah(cents: number): string` — `8000 → "Rp 8.000"`. `priceToNumber(cents: number): number` — `8000 → 8000` (for JSON-LD). `summariseVariantPrice(prices: Array<number | null>): { kind: "none" } | { kind: "single"; cents: number } | { kind: "range"; min: number; max: number }`.
- Consumes: nothing.

- [ ] **Step 1: Write the failing test**

```ts
// packages/api/src/lib/price.test.ts
import { describe, expect, test } from "bun:test";
import { formatRupiah, priceToNumber, summariseVariantPrice } from "./price";

describe("formatRupiah", () => {
  test("formats cents as Indonesian rupiah", () => {
    expect(formatRupiah(8000)).toBe("Rp 8.000");
    expect(formatRupiah(30000)).toBe("Rp 30.000");
    expect(formatRupiah(16000)).toBe("Rp 16.000");
    expect(formatRupiah(50000)).toBe("Rp 50.000");
  });

  test("formats seven-digit amounts", () => {
    expect(formatRupiah(1250000)).toBe("Rp 1.250.000");
  });
});

describe("priceToNumber", () => {
  test("returns the rupiah amount for JSON-LD", () => {
    expect(priceToNumber(35000)).toBe(35000);
  });
});

describe("summariseVariantPrice", () => {
  test("returns none when every price is null", () => {
    expect(summariseVariantPrice([null, null])).toEqual({ kind: "none" });
  });

  test("returns none for an empty list", () => {
    expect(summariseVariantPrice([])).toEqual({ kind: "none" });
  });

  test("collapses equal prices to a single value", () => {
    expect(summariseVariantPrice([16000, 16000, 16000])).toEqual({
      kind: "single",
      cents: 16000,
    });
  });

  test("returns a range when prices differ", () => {
    expect(summariseVariantPrice([8000, 30000, 50000])).toEqual({
      kind: "range",
      min: 8000,
      max: 50000,
    });
  });

  test("ignores nulls when other prices exist", () => {
    expect(summariseVariantPrice([null, 16000])).toEqual({ kind: "single", cents: 16000 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api && bun test src/lib/price.test.ts`
Expected: FAIL — `Cannot find module './price'`.

- [ ] **Step 3: Implement `packages/api/src/lib/price.ts`**

```ts
export function formatRupiah(cents: number): string {
  return `Rp ${cents.toLocaleString("id-ID")}`;
}

export function priceToNumber(cents: number): number {
  return cents;
}

export type VariantPriceSummary =
  | { kind: "none" }
  | { kind: "single"; cents: number }
  | { kind: "range"; min: number; max: number };

export function summariseVariantPrice(prices: Array<number | null>): VariantPriceSummary {
  const defined = prices.filter((price): price is number => price !== null);
  if (defined.length === 0) return { kind: "none" };
  const min = Math.min(...defined);
  const max = Math.max(...defined);
  return min === max ? { kind: "single", cents: min } : { kind: "range", min, max };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/api && bun test src/lib/price.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Repoint every consumer at the shared helper**

`packages/ui/src/components/product-card.tsx`: delete the local `formatRupiah` and re-export the shared one so existing imports keep working.

```ts
export { formatRupiah } from "@delisert.mks-1/api/lib/price";
```

Replace the body of `ProductPrice` with a call to `summariseVariantPrice`:

```tsx
import { formatRupiah, summariseVariantPrice } from "@delisert.mks-1/api/lib/price";

export function ProductPrice({ priceCents, variants, className }: {
  priceCents: number | null;
  variants?: Array<{ name: string; priceCents: number | null }>;
  className?: string;
}) {
  const summary =
    variants && variants.length > 0
      ? summariseVariantPrice(variants.map((variant) => variant.priceCents))
      : priceCents === null
        ? ({ kind: "none" } as const)
        : ({ kind: "single", cents: priceCents } as const);

  if (summary.kind === "none") {
    return <span className={cn("text-muted-foreground", className)}>Harga menyusul</span>;
  }
  if (summary.kind === "single") {
    return <span className={className}>{formatRupiah(summary.cents)}</span>;
  }
  return (
    <span className={className}>
      {formatRupiah(summary.min)} – {formatRupiah(summary.max)}
    </span>
  );
}
```

`apps/web/src/utils/seo.ts`: in `productJsonLd`, replace `product.priceCents / 1000` with `priceToNumber(product.priceCents)` and import it from `@delisert.mks-1/api/lib/price`.

`apps/web/src/routes/menu/$slug.tsx`: import `formatRupiah` from `@delisert.mks-1/api/lib/price` instead of from the UI package.

- [ ] **Step 6: Verify the rendered price on the dev server**

Run: `cd packages/infra && node node_modules/alchemy/bin/cli.js dev` in one shell, then:

```bash
curl -s http://localhost:3001/api/trpc/product.list | head -c 300
```

Expected: `"priceCents":8000` for Mochi (unchanged), and the homepage HTML shows `Rp 8.000`, not `Rp 80.000`.

- [ ] **Step 7: Run the full type check**

Run: `bun run check-types`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/api/src/lib/price.ts packages/api/src/lib/price.test.ts \
  packages/ui/src/components/product-card.tsx apps/web/src/utils/seo.ts \
  apps/web/src/routes/menu/\$slug.tsx
git commit -m "fix: format product prices in rupiah, not cents

price_cents stores rupiah x100, but formatRupiah printed the raw integer,
so every price rendered 10x too high (Rp 80.000 for a Rp 8.000 mochi).
Centralise the helper in packages/api and collapse equal variant prices
to a single value.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2: Seed data is correct, idempotent, and re-runnable

**Files:**
- Modify: `packages/db/src/seed.ts`
- Create: `packages/db/src/seed.test.ts`
- Modify: `packages/db/package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `seed(db: SeedDb): Promise<{ categories: number; products: number; variants: number }>` — now updates existing rows instead of skipping them, and returns counts.

- [ ] **Step 1: Write the failing test**

```ts
// packages/db/src/seed.test.ts
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { relations } from "./relations";
import { seed } from "./seed";

const MIGRATION = join(import.meta.dir, "migrations/20261031071817_overjoyed_slipstream/migration.sql");

function makeDb() {
  const client = new Database(":memory:");
  for (const statement of readFileSync(MIGRATION, "utf8").split("--> statement-breakpoint")) {
    if (statement.trim()) client.exec(statement);
  }
  return { client, db: drizzle({ client, relations }) };
}

describe("seed", () => {
  test("inserts the authoritative price list", async () => {
    const { client, db } = makeDb();
    await seed(db);

    const mochi = client
      .query("select price_cents from products where slug = ?")
      .get("artisanal-mochi-daifuku") as { price_cents: number };
    expect(mochi.price_cents).toBe(8000);

    const crepes = client
      .query("select price_cents from products where slug = ?")
      .get("mille-crepes") as { price_cents: number };
    expect(crepes.price_cents).toBe(16000);

    const pancake = client
      .query("select price_cents from products where slug = ?")
      .get("pancake-durian-premium") as { price_cents: number };
    expect(pancake.price_cents).toBe(35000);
  });

  test("is idempotent — running twice does not duplicate", async () => {
    const { client, db } = makeDb();
    await seed(db);
    await seed(db);
    const count = client.query("select count(*) as n from products").get() as { n: number };
    expect(count.n).toBe(6);
  });

  test("re-running repairs a drifted price", async () => {
    const { client, db } = makeDb();
    await seed(db);
    client.exec("update products set price_cents = 80000 where slug = 'artisanal-mochi-daifuku'");
    await seed(db);
    const mochi = client
      .query("select price_cents from products where slug = ?")
      .get("artisanal-mochi-daifuku") as { price_cents: number };
    expect(mochi.price_cents).toBe(8000);
  });

  test("seeds exactly three mochi size variants", async () => {
    const { client, db } = makeDb();
    await seed(db);
    const rows = client
      .query(
        `select v.name, v.price_cents from product_variants v
         join products p on p.id = v.product_id
         where p.slug = 'artisanal-mochi-daifuku' order by v.display_order`,
      )
      .all() as Array<{ name: string; price_cents: number }>;
    expect(rows.map((row) => [row.name, row.price_cents])).toEqual([
      ["1 Pcs", 8000],
      ["Isi 4 pcs", 30000],
      ["Isi 8 pcs", 50000],
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/db && bun test src/seed.test.ts`
Expected: FAIL on the first assertion — seeded `price_cents` is `80000`.

- [ ] **Step 3: Correct the seed values and make it update in place**

In `packages/db/src/seed.ts` change every price to rupiah ×100 (Rp 8.000 ⇒ `8000`):

| Product | `priceCents` |
|---|---|
| `artisanal-mochi-daifuku` | `8000` |
| `authentic-mango-sticky-rice` | `30000` |
| `pancake-durian-premium` | `35000` |
| `dubai-chewy-cookie` | `30000` |
| `slice-cake` | `16000` |
| `mille-crepes` | `16000` |

Variant prices: Mochi `1 Pcs 8000`, `Isi 4 pcs 30000`, `Isi 8 pcs 50000`; Slice Cake and Mille Crepes three variants each at `16000`.

Replace the skip-on-exists branch in the product loop so it reconciles:

```ts
for (const item of items) {
  const existing = await db.select().from(products).where(eq(products.slug, item.slug)).get();

  const values = {
    categoryId,
    slug: item.slug,
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    isFeatured: item.isFeatured,
    displayOrder: item.displayOrder,
  };

  let productId: number;
  if (existing) {
    await db.update(products).set(values).where(eq(products.id, existing.id));
    productId = existing.id;
  } else {
    productId = (await db.insert(products).values(values).returning().get()).id;
  }

  if (item.variants) {
    await db.delete(productVariants).where(eq(productVariants.productId, productId));
    await db.insert(productVariants).values(
      item.variants.map((variant) => ({
        productId,
        name: variant.name,
        priceCents: variant.priceCents,
        displayOrder: variant.displayOrder,
      })),
    );
  }
}
```

Change the return type to counts, and have `seed.local.ts` print them.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/db && bun test src/seed.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Re-seed the local D1 database and confirm the API output**

Run: `cd packages/db && bun run db:seed:local`
Expected: `Seed selesai — 6 kategori, 6 produk, 9 varian.`

Then `curl -s http://localhost:3001/api/trpc/product.list | head -c 200` and confirm `"priceCents":8000`.

- [ ] **Step 6: Commit**

```bash
git add packages/db/src/seed.ts packages/db/src/seed.test.ts packages/db/src/seed.local.ts packages/db/package.json
git commit -m "fix(seed): store prices as rupiah x100 and reconcile on re-run

The seed stored Rp 8.000 as 80000, and skipped existing rows, so a
drifted price could never be repaired. Values now match DESIGN_AUDIT
section 2, and seeding updates rows in place.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 3: Product detail pages render on the server instead of crashing

**Files:**
- Modify: `apps/web/src/router.tsx`
- Modify: `apps/web/src/routes/menu/$slug.tsx`
- Create: `apps/web/src/routes/menu/__tests__/detail-ssr.test.ts` (integration, run against a live server)

**Interfaces:**
- Consumes: `getRequestUrl({ xForwardedHost: true })` from `@tanstack/react-start/server`, `createIsomorphicFn` from `@tanstack/react-start`.
- Produces: `getRouter()` now builds its tRPC client per call, so SSR resolves `/api/trpc` against the request origin.

**Background (verified 2026-11-01):** `httpBatchLink({ url: "/api/trpc" })` throws `Error("Invalid URL: /api/trpc/product.bySlug...")` during SSR because Node's `fetch` needs an absolute URL. The route then 500s. The spike that produced HTTP 200 used exactly the code below.

- [ ] **Step 1: Write the failing integration test**

```ts
// apps/web/src/routes/menu/__tests__/detail-ssr.test.ts
import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("product detail SSR", () => {
  test("returns 200 with the product title in the HTML", async () => {
    const response = await fetch(`${BASE}/menu/artisanal-mochi-daifuku`);
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Artisanal Mochi Daifuku");
    expect(html).toContain("Rp 8.000");
  });

  test("returns 404 for an unknown slug", async () => {
    const response = await fetch(`${BASE}/menu/produk-tidak-ada`);
    expect(response.status).toBe(404);
    const html = await response.text();
    expect(html).toContain("tidak ditemukan");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Start the dev server (`cd packages/infra && node node_modules/alchemy/bin/cli.js dev`), then run:
`cd apps/web && bun test src/routes/menu/__tests__/detail-ssr.test.ts`
Expected: FAIL — first test gets status 500.

- [ ] **Step 3: Give SSR an absolute tRPC origin**

In `apps/web/src/router.tsx`, replace the module-level client with a per-call one:

```ts
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

const getTrpcUrl = createIsomorphicFn()
  .server(() => {
    const url = getRequestUrl({ xForwardedHost: true });
    return `${url.origin}/api/trpc`;
  })
  .client(() => "/api/trpc");
```

and inside `getRouter()`:

```ts
export const getRouter = () => {
  // Dibuat per pemanggilan getRouter (per request di server) supaya
  // getRequestUrl() di dalam getTrpcUrl() punya konteks request.
  const trpcClient = createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: getTrpcUrl() })],
  });
  const queryClient = createQueryClient();
  // ...unchanged
```

- [ ] **Step 4: Make the unknown-slug path a real 404**

In `apps/web/src/routes/menu/$slug.tsx`, keep `if (!product) throw notFound()` in the loader. In the component, replace the `throw notFound()` after the loading guard with an explicit fallback so a client-side miss renders the 404 component rather than a blank screen:

```tsx
if (!product) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="cn-eyebrow text-primary">404</p>
      <h1 className="text-3xl leading-tight text-balance sm:text-4xl">Produk tidak ditemukan.</h1>
      <p className="text-sm/relaxed text-muted-foreground">
        Produk yang Anda cari tidak tersedia atau sudah diganti. Jelajahi katalog menu Delisert
        untuk melihat produk lain.
      </p>
      <Link to="/menu" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Lihat semua menu →
      </Link>
    </div>
  );
}
```

Also add `notFoundComponent` to the route so the loader's `notFound()` maps to HTTP 404 with that same markup.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/web && bun test src/routes/menu/__tests__/detail-ssr.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/router.tsx apps/web/src/routes/menu/\$slug.tsx apps/web/src/routes/menu/__tests__
git commit -m "fix(ssr): resolve tRPC against the request origin

httpBatchLink with a relative URL throws Invalid URL during SSR, so every
product detail page returned 500. The client is now built per request
with an absolute origin, and unknown slugs return a real 404 page.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 4: Catalogue, homepage, and categories render on the server

**Files:**
- Modify: `apps/web/src/routes/menu.tsx`
- Modify: `apps/web/src/routes/index.tsx`
- Modify: `apps/web/src/routes/menu/__tests__/detail-ssr.test.ts` (extend)

**Interfaces:**
- Consumes: `context.queryClient.fetchQuery(context.trpc.*.queryOptions())` in loaders; `Route.useLoaderData()`.
- Produces: `/menu` and `/` contain product markup in the initial HTML.

**Background (verified 2026-11-01):** both pages currently render `Memuat katalog…` / `Memuat produk…` in SSR HTML, so crawlers see an empty catalogue. The spike that fixed it used `fetchQuery` in the loader and `products.data ?? initial.products` in the component.

- [ ] **Step 1: Extend the integration test**

```ts
test("catalogue renders products in the initial HTML", async () => {
  const response = await fetch(`${BASE}/menu`);
  expect(response.status).toBe(200);
  const html = await response.text();
  expect(html).not.toContain("Memuat katalog");
  expect(html).toContain("Artisanal Mochi Daifuku");
  expect(html).toContain("Rp 8.000");
  expect(html).toContain("Rp 16.000");
});

test("homepage renders featured products in the initial HTML", async () => {
  const response = await fetch(`${BASE}/`);
  const html = await response.text();
  expect(html).not.toContain("Memuat produk");
  expect(html).toContain("Menu Andalan");
  expect(html).toContain("Rp 35.000");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/routes/menu/__tests__/detail-ssr.test.ts`
Expected: FAIL — `Memuat katalog` present.

- [ ] **Step 3: Add loaders**

`apps/web/src/routes/menu.tsx`:

```ts
loader: async ({ context }) => {
  const [products, categories] = await Promise.all([
    context.queryClient.fetchQuery(context.trpc.product.list.queryOptions()),
    context.queryClient.fetchQuery(context.trpc.product.categories.queryOptions()),
  ]);
  return { products, categories };
},
```

In `MenuComponent`, fall back to loader data:

```ts
const initial = Route.useLoaderData();
const allProducts = products.data ?? initial.products;
const allCategories = categories.data ?? initial.categories;
```

`apps/web/src/routes/index.tsx`:

```ts
loader: async ({ context }) => {
  const [featured, categories] = await Promise.all([
    context.queryClient.fetchQuery(
      context.trpc.product.list.queryOptions({ featuredOnly: true }),
    ),
    context.queryClient.fetchQuery(context.trpc.product.categories.queryOptions()),
  ]);
  return { featured, categories };
},
```

and in `HomeComponent`:

```ts
const initial = Route.useLoaderData();
const featuredProducts = (featured.data ?? initial.featured).slice(0, 4);
const categoryList = categories.data ?? initial.categories;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test src/routes/menu/__tests__/detail-ssr.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/menu.tsx apps/web/src/routes/index.tsx apps/web/src/routes/menu/__tests__
git commit -m "fix(ssr): load catalogue data before render

Homepage and menu rendered only loading text in server HTML, so search
crawlers saw an empty catalogue. Both routes now fetch in a loader and
fall back to that data during hydration.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 5: SEO metadata uses the real origin and appears exactly once

**Files:**
- Modify: `apps/web/src/utils/seo.ts`
- Modify: `apps/web/src/routes/__root.tsx`
- Create: `apps/web/src/utils/seo.test.ts`
- Modify: `apps/web/src/routes/menu/__tests__/detail-ssr.test.ts` (extend)

**Interfaces:**
- Consumes: `getRequestUrl` from `@tanstack/react-start/server` via `createIsomorphicFn`.
- Produces: `siteUrl(): string` returns the request origin on the server and `window.location.origin` on the client. `canonical(path: string): string` joins them. Root route no longer sets `og:url`/`canonical`; each page sets its own.

**Background (verified):** `siteUrl()` reads `import.meta.env.VITE_SITE_URL`, which is never defined — it always returns `http://localhost:3001`. Every page therefore emits a localhost canonical. Non-home pages also emit two canonicals because `__root.tsx` adds one.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/utils/seo.test.ts
import { describe, expect, test } from "bun:test";
import { canonical, joinOrigin } from "./seo";

describe("joinOrigin", () => {
  test("joins an origin and a path", () => {
    expect(joinOrigin("https://delisert.id", "/menu")).toBe("https://delisert.id/menu");
  });

  test("does not double the slash", () => {
    expect(joinOrigin("https://delisert.id/", "/menu")).toBe("https://delisert.id/menu");
  });

  test("adds a leading slash to a bare path", () => {
    expect(joinOrigin("https://delisert.id", "menu")).toBe("https://delisert.id/menu");
  });
});

describe("canonical", () => {
  test("uses the configured origin", () => {
    expect(canonical("/jadwal", "https://delisert.id")).toBe("https://delisert.id/jadwal");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/utils/seo.test.ts`
Expected: FAIL — `joinOrigin` is not exported.

- [ ] **Step 3: Rewrite origin resolution**

```ts
// apps/web/src/utils/seo.ts
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

export function joinOrigin(origin: string, path: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const siteUrl = createIsomorphicFn()
  .server(() => getRequestUrl({ xForwardedHost: true }).origin)
  .client(() => window.location.origin);

export function canonical(path: string, origin?: string): string {
  return joinOrigin(origin ?? siteUrl(), path);
}
```

`localBusinessJsonLd()` and `productJsonLd()` keep their current shape but take the resolved origin as a parameter so the emitted URLs are absolute:

```ts
export function productJsonLd(product: {...}, origin: string): JsonLd
```

Inside `offers`, add `url: canonical(`/menu/${product.slug}`, origin)` and `price: priceToNumber(product.priceCents)`.

- [ ] **Step 4: Emit one canonical, from the page that owns it**

In `apps/web/src/routes/__root.tsx` remove `{ property: "og:url", content: siteUrl() }` and the `{ rel: "canonical", href: canonical("/") }` link entry. Keep `og:site_name`, `og:locale`, `twitter:card`.

Each page route keeps its own `links: [{ rel: "canonical", href: canonical("/<path>") }]` and adds `{ property: "og:url", content: canonical("/<path>") }`.

- [ ] **Step 5: Extend the integration test**

```ts
test("each page emits exactly one canonical and no localhost URL", async () => {
  for (const path of ["/", "/tentang", "/menu", "/jadwal", "/kontak"]) {
    const html = await (await fetch(`${BASE}${path}`)).text();
    const canonicals = html.match(/rel="canonical"/g) ?? [];
    expect(canonicals.length).toBe(1);
    expect(html).not.toContain('content="http://localhost:3001"');
  }
});
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd apps/web && bun test src/utils/seo.test.ts src/routes/menu/__tests__/detail-ssr.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/utils/seo.ts apps/web/src/utils/seo.test.ts apps/web/src/routes/__root.tsx apps/web/src/routes
git commit -m "fix(seo): emit one canonical from the real request origin

siteUrl() read an undefined VITE_SITE_URL and always fell back to
localhost, and the root route added a second canonical to every page.
Origin now comes from the request on the server and window.location on
the client; each page owns its canonical and og:url.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 6: Sitemap and robots.txt are absolute and dynamic

**Files:**
- Create: `apps/web/src/routes/sitemap[.]xml.ts`
- Modify: `apps/web/public/robots.txt`
- Delete: `apps/web/public/sitemap.xml`
- Create: `apps/web/src/routes/__tests__/sitemap.test.ts`

**Interfaces:**
- Consumes: `appRouter` + `createContext` (server route), `siteUrl()`.
- Produces: `GET /sitemap.xml` listing `/`, `/tentang`, `/menu`, `/jadwal`, `/kontak`, and one `/menu/<slug>` per product.

**Background:** the current `public/sitemap.xml` uses relative `<loc>` values (`/menu`), which the sitemap protocol forbids, and it is static so a new product never appears. FR-014 requires the sitemap to update automatically.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/routes/__tests__/sitemap.test.ts
import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("sitemap.xml", () => {
  test("serves absolute URLs for every public page", async () => {
    const response = await fetch(`${BASE}/sitemap.xml`);
    expect(response.status).toBe(200);
    const xml = await response.text();
    for (const path of ["/", "/tentang", "/menu", "/jadwal", "/kontak"]) {
      expect(xml).toContain(`<loc>${BASE}${path}</loc>`);
    }
    expect(xml).not.toContain("<loc>/menu</loc>");
  });

  test("includes one entry per product", async () => {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
    expect(xml).toContain("/menu/artisanal-mochi-daifuku");
    expect(xml).toContain("/menu/mille-crepes");
  });
});

describe("robots.txt", () => {
  test("points at an absolute sitemap URL and hides admin", async () => {
    const text = await (await fetch(`${BASE}/robots.txt`)).text();
    expect(text).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    expect(text).toContain("Disallow: /admin");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/routes/__tests__/sitemap.test.ts`
Expected: FAIL — relative `<loc>` values and relative `Sitemap:`.

- [ ] **Step 3: Add the sitemap server route**

```ts
// apps/web/src/routes/sitemap[.]xml.ts
import { appRouter } from "@delisert.mks-1/api/routers/index";
import { createFileRoute } from "@tanstack/react-router";

import { createContext } from "../context";
import { siteUrl } from "../utils/seo";

const STATIC_PATHS = ["/", "/tentang", "/menu", "/jadwal", "/kontak"] as const;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const caller = appRouter.createCaller(await createContext({ req: request }));
        const products = await caller.product.list();
        const origin = siteUrl().replace(/\/$/, "");
        const paths = [...STATIC_PATHS, ...products.map((product) => `/menu/${product.slug}`)];
        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
          "</urlset>",
        ].join("\n");
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
```

- [ ] **Step 4: Rewrite robots.txt and remove the static sitemap**

`apps/web/public/robots.txt` — the `Sitemap:` line must be absolute, but the origin is only known at runtime. Serve `robots.txt` from a server route too, at `apps/web/src/routes/robots[.]txt.ts`, returning:

```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: <origin>/sitemap.xml
```

Delete `apps/web/public/sitemap.xml` and `apps/web/public/robots.txt`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/web && bun test src/routes/__tests__/sitemap.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/sitemap\[.\]xml.ts apps/web/src/routes/robots\[.\]txt.ts apps/web/src/routes/__tests__
git rm apps/web/public/sitemap.xml apps/web/public/robots.txt
git commit -m "feat(seo): serve dynamic absolute sitemap and robots

The static sitemap used relative loc values and never picked up new
products. Both files are now server routes built from the request
origin, and admin is disallowed from crawling.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 7: Every page has exactly one h1 and a skip link

**Files:**
- Modify: `apps/web/src/routes/tentang.tsx`, `jadwal.tsx`, `kontak.tsx`
- Create: `apps/web/src/components/skip-link.tsx`
- Modify: `apps/web/src/routes/__root.tsx`
- Create: `apps/web/src/routes/__tests__/a11y.test.ts`

**Interfaces:**
- Consumes: `SectionHeading` already accepts `as?: "h1" | "h2" | "h3"`.
- Produces: `<SkipLink />` rendering an anchor to `#main-content`; `<main id="main-content" tabIndex={-1}>`.

**Background (verified):** `/menu`, `/tentang`, `/jadwal`, `/kontak` each render zero `<h1>`. No page has a skip link.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/routes/__tests__/a11y.test.ts
import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";
const PAGES = ["/", "/tentang", "/menu", "/jadwal", "/kontak"];

describe("accessibility structure", () => {
  test("every page has exactly one h1", async () => {
    for (const path of PAGES) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      const count = (html.match(/<h1[\s>]/g) ?? []).length;
      expect({ path, count }).toEqual({ path, count: 1 });
    }
  });

  test("every page has a skip link targeting main-content", async () => {
    for (const path of PAGES) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect(html).toContain('href="#main-content"');
      expect(html).toContain('id="main-content"');
    }
  });

  test("html declares Indonesian", async () => {
    const html = await (await fetch(`${BASE}/`)).text();
    expect(html).toContain('<html lang="id"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/routes/__tests__/a11y.test.ts`
Expected: FAIL — count 0 on four pages.

- [ ] **Step 3: Promote the page title to h1**

In `tentang.tsx`, `jadwal.tsx`, `kontak.tsx` pass `as="h1"` to the top `SectionHeading`. In `menu.tsx` add `as="h1"`. `index.tsx` already has an `<h1>` in the hero — leave it and make sure no second one is added.

- [ ] **Step 4: Add the skip link**

```tsx
// apps/web/src/components/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-primary focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
    >
      Lompat ke konten utama
    </a>
  );
}
```

In `__root.tsx`, render `<SkipLink />` as the first child of `<body>` and give the main element `id="main-content"` and `tabIndex={-1}`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/web && bun test src/routes/__tests__/a11y.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes apps/web/src/components/skip-link.tsx
git commit -m "fix(a11y): give every page one h1 and add a skip link

Four of five pages had no h1, and no page offered a way past the
navigation. Page titles are now h1 and a skip link targets main.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 8: Product detail lets the customer pick a variant

**Files:**
- Modify: `apps/web/src/routes/menu/$slug.tsx`
- Create: `packages/api/src/lib/whatsapp.ts`
- Create: `packages/api/src/lib/whatsapp.test.ts`
- Modify: `packages/api/src/data/business.ts`
- Modify: `apps/web/src/routes/menu/__tests__/detail-ssr.test.ts` (extend)

**Interfaces:**
- Consumes: `waLink` (moves to `lib/whatsapp.ts`, re-exported from `data/business.ts` so existing imports keep working).
- Produces: `productOrderMessage(input: { productName: string; variantName?: string }): string`.

**Background:** FR-004 requires the WhatsApp message to include the *selected* variant. Today the message lists all variants and the customer cannot choose, so a Mochi order cannot say "Isi 4 pcs".

- [ ] **Step 1: Write the failing test**

```ts
// packages/api/src/lib/whatsapp.test.ts
import { describe, expect, test } from "bun:test";
import { productOrderMessage, waLink } from "./whatsapp";

describe("productOrderMessage", () => {
  test("names the product and asks about availability", () => {
    expect(productOrderMessage({ productName: "Mille Crepes" })).toBe(
      "Halo Delisert, saya ingin memesan Mille Crepes. Apakah masih tersedia?",
    );
  });

  test("includes the chosen variant", () => {
    expect(productOrderMessage({ productName: "Artisanal Mochi Daifuku", variantName: "Isi 4 pcs" })).toBe(
      "Halo Delisert, saya ingin memesan Artisanal Mochi Daifuku (Isi 4 pcs). Apakah masih tersedia?",
    );
  });
});

describe("waLink", () => {
  test("targets the business number and encodes the message", () => {
    const link = waLink("Halo Delisert, saya ingin memesan.");
    expect(link.startsWith("https://wa.me/6285190021421?text=")).toBe(true);
    expect(link).not.toContain(" ");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api && bun test src/lib/whatsapp.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the helpers**

Move `waLink` into `packages/api/src/lib/whatsapp.ts` with `WHATSAPP_NUMBER` imported from `../data/business`, add `productOrderMessage`, and re-export both from `data/business.ts` so no other import changes.

```ts
export function productOrderMessage(input: { productName: string; variantName?: string }): string {
  const variant = input.variantName ? ` (${input.variantName})` : "";
  return `Halo Delisert, saya ingin memesan ${input.productName}${variant}. Apakah masih tersedia?`;
}
```

- [ ] **Step 4: Add variant selection to the detail page**

In `$slug.tsx` hold the choice in state:

```tsx
const [selectedVariant, setSelectedVariant] = useState<string | null>(
  product?.variants[0]?.name ?? null,
);
```

Render each variant as a real radio input inside a `fieldset` with a `legend` of "Pilih varian". Unavailable variants are `disabled` with the text "(habis)" so availability is not colour-only. The CTA becomes:

```tsx
<WhatsAppButton
  size="lg"
  href={waLink(
    productOrderMessage({
      productName: product.name,
      variantName: selectedVariant ?? undefined,
    }),
  )}
  fullWidth
>
  Pesan via WhatsApp
</WhatsAppButton>
```

When a product has no variants, `selectedVariant` stays `null` and the message omits the parentheses.

- [ ] **Step 5: Extend the integration test**

```ts
test("product with variants renders a radio group", async () => {
  const html = await (await fetch(`${BASE}/menu/artisanal-mochi-daifuku`)).text();
  expect(html).toContain('type="radio"');
  expect(html).toContain("Isi 4 pcs");
  expect(html).toContain("Pilih varian");
});
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd packages/api && bun test src/lib/whatsapp.test.ts` then `cd apps/web && bun test src/routes/menu/__tests__/detail-ssr.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/api/src/lib/whatsapp.ts packages/api/src/lib/whatsapp.test.ts \
  packages/api/src/data/business.ts apps/web/src/routes/menu/\$slug.tsx \
  apps/web/src/routes/menu/__tests__
git commit -m "feat(product): let customers choose a variant before ordering

The WhatsApp message listed every variant, so the shop could not tell
what was ordered. The detail page now has a radio group and the message
carries the chosen variant.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 9: Brand colour is rosewood and contrast passes AA

**Files:**
- Modify: `packages/ui/src/styles/globals.css`
- Modify: `apps/web/src/routes/__root.tsx` (theme-color)
- Create: `packages/ui/src/styles/contrast.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `--primary` = `oklch(0.44 0.110 15.7)` (≈ `#84343e`, 7.80:1 on the cream background). Dark-mode primary stays lighter for contrast on a dark canvas.

**Background (verified):** `--primary: oklch(0.33 0.131 104)` computes to `#423500` — olive-brown, not the rosewood `#8c3b44` the file's own comment claims. Every CTA and link currently renders olive.

- [ ] **Step 1: Write the failing test**

```ts
// packages/ui/src/styles/contrast.test.ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(import.meta.dir, "globals.css"), "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`${name}:\\s*oklch\\(([^)]+)\\)`));
  if (!match) throw new Error(`token ${name} not found`);
  return match[1]!;
}

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function toHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    "#" +
    rgb
      .map((v) => {
        const clamped = Math.max(0, Math.min(1, v));
        const srgb = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
        return Math.round(255 * srgb).toString(16).padStart(2, "0");
      })
      .join("")
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const parse = (raw: string) => raw.trim().split(/\s+/).map(Number) as [number, number, number];

describe("brand palette", () => {
  test("primary is rosewood, not olive", () => {
    const [L, C, H] = parse(token("--primary"));
    expect(H).toBeLessThan(40); // rosewood sits near 16deg; olive was 104deg
    expect(C).toBeGreaterThan(0.08);
    expect(L).toBeGreaterThan(0.35);
  });

  test("primary text on background passes AA", () => {
    const [L1, C1, H1] = parse(token("--primary"));
    const [L2, C2, H2] = parse(token("--background"));
    expect(contrast(toHex(L1, C1, H1), toHex(L2, C2, H2))).toBeGreaterThanOrEqual(4.5);
  });

  test("body text on background passes AAA", () => {
    const [L1, C1, H1] = parse(token("--foreground"));
    const [L2, C2, H2] = parse(token("--background"));
    expect(contrast(toHex(L1, C1, H1), toHex(L2, C2, H2))).toBeGreaterThanOrEqual(7);
  });

  test("muted text on background passes AA", () => {
    const [L1, C1, H1] = parse(token("--muted-foreground"));
    const [L2, C2, H2] = parse(token("--background"));
    expect(contrast(toHex(L1, C1, H1), toHex(L2, C2, H2))).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui && bun test src/styles/contrast.test.ts`
Expected: FAIL — hue is 104, not below 40.

- [ ] **Step 3: Set the rosewood token**

In `packages/ui/src/styles/globals.css` change `--primary` (light) to `oklch(0.44 0.110 15.7)` and `--ring` to match. In `.dark`, set `--primary` to `oklch(0.72 0.105 15.7)` so it reads on a dark canvas, and `--primary-foreground` to `oklch(0.16 0.02 15.7)`.

Update the comment to state the real derivation, and set `theme-color` in `__root.tsx` to `#84343e`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui && bun test src/styles/contrast.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Confirm visually**

Restart the dev server, screenshot the homepage at 1440×2600, and confirm the header button and eyebrow text are rose, not olive.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/styles/globals.css packages/ui/src/styles/contrast.test.ts apps/web/src/routes/__root.tsx
git commit -m "fix(design): correct the brand primary to rosewood

--primary was oklch(0.33 0.131 104), which renders olive (#423500),
while the token's own comment claimed the rosewood #8c3b44. The new value
matches the documented brand colour and passes AA on the cream canvas.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 10: Remaining PRD copy corrections and image metadata

**Files:**
- Modify: `apps/web/src/routes/tentang.tsx`
- Modify: `apps/web/src/routes/index.tsx`
- Modify: `packages/ui/src/components/product-gallery.tsx`
- Create: `apps/web/src/routes/__tests__/content.test.ts`

**Interfaces:**
- Consumes: `TIKTOK_LIVE`, `CFD` constants.
- Produces: no new exports.

**Background:** the homepage CFD section and `/jadwal` disagree on whether CFD hours are published — `CFD.hours` exists and `/jadwal` shows it, but the homepage never mentions 06.00–10.00, and `CFD.scheduleNote` still says hours are announced via social media. Q-09 is answered, so both should state the confirmed hours and keep only the "both locations not guaranteed every Sunday" caveat.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/routes/__tests__/content.test.ts
import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("published claims", () => {
  test("no unverified certification or origin claims appear", async () => {
    for (const path of ["/", "/tentang", "/menu", "/jadwal", "/kontak"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect(html).not.toContain("100% HALAL");
      expect(html).not.toContain("Pelopor");
      expect(html).not.toContain("durian Medan");
      expect(html).not.toContain("matang pohon");
      expect(html).not.toContain("LIVE SEKARANG");
    }
  });

  test("CFD hours are stated consistently", async () => {
    for (const path of ["/", "/jadwal"]) {
      const html = await (await fetch(`${BASE}${path}`)).text();
      expect(html).toContain("06.00 – 10.00 WITA");
    }
  });

  test("the operational address is never called a store", async () => {
    const html = await (await fetch(`${BASE}/jadwal`)).text();
    expect(html).toContain("Bukan toko ritel publik");
    expect(html).not.toMatch(/Alamat Toko/i);
  });

  test("every product image carries an alt attribute", async () => {
    const html = await (await fetch(`${BASE}/menu`)).text();
    for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
      expect(tag).toContain("alt=");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/routes/__tests__/content.test.ts`
Expected: FAIL — homepage lacks the CFD hours.

- [ ] **Step 3: State the confirmed CFD hours on the homepage**

In `index.tsx` `CfdSection`, add the hours next to the heading:

```tsx
<p className="cn-eyebrow text-muted-foreground">Minggu · {CFD.hours}</p>
```

In `packages/api/src/data/business.ts`, change `CFD.scheduleNote` so it no longer claims hours are unannounced:

```ts
scheduleNote:
  "Kedua titik bersifat sementara dan bukan cabang tetap. Tidak ada jaminan kedua lokasi aktif setiap Minggu — lokasi terkini diumumkan melalui media sosial Delisert.",
```

- [ ] **Step 4: Give the hero and gallery images explicit dimensions**

`ProductGallery` already sets `width`/`height`. Add `sizes="(min-width: 1024px) 50vw, 100vw"` to the main image so a future `srcset` slots in without layout change, and confirm the hero placeholder in `index.tsx` keeps its `aspect-4/5` box (it does).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/web && bun test src/routes/__tests__/content.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes packages/api/src/data/business.ts packages/ui/src/components/product-gallery.tsx
git commit -m "fix(content): publish confirmed CFD hours and keep claims honest

Q-09 confirmed CFD runs 06.00-10.00 WITA, but the homepage omitted it and
the schedule note still said hours were unannounced. Both pages now agree,
and the unverified-claims guard test locks the PRD rules in.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 11: Fix the dev server and the Base UI button warnings

**Files:**
- Modify: `package.json` (root)
- Modify: `apps/web/src/components/header.tsx`
- Modify: `packages/ui/src/components/whatsapp-button.tsx`
- Modify: `packages/ui/src/components/button.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `bun run dev` starts the stack on Node; no `Base UI: ... expected a native <button>` console errors.

**Background (verified):** `bun run dev` fails with `ERR_MODULE_NOT_FOUND ... alchemy/bin/register-dev-mode.js`. Alchemy's `nodeLoaderArgs` picks `register-dev-mode.js` when the entry is `.ts` — which it is for the published package — but only `register-oxc.js` ships. Running `node node_modules/alchemy/bin/cli.js dev` works, because Node takes the `default` (`lib/`) condition. Separately, `<Button render={<a …/>}>` logs a Base UI error on every page because `nativeButton` defaults to `true`.

- [ ] **Step 1: Write the failing check**

There is no unit test for a shell behaviour; the check is the command itself.

Run: `cd packages/infra && bun run dev`
Expected: FAIL — `ERR_MODULE_NOT_FOUND ... register-dev-mode.js`.

- [ ] **Step 2: Make the dev script use Node**

Root `package.json`:

```json
"dev": "turbo run dev",
"dev:infra": "cd packages/infra && node node_modules/alchemy/bin/cli.js dev",
```

`packages/infra/package.json`:

```json
"dev": "node node_modules/alchemy/bin/cli.js dev"
```

Record why in a comment in `packages/infra/alchemy.run.ts` above the stack definition:

```ts
// Alchemy 2.0.0-beta.84 resolves `bin/register-dev-mode.js` for .ts entries but
// only ships `register-oxc.js`, so `bun run dev` (Bun runtime) dies with
// ERR_MODULE_NOT_FOUND. Running the CLI under Node takes the `lib/` build and
// works; see docs/DESIGN_AUDIT.md and this plan's Task 11.
```

- [ ] **Step 3: Verify the dev server starts**

Run: `cd packages/infra && bun run dev`
Expected: `Done: 1 succeeded`, then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/` prints `200`.

- [ ] **Step 4: Write the failing test for button semantics**

```ts
// packages/ui/src/components/button-semantics.test.ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (path: string) => readFileSync(join(import.meta.dir, path), "utf8");

describe("link-rendering buttons", () => {
  test("WhatsAppButton opts out of native button semantics", () => {
    expect(read("whatsapp-button.tsx")).toContain("nativeButton={false}");
  });

  test("header WhatsApp links opt out of native button semantics", () => {
    const header = readFileSync(
      join(import.meta.dir, "../../../apps/web/src/components/header.tsx"),
      "utf8",
    );
    const anchorsInsideButton = header.match(/render=\{\s*<a/g) ?? [];
    const optOuts = header.match(/nativeButton=\{false\}/g) ?? [];
    expect(anchorsInsideButton.length).toBeGreaterThan(0);
    expect(optOuts.length).toBe(anchorsInsideButton.length);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `cd packages/ui && bun test src/components/button-semantics.test.ts`
Expected: FAIL — no `nativeButton` prop.

- [ ] **Step 6: Pass `nativeButton={false}` wherever `render` is an anchor**

In `whatsapp-button.tsx` add `nativeButton={false}` to `<Button>`. In `header.tsx`, add it to both the desktop and mobile WhatsApp buttons. Leave real `<button>` usages (the mobile menu toggle) untouched.

- [ ] **Step 7: Run test to verify it passes**

Run: `cd packages/ui && bun test src/components/button-semantics.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 8: Confirm the console is quiet**

Reload `/` and check `packages/infra/.alchemy/log/dev_ammar/web/*.log` for `Base UI:` — expected: no new entries.

- [ ] **Step 9: Commit**

```bash
git add package.json packages/infra/package.json packages/infra/alchemy.run.ts \
  packages/ui/src/components/whatsapp-button.tsx packages/ui/src/components/button-semantics.test.ts \
  apps/web/src/components/header.tsx
git commit -m "fix(dev): run the dev server under Node, quiet Base UI warnings

bun run dev died with ERR_MODULE_NOT_FOUND because Alchemy picks
register-dev-mode.js for .ts entries and does not ship it. The CLI now
runs under Node, which resolves the lib build. Link-rendering buttons
declare nativeButton={false} so Base UI stops warning on every page.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 12: Admin session tokens are signed and verified

**Files:**
- Create: `packages/api/src/lib/admin-session.ts`
- Create: `packages/api/src/lib/admin-session.test.ts`

**Interfaces:**
- Consumes: Web Crypto `crypto.subtle` (available in Workers and Bun).
- Produces:
  - `createSessionToken(secret: string, issuedAtMs: number, ttlMs: number): Promise<string>` — returns `base64url(payload).base64url(hmac)` where payload is `{ "iat": number, "exp": number }`.
  - `verifySessionToken(secret: string, token: string, nowMs: number): Promise<boolean>` — constant-time compare, expiry checked.
  - `SESSION_TTL_MS = 12 * 60 * 60 * 1000`.

**Background:** FR-101 needs single-user auth. A stateless HMAC token avoids a new table, a new dependency, and a session store on D1. No password is stored in the token — the password is compared once at login, then only a signed expiry is carried.

- [ ] **Step 1: Write the failing test**

```ts
// packages/api/src/lib/admin-session.test.ts
import { describe, expect, test } from "bun:test";
import { createSessionToken, SESSION_TTL_MS, verifySessionToken } from "./admin-session";

const SECRET = "test-secret-value";
const NOW = 1_800_000_000_000;

describe("admin session", () => {
  test("accepts a token it just issued", async () => {
    const token = await createSessionToken(SECRET, NOW, SESSION_TTL_MS);
    expect(await verifySessionToken(SECRET, token, NOW + 1000)).toBe(true);
  });

  test("rejects an expired token", async () => {
    const token = await createSessionToken(SECRET, NOW, 1000);
    expect(await verifySessionToken(SECRET, token, NOW + 2000)).toBe(false);
  });

  test("rejects a token signed with another secret", async () => {
    const token = await createSessionToken("other-secret", NOW, SESSION_TTL_MS);
    expect(await verifySessionToken(SECRET, token, NOW)).toBe(false);
  });

  test("rejects a tampered expiry", async () => {
    const token = await createSessionToken(SECRET, NOW, 1000);
    const [payload, signature] = token.split(".");
    const decoded = JSON.parse(atob(payload!.replace(/-/g, "+").replace(/_/g, "/")));
    decoded.exp = NOW + SESSION_TTL_MS;
    const forged = `${btoa(JSON.stringify(decoded)).replace(/=+$/, "")}.${signature}`;
    expect(await verifySessionToken(SECRET, forged, NOW)).toBe(false);
  });

  test("rejects malformed input without throwing", async () => {
    expect(await verifySessionToken(SECRET, "", NOW)).toBe(false);
    expect(await verifySessionToken(SECRET, "not-a-token", NOW)).toBe(false);
    expect(await verifySessionToken(SECRET, "a.b.c", NOW)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api && bun test src/lib/admin-session.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the token helpers**

```ts
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  );
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(
  secret: string,
  issuedAtMs: number,
  ttlMs: number,
): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ iat: issuedAtMs, exp: issuedAtMs + ttlMs })),
  );
  return `${payload}.${await sign(secret, payload)}`;
}

export async function verifySessionToken(
  secret: string,
  token: string,
  nowMs: number,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts as [string, string];
  try {
    const expected = await sign(secret, payload);
    if (expected.length !== signature.length) return false;
    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1) {
      mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
    }
    if (mismatch !== 0) return false;
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      exp?: unknown;
    };
    return typeof decoded.exp === "number" && decoded.exp > nowMs;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/api && bun test src/lib/admin-session.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/lib/admin-session.ts packages/api/src/lib/admin-session.test.ts
git commit -m "feat(admin): sign and verify session tokens with HMAC-SHA256

Single-user admin auth without a session table or a new dependency.
Tokens carry only an issued-at and expiry, are compared in constant
time, and malformed input is rejected rather than thrown.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 13: Admin login and logout procedures

**Files:**
- Create: `packages/api/src/routers/admin-auth.ts`
- Create: `packages/api/src/routers/admin-auth.test.ts`
- Modify: `packages/api/src/index.ts`
- Modify: `packages/api/src/routers/index.ts`
- Modify: `packages/api/src/context.ts`

**Interfaces:**
- Consumes: `createSessionToken`, `verifySessionToken`, `SESSION_TTL_MS`.
- Produces:
  - `Context` gains `adminSecret: string`, `adminPassword: string`.
  - `adminProcedure` — a tRPC procedure that rejects with `UNAUTHORIZED` when the request carries no valid session. Reads the token from the `Authorization: Bearer <token>` header.
  - `adminAuthRouter.login({ password }): { token: string }`, `.logout()`, `.session(): { authenticated: boolean }`.

**Background:** the tRPC context is created per request from the Worker `env`, so secrets never reach the client bundle. Reading the token from a header (not a cookie) keeps CSRF out of scope: a cross-site form cannot set `Authorization`, and the token lives in `sessionStorage` only on the admin routes.

- [ ] **Step 1: Write the failing test**

```ts
// packages/api/src/routers/admin-auth.test.ts
import { describe, expect, test } from "bun:test";
import { appRouter } from "./index";

const SECRET = "test-secret";
const PASSWORD = "correct-horse";

const ctx = (authorization?: string) => ({
  db: null as never,
  adminSecret: SECRET,
  adminPassword: PASSWORD,
  authorization,
});

describe("admin auth", () => {
  test("rejects a wrong password", async () => {
    const caller = appRouter.createCaller(ctx());
    await expect(caller.adminAuth.login({ password: "wrong" })).rejects.toThrow();
  });

  test("issues a token for the right password", async () => {
    const caller = appRouter.createCaller(ctx());
    const result = await caller.adminAuth.login({ password: PASSWORD });
    expect(typeof result.token).toBe("string");
    expect(result.token).toContain(".");
  });

  test("session is false without a token", async () => {
    const caller = appRouter.createCaller(ctx());
    expect(await caller.adminAuth.session()).toEqual({ authenticated: false });
  });

  test("session is true with a token from login", async () => {
    const anon = appRouter.createCaller(ctx());
    const { token } = await anon.adminAuth.login({ password: PASSWORD });
    const authed = appRouter.createCaller(ctx(`Bearer ${token}`));
    expect(await authed.adminAuth.session()).toEqual({ authenticated: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api && bun test src/routers/admin-auth.test.ts`
Expected: FAIL — `adminAuth` and `adminProduct` are not on the router.

- [ ] **Step 3: Extend the context and add the guarded procedure**

```ts
// packages/api/src/context.ts
import type { Database } from "@delisert.mks-1/db";

export type Context = {
  db: Database;
  adminSecret: string;
  adminPassword: string;
  authorization?: string;
};
```

```ts
// packages/api/src/index.ts
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { verifySessionToken } from "./lib/admin-session";

export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  const token = ctx.authorization?.replace(/^Bearer\s+/i, "");
  if (!token || !(await verifySessionToken(ctx.adminSecret, token, Date.now()))) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Silakan login sebagai admin." });
  }
  return next({ ctx });
});
```

- [ ] **Step 4: Implement the auth router**

```ts
// packages/api/src/routers/admin-auth.ts
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../index";
import { createSessionToken, SESSION_TTL_MS, verifySessionToken } from "../lib/admin-session";

export const adminAuthRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (input.password !== ctx.adminPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Kata sandi salah." });
      }
      return { token: await createSessionToken(ctx.adminSecret, Date.now(), SESSION_TTL_MS) };
    }),

  logout: publicProcedure.mutation(() => ({ ok: true as const })),

  session: publicProcedure.query(async ({ ctx }) => {
    const token = ctx.authorization?.replace(/^Bearer\s+/i, "");
    const authenticated = Boolean(
      token && (await verifySessionToken(ctx.adminSecret, token, Date.now())),
    );
    return { authenticated };
  }),
});
```

Register both routers in `routers/index.ts`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/api && bun test src/routers/admin-auth.test.ts`
Expected: PASS, 4 tests. (The "admin procedures reject an anonymous caller" case lives in Task 14, which owns `adminProduct`.)

- [ ] **Step 6: Commit**

```bash
git add packages/api/src/context.ts packages/api/src/index.ts \
  packages/api/src/routers/admin-auth.ts packages/api/src/routers/admin-auth.test.ts \
  packages/api/src/routers/index.ts
git commit -m "feat(admin): add login, logout, and a guarded admin procedure

Secrets come from the Worker env through the tRPC context, so they never
reach the client bundle. The session token travels in an Authorization
header, which keeps CSRF out of scope.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 14: Admin product CRUD procedures

**Files:**
- Create: `packages/api/src/routers/admin-product.ts`
- Create: `packages/api/src/routers/admin-product.test.ts`
- Modify: `packages/api/src/routers/index.ts`

**Interfaces:**
- Consumes: `adminProcedure`, `products`, `productVariants`, `productCategories`.
- Produces: `adminProduct.list()`, `.byId({ id })`, `.create(input)`, `.update(input)`, `.remove({ id })`, `.setAvailability({ id, availability })`, `.addVariant(input)`, `.updateVariant(input)`, `.removeVariant({ id })`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/api/src/routers/admin-product.test.ts
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { relations } from "@delisert.mks-1/db/relations";
import { seed } from "@delisert.mks-1/db/seed";
import { appRouter } from "./index";

const MIGRATION = join(
  import.meta.dir,
  "../../../db/src/migrations/20261031071817_overjoyed_slipstream/migration.sql",
);

async function setup() {
  const client = new Database(":memory:");
  for (const statement of readFileSync(MIGRATION, "utf8").split("--> statement-breakpoint")) {
    if (statement.trim()) client.exec(statement);
  }
  const db = drizzle({ client, relations });
  await seed(db);
  return { client, db };
}

const ctx = (db: never) => ({
  db,
  adminSecret: "s",
  adminPassword: "p",
  authorization: undefined,
});

describe("admin product", () => {
  test("rejects an unauthenticated caller", async () => {
    const { db } = await setup();
    const caller = appRouter.createCaller(ctx(db as never));
    await expect(caller.adminProduct.list()).rejects.toThrow();
  });

  test("creates, updates, and deletes a product", async () => {
    const { db, client } = await setup();
    const anon = appRouter.createCaller(ctx(db as never));
    const { token } = await anon.adminAuth.login({ password: "p" });
    const caller = appRouter.createCaller({ ...ctx(db as never), authorization: `Bearer ${token}` });

    const categories = await caller.adminProduct.categories();
    const mochiCategory = categories.find((category) => category.slug === "mochi")!;

    const created = await caller.adminProduct.create({
      categoryId: mochiCategory.id,
      slug: "mochi-strawberry",
      name: "Mochi Stroberi",
      description: "Mochi isi krim stroberi.",
      priceCents: 8000,
      isFeatured: false,
      availability: "available",
    });
    expect(created.slug).toBe("mochi-strawberry");

    const updated = await caller.adminProduct.update({
      id: created.id,
      priceCents: 9000,
      availability: "preorder",
    });
    expect(updated.priceCents).toBe(9000);
    expect(updated.availability).toBe("preorder");

    await caller.adminProduct.remove({ id: created.id });
    const row = client
      .query("select id from products where slug = 'mochi-strawberry'")
      .get() as { id: number } | null;
    expect(row).toBeNull();
  });

  test("rejects a duplicate slug", async () => {
    const { db } = await setup();
    const anon = appRouter.createCaller(ctx(db as never));
    const { token } = await anon.adminAuth.login({ password: "p" });
    const caller = appRouter.createCaller({ ...ctx(db as never), authorization: `Bearer ${token}` });
    const categories = await caller.adminProduct.categories();
    await expect(
      caller.adminProduct.create({
        categoryId: categories[0]!.id,
        slug: "mille-crepes",
        name: "Duplikat",
        priceCents: 1000,
        isFeatured: false,
        availability: "available",
      }),
    ).rejects.toThrow();
  });

  test("rejects a negative price", async () => {
    const { db } = await setup();
    const anon = appRouter.createCaller(ctx(db as never));
    const { token } = await anon.adminAuth.login({ password: "p" });
    const caller = appRouter.createCaller({ ...ctx(db as never), authorization: `Bearer ${token}` });
    const categories = await caller.adminProduct.categories();
    await expect(
      caller.adminProduct.create({
        categoryId: categories[0]!.id,
        slug: "negatif",
        name: "Negatif",
        priceCents: -1,
        isFeatured: false,
        availability: "available",
      }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api && bun test src/routers/admin-product.test.ts`
Expected: FAIL — `adminProduct` is not on the router.

- [ ] **Step 3: Implement the router**

Validation is the contract, so pin it explicitly: `slug` matches `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, `priceCents` is a non-negative integer or null, `availability` is the existing enum. `update` takes `id` plus a partial of the create shape and applies only supplied fields. `remove` deletes variants first (foreign key cascade is declared, but deleting explicitly keeps the intent visible).

```ts
const productInput = z.object({
  categoryId: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0).nullable(),
  imageUrl: z.string().url().nullable().optional(),
  imageAlt: z.string().max(200).nullable().optional(),
  isFeatured: z.boolean().default(false),
  availability: z.enum(["available", "preorder", "soldout"]).default("available"),
  displayOrder: z.number().int().min(0).default(0),
});
```

`create` catches the SQLite unique-constraint error on `slug` and rethrows `CONFLICT`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/api && bun test src/routers/admin-product.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/api/src/routers/admin-product.ts packages/api/src/routers/admin-product.test.ts \
  packages/api/src/routers/index.ts
git commit -m "feat(admin): add product CRUD procedures

Every mutation is behind adminProcedure, slug and price are validated at
the boundary, and a duplicate slug surfaces as CONFLICT rather than a 500.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 15: Image upload validation and R2 storage

**Files:**
- Create: `packages/api/src/lib/image.ts`
- Create: `packages/api/src/lib/image.test.ts`
- Modify: `packages/infra/alchemy.run.ts`
- Create: `apps/web/src/routes/api/upload.ts`
- Create: `apps/web/src/routes/__tests__/upload.test.ts`

**Interfaces:**
- Consumes: `adminProcedure` semantics (verify the bearer token in the route), `env.PHOTOS: R2Bucket`.
- Produces:
  - `validateImageUpload(input: { filename: string; contentType: string; size: number }): { ok: true; key: string } | { ok: false; reason: string }`
  - `POST /api/upload` returning `{ url: string }`.

**Background:** Workers cannot write to disk, so photos need R2. `validateImageUpload` is pure and testable; the route is a thin wrapper. The key is derived from a generated UUID, never from the user's filename, which removes path traversal by construction — the filename is only used to pick an extension.

- [ ] **Step 1: Write the failing test**

```ts
// packages/api/src/lib/image.test.ts
import { describe, expect, test } from "bun:test";
import { MAX_IMAGE_BYTES, validateImageUpload } from "./image";

const base = { filename: "mochi.jpg", contentType: "image/jpeg", size: 1024 };

describe("validateImageUpload", () => {
  test("accepts a normal jpeg", () => {
    const result = validateImageUpload(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.key).toMatch(/^products\/[0-9a-f-]{36}\.jpg$/);
  });

  test("accepts png and webp", () => {
    expect(validateImageUpload({ ...base, contentType: "image/png" }).ok).toBe(true);
    expect(validateImageUpload({ ...base, contentType: "image/webp" }).ok).toBe(true);
  });

  test("rejects a non-image type", () => {
    const result = validateImageUpload({ ...base, contentType: "application/pdf" });
    expect(result.ok).toBe(false);
  });

  test("rejects an svg, which can carry script", () => {
    expect(validateImageUpload({ ...base, contentType: "image/svg+xml" }).ok).toBe(false);
  });

  test("rejects a file over the size limit", () => {
    expect(validateImageUpload({ ...base, size: MAX_IMAGE_BYTES + 1 }).ok).toBe(false);
  });

  test("never puts the user filename in the key", () => {
    const result = validateImageUpload({
      filename: "../../etc/passwd.jpg",
      contentType: "image/jpeg",
      size: 1024,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.key).not.toContain("..");
      expect(result.key).not.toContain("passwd");
    }
  });

  test("rejects an empty file", () => {
    expect(validateImageUpload({ ...base, size: 0 }).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/api && bun test src/lib/image.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the validator**

```ts
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ImageUploadInput = { filename: string; contentType: string; size: number };
export type ImageUploadResult =
  | { ok: true; key: string; extension: string }
  | { ok: false; reason: string };

export function validateImageUpload(input: ImageUploadInput): ImageUploadResult {
  const extension = EXTENSION_BY_TYPE[input.contentType];
  if (!extension) {
    return { ok: false, reason: "Format foto harus JPG, PNG, atau WebP." };
  }
  if (input.size <= 0) {
    return { ok: false, reason: "File kosong." };
  }
  if (input.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "Ukuran foto maksimal 5 MB." };
  }
  return { ok: true, key: `products/${crypto.randomUUID()}.${extension}`, extension };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/api && bun test src/lib/image.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Provision the bucket and bind it**

```ts
// packages/infra/alchemy.run.ts
export const photos = Cloudflare.R2.Bucket("photos", {
  cors: [{ allowed: { origins: ["*"], methods: ["GET"] } }],
});

export const web = Cloudflare.Website.Vite("web", {
  rootDir: "../../apps/web",
  compatibility: { flags: ["nodejs_compat", "global_fetch_strictly_public"] },
  env: {
    DB: db,
    PHOTOS: photos,
    ADMIN_PASSWORD: Redacted.make(process.env.ADMIN_PASSWORD ?? ""),
    ADMIN_SESSION_SECRET: Redacted.make(process.env.ADMIN_SESSION_SECRET ?? ""),
  },
  dev: { port: 3001 },
});
```

Add to `packages/infra/.env.schema`:

```
# @required
ADMIN_PASSWORD=
# @required
ADMIN_SESSION_SECRET=
```

and add both to `.env` locally (never committed). Run `bun run env:generate` after editing `apps/web/.env.schema` to expose the binding names.

- [ ] **Step 6: Add the upload route**

```ts
// apps/web/src/routes/api/upload.ts
import { validateImageUpload } from "@delisert.mks-1/api/lib/image";
import { verifySessionToken } from "@delisert.mks-1/api/lib/admin-session";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token || !(await verifySessionToken(env.ADMIN_SESSION_SECRET, token, Date.now()))) {
          return new Response("Unauthorized", { status: 401 });
        }
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "File tidak ditemukan." }, { status: 400 });
        }
        const check = validateImageUpload({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });
        if (!check.ok) {
          return Response.json({ error: check.reason }, { status: 400 });
        }
        await env.PHOTOS.put(check.key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
        });
        return Response.json({ url: `/api/photos/${check.key}` });
      },
    },
  },
});
```

Add a companion `apps/web/src/routes/api/photos/$.ts` that streams the object back with its content type and a long cache header.

- [ ] **Step 7: Write the route test**

```ts
// apps/web/src/routes/__tests__/upload.test.ts
import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("upload endpoint", () => {
  test("rejects an anonymous request", async () => {
    const response = await fetch(`${BASE}/api/upload`, { method: "POST" });
    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `cd apps/web && bun test src/routes/__tests__/upload.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 9: Commit**

```bash
git add packages/api/src/lib/image.ts packages/api/src/lib/image.test.ts \
  packages/infra/alchemy.run.ts packages/infra/.env.schema \
  apps/web/src/routes/api/upload.ts apps/web/src/routes/api/photos \
  apps/web/src/routes/__tests__/upload.test.ts
git commit -m "feat(admin): store product photos in R2 behind an auth check

Workers have no writable disk, so photos go to R2. Keys are generated
UUIDs, so a hostile filename cannot escape the products/ prefix, and
SVG is rejected because it can carry script.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 16: Admin dashboard, product list, and editor screens

**Files:**
- Create: `apps/web/src/routes/admin.tsx`
- Create: `apps/web/src/routes/admin.login.tsx`
- Create: `apps/web/src/routes/admin.index.tsx`
- Create: `apps/web/src/routes/admin.produk.tsx`
- Create: `apps/web/src/routes/admin.produk.$id.tsx`
- Create: `apps/web/src/utils/admin-client.ts`
- Create: `apps/web/src/routes/__tests__/admin-guard.test.ts`

**Interfaces:**
- Consumes: `adminAuth.*`, `adminProduct.*`, `POST /api/upload`.
- Produces: token in `sessionStorage` under `delisert.admin.token`; `useAdminToken()` and `adminHeaders(token)`.

**Background:** the guard is client-side (redirect to `/admin/login` when `session()` is false) *and* server-side (every mutation is behind `adminProcedure`). The client redirect is UX; the procedure is the security boundary. Stitch screen `945071e4cdd44e4da8613da5b7f2ead6` is the dashboard reference, `54d11d173dc74270bf0cae1fe23dabab` the catalogue reference — but per `docs/DESIGN_AUDIT.md` §4 the example prices on those screens are placeholders and must not be copied.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/routes/__tests__/admin-guard.test.ts
import { describe, expect, test } from "bun:test";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

describe("admin routes", () => {
  test("the login page is reachable without a session", async () => {
    const response = await fetch(`${BASE}/admin/login`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Masuk");
  });

  test("admin pages are not indexed", async () => {
    const response = await fetch(`${BASE}/admin`, { redirect: "manual" });
    // TanStack Router's beforeLoad redirects an unauthenticated visitor, so
    // either a redirect or a noindex document is acceptable; what must never
    // happen is an indexable admin page.
    if (response.status >= 300 && response.status < 400) {
      expect(response.headers.get("location")).toContain("/admin/login");
      return;
    }
    const html = await response.text();
    expect(html).toContain('name="robots"');
    expect(html).toContain("noindex");
  });

  test("admin mutations reject a forged token", async () => {
    const response = await fetch(`${BASE}/api/trpc/adminProduct.list?batch=1&input=%7B%7D`, {
      headers: { authorization: "Bearer forged.signature" },
    });
    expect(response.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/routes/__tests__/admin-guard.test.ts`
Expected: FAIL — `/admin/login` returns 404.

- [ ] **Step 3: Add the admin client helpers**

```ts
// apps/web/src/utils/admin-client.ts
const TOKEN_KEY = "delisert.admin.token";

export function readAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAdminToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode: the session simply will not persist */
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function adminHeaders(token: string | null): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}
```

- [ ] **Step 4: Build the five routes**

`admin.tsx` is a layout route that renders `<Outlet />`, sets `meta: [{ name: "robots", content: "noindex, nofollow" }]`, and redirects to `/admin/login` when there is no token. `admin.login.tsx` posts the password to `adminAuth.login`, stores the token, and navigates to `/admin`. `admin.index.tsx` shows counts (products, featured, out-of-stock) and the five most recently updated products. `admin.produk.tsx` lists products with a category filter, availability badge, price, and edit/delete actions. `admin.produk.$id.tsx` is the editor: name, slug, category, description, price in rupiah (converted to cents on submit), availability, featured toggle, variant rows, and a photo field that uploads through `/api/upload` and writes the returned URL into `imageUrl`.

Every form control has a `<label>`, every error is announced with `role="alert"`, and the delete action asks for confirmation with the product name in the prompt.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd apps/web && bun test src/routes/__tests__/admin-guard.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Verify the flow by hand**

Start the dev server, open `/admin`, get redirected to `/admin/login`, sign in with the password from `.env`, create a product with a photo, confirm it appears on `/menu`, then delete it and confirm it disappears.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/routes/admin.tsx apps/web/src/routes/admin.login.tsx \
  apps/web/src/routes/admin.index.tsx apps/web/src/routes/admin.produk.tsx \
  apps/web/src/routes/admin.produk.\$id.tsx apps/web/src/utils/admin-client.ts \
  apps/web/src/routes/__tests__/admin-guard.test.ts
git commit -m "feat(admin): add dashboard, product list, and editor

The owner can now add, edit, and remove products and photos without
touching code, which is the maintainability gap NFR-016 names. Admin
pages are noindex and every write still passes the server guard.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 17: Wire admin secrets through the request context

**Files:**
- Modify: `apps/web/src/context.ts`
- Modify: `apps/web/src/env.server.ts` (reference only)
- Modify: `apps/web/src/services.ts`
- Modify: `apps/web/.env.schema`
- Create: `apps/web/src/context.test.ts`

**Interfaces:**
- Consumes: `env.ADMIN_PASSWORD`, `env.ADMIN_SESSION_SECRET` from `cloudflare:workers`.
- Produces: `createContext({ req })` returns `{ db, adminSecret, adminPassword, authorization }`.

**Background:** Task 13 added the fields to the API `Context`; this task fills them from the Worker binding and reads the `Authorization` header off the incoming request. Without it, login compares against `undefined` and every admin call fails.

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/src/context.test.ts
import { describe, expect, test } from "bun:test";

describe("context shape", () => {
  test("createContext exposes the admin secret and password fields", async () => {
    const source = await Bun.file(new URL("./context.ts", import.meta.url)).text();
    expect(source).toContain("adminSecret");
    expect(source).toContain("adminPassword");
    expect(source).toContain("authorization");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bun test src/context.test.ts`
Expected: FAIL — the fields are absent.

- [ ] **Step 3: Populate the context**

```ts
// apps/web/src/context.ts
import type { Context as ApiContext } from "@delisert.mks-1/api/context";
import { env } from "cloudflare:workers";
import { getDb } from "./services";

export async function createContext({ req }: { req: Request }): Promise<ApiContext> {
  return {
    db: getDb(),
    adminSecret: env.ADMIN_SESSION_SECRET,
    adminPassword: env.ADMIN_PASSWORD,
    authorization: req.headers.get("authorization") ?? undefined,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

Add the two bindings to `apps/web/.env.schema` as `@sensitive @type=string`, then run `bun run env:generate`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd apps/web && bun test src/context.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 5: Verify end to end**

Sign in through `/admin/login` against the dev server and confirm `adminProduct.list` returns rows rather than 401.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/context.ts apps/web/src/services.ts apps/web/.env.schema apps/web/src/env.ts apps/web/src/context.test.ts
git commit -m "feat(admin): supply secrets and the auth header to tRPC

createContext now reads ADMIN_PASSWORD and ADMIN_SESSION_SECRET from the
Worker binding and forwards the Authorization header, so adminProcedure
can verify a real session.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 18: Documentation, full verification, and a deploy-ready build

**Files:**
- Modify: `README.md`
- Modify: `docs/PRD.md` (status + DoD checklist)
- Modify: `docs/TECHNICAL_ARCHITECTURE.md` (admin section, R2)
- Create: `docs/ADMIN_GUIDE.md`

**Interfaces:**
- Consumes: everything above.
- Produces: no code.

- [ ] **Step 1: Run the whole test suite and record the result**

Run: `bun test` from the repo root (workspaces resolve).
Expected: all suites pass. Capture the count; this number goes in the final report.

- [ ] **Step 2: Run the type check and the production build**

Run: `bun run check-types && bun run build`
Expected: both exit 0. If the build emits the >500 kB chunk warning, note it — do not silence it.

- [ ] **Step 3: Write the owner's admin guide**

`docs/ADMIN_GUIDE.md` covers: how to sign in, how to add a product (including the rupiah field — type `8000` for Rp 8.000), how to upload a photo, how to mark a product out of stock, how to remove a product, and what to do when the session expires. Written for a non-technical reader, in Bahasa Indonesia, per assumption A1.

- [ ] **Step 4: Update the PRD status**

Change the metadata row to `Status — Selesai untuk MVP + Admin (menunggu review pemilik)` and tick the §16.2 boxes that are now true. Leave `Deploy produksi` unticked — it has not run.

- [ ] **Step 5: Document the deploy procedure without running it**

In `README.md` add a "Deploy" section stating the two required secrets, the command `cd packages/infra && bunx alchemy deploy --stage production`, and the reminder that production deploy needs owner approval.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/ADMIN_GUIDE.md docs/PRD.md docs/TECHNICAL_ARCHITECTURE.md
git commit -m "docs: add admin guide and record MVP completion status

Documents the owner-facing workflow, the deploy steps, and which
Definition of Done items are met. Production deploy is documented but
not executed.

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage.** FR-001 → Tasks 4, 7, 10. FR-002 → Tasks 7, 10. FR-003 → Tasks 2, 4. FR-004 → Tasks 1, 3, 8. FR-005 → Task 8. FR-006 → existing constants, covered by Task 10's claim guard. FR-007/008/009/010/011 → Task 10. FR-012 → Task 11 (button semantics) and existing header. FR-013 → Task 5. FR-014 → Task 6. FR-015/016 → Tasks 7, 10. FR-101/102 → Tasks 12–17. NFR-001/002 → Task 18 build check. NFR-003 → Task 10 image metadata. NFR-004 → Tasks 5, 6. NFR-005 → Tasks 7, 9. NFR-008 → Tasks 12–17. NFR-009 → Global Constraints. NFR-010 → Task 18. No FR left unaddressed.

**Step scan.** Every step names a file, a command, or an exact value. The two steps that could be read as vague — Task 16 Step 4 ("build the five routes") and Task 18 Step 3 ("write the guide") — are the ones where the surrounding interface blocks and the Stitch screen references pin the content; each route's data source and each guide section is enumerated in its step.

**Type consistency.** `formatRupiah(cents)` is defined in Task 1 and consumed in Tasks 1, 3, 8. `verifySessionToken(secret, token, nowMs)` is defined in Task 12 and consumed identically in Tasks 13, 15, 17. `validateImageUpload` returns `{ ok, key, extension }` in Task 15 and is consumed with that shape in the same task. `adminProcedure` is defined once in Task 13 and used in Task 14. `productOrderMessage({ productName, variantName })` matches between Task 8's test and its implementation.

**Review Focus.** The five listed failure modes are pinned: null price → Task 1 `summariseVariantPrice` returns `none` and `productJsonLd` omits `offers`; equal variant prices → Task 1 "collapses equal prices"; unknown slug → Task 3 second test; session tampering → Task 12 "rejects a tampered expiry" and Task 16 "forged token"; upload abuse → Task 15 MIME, size, and traversal tests.

**Proportion.** 18 tasks across 6 packages. Code blocks are signatures, schemas, and tests rather than full component bodies; the two largest blocks (Task 12's HMAC helpers, Task 14's Zod schema) are algorithms and contracts the implementer cannot infer.
