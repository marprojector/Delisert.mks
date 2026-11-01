import { describe, expect, test } from "bun:test";

import { analyticsRange, buildAnalyticsQuery, fetchAnalytics, parseAnalytics } from "./web-analytics";

const NOW = Date.UTC(2026, 10, 2, 9, 0, 0); // 2 Nov 2026
const CONFIG = { apiToken: "t", accountTag: "acc", siteTag: "site" };

describe("web analytics", () => {
  test("range covers the last N days including today, and the period before it", () => {
    expect(analyticsRange(7, NOW)).toEqual({
      from: "2026-10-27",
      to: "2026-11-02",
      previousFrom: "2026-10-20",
      previousTo: "2026-10-26",
    });
  });

  test("query filters by site tag and date range", () => {
    const query = buildAnalyticsQuery(CONFIG, 7, NOW);
    expect(query).toContain('accountTag:"acc"');
    expect(query).toContain('{siteTag:"site"}');
    expect(query).toContain('{date_geq:"2026-10-27"}');
    expect(query).toContain('{date_geq:"2026-10-20"},{date_leq:"2026-10-26"}');
  });

  test("days without visits are filled with zero, in order", () => {
    const summary = parseAnalytics(
      {
        total: [{ count: 30, sum: { visits: 12 } }],
        previous: [{ count: 10, sum: { visits: 4 } }],
        daily: [
          { count: 20, sum: { visits: 8 }, dimensions: { date: "2026-10-28" } },
          { count: 10, sum: { visits: 4 }, dimensions: { date: "2026-11-02" } },
        ],
        paths: [{ count: 25, dimensions: { requestPath: "/menu" } }],
        referrers: [{ count: 5, dimensions: { refererHost: "" } }],
      },
      7,
      NOW,
    );
    expect(summary.daily.map((day) => day.date)).toEqual([
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
    expect(summary.daily[1]).toEqual({ date: "2026-10-28", pageviews: 20, visits: 8 });
    expect(summary.daily[0]!.pageviews).toBe(0);
    expect(summary.pageviews).toBe(30);
    expect(summary.previousVisits).toBe(4);
    expect(summary.topPaths).toEqual([{ label: "/menu", count: 25 }]);
    expect(summary.referrers[0]!.label).toBe("Langsung / tidak diketahui");
    expect(summary.devices).toEqual([]);
  });

  test("a GraphQL error is surfaced as an error, not as empty data", async () => {
    const fakeFetch = (async () =>
      new Response(JSON.stringify({ data: null, errors: [{ message: "not authorized" }] }))) as unknown as typeof fetch;
    await expect(fetchAnalytics(CONFIG, 7, NOW, fakeFetch)).rejects.toThrow("not authorized");
  });

  test("sends the token as a bearer header", async () => {
    let auth = "";
    const fakeFetch = (async (_url: string, init: RequestInit) => {
      auth = new Headers(init.headers).get("authorization") ?? "";
      return new Response(JSON.stringify({ data: { viewer: { accounts: [{}] } } }));
    }) as unknown as typeof fetch;
    const summary = await fetchAnalytics(CONFIG, 7, NOW, fakeFetch);
    expect(auth).toBe("Bearer t");
    expect(summary.daily).toHaveLength(7);
  });
});
