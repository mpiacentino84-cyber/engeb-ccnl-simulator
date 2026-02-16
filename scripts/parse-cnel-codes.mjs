#!/usr/bin/env node

/**
 * Script per parsing file Excel codici CCNL CNEL da INPS
 * Estrae codici CNEL, titoli, settori e contraenti per mappatura con database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funzione per leggere file Excel come testo (richiede xlsx package)
async function parseExcelFile() {
  try {
    // Importa xlsx
    const XLSX = (await import('xlsx')).default;
    
    const filePath = path.join(__dirname, '../data/CodContrUniemens_CNEL.xlsx');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ File non trovato:', filePath);
      process.exit(1);
    }
    
    console.log('📖 Lettura file Excel CNEL...');
    const workbook = XLSX.readFile(filePath);
    
    // Leggi foglio "ElencoContrattiCNEL"
    const sheetName = 'ElencoContrattiCNEL';
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      console.error('❌ Foglio "ElencoContrattiCNEL" non trovato');
      process.exit(1);
    }
    
    // Converti in JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ Trovati ${data.length} contratti CNEL`);
    
    // Filtra solo contratti attivi (senza data finale o data finale futura)
    const now = new Date();
    const activeContracts = data.filter(row => {
      const endDate = row['Periodo finale in Uniemens'];
      if (!endDate) return true; // Nessuna data finale = attivo
      
      const endDateObj = new Date(endDate);
      return endDateObj > now;
    });
    
    console.log(`✅ Contratti attivi: ${activeContracts.length}`);
    
    // Estrai informazioni rilevanti
    const cnelCodes = activeContracts.map(row => ({
      codiceCnel: row['Codice contratto CNEL'],
      titolo: row['Titolo contratto CNEL'],
      macroSettoreCodice: row['Codice Macro settore CNEL'],
      macroSettoreDescrizione: row['Descrizione Macro settore CNEL'],
      contraentiDatoriali: row['Contraenti Datoriali'] || '',
      contraentiSindacali: row['Contraenti Sindacali'] || '',
      periodoIniziale: row['Periodo iniziale in Uniemens'],
      periodoFinale: row['Periodo finale in Uniemens'] || null,
    }));
    
    // Raggruppa per macro settore
    const byMacroSector = {};
    cnelCodes.forEach(contract => {
      const sector = contract.macroSettoreDescrizione;
      if (!byMacroSector[sector]) {
        byMacroSector[sector] = [];
      }
      byMacroSector[sector].push(contract);
    });
    
    console.log('\n📊 Distribuzione per Macro Settore:');
    Object.entries(byMacroSector)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([sector, contracts]) => {
        console.log(`  ${sector}: ${contracts.length} contratti`);
      });
    
    // Salva in JSON per analisi
    const outputPath = path.join(__dirname, '../data/cnel-codes.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      metadata: {
        dataEstrazione: new Date().toISOString(),
        totaleContratti: data.length,
        contrattiAttivi: activeContracts.length,
        fonte: 'INPS - CodContrUniemens_AZConDip.xlsx'
      },
      macroSettori: Object.keys(byMacroSector).sort(),
      contratti: cnelCodes
    }, null, 2));
    
    console.log(`\n✅ File JSON generato: ${outputPath}`);
    
    // Genera mapping suggerito per CCNL esistenti
    console.log('\n🔍 Ricerca corrispondenze con CCNL esistenti...');
    
    // Cerca contratti ENGEB e principali nazionali
    const engebContracts = cnelCodes.filter(c => 
      c.contraentiDatoriali.includes('CONFIMITALIA') ||
      c.contraentiDatoriali.includes('CONFAEL') ||
      c.contraentiDatoriali.includes('SNALP') ||
      c.titolo.toLowerCase().includes('engeb')
    );
    
    console.log(`\n📋 Contratti ENGEB/CONFIMITALIA trovati: ${engebContracts.length}`);
    engebContracts.forEach(c => {
      console.log(`  ${c.codiceCnel} - ${c.titolo}`);
      console.log(`    Datoriali: ${c.contraentiDatoriali}`);
      console.log(`    Sindacali: ${c.contraentiSindacali}`);
      console.log('');
    });
    
    // Cerca principali CCNL nazionali
    const mainNationalContracts = [
      'Terziario',
      'Commercio',
      'Edilizia',
      'Metalmeccanici',
      'Trasporti',
      'Turismo',
      'Sanità'
    ];
    
    console.log('\n📋 Principali CCNL Nazionali:');
    mainNationalContracts.forEach(keyword => {
      const found = cnelCodes.filter(c => 
        c.titolo.toLowerCase().includes(keyword.toLowerCase())
      );
      if (found.length > 0) {
        console.log(`\n  ${keyword}:`);
        found.slice(0, 3).forEach(c => {
          console.log(`    ${c.codiceCnel} - ${c.titolo.substring(0, 80)}...`);
        });
      }
    });
    
    // Genera SQL mapping suggerito
    console.log('\n💡 Generazione SQL mapping...');
    const sqlStatements = [];
    
    // Aggiungi colonna codice_cnel se non esiste
    sqlStatements.push(`
-- Aggiungi colonna codice_cnel alla tabella ccnl
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS codice_cnel VARCHAR(10) UNIQUE;
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS macro_settore_cnel VARCHAR(100);
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS contraenti_datoriali TEXT;
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS contraenti_sindacali TEXT;
`);
    
    // Mapping manuale per CCNL esistenti (da verificare)
    const manualMappings = [
      { ccnlId: 'engeb_multisettore', cnelCode: 'A00M', note: 'CONFIMITALIA - Operatori Agricoli' },
      { ccnlId: 'engeb_commercio', cnelCode: 'H00M', note: 'CONFIMITALIA - Terziario' },
      { ccnlId: 'engeb_edilizia', cnelCode: 'F00M', note: 'CONFIMITALIA - Edilizia' },
      { ccnlId: 'engeb_turismo', cnelCode: 'H00N', note: 'CONFAEL - Turismo' },
      { ccnlId: 'engeb_trasporti', cnelCode: 'I00M', note: 'CONFIMITALIA - Trasporti' },
      { ccnlId: 'engeb_sanita', cnelCode: 'T00M', note: 'CONFAEL - Sanità' },
      { ccnlId: 'engeb_energia', cnelCode: 'K00M', note: 'CONFIMITALIA - Energia' },
    ];
    
    sqlStatements.push(`\n-- Mapping CCNL ENGEB con codici CNEL (da verificare manualmente)`);
    manualMappings.forEach(mapping => {
      const cnelContract = cnelCodes.find(c => c.codiceCnel === mapping.cnelCode);
      if (cnelContract) {
        sqlStatements.push(`
UPDATE ccnl 
SET 
  codice_cnel = '${mapping.cnelCode}',
  macro_settore_cnel = '${cnelContract.macroSettoreDescrizione}',
  contraenti_datoriali = ${cnelContract.contraentiDatoriali ? `'${cnelContract.contraentiDatoriali.replace(/'/g, "''")}'` : 'NULL'},
  contraenti_sindacali = ${cnelContract.contraentiSindacali ? `'${cnelContract.contraentiSindacali.replace(/'/g, "''")}'` : 'NULL'}
WHERE id = '${mapping.ccnlId}';
-- ${mapping.note}: ${cnelContract.titolo.substring(0, 100)}
`);
      } else {
        sqlStatements.push(`-- ⚠️ Codice CNEL ${mapping.cnelCode} non trovato per ${mapping.ccnlId}`);
      }
    });
    
    // Salva SQL
    const sqlPath = path.join(__dirname, '../data/cnel-mapping.sql');
    fs.writeFileSync(sqlPath, sqlStatements.join('\n'));
    console.log(`✅ File SQL generato: ${sqlPath}`);
    
    console.log('\n✨ Parsing completato!');
    console.log('\n📝 Prossimi passi:');
    console.log('  1. Verificare mapping in data/cnel-mapping.sql');
    console.log('  2. Eseguire SQL per aggiornare database');
    console.log('  3. Creare tabella ccnl_monthly_stats per statistiche');
    console.log('  4. Popolare con dati stimati o richiedere dati reali a CNEL');
    
  } catch (error) {
    console.error('❌ Errore durante il parsing:', error.message);
    process.exit(1);
  }
}

// Esegui parsing
parseExcelFile();
