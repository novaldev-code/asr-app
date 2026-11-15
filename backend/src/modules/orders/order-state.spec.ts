import { describe, expect, it } from "vitest";
import {
  canSubmitProof,
  canTransition,
  canVerifyPayment,
  isExpired,
  type OrderState,
} from "./order-state.js";

const base: OrderState = {
  status: "pending",
  paymentMethod: "bank_transfer",
  paymentStatus: "unpaid",
};

describe("canTransition", () => {
  it("lets customers cancel a pending order", () => {
    expect(canTransition(base, "cancelled", "customer")).toEqual({ ok: true });
  });

  it("blocks customers from cancelling a processing order", () => {
    const result = canTransition(
      { ...base, status: "processing" },
      "cancelled",
      "customer",
    );
    expect(result.ok).toBe(false);
  });

  it("requires paid bank transfers before processing", () => {
    const result = canTransition(base, "processing", "admin");
    expect(result.ok).toBe(false);
  });

  it("allows processing paid bank transfers", () => {
    const result = canTransition(
      { ...base, paymentStatus: "paid" },
      "processing",
      "admin",
    );
    expect(result).toEqual({ ok: true });
  });

  it("allows COD processing without payment", () => {
    const result = canTransition(
      { ...base, paymentMethod: "cod" },
      "processing",
      "admin",
    );
    expect(result).toEqual({ ok: true });
  });

  it("enforces the shipped then completed path", () => {
    expect(canTransition({ ...base, status: "processing" }, "shipped", "admin")).toEqual({
      ok: true,
    });
    expect(canTransition({ ...base, status: "shipped" }, "completed", "admin")).toEqual({
      ok: true,
    });
    expect(canTransition({ ...base, status: "processing" }, "completed", "admin").ok).toBe(
      false,
    );
  });

  it("never changes final statuses", () => {
    expect(
      canTransition({ ...base, status: "cancelled" }, "processing", "admin").ok,
    ).toBe(false);
    expect(
      canTransition({ ...base, status: "completed" }, "cancelled", "admin").ok,
    ).toBe(false);
  });
});

describe("payment helpers", () => {
  it("accepts proof only for unpaid or rejected transfers", () => {
    expect(canSubmitProof(base)).toBe(true);
    expect(canSubmitProof({ ...base, paymentStatus: "rejected" })).toBe(true);
    expect(canSubmitProof({ ...base, paymentStatus: "waiting_verification" })).toBe(
      false,
    );
    expect(canSubmitProof({ ...base, paymentMethod: "cod" })).toBe(false);
    expect(canSubmitProof({ ...base, status: "cancelled" })).toBe(false);
  });

  it("verifies only waiting transfers", () => {
    expect(canVerifyPayment({ ...base, paymentStatus: "waiting_verification" })).toBe(
      true,
    );
    expect(canVerifyPayment(base)).toBe(false);
    expect(
      canVerifyPayment({
        ...base,
        paymentStatus: "waiting_verification",
        status: "cancelled",
      }),
    ).toBe(false);
  });
});

describe("isExpired", () => {
  const now = new Date("2026-11-13T12:00:00.000Z");

  it("expires overdue unpaid bank transfers", () => {
    expect(
      isExpired(
        { ...base, expiresAt: new Date("2026-11-13T11:59:59.000Z") },
        now,
      ),
    ).toBe(true);
  });

  it("ignores future deadlines, COD, and waiting verification", () => {
    expect(
      isExpired({ ...base, expiresAt: new Date("2026-11-13T12:00:01.000Z") }, now),
    ).toBe(false);
    expect(
      isExpired(
        {
          ...base,
          paymentMethod: "cod",
          expiresAt: new Date("2026-11-13T11:00:00.000Z"),
        },
        now,
      ),
    ).toBe(false);
    expect(
      isExpired(
        {
          ...base,
          paymentStatus: "waiting_verification",
          expiresAt: new Date("2026-11-13T11:00:00.000Z"),
        },
        now,
      ),
    ).toBe(false);
  });
});
