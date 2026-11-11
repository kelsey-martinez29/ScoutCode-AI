import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, generateAccessCode, generateAccountId, normalizeAccountId, normalizeCode } from "./codes";

describe("access codes", () => {
  it("are 16 symbols (not a short PIN) in 4 groups", () => {
    const c = generateAccessCode();
    expect(c).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(normalizeCode(c)).toHaveLength(16);
    expect(16 * Math.log2(CODE_ALPHABET.length)).toBeGreaterThan(75);
  });
  it("are unique across many draws", () => {
    const s = new Set(Array.from({ length: 2000 }, generateAccessCode));
    expect(s.size).toBe(2000);
  });
  it("account ids normalize from sloppy typing", () => {
    const id = generateAccountId();
    expect(normalizeAccountId(id.toLowerCase().replace("-", " "))).toBe(id);
  });
});