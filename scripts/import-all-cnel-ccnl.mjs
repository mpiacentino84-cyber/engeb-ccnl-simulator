#!/usr/bin/env node
/**
 * Script per importare TUTTI i 1.110 CCNL dal file Excel CNEL nel database
 * 
 * Questo script:
 * 1. Legge il file Excel CodContrUniemens_CNEL.xlsx
 * 2. Estrae tutti i contratti con i loro dati
 * 3. Li inserisce nella tabella ccnls del database
 * 4. Gestisce duplicati (skip se codice CNEL già esistente)
 * 
 * Usage: npx tsx scripts/import-all-cnel-ccnl.mjs
 */

import xlsx from 'xlsx';
import { getDb } from '../server/db.ts';
import { ccnls } from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const EXCEL_FILE_PATH = '/home/ubuntu/engeb_ccnl_simulator/data/CodContrUniemens_CNEL.xlsx';

console.log('📊 Inizio import massivo CCNL da file CNEL...\n');

// Connetti al database
const db = await getDb();
if (!db) {
  console.error('❌ Impossibile connettersi al database');
  process.exit(1);
}

// Leggi file Excel
console.log('📜 Lettura file Excel...');
const workbook = xlsx.readFile(EXCEL_FILE_PATH);
const sheetName = 'ElencoContrattiCNEL'; // Foglio con 1.110 contratti
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

console.log(`✅ Trovati ${data.length} contratti nel file Excel\n`);

// Statistiche
let inserted = 0;
let skipped = 0;
let errors = 0;

// Processa ogni contratto
for (const row of data) {
  try {
    const codiceCnel = row['Codice contratto CNEL'];
    const denominazione = row['Titolo contratto CNEL'];
    const contraentiDatoriali = row['Contraenti Datoriali'];
    const contraentiSindacali = row['Contraenti Sindacali'];
    const macroSettore = row['Descrizione Macro settore CNEL'];
    
    // Skip se mancano dati essenziali
    if (!codiceCnel || !denominazione) {
      console.log(`⚠️  Skip: mancano dati essenziali (codice o denominazione)`);
      skipped++;
      continue;
    }
    
    // Verifica se già esiste
    const existing = await db.select().from(ccnls).where(eq(ccnls.codiceCnel, String(codiceCnel))).limit(1);
    
    if (existing.length > 0) {
      console.log(`⏭️  Skip: ${codiceCnel} - ${denominazione} (già esistente)`);
      skipped++;
      continue;
    }
    
    // Determina se è ENGEB (tutti i nuovi sono competitor)
    const isENGEB = false;
    
    // Determina settore dalla denominazione o macro settore
    let sector = 'Vari';
    if (macroSettore) {
      sector = macroSettore;
    } else if (denominazione.toLowerCase().includes('commercio')) {
      sector = 'Commercio e Distribuzione';
    } else if (denominazione.toLowerCase().includes('edil')) {
      sector = 'Edilizia';
    } else if (denominazione.toLowerCase().includes('turismo') || denominazione.toLowerCase().includes('albergh')) {
      sector = 'Turismo e Ospitalità';
    } else if (denominazione.toLowerCase().includes('trasport')) {
      sector = 'Trasporti e Logistica';
    } else if (denominazione.toLowerCase().includes('sanit') || denominazione.toLowerCase().includes('salute')) {
      sector = 'Sanità e Assistenza';
    } else if (denominazione.toLowerCase().includes('industria') || denominazione.toLowerCase().includes('metalmeccan')) {
      sector = 'Industria';
    } else if (denominazione.toLowerCase().includes('artigian')) {
      sector = 'Artigianato';
    }
    
    // Genera externalId univoco dal codice CNEL
    const externalId = `cnel_${String(codiceCnel).toLowerCase()}`;
    
    // Inserisci nel database
    await db.insert(ccnls).values({
      externalId: externalId,
      name: denominazione.substring(0, 500), // Limita lunghezza a 500
      sector: sector,
      sectorCategory: macroSettore || 'VARI',
      isENGEB: isENGEB,
      codiceCnel: String(codiceCnel),
      macroSettoreCnel: macroSettore || null,
      contraentiDatoriali: contraentiDatoriali || null,
      contraentiSindacali: contraentiSindacali || null,
      // Campi opzionali non popolati (verranno aggiunti successivamente se necessario)
      numeroLavoratori: null,
      numeroAziende: null,
    });
    
    console.log(`✅ Inserito: ${codiceCnel} - ${denominazione}`);
    inserted++;
    
  } catch (error) {
    console.error(`❌ Errore processando contratto:`, error.message);
    errors++;
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RIEPILOGO IMPORT');
console.log('='.repeat(60));
console.log(`✅ Inseriti: ${inserted}`);
console.log(`⏭️  Saltati (già esistenti): ${skipped}`);
console.log(`❌ Errori: ${errors}`);
console.log(`📋 Totale processati: ${data.length}`);
console.log('='.repeat(60));

console.log('\n✨ Import completato!');
process.exit(0);
