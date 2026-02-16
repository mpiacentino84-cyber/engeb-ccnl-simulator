/**
 * Script di migrazione per popolare il database con i 22 CCNL esistenti
 * Esegui con: node scripts/migrate-ccnl-data.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL non trovato nelle variabili d'ambiente");
  process.exit(1);
}

// Read CCNL data from TypeScript file
const ccnlDataPath = join(__dirname, "../client/src/lib/ccnlData.ts");
const ccnlDataContent = readFileSync(ccnlDataPath, "utf-8");

// Extract ccnlDatabase array from the file (simplified parsing)
const ccnlDatabaseMatch = ccnlDataContent.match(/export const ccnlDatabase[\s\S]*?=([\s\S]*?);\s*\/\//);
if (!ccnlDatabaseMatch) {
  console.error("❌ Impossibile estrarre ccnlDatabase dal file");
  process.exit(1);
}

// Create database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Parse CCNL data (simplified - assumes valid structure)
const ccnlDatabase = eval(`(${ccnlDatabaseMatch[1]})`);

async function migrateCCNLData() {
  console.log("🚀 Inizio migrazione dati CCNL...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const ccnl of ccnlDatabase) {
    try {
      console.log(`📝 Migrazione CCNL: ${ccnl.name}...`);

      // Insert CCNL
      const [ccnlResult] = await db.execute(
        `INSERT INTO ccnls (externalId, name, sector, sectorCategory, issuer, validFrom, validTo, description, isENGEB, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          ccnl.id,
          ccnl.name,
          ccnl.sector,
          ccnl.sectorCategory,
          ccnl.issuer,
          ccnl.validFrom,
          ccnl.validTo,
          ccnl.description || null,
          ccnl.issuer === "ENGEB" ? 1 : 0,
        ]
      );

      const ccnlId = ccnlResult.insertId;

      // Insert levels
      for (const level of ccnl.levels) {
        await db.execute(
          `INSERT INTO ccnl_levels (ccnlId, level, description, baseSalaryMonthly, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [
            ccnlId,
            level.level,
            level.description,
            level.baseSalaryMonthly.toString(),
          ]
        );
      }

      // Insert additional costs
      await db.execute(
        `INSERT INTO ccnl_additional_costs (ccnlId, tfr, socialContributions, otherBenefits, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          ccnlId,
          ccnl.additionalCosts.tfr.toString(),
          ccnl.additionalCosts.socialContributions.toString(),
          ccnl.additionalCosts.otherBenefits.toString(),
        ]
      );

      // Insert contributions
      for (const contribution of ccnl.contributions) {
        await db.execute(
          `INSERT INTO ccnl_contributions (ccnlId, name, description, percentage, amount, isPercentage, category, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            ccnlId,
            contribution.name,
            contribution.description || null,
            contribution.percentage.toString(),
            contribution.amount.toString(),
            contribution.isPercentage ? 1 : 0,
            contribution.category,
          ]
        );
      }

      console.log(`✅ CCNL "${ccnl.name}" migrato con successo (ID: ${ccnlId})\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Errore durante la migrazione di "${ccnl.name}":`, error.message);
      errorCount++;
    }
  }

  console.log("\n📊 Riepilogo migrazione:");
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📦 Totale: ${ccnlDatabase.length}`);

  if (errorCount === 0) {
    console.log("\n🎉 Migrazione completata con successo!");
  } else {
    console.log("\n⚠️  Migrazione completata con alcuni errori.");
  }

  await connection.end();
  process.exit(errorCount > 0 ? 1 : 0);
}

// Esegui la migrazione
migrateCCNLData().catch((error) => {
  console.error("💥 Errore fatale durante la migrazione:", error);
  process.exit(1);
});
