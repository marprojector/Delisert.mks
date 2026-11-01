/**
 * Ringkasan Cloudflare Web Analytics untuk dashboard admin.
 *
 * Data diambil dari GraphQL Analytics API (dataset rumPageloadEventsAdaptiveGroups)
 * memakai token API yang hanya berizin "Account Analytics Read". Token itu
 * rahasia Worker (CF_ANALYTICS_API_TOKEN) dan tidak pernah dikirim ke browser.
 */

export const ANALYTICS_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

/** Akun dan situs Web Analytics Delisert. Keduanya bukan rahasia. */
export const CLOUDFLARE_ACCOUNT_TAG = "affb450d746e53150028bb763b2f640c";
export const WEB_ANALYTICS_SITE_TAG = "bcd3e04f7fa347ccb78d4df5c5d8349d";

export type AnalyticsConfig = {
  apiToken: string;
  accountTag: string;
  siteTag: string;
};

export type Ranked = { label: string; count: number };

export type AnalyticsSummary = {
  days: number;
  from: string;
  to: string;
  pageviews: number;
  visits: number;
  /** Periode sebelumnya dengan panjang yang sama, untuk persentase naik/turun. */
  previousPageviews: number;
  previousVisits: number;
  daily: Array<{ date: string; pageviews: number; visits: number }>;
  topPaths: Ranked[];
  referrers: Ranked[];
  countries: Ranked[];
  devices: Ranked[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tanggal UTC "YYYY-MM-DD". */
export const isoDate = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function analyticsRange(days: number, nowMs: number) {
  const to = isoDate(nowMs);
  const from = isoDate(nowMs - (days - 1) * DAY_MS);
  const previousTo = isoDate(nowMs - days * DAY_MS);
  const previousFrom = isoDate(nowMs - (2 * days - 1) * DAY_MS);
  return { from, to, previousFrom, previousTo };
}

const filter = (siteTag: string, from: string, to: string) =>
  `{AND:[{date_geq:"${from}"},{date_leq:"${to}"},{siteTag:"${siteTag}"}]}`;

export function buildAnalyticsQuery(config: AnalyticsConfig, days: number, nowMs: number): string {
  const { from, to, previousFrom, previousTo } = analyticsRange(days, nowMs);
  const current = filter(config.siteTag, from, to);
  const previous = filter(config.siteTag, previousFrom, previousTo);
  const group = (alias: string, dimension: string, limit = 8) =>
    `${alias}: rumPageloadEventsAdaptiveGroups(limit:${limit}, filter:${current}, orderBy:[count_DESC]) { count dimensions { ${dimension} } }`;
  return `{ viewer { accounts(filter:{accountTag:"${config.accountTag}"}) {
    total: rumPageloadEventsAdaptiveGroups(limit:1, filter:${current}) { count sum { visits } }
    previous: rumPageloadEventsAdaptiveGroups(limit:1, filter:${previous}) { count sum { visits } }
    daily: rumPageloadEventsAdaptiveGroups(limit:100, filter:${current}, orderBy:[date_ASC]) { count sum { visits } dimensions { date } }
    ${group("paths", "requestPath")}
    ${group("referrers", "refererHost")}
    ${group("countries", "countryName", 6)}
    ${group("devices", "deviceType", 4)}
  } } }`;
}

type Group = { count?: number; sum?: { visits?: number }; dimensions?: Record<string, string> };
type Account = Partial<Record<"total" | "previous" | "daily" | "paths" | "referrers" | "countries" | "devices", Group[]>>;

const ranked = (groups: Group[] | undefined, dimension: string, emptyLabel: string): Ranked[] =>
  (groups ?? []).map((group) => ({
    label: group.dimensions?.[dimension] || emptyLabel,
    count: group.count ?? 0,
  }));

/** Ubah respons GraphQL menjadi ringkasan; hari tanpa kunjungan diisi nol. */
export function parseAnalytics(account: Account, days: number, nowMs: number): AnalyticsSummary {
  const { from, to } = analyticsRange(days, nowMs);
  const byDate = new Map(
    (account.daily ?? []).map((group) => [
      group.dimensions?.date ?? "",
      { pageviews: group.count ?? 0, visits: group.sum?.visits ?? 0 },
    ]),
  );
  const daily = Array.from({ length: days }, (_, index) => {
    const date = isoDate(nowMs - (days - 1 - index) * DAY_MS);
    return { date, ...(byDate.get(date) ?? { pageviews: 0, visits: 0 }) };
  });
  const total = account.total?.[0];
  const previous = account.previous?.[0];
  return {
    days,
    from,
    to,
    pageviews: total?.count ?? 0,
    visits: total?.sum?.visits ?? 0,
    previousPageviews: previous?.count ?? 0,
    previousVisits: previous?.sum?.visits ?? 0,
    daily,
    topPaths: ranked(account.paths, "requestPath", "/"),
    referrers: ranked(account.referrers, "refererHost", "Langsung / tidak diketahui"),
    countries: ranked(account.countries, "countryName", "Tidak diketahui"),
    devices: ranked(account.devices, "deviceType", "Lainnya"),
  };
}

export class AnalyticsError extends Error {}

export async function fetchAnalytics(
  config: AnalyticsConfig,
  days: number,
  nowMs: number,
  fetchImpl: typeof fetch = fetch,
): Promise<AnalyticsSummary> {
  const response = await fetchImpl(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query: buildAnalyticsQuery(config, days, nowMs) }),
  });
  if (!response.ok) throw new AnalyticsError(`Cloudflare menolak permintaan (${response.status}).`);
  const body = (await response.json()) as {
    data?: { viewer?: { accounts?: Account[] } };
    errors?: Array<{ message: string }> | null;
  };
  if (body.errors?.length) throw new AnalyticsError(body.errors[0]!.message);
  const account = body.data?.viewer?.accounts?.[0];
  if (!account) throw new AnalyticsError("Akun Cloudflare tidak ditemukan.");
  return parseAnalytics(account, days, nowMs);
}
