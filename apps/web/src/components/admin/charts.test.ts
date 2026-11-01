import { describe, expect, test } from "bun:test";

import { axisLabel } from "./charts";

describe("axisLabel", () => {
  test("shows the month only on the first label and when the month changes", () => {
    expect(axisLabel("2026-10-26", undefined)).toBe("26 Okt");
    expect(axisLabel("2026-10-27", "2026-10-26")).toBe("27");
    expect(axisLabel("2026-11-01", "2026-10-31")).toBe("1 Nov");
  });
});
