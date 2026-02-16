/**
 * Script di migrazione completo per tutti i CCNL
 * Esegui con: node scripts/migrate-all-ccnl.mjs
 */

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

// Load exported CCNL data
const ccnlDataPath = join(__dirname, "ccnl-data-export.json");
const ccnlDatabase = JSON.parse(readFileSync(ccnlDataPath, "utf-8"));

console.log(`📦 Caricati ${ccnlDatabase.length} CCNL dal file di esportazione\n`);

// Create database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);

async function migrateCCNLData() {
  console.log("🚀 Inizio migrazione completa CCNL...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const ccnl of ccnlDatabase) {
    try {
      console.log(`📝 Migrazione CCNL: ${ccnl.name}...`);

      // Determine if ENGEB based on issuer
      const isENGEB = ccnl.issuer.includes("CONFAEL") || ccnl.issuer.includes("SNALP") || ccnl.issuer === "ENGEB" ? 1 : 0;

      // Insert or update CCNL
      const [ccnlResult] = await connection.execute(
        `INSERT INTO ccnls (externalId, name, sector, sectorCategory, issuer, validFrom, validTo, description, isENGEB, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           sector = VALUES(sector),
           sectorCategory = VALUES(sectorCategory),
           issuer = VALUES(issuer),
           validFrom = VALUES(validFrom),
           validTo = VALUES(validTo),
           description = VALUES(description),
           isENGEB = VALUES(isENGEB),
           updatedAt = NOW()`,
        [
          ccnl.id,
          ccnl.name,
          ccnl.sector,
          ccnl.sectorCategory,
          ccnl.issuer,
          ccnl.validFrom,
          ccnl.validTo,
          ccnl.description || null,
          isENGEB,
        ]
      );

      // Get CCNL ID (either newly inserted or existing)
      let ccnlId;
      if (ccnlResult.insertId) {
        ccnlId = ccnlResult.insertId;
      } else {
        // If it was an update, fetch the existing ID
        const [rows] = await connection.execute(
          `SELECT id FROM ccnls WHERE externalId = ?`,
          [ccnl.id]
        );
        ccnlId = rows[0].id;
      }

      // Delete existing related data to avoid duplicates
      await connection.execute(`DELETE FROM ccnl_levels WHERE ccnlId = ?`, [ccnlId]);
      await connection.execute(`DELETE FROM ccnl_additional_costs WHERE ccnlId = ?`, [ccnlId]);
      await connection.execute(`DELETE FROM ccnl_contributions WHERE ccnlId = ?`, [ccnlId]);

      // Insert levels
      if (ccnl.levels && ccnl.levels.length > 0) {
        for (const level of ccnl.levels) {
          await connection.execute(
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
        console.log(`   ✓ Inseriti ${ccnl.levels.length} livelli professionali`);
      }

      // Insert additional costs
      if (ccnl.additionalCosts) {
        await connection.execute(
          `INSERT INTO ccnl_additional_costs (ccnlId, tfr, socialContributions, otherBenefits, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [
            ccnlId,
            ccnl.additionalCosts.tfr.toString(),
            ccnl.additionalCosts.socialContributions.toString(),
            ccnl.additionalCosts.otherBenefits.toString(),
          ]
        );
        console.log(`   ✓ Inseriti costi aggiuntivi (TFR, contributi sociali, altri benefici)`);
      }

      // Insert contributions
      if (ccnl.contributions && ccnl.contributions.length > 0) {
        for (const contribution of ccnl.contributions) {
          await connection.execute(
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
        console.log(`   ✓ Inseriti ${ccnl.contributions.length} contributi specifici`);
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
