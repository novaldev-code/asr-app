import { describe, expect, it } from "vitest";
import { buildUniqueSlug, slugify } from "./slug.js";

describe("slugify", () => {
  it("normalizes accents, spaces, and symbols", () => {
    expect(slugify("  Kopi Susu Gula Aren! ")).toBe("kopi-susu-gula-aren");
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });

  it("collapses repeated separators", () => {
    expect(slugify("Arabika -- Gayo___Premium")).toBe("arabika-gayo-premium");
  });
});

describe("buildUniqueSlug", () => {
  it("returns the base when unused", () => {
    expect(buildUniqueSlug("Arabika Gayo", [])).toBe("arabika-gayo");
  });

  it("appends an incrementing suffix", () => {
    expect(
      buildUniqueSlug("Arabika Gayo", [
        "arabika-gayo",
        "arabika-gayo-2",
        "arabika-gayo-3",
      ]),
    ).toBe("arabika-gayo-4");
  });

  it("falls back to item for empty input", () => {
    expect(buildUniqueSlug("!!!", [])).toBe("item");
  });
});
