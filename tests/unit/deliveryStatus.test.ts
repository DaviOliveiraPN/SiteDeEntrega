import { describe, expect, it } from "vitest";
import { deliveryStatus, formatBytes, formatDateOnly, slugify, sortDeliveries } from "../../src/lib/deliveryStatus.ts";

const NOW = Date.UTC(2026, 9, 10);
const future = new Date(NOW + 86_400_000).toISOString();
const past = new Date(NOW - 1).toISOString();

describe("deliveryStatus", () => {
  it("maps published/draft/expired", () => {
    expect(deliveryStatus({ status: "published", expires_at: future }, NOW)).toBe("ativa");
    expect(deliveryStatus({ status: "draft", expires_at: future }, NOW)).toBe("espera");
    expect(deliveryStatus({ status: "published", expires_at: past }, NOW)).toBe("inativa");
    expect(deliveryStatus({ status: "draft", expires_at: past }, NOW)).toBe("inativa");
  });
});

describe("sortDeliveries", () => {
  it("puts active first, then waiting, then inactive, by name inside each group", () => {
    const pages = [
      { client_name: "Zeca", status: "published" as const, expires_at: past },
      { client_name: "bruna", status: "draft" as const, expires_at: future },
      { client_name: "Ângela", status: "published" as const, expires_at: future },
      { client_name: "Carlos", status: "published" as const, expires_at: future },
      { client_name: "Ana", status: "draft" as const, expires_at: future },
    ];
    expect(sortDeliveries(pages, NOW).map((p) => p.client_name)).toEqual(["Ângela", "Carlos", "Ana", "bruna", "Zeca"]);
  });
});

describe("formatters", () => {
  it("formats bytes and dates in pt-BR", () => {
    expect(formatBytes(1_500_000)).toBe("1,4 MB");
    expect(formatBytes(3 * 1024 ** 3)).toBe("3,00 GB");
    expect(formatDateOnly("2026-09-12")).toBe("12/09/2026");
    expect(formatDateOnly(null)).toBe("—");
  });

  it("slugifies names with accents and symbols", () => {
    expect(slugify("Casamento Ana & Bruno")).toBe("casamento-ana-bruno");
    expect(slugify("  15 anos da Júlia!! ")).toBe("15-anos-da-julia");
  });
});
