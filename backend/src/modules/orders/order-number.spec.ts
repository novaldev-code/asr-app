import { describe, expect, it } from "vitest";
import { formatOrderNumber } from "./order-number.js";

describe("formatOrderNumber", () => {
  it("formats the sequence and date with padding", () => {
    expect(formatOrderNumber(7, new Date(2026, 0, 5))).toBe("ORD-20260105-0007");
  });

  it("keeps numbers above four digits intact", () => {
    expect(formatOrderNumber(12345, new Date(2026, 10, 13))).toBe(
      "ORD-20261113-12345",
    );
  });
});
