/**
 * Very small, dependency-free template renderer.
 *
 * Placeholders format: {{key}}
 *
 * - Unknown placeholders remain untouched.
 * - Values are converted to strings.
 */

export type RenderResult = {
  output: string;
  missingKeys: string[];
};

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function extractPlaceholders(template: string): string[] {
  const keys = new Set<string>();
  template.replace(PLACEHOLDER_RE, (_m, key: string) => {
    keys.add(key);
    return _m;
  });
  return Array.from(keys);
}

export function renderTemplate(
  template: string,
  data: Record<string, unknown>
): RenderResult {
  const missing = new Set<string>();

  const output = template.replace(PLACEHOLDER_RE, (m, key: string) => {
    const value = data[key];
    if (value === undefined || value === null || value === "") {
      missing.add(key);
      return m;
    }
    return String(value);
  });

  return {
    output,
    missingKeys: Array.from(missing),
  };
}
