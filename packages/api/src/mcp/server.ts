/**
 * Server MCP Delisert (Model Context Protocol, transport Streamable HTTP,
 * mode stateless: setiap POST berisi satu pesan JSON-RPC dan dijawab JSON).
 *
 * Asisten AI (Claude, dll.) memakai token yang dibuat pemilik di admin →
 * MCP. Token "read" hanya boleh memakai alat baca; token "write" boleh
 * mengubah katalog dan konten. Setiap alat menjalankan prosedur tRPC admin
 * yang sama dengan dashboard, jadi validasi dan log aktivitasnya identik.
 */
import { z } from "zod";

import type { appRouter } from "../routers/index";

export type McpPrincipal = { id: number; name: string; scope: "read" | "write" };
type Caller = ReturnType<typeof appRouter.createCaller>;

export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"] as const;
const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

const availability = z.enum(["available", "preorder", "soldout"]);
const section = z.enum(["brand", "home", "schedule", "about", "contact"]);
const id = z.number().int().positive();

type Tool = {
  name: string;
  title: string;
  description: string;
  scope: "read" | "write";
  input: z.ZodObject;
  run: (caller: Caller, args: never) => Promise<unknown>;
};

const tool = <Schema extends z.ZodObject>(definition: {
  name: string;
  title: string;
  description: string;
  scope: "read" | "write";
  input: Schema;
  run: (caller: Caller, args: z.infer<Schema>) => Promise<unknown>;
}): Tool => definition as unknown as Tool;

const productChanges = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z.string().min(1).max(80).optional().describe("Huruf kecil, angka, tanda hubung."),
  description: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0).nullable().optional().describe("Harga dalam rupiah (bukan sen), mis. 25000."),
  categoryId: id.optional(),
  availability: availability.optional(),
  isFeatured: z.boolean().optional().describe("Tampil di bagian Menu Andalan beranda."),
  imageAlt: z.string().max(200).nullable().optional(),
});

export const TOOLS: Tool[] = [
  tool({
    name: "list_products",
    title: "Daftar produk",
    description:
      "Daftar semua produk katalog Delisert (termasuk yang habis), dengan kategori, harga (rupiah), ketersediaan, jumlah varian, dan status unggulan.",
    scope: "read",
    input: z.object({
      search: z.string().optional().describe("Cari berdasarkan nama produk."),
      availability: availability.optional(),
    }),
    run: async (caller, args) => {
      const rows = await caller.adminProduct.list();
      const query = args.search?.trim().toLowerCase();
      return rows.filter(
        (row) =>
          (!query || row.name.toLowerCase().includes(query)) &&
          (!args.availability || row.availability === args.availability),
      );
    },
  }),
  tool({
    name: "get_product",
    title: "Detail produk",
    description: "Detail satu produk beserta varian ukuran (harga) dan varian rasanya.",
    scope: "read",
    input: z.object({ id }),
    run: (caller, args) => caller.adminProduct.byId({ id: args.id }),
  }),
  tool({
    name: "list_categories",
    title: "Daftar kategori",
    description: "Semua kategori produk, urutan tampil, status aktif, dan jumlah produknya.",
    scope: "read",
    input: z.object({}),
    run: (caller) => caller.adminCategory.list(),
  }),
  tool({
    name: "get_site_content",
    title: "Konten website",
    description:
      "Isi teks website yang bisa diubah: brand (WhatsApp, sosial media, pengumuman), home (beranda), schedule (jadwal & lokasi), about (tentang), contact (kontak).",
    scope: "read",
    input: z.object({ section: section.optional() }),
    run: async (caller, args) => {
      const content = await caller.adminSite.content();
      return args.section ? content[args.section] : content;
    },
  }),
  tool({
    name: "get_analytics",
    title: "Statistik pengunjung",
    description: "Ringkasan Cloudflare Web Analytics: pengunjung, tayangan halaman per hari, halaman teratas, sumber, negara, perangkat.",
    scope: "read",
    input: z.object({ days: z.union([z.literal(7), z.literal(30), z.literal(90)]).optional() }),
    run: (caller, args) => caller.adminAnalytics.summary({ days: args.days ?? 7 }),
  }),
  tool({
    name: "list_activity",
    title: "Aktivitas terbaru",
    description: "Perubahan terbaru dari admin maupun MCP.",
    scope: "read",
    input: z.object({ limit: z.number().int().min(1).max(100).optional() }),
    run: (caller, args) => caller.adminActivity.list({ limit: args.limit ?? 20 }),
  }),
  tool({
    name: "set_availability",
    title: "Ubah ketersediaan",
    description: "Tandai produk Tersedia (available), Pre-Order (preorder), atau Habis (soldout).",
    scope: "write",
    input: z.object({ id, availability }),
    run: (caller, args) => caller.adminProduct.setAvailability(args),
  }),
  tool({
    name: "update_product",
    title: "Ubah produk",
    description: "Ubah sebagian isian produk. Hanya isian yang dikirim yang berubah.",
    scope: "write",
    input: productChanges.extend({ id }),
    run: (caller, args) => caller.adminProduct.update(args),
  }),
  tool({
    name: "create_product",
    title: "Tambah produk",
    description: "Tambah produk baru. Pakai list_categories untuk mendapatkan categoryId.",
    scope: "write",
    input: z.object({
      name: z.string().min(1).max(120),
      slug: z.string().min(1).max(80).describe("Huruf kecil, angka, tanda hubung, mis. mochi-matcha."),
      categoryId: id,
      priceCents: z.number().int().min(0).nullable().describe("Harga dalam rupiah, atau null bila belum ada."),
      description: z.string().max(2000).nullable().optional(),
      availability: availability.optional(),
      isFeatured: z.boolean().optional(),
    }),
    run: (caller, args) =>
      caller.adminProduct.create({
        ...args,
        isFeatured: args.isFeatured ?? false,
        availability: args.availability ?? "available",
        displayOrder: 0,
      }),
  }),
  tool({
    name: "delete_product",
    title: "Hapus produk",
    description: "Hapus produk beserta variannya. Tidak bisa dibatalkan — pastikan pemilik memintanya.",
    scope: "write",
    input: z.object({ id }),
    run: (caller, args) => caller.adminProduct.remove(args),
  }),
  tool({
    name: "add_variant",
    title: "Tambah varian",
    description: "Tambah varian ukuran/rasa ke produk.",
    scope: "write",
    input: z.object({
      productId: id,
      name: z.string().min(1).max(80),
      priceCents: z.number().int().min(0).nullable(),
      isAvailable: z.boolean().optional(),
    }),
    run: (caller, args) =>
      caller.adminProduct.addVariant({ ...args, isAvailable: args.isAvailable ?? true, displayOrder: 0 }),
  }),
  tool({
    name: "update_variant",
    title: "Ubah varian",
    description: "Ubah nama, harga, atau ketersediaan varian.",
    scope: "write",
    input: z.object({
      id,
      name: z.string().min(1).max(80).optional(),
      priceCents: z.number().int().min(0).nullable().optional(),
      isAvailable: z.boolean().optional(),
    }),
    run: (caller, args) => caller.adminProduct.updateVariant(args),
  }),
  tool({
    name: "delete_variant",
    title: "Hapus varian",
    description: "Hapus satu varian produk.",
    scope: "write",
    input: z.object({ id }),
    run: (caller, args) => caller.adminProduct.removeVariant(args),
  }),
  tool({
    name: "add_flavor",
    title: "Tambah rasa",
    description: "Tambah varian rasa ke produk (mis. Matcha Oreo). Rasa tidak mengubah harga.",
    scope: "write",
    input: z.object({ productId: id, name: z.string().min(1).max(60) }),
    run: (caller, args) => caller.adminProduct.addFlavor(args),
  }),
  tool({
    name: "update_flavor",
    title: "Ubah rasa",
    description: "Ganti nama rasa, atau tandai rasa sedang habis (isAvailable: false).",
    scope: "write",
    input: z.object({ id, name: z.string().min(1).max(60).optional(), isAvailable: z.boolean().optional() }),
    run: (caller, args) => caller.adminProduct.updateFlavor(args),
  }),
  tool({
    name: "delete_flavor",
    title: "Hapus rasa",
    description: "Hapus satu varian rasa dari produk.",
    scope: "write",
    input: z.object({ id }),
    run: (caller, args) => caller.adminProduct.removeFlavor(args),
  }),
  tool({
    name: "create_category",
    title: "Tambah kategori",
    description: "Tambah kategori produk baru.",
    scope: "write",
    input: z.object({
      name: z.string().min(1).max(60),
      slug: z.string().min(1).max(80),
      description: z.string().max(400).nullable().optional(),
      isActive: z.boolean().optional(),
    }),
    run: (caller, args) => caller.adminCategory.create({ ...args, isActive: args.isActive ?? true }),
  }),
  tool({
    name: "update_category",
    title: "Ubah kategori",
    description: "Ubah nama, slug, deskripsi, atau status aktif kategori.",
    scope: "write",
    input: z.object({
      id,
      name: z.string().min(1).max(60).optional(),
      slug: z.string().min(1).max(80).optional(),
      description: z.string().max(400).nullable().optional(),
      isActive: z.boolean().optional(),
    }),
    run: (caller, args) => caller.adminCategory.update(args),
  }),
  tool({
    name: "update_site_content",
    title: "Ubah konten website",
    description:
      "Ubah teks website. Kirim nama bagian dan isian yang ingin diubah saja; isian lain tetap. Baca get_site_content dulu untuk melihat nama isian.",
    scope: "write",
    input: z.object({
      section,
      changes: z.record(z.string(), z.unknown()).describe("Isian yang diubah, mis. {\"heroTitleLine1\": \"Dessert baru,\"}."),
    }),
    run: async (caller, args) => {
      const current = await caller.adminSite.content();
      const updated = await caller.adminSite.update({
        section: args.section,
        value: { ...current[args.section], ...args.changes },
      });
      return updated[args.section];
    },
  }),
];

const INSTRUCTIONS =
  "Server ini mengelola katalog dan konten website Delisert (dessert Makassar). Harga dalam rupiah. " +
  "Pesanan tidak diproses di sini — semua pesanan lewat WhatsApp. Baca data dulu sebelum mengubah, " +
  "dan konfirmasi ke pemilik sebelum menghapus.";

type JsonRpcRequest = { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> };

const rpcResult = (id: JsonRpcRequest["id"], result: unknown) => ({ jsonrpc: "2.0", id: id ?? null, result });
const rpcError = (id: JsonRpcRequest["id"], code: number, message: string) => ({
  jsonrpc: "2.0",
  id: id ?? null,
  error: { code, message },
});

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

function listTools(principal: McpPrincipal) {
  return TOOLS.filter((item) => item.scope === "read" || principal.scope === "write").map((item) => ({
    name: item.name,
    title: item.title,
    description: item.description,
    inputSchema: z.toJSONSchema(item.input, { io: "input" }),
    annotations: {
      readOnlyHint: item.scope === "read",
      destructiveHint: item.name.startsWith("delete_"),
    },
  }));
}

const errorMessage = (error: unknown) => {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return `Isian tidak valid: ${issue?.path.join(".") || "input"} — ${issue?.message}`;
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
};

async function callTool(principal: McpPrincipal, caller: () => Promise<Caller>, params: Record<string, unknown>) {
  const found = TOOLS.find((item) => item.name === params.name);
  if (!found) return null;
  if (found.scope === "write" && principal.scope !== "write") {
    return { content: [{ type: "text", text: "Token ini hanya boleh membaca. Buat token dengan akses ubah di admin → MCP." }], isError: true };
  }
  try {
    const args = found.input.parse(params.arguments ?? {});
    const result = await found.run(await caller(), args as never);
    return { content: [{ type: "text", text: JSON.stringify(result ?? { ok: true }, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: errorMessage(error) }], isError: true };
  }
}

export type McpDeps = {
  /** Kembalikan pemilik token, atau null bila token tidak ada/dicabut. */
  authenticate: (token: string) => Promise<McpPrincipal | null>;
  /** Buat pemanggil tRPC admin atas nama token ini. */
  createCaller: (principal: McpPrincipal) => Promise<Caller>;
  /** Ambil token mentah dari request (header Bearer atau ?key=). */
  readToken: (request: Request) => string | null;
};

export async function handleMcpRequest(request: Request, deps: McpDeps): Promise<Response> {
  if (request.method !== "POST") {
    // Mode stateless: tidak ada aliran SSE untuk GET.
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
  }

  const raw = deps.readToken(request);
  const principal = raw ? await deps.authenticate(raw) : null;
  if (!principal) {
    return json(rpcError(null, -32001, "Token MCP tidak valid atau sudah dicabut."), 401, {
      "www-authenticate": 'Bearer realm="delisert-mcp"',
    });
  }

  let message: JsonRpcRequest;
  try {
    message = (await request.json()) as JsonRpcRequest;
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }
  if (!message || typeof message !== "object" || Array.isArray(message) || typeof message.method !== "string") {
    return json(rpcError(null, -32600, "Invalid Request"), 400);
  }

  // Notifikasi (tanpa id) tidak dijawab.
  if (message.id === undefined || message.id === null) return new Response(null, { status: 202 });

  const params = message.params ?? {};
  switch (message.method) {
    case "initialize": {
      const requested = String(params.protocolVersion ?? "");
      const protocolVersion = (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(requested)
        ? requested
        : LATEST_PROTOCOL_VERSION;
      return json(
        rpcResult(message.id, {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "delisert", title: "Delisert Admin", version: "1.0.0" },
          instructions: INSTRUCTIONS,
        }),
      );
    }
    case "ping":
      return json(rpcResult(message.id, {}));
    case "tools/list":
      return json(rpcResult(message.id, { tools: listTools(principal) }));
    case "tools/call": {
      const result = await callTool(principal, () => deps.createCaller(principal), params);
      if (!result) return json(rpcError(message.id, -32602, `Alat tidak dikenal: ${String(params.name)}`));
      return json(rpcResult(message.id, result));
    }
    default:
      return json(rpcError(message.id, -32601, `Method not found: ${message.method}`));
  }
}
