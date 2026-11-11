import { describe, expect, it } from "vitest";
import { MODULES, moduleStatus } from "./modules";

const m5 = MODULES.find((m) => m.id === "m5")!;
const all = (status: "approved" | "submitted") => m5.questions.map((q) => ({ question_id: q.id, status, answer: "x" }));

describe("module completion", () => {
  it("has six modules", () => expect(MODULES).toHaveLength(6));
  it("is NOT complete when all answers approved but demos not signed off", () => {
    expect(moduleStatus(m5, all("approved"), new Set())).toBe("submitted");
  });
  it("is complete only with approvals and every counselor sign-off", () => {
    expect(moduleStatus(m5, all("approved"), new Set(m5.signoffs.map((s) => s.id)))).toBe("complete");
  });
  it("returned answers flag needs revision", () => {
    const r = all("submitted");
    r[0] = { ...r[0]!,  status: "returned" as never };
    expect(moduleStatus(m5, r as never, new Set())).toBe("needs_revision");
  });
});

