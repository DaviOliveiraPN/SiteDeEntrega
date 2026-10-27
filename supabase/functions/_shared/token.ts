// Guest access token: a minimal HS256 JWT with payload { page_id, exp }.
// Written by hand on Web Crypto to avoid a dependency for ~40 lines of code.
// Reference: https://datatracker.ietf.org/doc/html/rfc7519

export type AccessTokenPayload = { page_id: string; exp: number };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function importKey(secret: string, usage: "sign" | "verify") {
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not set");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

const HEADER = base64url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));

export async function signAccessToken(
  pageId: string,
  secret: string,
  ttlSeconds = 4 * 60 * 60,
  now = Date.now(),
): Promise<string> {
  const payload: AccessTokenPayload = { page_id: pageId, exp: Math.floor(now / 1000) + ttlSeconds };
  const body = base64url(encoder.encode(JSON.stringify(payload)));
  const data = `${HEADER}.${body}`;
  const sig = await crypto.subtle.sign("HMAC", await importKey(secret, "sign"), encoder.encode(data));
  return `${data}.${base64url(new Uint8Array(sig))}`;
}

// Returns the payload, or null for any invalid/expired token. Callers must not
// distinguish the reasons to the guest.
export async function verifyAccessToken(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<AccessTokenPayload | null> {
  const parts = token.split(".");
  // Only accept our exact header: blocks "alg: none" and algorithm-confusion tricks.
  if (parts.length !== 3 || parts[0] !== HEADER) return null;
  try {
    // crypto.subtle.verify compares in constant time.
    const ok = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret, "verify"),
      fromBase64url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!ok) return null;
    const payload = JSON.parse(decoder.decode(fromBase64url(parts[1])));
    if (typeof payload.page_id !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(now / 1000)) return null;
    return { page_id: payload.page_id, exp: payload.exp };
  } catch {
    return null;
  }
}
