import { describe, it, expect } from "vitest";
import { extractPlaceholders, renderTemplate } from "../shared/templateRender";

describe("templateRender", () => {
  it("extractPlaceholders returns unique keys", () => {
    const tpl = "Hello {{name}} {{name}} - {{date}}";
    const keys = extractPlaceholders(tpl);
    expect(keys.sort()).toEqual(["date", "name"]);
  });

  it("renderTemplate replaces placeholders and reports missing keys", () => {
    const tpl = "Dear {{name}}, your code is {{code}}.";
    const res = renderTemplate(tpl, { name: "Marco" });
    expect(res.output).toBe("Dear Marco, your code is {{code}}.");
    expect(res.missingKeys).toEqual(["code"]);
  });

  it("renderTemplate keeps newlines", () => {
    const tpl = "Line1\nLine2 {{x}}";
    const res = renderTemplate(tpl, { x: "OK" });
    expect(res.output).toBe("Line1\nLine2 OK");
  });
});
