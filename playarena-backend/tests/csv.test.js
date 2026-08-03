import { describe, it, expect } from "vitest";
import { toCSV } from "../src/utils/csv.js";

describe("toCSV", () => {
  it("writes header row and data rows", () => {
    const out = toCSV(["a", "b"], [{ a: 1, b: "x" }, { a: 2, b: "y" }]);
    expect(out).toBe("a,b\r\n1,x\r\n2,y\r\n");
  });

  it("quotes fields containing commas", () => {
    const out = toCSV(["name"], [{ name: "Doe, John" }]);
    expect(out).toBe('name\r\n"Doe, John"\r\n');
  });

  it("quotes fields containing double quotes by doubling them", () => {
    const out = toCSV(["note"], [{ note: 'say "hi"' }]);
    expect(out).toBe('note\r\n"say ""hi"""\r\n');
  });

  it("quotes fields containing newlines", () => {
    const out = toCSV(["note"], [{ note: "line1\nline2" }]);
    expect(out).toBe('note\r\n"line1\nline2"\r\n');
  });

  it("serializes null/undefined as empty string", () => {
    const out = toCSV(["a", "b"], [{ a: null, b: undefined }]);
    expect(out).toBe("a,b\r\n,\r\n");
  });

  it("handles empty rows", () => {
    const out = toCSV(["a", "b"], []);
    expect(out).toBe("a,b\r\n");
  });
});
