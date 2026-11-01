import { describe, expect, test } from "bun:test";

import { moveInOrder } from "./reorder";

describe("moveInOrder", () => {
  test("swaps with the neighbour and renumbers everything", () => {
    expect(moveInOrder([5, 9, 2], 2, "up")).toEqual([
      { id: 5, displayOrder: 0 },
      { id: 2, displayOrder: 1 },
      { id: 9, displayOrder: 2 },
    ]);
  });

  test("returns null at the edges or for unknown ids", () => {
    expect(moveInOrder([1, 2], 1, "up")).toBeNull();
    expect(moveInOrder([1, 2], 2, "down")).toBeNull();
    expect(moveInOrder([1, 2], 7, "down")).toBeNull();
  });
});
