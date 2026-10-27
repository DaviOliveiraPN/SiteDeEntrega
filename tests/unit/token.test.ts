import { describe, expect, it } from "vitest";
import { signAccessToken, verifyAccessToken } from "../../supabase/functions/_shared/token.ts";

const SECRET = "test-secret";
const PAGE = "6f1c2a52-0000-4000-8000-000000000001";

describe("access token", () => {
  it("round-trips page_id", async () => {
    const token = await signAccessToken(PAGE, SECRET);
    expect((await verifyAccessToken(token, SECRET))?.page_id).toBe(PAGE);
  });

  it("rejects an expired token", async () => {
    const now = Date.now();
    const token = await signAccessToken(PAGE, SECRET, 60, now);
    expect(await verifyAccessToken(token, SECRET, now + 59_000)).not.toBeNull();
    expect(await verifyAccessToken(token, SECRET, now + 60_000)).toBeNull();
  });

  it("rejects a different secret", async () => {
    const token = await signAccessToken(PAGE, SECRET);
    expect(await verifyAccessToken(token, "other")).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const [h, , s] = (await signAccessToken(PAGE, SECRET)).split(".");
    const forged = btoa(JSON.stringify({ page_id: "other-page", exp: 9999999999 }))
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    expect(await verifyAccessToken(`${h}.${forged}.${s}`, SECRET)).toBeNull();
  });

  it('rejects "alg: none" and garbage', async () => {
    const [, p] = (await signAccessToken(PAGE, SECRET)).split(".");
    const none = btoa(JSON.stringify({ alg: "none", typ: "JWT" })).replace(/=+$/, "");
    expect(await verifyAccessToken(`${none}.${p}.`, SECRET)).toBeNull();
    expect(await verifyAccessToken("not-a-token", SECRET)).toBeNull();
    expect(await verifyAccessToken("a.b.c", SECRET)).toBeNull();
  });
});
