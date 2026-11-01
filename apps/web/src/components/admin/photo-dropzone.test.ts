import { describe, expect, test } from "bun:test";
import { pickDroppedFile } from "./photo-dropzone";

const file = new File(["x"], "a.jpg", { type: "image/jpeg" });

describe("pickDroppedFile", () => {
  test("takes the first dropped file", () => {
    expect(pickDroppedFile([file], false)).toBe(file);
  });

  test("ignores a drop while another photo is still uploading", () => {
    expect(pickDroppedFile([file], true)).toBeNull();
  });

  test("ignores an empty drop", () => {
    expect(pickDroppedFile([], false)).toBeNull();
  });
});
