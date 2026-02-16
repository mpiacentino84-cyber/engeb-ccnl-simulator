import { describe, expect, it } from "vitest";
import { extractPlaceholders, renderTemplate } from "@shared/templateRender";

describe("templateRender", () => {
  it("extracts placeholders", () => {
    const keys = extractPlaceholders("Hello {{name}} from {{company}}!");
    expect(keys.sort()).toEqual(["company", "name"]);
  });

  it("renders provided keys and leaves missing placeholders", () => {
    const { output, missingKeys } = renderTemplate(
      "Ciao {{name}}, azienda {{company}} - data {{date}}",
      { name: "Mario", company: "ACME" }
    );
    expect(output).toContain("Ciao Mario");
    expect(output).toContain("azienda ACME");
    expect(output).toContain("{{date}}");
    expect(missingKeys).toEqual(["date"]);
  });
});
