// Unambiguous alphabet (no 0/O, 1/I/L) so Scouts can read codes off a printed card.
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomChars(n: number): string {
  const out: string[] = [];
  const buf = new Uint32Array(n * 2);
  while (out.length < n) {
    crypto.getRandomValues(buf);
    for (const v of buf) {
      // rejection sampling to avoid modulo bias
      const limit = Math.floor(0xffffffff / CODE_ALPHABET.length) * CODE_ALPHABET.length;
      if (v < limit) out.push(CODE_ALPHABET.charAt(v % CODE_ALPHABET.length));
      if (out.length === n) break;
    }
  }
  return out.join("");
}

/** 16 random symbols from a 31-symbol alphabet ≈ 79 bits of entropy. */
export function generateAccessCode(): string {
  const raw = randomChars(16);
  return raw.match(/.{4}/g)!.join("-");
}

export function generateAccountId(): string {
  return `T99-${randomChars(6)}`;
}

export function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizeAccountId(id: string): string {
  const s = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.startsWith("T99") ? `T99-${s.slice(3)}` : s;
}

/** Synthetic, undeliverable login identity. Never shown to anyone and never emailed. */
export function scoutAuthEmail(accountId: string): string {
  return `${normalizeAccountId(accountId).toLowerCase()}@scouts.troop99.invalid`;
}

export const RATE_LIMIT = { windowMinutes: 15, maxFailuresPerAccount: 5, maxFailuresGlobalPerMinute: 30 };

