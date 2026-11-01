import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { WEEK, WeekStrip, makassarWeekdayIndex } from "./week-strip";

describe("WeekStrip", () => {
  test("shows seven days with Monday off and Sunday at CFD", () => {
    const html = renderToStaticMarkup(<WeekStrip />);
    expect(html.match(/data-day=/g)?.length).toBe(7);
    expect(html).toContain("Libur");
    expect(html).toContain("CFD");
  });

  test("starts on Monday", () => {
    expect(WEEK[0]?.short).toBe("Sen");
    expect(WEEK[6]?.short).toBe("Min");
  });
});

describe("makassarWeekdayIndex", () => {
  test("uses Makassar time, not the server's", () => {
    // 2026-11-01 17:30 UTC = Senin 2 Nov 01.30 WITA.
    expect(makassarWeekdayIndex(new Date("2026-11-01T17:30:00Z"))).toBe(0);
    // 2026-11-01 10:00 UTC = Minggu 1 Nov 18.00 WITA.
    expect(makassarWeekdayIndex(new Date("2026-11-01T10:00:00Z"))).toBe(6);
  });
});

describe("WeekStrip hours", () => {
  test("each selling day shows its hours", () => {
    const html = renderToStaticMarkup(<WeekStrip liveHours="10:30 – 14:30" cfdHours="06.00 – 10.00" />);
    expect(html.match(/10:30 – 14:30/g)?.length).toBe(5);
    expect(html).toContain("06.00 – 10.00");
  });
});
