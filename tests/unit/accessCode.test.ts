import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  formatAccessCode,
  generateAccessCode,
  normalizeAccessCode,
} from "../../supabase/functions/_shared/accessCode.ts";

describe("generateAccessCode", () => {
  it("has the configured length (>= 10) and only allowed characters", () => {
    expect(CODE_LENGTH).toBeGreaterThanOrEqual(10);
    for (let i = 0; i < 200; i++) {
      const code = generateAccessCode();
      expect(code).toHaveLength(CODE_LENGTH);
      expect(code).toMatch(new RegExp(`^[${CODE_ALPHABET}]+$`));
    }
  });

  it("never uses ambiguous characters", () => {
    expect(CODE_ALPHABET).not.toMatch(/[0O1lI]/);
  });

  it("does not repeat codes", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateAccessCode()));
    expect(codes.size).toBe(1000);
  });
});

describe("normalizeAccessCode / formatAccessCode", () => {
  it("accepts what a guest might type", () => {
    expect(normalizeAccessCode(" abcde-fghjk ")).toBe("ABCDEFGHJK");
  });

  it("round-trips the display format", () => {
    const code = generateAccessCode();
    expect(normalizeAccessCode(formatAccessCode(code))).toBe(code);
    expect(formatAccessCode("ABCDEFGHJK")).toBe("ABCDE-FGHJK");
  });
});
