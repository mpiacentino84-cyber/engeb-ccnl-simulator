/**
 * Script di migrazione CCNL tramite API tRPC
 * Esegui con: node scripts/migrate-via-api.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
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

// CCNL data hardcoded from ccnlData.ts with corrected IDs
const ccnlsToMigrate = [
  {
    externalId: "engeb_multisettore",
    name: "ENGEB Multisettore",
    sector: "Multiservizi, Pulizie, Logistica",
    sectorCategory: "multiservizi",
    issuer: "CONFAEL-FAL / CONFIMITALIA / SNALP",
    isENGEB: true,
  },
  {
    externalId: "engeb_turismo",
    name: "ENGEB Turismo e Pubblici Esercizi",
    sector: "Turismo, Alberghi, Ristorazione",
    sectorCategory: "turismo",
    issuer: "CONFAEL-FAL / SNALP",
    isENGEB: true,
  },
  {
    externalId: "engeb_commercio",
    name: "ENGEB Commercio e Distribuzione",
    sector: "Commercio, Distribuzione, Retail",
    sectorCategory: "commercio",
    issuer: "CONFIMITALIA / CONFAEL",
    isENGEB: true,
  },
  {
    externalId: "ebinter_terziario",
    name: "EBINTER Terziario",
    sector: "Terziario, Distribuzione, Servizi",
    sectorCategory: "servizi",
    issuer: "EBINTER",
    isENGEB: false,
  },
  {
    externalId: "engeb_turismo_ospitalita",
    name: "ENGEB Turismo e Ospitalita",
    sector: "Turismo, Ospitalita, Ristorazione",
    sectorCategory: "turismo",
    issuer: "CONFAEL-FAL / SNALP",
    isENGEB: true,
  },
  {
    externalId: "ebil_intersettoriale",
    name: "EBIL Intersettoriale",
    sector: "Intersettoriale MPMI",
    sectorCategory: "servizi",
    issuer: "EBIL / CONFIMPRESE ITALIA / FESICA CONFSAL",
    isENGEB: false,
  },
  {
    externalId: "ccnl_artigianato",
    name: "Artigianato e Piccole Imprese",
    sector: "Artigianato",
    sectorCategory: "artigianato",
    issuer: "CONFIMITALIA",
    isENGEB: false,
  },
  {
    externalId: "engeb_sanita",
    name: "ENGEB Sanita e Assistenza",
    sector: "Sanita, Assistenza Socio-Sanitaria",
    sectorCategory: "sanita",
    issuer: "CONFAEL-FAL / SNALP",
    isENGEB: true,
  },
];

// Create database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);

async function migrateCCNLs() {
  console.log("🚀 Inizio migrazione CCNL base...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const ccnl of ccnlsToMigrate) {
    try {
      console.log(`📝 Migrazione: ${ccnl.name}...`);

      const [result] = await connection.execute(
        `INSERT INTO ccnls (externalId, name, sector, sectorCategory, issuer, validFrom, validTo, description, isENGEB, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, '2023-01-01', '2026-12-31', ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           sector = VALUES(sector),
           sectorCategory = VALUES(sectorCategory),
           issuer = VALUES(issuer),
           isENGEB = VALUES(isENGEB),
           updatedAt = NOW()`,
        [
          ccnl.externalId,
          ccnl.name,
          ccnl.sector,
          ccnl.sectorCategory,
          ccnl.issuer,
          `Contratto ${ccnl.name}`,
          ccnl.isENGEB ? 1 : 0,
        ]
      );

      console.log(`✅ ${ccnl.name} migrato con successo\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Errore durante la migrazione di "${ccnl.name}":`, error.message);
      errorCount++;
    }
  }

  console.log("\n📊 Riepilogo migrazione:");
  console.log(`✅ Successi: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log(`📦 Totale: ${ccnlsToMigrate.length}`);

  if (errorCount === 0) {
    console.log("\n🎉 Migrazione completata con successo!");
  } else {
    console.log("\n⚠️  Migrazione completata con alcuni errori.");
  }

  await connection.end();
  process.exit(errorCount > 0 ? 1 : 0);
}

// Esegui la migrazione
migrateCCNLs().catch((error) => {
  console.error("💥 Errore fatale durante la migrazione:", error);
  process.exit(1);
});
