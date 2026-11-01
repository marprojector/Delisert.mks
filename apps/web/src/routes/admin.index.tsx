import { AvailabilityBadge } from "@delisert.mks-1/ui/components/availability-badge";
import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  FileText,
  ImageOff,
  Megaphone,
  Package,
  PackageX,
  Plus,
  UserRound,
  Users,
} from "lucide-react";

import { DailyBarChart, RankedBars, pageName } from "@/components/admin/charts";
import { Card, Notice, PageHeader, StatTile, buttonClass, formatNumber, percentChange, timeAgo } from "@/components/admin/ui";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Ringkasan Admin — Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminDashboard,
});

function greeting(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Makassar" }).format(now),
  );
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

const todayLabel = () =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(new Date());

function AdminDashboard() {
  const trpc = useTRPC();
  const products = useQuery(trpc.adminProduct.list.queryOptions());
  const analytics = useQuery({ ...trpc.adminAnalytics.summary.queryOptions({ days: 7 }), staleTime: 5 * 60_000 });
  const activity = useQuery(trpc.adminActivity.list.queryOptions({ limit: 8 }));
  const tokens = useQuery(trpc.adminMcp.list.queryOptions());

  const rows = products.data ?? [];
  const available = rows.filter((row) => row.availability !== "soldout").length;
  const soldOut = rows.filter((row) => row.availability === "soldout");
  const withoutPhoto = rows.filter((row) => !row.thumbnailUrl);
  const withoutDescription = rows.filter((row) => !row.description?.trim());
  const attention = soldOut.length + withoutPhoto.length;
  const activeTokens = (tokens.data ?? []).filter((token) => !token.revokedAt).length;

  const summary = analytics.data?.status === "ok" ? analytics.data.summary : null;

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow={todayLabel()}
        title={`${greeting()}!`}
        description="Ringkasan website Delisert: pengunjung minggu ini, kondisi katalog, dan perubahan terbaru."
        actions={
          <>
            <Link to="/admin/konten" className={buttonClass("secondary")}>
              <FileText aria-hidden="true" className="size-4" />
              Ubah konten
            </Link>
            <Link to="/admin/produk/$id" params={{ id: "baru" }} className={buttonClass("primary")}>
              <Plus aria-hidden="true" className="size-4" />
              Tambah produk
            </Link>
          </>
        }
      />

      {products.isError ? <Notice tone="error">Gagal memuat data katalog. Coba muat ulang halaman.</Notice> : null}

      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatTile
          icon={Users}
          tone="primary"
          label="Pengunjung · 7 hari"
          value={summary ? formatNumber(summary.visits) : "—"}
          trend={summary ? percentChange(summary.visits, summary.previousVisits) : null}
          hint={summary ? "dibanding 7 hari sebelumnya" : analyticsHint(analytics.data?.status)}
          loading={analytics.isLoading}
        />
        <StatTile
          icon={Eye}
          label="Tayangan halaman"
          value={summary ? formatNumber(summary.pageviews) : "—"}
          trend={summary ? percentChange(summary.pageviews, summary.previousPageviews) : null}
          hint="7 hari terakhir"
          loading={analytics.isLoading}
        />
        <StatTile
          icon={Package}
          label="Produk dijual"
          value={
            <>
              {available}
              <span className="text-base font-medium text-muted-foreground">/{rows.length}</span>
            </>
          }
          hint={`${rows.filter((row) => row.isFeatured).length} tampil di beranda`}
          loading={products.isLoading}
        />
        <StatTile
          icon={AlertTriangle}
          tone={attention > 0 ? "warning" : "default"}
          label="Perlu perhatian"
          value={attention}
          hint={attention > 0 ? `${soldOut.length} habis · ${withoutPhoto.length} tanpa foto` : "Semua beres"}
          loading={products.isLoading}
        />
      </ul>

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card
          title="Pengunjung 7 hari terakhir"
          description="Data Cloudflare Web Analytics, tanpa cookie."
          action={
            <Link to="/admin/analitik" className="-my-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary">
              Analitik <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        >
          <AnalyticsBody status={analytics.data} loading={analytics.isLoading}>
            {summary ? (
              summary.pageviews === 0 ? (
                <Notice>
                  Belum ada kunjungan tercatat. Data muncul beberapa menit setelah website dibuka pengunjung.
                </Notice>
              ) : (
                <DailyBarChart data={summary.daily} metric="visits" dim={analytics.isFetching} />
              )
            ) : null}
          </AnalyticsBody>
        </Card>

        <Card
          title="Aktivitas terbaru"
          description="Perubahan dari admin dan asisten AI."
          bodyClassName="gap-0 pt-2 lg:pt-3"
        >
          {activity.data && activity.data.length > 0 ? (
            <ol className="flex flex-col">
              {activity.data.map((entry) => {
                const viaMcp = entry.actor.startsWith("mcp:");
                return (
                  <li key={entry.id} className="flex gap-3 border-b border-border/60 py-3 last:border-0">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        viaMcp ? "bg-[#ece6f6] text-[#5b3f8f]" : "bg-secondary text-primary",
                      )}
                    >
                      {viaMcp ? <Bot className="size-4" /> : <UserRound className="size-4" />}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm/snug text-foreground">{entry.summary}</span>
                      <span className="text-xs text-muted-foreground">
                        {viaMcp ? `MCP · ${entry.actor.slice(4)}` : "Admin"} · {timeAgo(entry.createdAt)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {activity.isLoading ? "Memuat…" : "Belum ada perubahan tercatat."}
            </p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <Card title="Kesehatan katalog" description="Hal kecil yang membuat menu lebih meyakinkan.">
          <ul className="flex flex-col gap-2">
            <HealthRow
              ok={withoutPhoto.length === 0}
              icon={ImageOff}
              label={withoutPhoto.length === 0 ? "Semua produk punya foto" : `${withoutPhoto.length} produk belum ada foto`}
              to={withoutPhoto[0] ? String(withoutPhoto[0].id) : undefined}
            />
            <HealthRow
              ok={soldOut.length === 0}
              icon={PackageX}
              label={soldOut.length === 0 ? "Tidak ada produk habis" : `${soldOut.length} produk ditandai habis`}
              to={soldOut[0] ? String(soldOut[0].id) : undefined}
            />
            <HealthRow
              ok={withoutDescription.length === 0}
              icon={FileText}
              label={
                withoutDescription.length === 0
                  ? "Semua produk punya deskripsi"
                  : `${withoutDescription.length} produk tanpa deskripsi`
              }
              to={withoutDescription[0] ? String(withoutDescription[0].id) : undefined}
            />
            <HealthRow
              ok={activeTokens > 0}
              neutral
              icon={Bot}
              label={activeTokens > 0 ? `${activeTokens} token MCP aktif` : "Belum ada asisten AI terhubung"}
              href="/admin/mcp"
            />
          </ul>
        </Card>

        <Card title="Halaman paling dilihat" description="7 hari terakhir.">
          <AnalyticsBody status={analytics.data} loading={analytics.isLoading} compact>
            {summary ? <RankedBars rows={summary.topPaths.slice(0, 5)} format={pageName} /> : null}
          </AnalyticsBody>
        </Card>

        <Card title="Pintasan" description="Perubahan yang paling sering dilakukan.">
          <ul className="grid grid-cols-1 gap-2">
            <Shortcut to="/admin/produk" icon={Package} title="Tandai stok habis / tersedia" text="Langsung dari daftar produk" />
            <Shortcut to="/admin/konten" section="brand" icon={Megaphone} title="Pasang pengumuman" text="Pita di atas website, mis. PO dibuka" />
            <Shortcut to="/admin/konten" section="schedule" icon={FileText} title="Ubah jadwal & lokasi" text="Jam TikTok Live dan titik CFD" />
          </ul>
        </Card>
      </div>

      <Card
        title="Produk"
        description="Urutan sesuai tampilan di menu."
        action={
          <Link to="/admin/produk" className="-my-2 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-primary">
            Kelola <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        }
        bodyClassName="gap-0 pt-1"
      >
        <ul className="flex flex-col">
          {rows.slice(0, 6).map((row) => (
            <li key={row.id}>
              <Link
                to="/admin/produk/$id"
                params={{ id: String(row.id) }}
                className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0 hover:bg-muted/50"
              >
                <span className="size-12 shrink-0 overflow-hidden rounded-xl">
                  {row.thumbnailUrl ? (
                    <img src={row.thumbnailUrl} srcSet={photoSrcSet(row.thumbnailUrl)} sizes="48px" alt="" width={48} height={48} className="size-full object-cover" />
                  ) : (
                    <PhotoPlaceholder label="" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[0.9375rem] font-semibold text-foreground">{row.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {[row.categoryName, row.variantCount > 0 ? `${row.variantCount} ukuran` : null, row.flavorCount > 0 ? `${row.flavorCount} rasa` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <span className="hidden text-sm font-semibold text-foreground sm:block">
                  {row.priceCents === null ? "—" : formatRupiah(row.priceCents)}
                </span>
                <AvailabilityBadge availability={row.availability} className="shrink-0 border border-border" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function analyticsHint(status: string | undefined) {
  if (status === "unconfigured") return "Analitik belum dipasang";
  if (status === "error") return "Cloudflare tidak bisa dihubungi";
  return "7 hari terakhir";
}

function AnalyticsBody({
  status,
  loading,
  compact = false,
  children,
}: {
  status: { status: "ok" } | { status: "unconfigured" } | { status: "error"; message: string } | undefined;
  loading: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return <div className={cn("animate-pulse rounded-xl bg-muted", compact ? "h-40" : "h-64")} />;
  }
  if (status?.status === "unconfigured") {
    return (
      <Notice>
        Statistik pengunjung belum aktif: token Cloudflare Analytics belum dipasang di server. Lihat halaman Analitik untuk caranya.
      </Notice>
    );
  }
  if (status?.status === "error") {
    return <Notice tone="error">Gagal mengambil data dari Cloudflare: {status.message}</Notice>;
  }
  return <>{children}</>;
}

function HealthRow({
  ok,
  neutral = false,
  icon: Icon,
  label,
  to,
  href,
}: {
  ok: boolean;
  neutral?: boolean;
  icon: typeof Package;
  label: string;
  to?: string;
  href?: "/admin/mcp";
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          ok ? "bg-[#e3f1e6] text-[#256b3a]" : neutral ? "bg-secondary text-primary" : "bg-[#fbf1df] text-[#8a5a0b]",
        )}
      >
        {ok ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
      </span>
      <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
      {!ok || neutral ? <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  );
  const className = "flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/70";
  if (href) {
    return (
      <li>
        <Link to={href} className={className}>
          {body}
        </Link>
      </li>
    );
  }
  if (to && !ok) {
    return (
      <li>
        <Link to="/admin/produk/$id" params={{ id: to }} className={className}>
          {body}
        </Link>
      </li>
    );
  }
  return <li className={cn(className, "hover:bg-transparent")}>{body}</li>;
}

function Shortcut({
  to,
  section,
  icon: Icon,
  title,
  text,
}: {
  to: "/admin/produk" | "/admin/konten";
  section?: "brand" | "schedule";
  icon: typeof Package;
  title: string;
  text: string;
}) {
  return (
    <li>
      <Link
        to={to}
        search={section ? { bagian: section } : undefined}
        className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2.5 transition-colors hover:border-primary"
      >
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="truncate text-xs text-muted-foreground">{text}</span>
        </span>
      </Link>
    </li>
  );
}
