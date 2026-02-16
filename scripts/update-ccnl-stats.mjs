/**
 * Script per aggiornare i CCNL con dati statistici simulati realistici
 * Basato su statistiche reali dei settori italiani
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ccnls } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Dati statistici simulati realistici basati su settori italiani
// Fonte: elaborazione da dati ISTAT, INPS, rapporti sindacali
const ccnlStats = {
  // CCNL ENGEB
  'engeb_multisettore': { lavoratori: 45000, aziende: 3200 },
  'engeb_turismo_ospitalita': { lavoratori: 28000, aziende: 1800 },
  'engeb_commercio': { lavoratori: 52000, aziende: 4100 },
  'engeb_servizi': { lavoratori: 38000, aziende: 2900 },
  'engeb_artigianato': { lavoratori: 31000, aziende: 2400 },
  'engeb_industria': { lavoratori: 42000, aziende: 1600 },
  'engeb_agricoltura': { lavoratori: 19000, aziende: 1200 },
  'engeb_trasporti': { lavoratori: 24000, aziende: 950 },
  'engeb_edilizia': { lavoratori: 35000, aziende: 2100 },
  'engeb_sanita': { lavoratori: 16000, aziende: 680 },
  'engeb_istruzione': { lavoratori: 12000, aziende: 520 },
  'engeb_cultura': { lavoratori: 8500, aziende: 420 },
  'engeb_sport': { lavoratori: 6200, aziende: 310 },
  'engeb_ambiente': { lavoratori: 9800, aziende: 480 },
  'engeb_energia': { lavoratori: 11000, aziende: 380 },
  'engeb_telecomunicazioni': { lavoratori: 14000, aziende: 290 },
  'engeb_finanza': { lavoratori: 18000, aziende: 520 },
  'engeb_immobiliare': { lavoratori: 13000, aziende: 890 },
  'engeb_consulenza': { lavoratori: 22000, aziende: 1600 },
  'engeb_tecnologia': { lavoratori: 26000, aziende: 1100 },
  'engeb_alimentare': { lavoratori: 29000, aziende: 1400 },
  'engeb_tessile': { lavoratori: 15000, aziende: 780 },
  
  // CCNL Nazionali (competitor)
  'ebinter_terziario': { lavoratori: 1850000, aziende: 125000 },
  'confcommercio_terziario': { lavoratori: 2100000, aziende: 180000 },
  'ccnl_artigianato': { lavoratori: 950000, aziende: 85000 },
  'ccnl_metalmeccanici': { lavoratori: 1600000, aziende: 42000 },
};

console.log('🔄 Aggiornamento dati statistici CCNL...\n');

let updated = 0;
let notFound = 0;

for (const [externalId, stats] of Object.entries(ccnlStats)) {
  try {
    const result = await db
      .update(ccnls)
      .set({
        numeroLavoratori: stats.lavoratori,
        numeroAziende: stats.aziende,
        fonteDati: 'simulato',
        dataAggiornamentoDati: new Date(),
      })
      .where(eq(ccnls.externalId, externalId));

    if (result[0].affectedRows > 0) {
      console.log(`✅ ${externalId}: ${stats.lavoratori.toLocaleString('it-IT')} lavoratori, ${stats.aziende.toLocaleString('it-IT')} aziende`);
      updated++;
    } else {
      console.log(`⚠️  ${externalId}: CCNL non trovato nel database`);
      notFound++;
    }
  } catch (error) {
    console.error(`❌ Errore aggiornamento ${externalId}:`, error.message);
  }
}

console.log(`\n📊 Riepilogo:`);
console.log(`   ✅ CCNL aggiornati: ${updated}`);
console.log(`   ⚠️  CCNL non trovati: ${notFound}`);
console.log(`   📈 Totale lavoratori: ${Object.values(ccnlStats).reduce((sum, s) => sum + s.lavoratori, 0).toLocaleString('it-IT')}`);
console.log(`   🏢 Totale aziende: ${Object.values(ccnlStats).reduce((sum, s) => sum + s.aziende, 0).toLocaleString('it-IT')}`);

await connection.end();
console.log('\n✨ Aggiornamento completato!');
