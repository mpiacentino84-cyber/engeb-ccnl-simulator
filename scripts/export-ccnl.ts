/**
 * Script per esportare i dati CCNL in formato JSON
 * Esegui con: tsx scripts/export-ccnl.ts
 */

import { ccnlDatabase } from "../client/src/lib/ccnlData";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, "ccnl-data-export.json");

// Export CCNL data to JSON
writeFileSync(outputPath, JSON.stringify(ccnlDatabase, null, 2), "utf-8");

console.log(`✅ Esportati ${ccnlDatabase.length} CCNL in: ${outputPath}`);
console.log(`📦 File pronto per la migrazione`);
