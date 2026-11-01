import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bot, Check, Copy, KeyRound, Plus, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Segmented } from "@/components/admin/segmented";
import { Card, Notice, PageHeader, TextField, buttonClass, timeAgo } from "@/components/admin/ui";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/admin/mcp")({
  head: () => ({
    meta: [{ title: "MCP & Asisten AI — Admin Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: McpPage,
});

type Scope = "read" | "write";

const SCOPES: ReadonlyArray<{ value: Scope; label: string }> = [
  { value: "read", label: "Hanya baca" },
  { value: "write", label: "Baca & ubah" },
];

const TOOLS: ReadonlyArray<{ group: string; scope: Scope; items: string[] }> = [
  {
    group: "Membaca",
    scope: "read",
    items: ["Daftar & detail produk", "Kategori", "Konten website", "Statistik pengunjung", "Aktivitas terbaru"],
  },
  {
    group: "Mengubah",
    scope: "write",
    items: [
      "Tandai stok habis / tersedia",
      "Ubah harga, nama, deskripsi",
      "Tambah / hapus produk",
      "Kelola varian ukuran & rasa",
      "Kelola kategori",
      "Ubah teks website & pengumuman",
    ],
  },
];

const EXAMPLES = [
  "Tandai Mille Crepes rasa Red Velvet sedang habis.",
  "Pasang pengumuman: PO mochi untuk Lebaran dibuka sampai 25 Maret.",
  "Berapa pengunjung website minggu ini, dan halaman apa yang paling dilihat?",
  "Ubah jam TikTok Live hari ini jadi 13:00 – 16:00 WITA.",
];

function McpPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const tokens = useQuery(trpc.adminMcp.list.queryOptions());
  const [name, setName] = useState("");
  const [scope, setScope] = useState<Scope>("read");
  const [created, setCreated] = useState<{ name: string; token: string; scope: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://delisert…");

  useEffect(() => setOrigin(window.location.origin), []);
  const endpoint = `${origin}/api/mcp`;

  const refresh = () => void queryClient.invalidateQueries(trpc.adminMcp.list.queryFilter());
  const create = useMutation(
    trpc.adminMcp.create.mutationOptions({
      onSuccess: (result) => {
        setCreated({ name: result.name, token: result.token, scope: result.scope });
        setName("");
        setError(null);
        refresh();
      },
      onError: (mutationError) => setError(mutationError.message),
    }),
  );
  const revoke = useMutation(
    trpc.adminMcp.revoke.mutationOptions({ onSuccess: refresh, onError: (mutationError) => setError(mutationError.message) }),
  );

  const activeTokens = (tokens.data ?? []).filter((token) => !token.revokedAt);
  const revokedTokens = (tokens.data ?? []).filter((token) => token.revokedAt);

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Integrasi"
        title="MCP & asisten AI"
        description="Hubungkan Claude atau asisten AI lain yang mendukung MCP (Model Context Protocol) ke katalog Delisert. Setelah terhubung, kamu bisa mengelola menu dan website cukup dengan mengetik perintah."
      />

      <div className="grid gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
          {created ? (
            <NewTokenCard created={created} endpoint={endpoint} onDone={() => setCreated(null)} />
          ) : (
            <Card title="Buat koneksi baru" description="Setiap aplikasi sebaiknya punya token sendiri, supaya bisa dicabut satu per satu.">
              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!name.trim()) return setError("Beri nama dulu, mis. “Claude di laptop”.");
                  create.mutate({ name: name.trim(), scope });
                }}
              >
                <TextField
                  label="Nama koneksi"
                  value={name}
                  maxLength={60}
                  placeholder="Claude di laptop"
                  onChange={setName}
                />
                <Segmented name="scope" label="Hak akses" value={scope} options={SCOPES} onChange={setScope} />
                <p className="-mt-2 text-xs/relaxed text-muted-foreground">
                  {scope === "read"
                    ? "Asisten hanya bisa melihat data. Aman untuk mencoba."
                    : "Asisten bisa mengubah produk, harga, stok, dan teks website. Semua perubahan tercatat di Aktivitas."}
                </p>
                {error ? <Notice tone="error">{error}</Notice> : null}
                <button type="submit" disabled={create.isPending} className={cn(buttonClass("primary"), "w-fit")}>
                  <KeyRound aria-hidden="true" className="size-4" />
                  {create.isPending ? "Membuat…" : "Buat token"}
                </button>
              </form>
            </Card>
          )}

          <Card title="Koneksi aktif" description={`${activeTokens.length} token bisa dipakai saat ini.`} bodyClassName="gap-0 pt-2">
            {tokens.isLoading ? <p className="py-4 text-sm text-muted-foreground">Memuat…</p> : null}
            {!tokens.isLoading && activeTokens.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Belum ada koneksi. Buat token di atas.</p>
            ) : null}
            <ul className="flex flex-col">
              {activeTokens.map((token) => (
                <li key={token.id} className="flex flex-wrap items-center gap-3 border-b border-border/60 py-3.5 last:border-0">
                  <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ece6f6] text-[#5b3f8f]">
                    <Bot className="size-5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex flex-wrap items-center gap-2 text-[0.9375rem] font-semibold text-foreground">
                      {token.name}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                          token.scope === "write" ? "bg-[#fbf1df] text-[#8a5a0b]" : "bg-[#e3f1e6] text-[#256b3a]",
                        )}
                      >
                        {token.scope === "write" ? "Baca & ubah" : "Hanya baca"}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      <code>{token.tokenPrefix}…</code> · dibuat {timeAgo(token.createdAt)} · terakhir dipakai {timeAgo(token.lastUsedAt)}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={revoke.isPending}
                    onClick={() => {
                      if (window.confirm(`Cabut token "${token.name}"? Aplikasi yang memakainya langsung terputus.`)) {
                        revoke.mutate({ id: token.id });
                      }
                    }}
                    className={buttonClass("danger", "sm")}
                  >
                    Cabut
                  </button>
                </li>
              ))}
            </ul>
            {revokedTokens.length > 0 ? (
              <details className="pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                  {revokedTokens.length} token sudah dicabut
                </summary>
                <ul className="flex flex-col gap-1 pt-2 text-xs text-muted-foreground">
                  {revokedTokens.map((token) => (
                    <li key={token.id}>
                      {token.name} · <code>{token.tokenPrefix}…</code> · dicabut {timeAgo(token.revokedAt)}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <Card title="Yang bisa dilakukan asisten">
            {TOOLS.map((group) => (
              <div key={group.group} className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {group.group} {group.scope === "write" ? "· token Baca & ubah" : ""}
                </span>
                <ul className="flex flex-col gap-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <Check aria-hidden="true" className="size-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
          <Card title="Contoh perintah">
            <ul className="flex flex-col gap-2">
              {EXAMPLES.map((example) => (
                <li key={example} className="flex gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm/relaxed text-foreground">
                  <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />“{example}”
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Keamanan">
            <ul className="flex flex-col gap-2 text-sm/relaxed text-muted-foreground">
              <li className="flex gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                Token hanya ditampilkan sekali. Server menyimpan sidik jarinya saja, bukan token aslinya.
              </li>
              <li className="flex gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                Cabut token kapan saja; aplikasi yang memakainya langsung terputus.
              </li>
              <li className="flex gap-2">
                <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
                Asisten tidak bisa melihat kata sandi admin dan tidak bisa membuat token baru.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NewTokenCard({
  created,
  endpoint,
  onDone,
}: {
  created: { name: string; token: string; scope: string };
  endpoint: string;
  onDone: () => void;
}) {
  const [client, setClient] = useState<"code" | "desktop" | "web">("code");
  const snippets = {
    code: `claude mcp add --transport http delisert ${endpoint} --header "Authorization: Bearer ${created.token}"`,
    desktop: JSON.stringify(
      {
        mcpServers: {
          delisert: {
            command: "npx",
            args: ["-y", "mcp-remote", endpoint, "--header", `Authorization: Bearer ${created.token}`],
          },
        },
      },
      null,
      2,
    ),
    web: `${endpoint}?key=${created.token}`,
  } as const;
  const guide = {
    code: "Jalankan perintah ini di terminal, lalu buka Claude Code dan ketik /mcp untuk memastikan Delisert terhubung.",
    desktop:
      "Claude Desktop → Settings → Developer → Edit Config. Tempel isi ini ke claude_desktop_config.json (gabungkan bila sudah ada mcpServers), lalu mulai ulang Claude Desktop.",
    web: "claude.ai → Settings → Connectors → Add custom connector. Tempel URL ini. Token ada di dalam URL, jadi jangan bagikan URL-nya.",
  } as const;

  return (
    <Card className="border-primary/50" title={`Token untuk “${created.name}” siap`}>
      <div className="flex items-start gap-2.5 rounded-xl bg-[#fbf1df] px-3.5 py-3 text-sm/relaxed text-[#6e4708]">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        Salin sekarang. Token ini tidak akan ditampilkan lagi; kalau hilang, cabut lalu buat yang baru.
      </div>
      <CopyBlock label="Token" value={created.token} />

      <div className="flex flex-col gap-3">
        <Segmented
          name="client"
          label="Pasang di"
          value={client}
          options={[
            { value: "code", label: "Claude Code" },
            { value: "desktop", label: "Claude Desktop" },
            { value: "web", label: "claude.ai" },
          ]}
          onChange={setClient}
        />
        <p className="text-sm/relaxed text-muted-foreground">{guide[client]}</p>
        <CopyBlock label={client === "web" ? "URL connector" : "Konfigurasi"} value={snippets[client]} multiline={client === "desktop"} />
      </div>
      <button type="button" onClick={onDone} className={cn(buttonClass("secondary"), "w-fit")}>
        <Plus aria-hidden="true" className="size-4" />
        Selesai, buat koneksi lain
      </button>
    </Card>
  );
}

function CopyBlock({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto rounded-xl bg-foreground px-3.5 py-3 pr-24 font-mono text-[0.8125rem] text-background",
            multiline ? "whitespace-pre" : "whitespace-pre-wrap break-all",
          )}
        >
          {value}
        </pre>
        <button
          type="button"
          onClick={() => void copy()}
          className="absolute top-2 right-2 inline-flex h-8 items-center gap-1.5 rounded-full bg-background px-3 text-xs font-semibold text-foreground"
        >
          {copied ? <Check aria-hidden="true" className="size-3.5 text-success" /> : <Copy aria-hidden="true" className="size-3.5" />}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
    </div>
  );
}
