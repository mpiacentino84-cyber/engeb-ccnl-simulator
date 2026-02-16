import { execSync } from "child_process";
import { existsSync } from "fs";
import * as db from "./db";

/**
 * Script di inizializzazione database per Railway
 * Può essere chiamato tramite endpoint API o comando CLI
 */

export async function initializeDatabase(): Promise<{
  success: boolean;
  steps: string[];
  errors: string[];
}> {
  const steps: string[] = [];
  const errors: string[] = [];

  try {
    // Step 1: Verifica se il database è già inizializzato
    steps.push("Verifica stato database...");
    const dbInstance = await db.get();
    if (!dbInstance) {
      errors.push("Database non disponibile");
      return { success: false, steps, errors };
    }
    const tablesResult: any = await dbInstance.execute("SHOW TABLES");
    const tables = tablesResult.rows || tablesResult || [];

    if (tables.length > 0) {
      steps.push(`Database già inizializzato con ${tables.length} tabelle`);
      return { success: true, steps, errors };
    }

    // Step 2: Esegui migrazioni Drizzle
    steps.push("Esecuzione migrazioni Drizzle...");
    try {
      execSync("pnpm db:migrate", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      steps.push("✅ Migrazioni completate");
    } catch (error) {
      const errMsg = `Errore migrazioni: ${error}`;
      errors.push(errMsg);
      steps.push(`❌ ${errMsg}`);
    }

    // Step 3: Popola CCNL
    steps.push("Popolamento CCNL...");
    const ccnlScriptPath = `${process.cwd()}/scripts/migrate-all-ccnl.mjs`;
    if (existsSync(ccnlScriptPath)) {
      try {
        execSync(`node ${ccnlScriptPath}`, {
          stdio: "inherit",
          cwd: process.cwd(),
        });
        steps.push("✅ CCNL popolati");
      } catch (error) {
        const errMsg = `Errore popolamento CCNL: ${error}`;
        errors.push(errMsg);
        steps.push(`❌ ${errMsg}`);
      }
    } else {
      steps.push("⚠️ Script CCNL non trovato, skip");
    }

    // Step 4: Popola statistiche mensili
    steps.push("Popolamento statistiche mensili...");
    const statsScriptPath = `${process.cwd()}/scripts/populate-monthly-stats.mjs`;
    if (existsSync(statsScriptPath)) {
      try {
        execSync(`npx tsx ${statsScriptPath}`, {
          stdio: "inherit",
          cwd: process.cwd(),
        });
        steps.push("✅ Statistiche popolate");
      } catch (error) {
        const errMsg = `Errore popolamento statistiche: ${error}`;
        errors.push(errMsg);
        steps.push(`❌ ${errMsg}`);
      }
    } else {
      steps.push("⚠️ Script statistiche non trovato, skip");
    }

    // Step 5: Verifica finale
    steps.push("Verifica finale...");
    const finalTablesResult: any = await dbInstance.execute("SHOW TABLES");
    const finalTables = finalTablesResult.rows || finalTablesResult || [];
    steps.push(`✅ Database inizializzato con ${finalTables.length} tabelle`);

    return {
      success: errors.length === 0,
      steps,
      errors,
    };
  } catch (error) {
    const errMsg = `Errore fatale: ${error}`;
    errors.push(errMsg);
    steps.push(`❌ ${errMsg}`);
    return { success: false, steps, errors };
  }
}

// Esecuzione diretta da CLI (ES modules syntax)
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🚀 Inizializzazione database...\n");
  initializeDatabase()
    .then((result) => {
      console.log("\n📊 Risultato:");
      result.steps.forEach((step) => console.log(`  ${step}`));
      if (result.errors.length > 0) {
        console.log("\n❌ Errori:");
        result.errors.forEach((err) => console.log(`  ${err}`));
        process.exit(1);
      } else {
        console.log("\n✅ Inizializzazione completata con successo!");
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error("❌ Errore fatale:", error);
      process.exit(1);
    });
}
