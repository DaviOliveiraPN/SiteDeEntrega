// Access codes: generated with a CSPRNG, no ambiguous characters (0/O, 1/l/I).
// Only uppercase is used, so guests can type it in any case.
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 10;

export function generateAccessCode(length = CODE_LENGTH): string {
  // Rejection sampling: discard bytes >= the largest multiple of the alphabet size,
  // otherwise `byte % size` would favor the first characters (modulo bias).
  const size = CODE_ALPHABET.length;
  const limit = 256 - (256 % size);
  let code = "";
  while (code.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of bytes) {
      if (b < limit && code.length < length) code += CODE_ALPHABET[b % size];
    }
  }
  return code;
}

// What the guest types may contain spaces, dashes or lowercase letters.
export function normalizeAccessCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Display format for the invite: "ABCDE-FGHJK".
export function formatAccessCode(code: string): string {
  return code.match(/.{1,5}/g)?.join("-") ?? code;
}
