import { getDb } from '../server/db.ts';
import { ccnls, ccnlLevels, ccnlAdditionalCosts, ccnlContributions } from '../drizzle/schema.ts';
import { eq, isNull } from 'drizzle-orm';

console.log('🚀 Inizio popolamento livelli, costi e contributi di default per CCNL importati...\n');

// Verifica connessione database
const db = await getDb();
if (!db) {
  console.error('❌ Impossibile connettersi al database');
  process.exit(1);
}

try {
  await db.select().from(ccnls).limit(1);
  console.log('✅ Connessione database OK\n');
} catch (error) {
  console.error('❌ Errore connessione database:', error.message);
  process.exit(1);
}

// Stipendi base medi per settore (fonte: ISTAT 2024, valori mensili lordi)
const SECTOR_BASE_SALARIES = {
  'AGRICOLTURA': 1200,
  'ARTIGIANATO': 1400,
  'CHIMICI': 1800,
  'COMMERCIO': 1500,
  'CREDITO E ASSICURAZIONI': 2200,
  'EDILIZIA': 1600,
  'INDUSTRIA': 1700,
  'SANITA': 1900,
  'TERZIARIO E SERVIZI': 1500,
  'TRASPORTI': 1650,
  'TURISMO': 1350,
  'CCNL PLURISETTORIALI, MICROSETTORIALI E ALTRI': 1500,
  'AMMINISTRAZIONE PUBBLICA': 1800,
  'Vari': 1500,
};

// Livelli professionali standard (5 livelli per ogni CCNL)
const STANDARD_LEVELS = [
  { level: '1', description: 'Operaio/Impiegato Base', multiplier: 1.0 },
  { level: '2', description: 'Operaio/Impiegato Specializzato', multiplier: 1.15 },
  { level: '3', description: 'Impiegato Qualificato', multiplier: 1.35 },
  { level: '4', description: 'Quadro', multiplier: 1.65 },
  { level: '5', description: 'Dirigente', multiplier: 2.2 },
];

// Costi aggiuntivi standard (percentuali)
const STANDARD_ADDITIONAL_COSTS = {
  tfr: '8.33', // TFR standard
  socialContributions: '30.00', // Contributi sociali medi
  otherBenefits: '2.00', // Altri benefici
};

// Contributi bilaterali standard
const STANDARD_CONTRIBUTIONS = [
  {
    name: 'Formazione Professionale',
    description: 'Contributo per formazione continua dei lavoratori',
    percentage: '0.30',
    amount: '0',
    isPercentage: true,
    category: 'bilateral',
    type: 'percentage',
  },
  {
    name: 'Assistenza Sanitaria Integrativa',
    description: 'Fondo sanitario integrativo',
    percentage: '0',
    amount: '15',
    isPercentage: false,
    category: 'health',
    type: 'fixed',
  },
];

// Trova tutti i CCNL senza livelli
const ccnlsWithoutLevels = await db
  .select()
  .from(ccnls)
  .where(eq(ccnls.isCustom, 0)); // Solo CCNL predefiniti (non personalizzati)

console.log(`📋 Trovati ${ccnlsWithoutLevels.length} CCNL nel database\n`);

let processedCount = 0;
let skippedCount = 0;
let errorCount = 0;

for (const ccnl of ccnlsWithoutLevels) {
  try {
    // Controlla se il CCNL ha già livelli
    const existingLevels = await db
      .select()
      .from(ccnlLevels)
      .where(eq(ccnlLevels.ccnlId, ccnl.id))
      .limit(1);

    if (existingLevels.length > 0) {
      console.log(`⏭️  Skip: ${ccnl.name} (già ha livelli)`);
      skippedCount++;
      continue;
    }

    // Determina stipendio base per settore
    const baseSalary = SECTOR_BASE_SALARIES[ccnl.macroSettoreCnel || 'Vari'] || 1500;

    // Inserisci livelli professionali
    for (const level of STANDARD_LEVELS) {
      const levelSalary = Math.round(baseSalary * level.multiplier);
      await db.insert(ccnlLevels).values({
        ccnlId: ccnl.id,
        level: level.level,
        description: level.description,
        baseSalaryMonthly: levelSalary.toString(),
      });
    }

    // Inserisci costi aggiuntivi
    const existingCosts = await db
      .select()
      .from(ccnlAdditionalCosts)
      .where(eq(ccnlAdditionalCosts.ccnlId, ccnl.id))
      .limit(1);

    if (existingCosts.length === 0) {
      await db.insert(ccnlAdditionalCosts).values({
        ccnlId: ccnl.id,
        tfr: STANDARD_ADDITIONAL_COSTS.tfr,
        socialContributions: STANDARD_ADDITIONAL_COSTS.socialContributions,
        otherBenefits: STANDARD_ADDITIONAL_COSTS.otherBenefits,
      });
    }

    // Inserisci contributi bilaterali
    const existingContributions = await db
      .select()
      .from(ccnlContributions)
      .where(eq(ccnlContributions.ccnlId, ccnl.id))
      .limit(1);

    if (existingContributions.length === 0) {
      for (const contrib of STANDARD_CONTRIBUTIONS) {
        await db.insert(ccnlContributions).values({
          ccnlId: ccnl.id,
          name: contrib.name,
          description: contrib.description,
          percentage: contrib.percentage,
          amount: contrib.amount,
          isPercentage: contrib.isPercentage ? 1 : 0,
          category: contrib.category,
          type: contrib.type,
        });
      }
    }

    console.log(`✅ Popolato: ${ccnl.name} (${ccnl.macroSettoreCnel || 'Vari'})`);
    processedCount++;

  } catch (error) {
    console.error(`❌ Errore processando ${ccnl.name}:`, error.message);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RIEPILOGO POPOLAMENTO');
console.log('='.repeat(60));
console.log(`✅ Processati: ${processedCount}`);
console.log(`⏭️  Saltati (già esistenti): ${skippedCount}`);
console.log(`❌ Errori: ${errorCount}`);
console.log(`📋 Totale CCNL: ${ccnlsWithoutLevels.length}`);
console.log('='.repeat(60));
console.log('✨ Popolamento completato!');

process.exit(0);
