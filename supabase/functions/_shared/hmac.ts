import { normalizeAccessCode } from "./accessCode.ts";

const encoder = new TextEncoder();

export async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Value stored in pages.access_code_lookup. Deterministic (so the page can be found
// from the code alone) but useless without ACCESS_CODE_SECRET.
export async function accessCodeLookup(code: string, secret: string): Promise<string> {
  if (!secret) throw new Error("ACCESS_CODE_SECRET is not set");
  return toHex(await hmacSha256(secret, normalizeAccessCode(code)));
}
