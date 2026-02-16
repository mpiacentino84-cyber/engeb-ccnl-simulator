/**
 * Script di migrazione semplificato per popolare il database con i CCNL
 * Esegui con: node scripts/migrate-simple.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL non trovato nelle variabili d'ambiente");
  process.exit(1);
}

// Simplified CCNL data for migration (first 3 as example)
const ccnlData = [
  {
    id: "engeb_multisettore",
    name: "ENGEB Multisettore",
    sector: "Multiservizi, Pulizie, Logistica",
    sectorCategory: "multiservizi",
    issuer: "ENGEB",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    description: "Contratto collettivo per il settore multiservizi",
    isENGEB: true,
    levels: [
      { level: "Livello 1", description: "Operaio generico", baseSalaryMonthly: 1450 },
      { level: "Livello 2", description: "Operaio qualificato", baseSalaryMonthly: 1650 },
    ],
    additionalCosts: {
      tfr: 8.33,
      socialContributions: 30.0,
      otherBenefits: 2.0,
    },
    contributions: [
      {
        name: "Contributo ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Cassa per l'Assistenza e Previdenza Complementare",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "pension",
      },
    ],
  },
];

async function migrateCCNLData() {
  console.log("🚀 Inizio migrazione dati CCNL...\n");

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  let successCount = 0;
  let errorCount = 0;

  for (const ccnl of ccnlData) {
    try {
      console.log(`📝 Migrazione CCNL: ${ccnl.name}...`);

      // Insert CCNL
      const [ccnlResult] = await connection.execute(
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
          ccnl.isENGEB ? 1 : 0,
        ]
      );

      const ccnlId = ccnlResult.insertId;

      // Insert levels
      for (const level of ccnl.levels) {
        await connection.execute(
          `INSERT INTO ccnl_levels (ccnlId, level, description, baseSalaryMonthly, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [ccnlId, level.level, level.description, level.baseSalaryMonthly.toString()]
        );
      }

      // Insert additional costs
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

      // Insert contributions
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

      console.log(`✅ CCNL "${ccnl.name}" migrato con successo (ID: ${ccnlId})\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Errore durante la migrazione di "${ccnl.name}":`, error.message);
      errorCount++;
    }
  }

  await connection.end();

  console.log("\n📊 Riepilogo migrazione:");
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📦 Totale: ${ccnlData.length}`);

  if (errorCount === 0) {
    console.log("\n🎉 Migrazione completata con successo!");
  } else {
    console.log("\n⚠️  Migrazione completata con alcuni errori.");
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

// Esegui la migrazione
migrateCCNLData().catch((error) => {
  console.error("💥 Errore fatale durante la migrazione:", error);
  process.exit(1);
});
