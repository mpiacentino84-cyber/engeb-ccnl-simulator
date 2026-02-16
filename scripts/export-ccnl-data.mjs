/**
 * Script per esportare i dati CCNL in formato JSON per la migrazione
 * Esegui con: node scripts/export-ccnl-data.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read CCNL data from TypeScript file
const ccnlDataPath = join(__dirname, "../client/src/lib/ccnlData.ts");
const ccnlDataContent = readFileSync(ccnlDataPath, "utf-8");

// Extract and clean the ccnlDatabase array
const startMarker = "export const ccnlDatabase: CCNL[] = [";
const endMarker = "];";

const startIndex = ccnlDataContent.indexOf(startMarker);
const endIndex = ccnlDataContent.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("❌ Impossibile trovare ccnlDatabase nel file");
  process.exit(1);
}

// Extract the array content
const arrayContent = ccnlDataContent.substring(
  startIndex + startMarker.length,
  endIndex
);

// Create a valid JSON by wrapping in array brackets
const jsonContent = `[${arrayContent}]`;

// Write to temporary JSON file
const outputPath = join(__dirname, "ccnl-data-temp.json");
writeFileSync(outputPath, jsonContent, "utf-8");

console.log(`✅ Dati CCNL esportati in: ${outputPath}`);
console.log(`📦 File pronto per la migrazione`);
