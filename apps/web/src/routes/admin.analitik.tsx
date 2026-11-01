import { cn } from "@delisert.mks-1/ui/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Globe2, Layers, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import {
  DailyBarChart,
  METRIC_LABEL,
  type Metric,
  RankedBars,
  countryName,
  deviceName,
  pageName,
} from "@/components/admin/charts";
import { Segmented } from "@/components/admin/segmented";
import { Card, Notice, PageHeader, StatTile, buttonClass, formatNumber, percentChange } from "@/components/admin/ui";
import { useTRPC } from "@/utils/trpc";

const RANGES = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
] as const;

export const Route = createFileRoute("/admin/analitik")({
  validateSearch: z.object({ hari: z.enum(["7", "30", "90"]).optional() }),
  head: () => ({
    meta: [{ title: "Analitik — Admin Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const trpc = useTRPC();
  const navigate = Route.useNavigate();
  const { hari = "7" } = Route.useSearch();
  const days = Number(hari) as 7 | 30 | 90;
  const [metric, setMetric] = useState<Metric>("visits");

  const query = useQuery({
    ...trpc.adminAnalytics.summary.queryOptions({ days }),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });
  const summary = query.data?.status === "ok" ? query.data.summary : null;

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Cloudflare Web Analytics"
        title="Analitik pengunjung"
        description="Siapa yang membuka website dan halaman apa yang paling diminati. Tanpa cookie, jadi tidak perlu banner persetujuan."
        actions={
          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className={buttonClass("secondary")}
          >
            <RefreshCw aria-hidden="true" className={cn("size-4", query.isFetching && "animate-spin")} />
            Muat ulang
          </button>
        }
      />

      {/* Filter: satu baris, di atas semua isi yang terpengaruh. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Segmented
            name="rentang"
            label="Rentang waktu"
            value={hari}
            options={RANGES}
            onChange={(value) => void navigate({ search: { hari: value } })}
          />
        </div>
      </div>

      {query.isLoading ? <div className="h-72 animate-pulse rounded-3xl bg-background" /> : null}

      {query.data?.status === "unconfigured" ? (
        <Card title="Statistik belum aktif">
          <Notice>
            Server belum punya token Cloudflare berizin <strong>Account Analytics Read</strong>. Isi rahasia{" "}
            <code className="rounded bg-background px-1">CF_ANALYTICS_API_TOKEN</code> di GitHub (Settings → Secrets →
            Actions), lalu deploy ulang. Penghitung kunjungan di website sudah aktif, jadi data tetap terkumpul.
          </Notice>
        </Card>
      ) : null}

      {query.data?.status === "error" ? (
        <Notice tone="error">Gagal mengambil data dari Cloudflare: {query.data.message}</Notice>
      ) : null}

      {summary ? (
        <>
          <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
            <StatTile
              icon={Users}
              tone="primary"
              label="Pengunjung"
              value={formatNumber(summary.visits)}
              trend={percentChange(summary.visits, summary.previousVisits)}
              hint={`vs ${days} hari sebelumnya`}
            />
            <StatTile
              icon={Eye}
              label="Tayangan halaman"
              value={formatNumber(summary.pageviews)}
              trend={percentChange(summary.pageviews, summary.previousPageviews)}
              hint={`vs ${days} hari sebelumnya`}
            />
            <StatTile
              icon={Layers}
              label="Halaman per kunjungan"
              value={summary.visits > 0 ? (summary.pageviews / summary.visits).toFixed(1).replace(".", ",") : "—"}
              hint="Makin tinggi, makin betah"
            />
            <StatTile
              icon={Globe2}
              label="Asal terbanyak"
              value={<span className="text-xl lg:text-2xl">{summary.countries[0] ? countryName(summary.countries[0].label) : "—"}</span>}
              hint={summary.countries[0] ? `${formatNumber(summary.countries[0].count)} tayangan` : "Belum ada data"}
            />
          </ul>

          <Card
            title={`${METRIC_LABEL[metric]} per hari`}
            description={`${summary.from} s.d. ${summary.to} (UTC)`}
            action={
              <div className="w-56">
                <Segmented
                  name="ukuran"
                  label="Tampilkan"
                  value={metric}
                  options={[
                    { value: "visits", label: "Pengunjung" },
                    { value: "pageviews", label: "Tayangan" },
                  ]}
                  onChange={setMetric}
                />
              </div>
            }
          >
            {summary.pageviews === 0 ? (
              <Notice>Belum ada kunjungan di rentang ini. Data muncul beberapa menit setelah website dibuka.</Notice>
            ) : (
              <DailyBarChart data={summary.daily} metric={metric} dim={query.isFetching} />
            )}
            <details className="group rounded-xl border border-border/70">
              <summary className="cursor-pointer px-3.5 py-2.5 text-sm font-semibold text-foreground">
                Lihat sebagai tabel
              </summary>
              <div className="max-h-72 overflow-auto border-t border-border/70">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-background text-xs text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3.5 py-2 font-semibold">Tanggal</th>
                      <th scope="col" className="px-3.5 py-2 text-right font-semibold">Pengunjung</th>
                      <th scope="col" className="px-3.5 py-2 text-right font-semibold">Tayangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {[...summary.daily].reverse().map((day) => (
                      <tr key={day.date}>
                        <td className="px-3.5 py-2">{day.date}</td>
                        <td className="px-3.5 py-2 text-right tabular-nums">{formatNumber(day.visits)}</td>
                        <td className="px-3.5 py-2 text-right tabular-nums">{formatNumber(day.pageviews)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Card>

          <div className={cn("grid gap-4 lg:grid-cols-2 lg:gap-6", query.isFetching && "opacity-60")}>
            <Card title="Halaman teratas" description="Berdasarkan tayangan.">
              <RankedBars rows={summary.topPaths} format={pageName} />
            </Card>
            <Card title="Sumber kunjungan" description="Situs yang mengarahkan pengunjung ke Delisert.">
              <RankedBars rows={summary.referrers} />
            </Card>
            <Card title="Negara">
              <RankedBars rows={summary.countries} format={countryName} />
            </Card>
            <Card title="Perangkat">
              <RankedBars rows={summary.devices} format={deviceName} />
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
