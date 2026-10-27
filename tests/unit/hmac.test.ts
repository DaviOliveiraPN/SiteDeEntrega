import { describe, expect, it } from "vitest";
import { accessCodeLookup, hmacSha256, toHex } from "../../supabase/functions/_shared/hmac.ts";

describe("hmacSha256", () => {
  it("matches RFC 4231 test case 2", async () => {
    const mac = await hmacSha256("Jefe", "what do ya want for nothing?");
    expect(toHex(mac)).toBe("5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843");
  });
});

describe("accessCodeLookup", () => {
  it("is deterministic and ignores formatting", async () => {
    const a = await accessCodeLookup("ABCDE-FGHJK", "secret");
    const b = await accessCodeLookup("abcdefghjk", "secret");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("depends on the secret", async () => {
    expect(await accessCodeLookup("ABCDEFGHJK", "s1")).not.toBe(await accessCodeLookup("ABCDEFGHJK", "s2"));
  });

  it("refuses an empty secret", async () => {
    await expect(accessCodeLookup("ABCDEFGHJK", "")).rejects.toThrow();
  });
});
