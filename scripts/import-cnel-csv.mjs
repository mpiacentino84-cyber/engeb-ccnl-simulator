/**
 * Script per importare CCNL da file CSV Open Data CNEL
 * 
 * Formato CSV atteso (con header):
 * nome,settore,emittente,numeroLavoratori,numeroAziende,fonteDati,dataAggiornamento
 * 
 * Esempio:
 * CCNL Commercio,Commercio,Confcommercio,500000,45000,INPS-UNIEMENS,2024-12-31
 * 
 * Uso:
 * node scripts/import-cnel-csv.mjs path/to/ccnl-data.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Generate unique ID from name
function generateCCNLId(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Validate CCNL data
function validateCCNL(ccnl, lineNumber) {
  const errors = [];
  
  if (!ccnl.nome || ccnl.nome.length < 3) {
    errors.push(`Riga ${lineNumber}: Nome CCNL mancante o troppo corto`);
  }
  
  if (!ccnl.settore) {
    errors.push(`Riga ${lineNumber}: Settore mancante`);
  }
  
  if (!ccnl.emittente) {
    errors.push(`Riga ${lineNumber}: Emittente mancante`);
  }
  
  if (ccnl.numeroLavoratori !== null && (isNaN(ccnl.numeroLavoratori) || ccnl.numeroLavoratori < 0)) {
    errors.push(`Riga ${lineNumber}: Numero lavoratori non valido`);
  }
  
  if (ccnl.numeroAziende !== null && (isNaN(ccnl.numeroAziende) || ccnl.numeroAziende < 0)) {
    errors.push(`Riga ${lineNumber}: Numero aziende non valido`);
  }
  
  return errors;
}

// Parse CSV file
function parseCSV(filePath) {
  console.log(`📖 Lettura file CSV: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File non trovato: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('File CSV vuoto');
  }
  
  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log(`📋 Colonne rilevate: ${header.join(', ')}`);
  
  // Expected columns
  const requiredColumns = ['nome', 'settore', 'emittente'];
  const optionalColumns = ['numeroLavoratori', 'numeroAziende', 'fonteDati', 'dataAggiornamento'];
  
  // Validate header
  const missingColumns = requiredColumns.filter(col => !header.includes(col));
  if (missingColumns.length > 0) {
    throw new Error(`Colonne obbligatorie mancanti: ${missingColumns.join(', ')}`);
  }
  
  // Parse data rows
  const ccnls = [];
  const errors = [];
  const duplicateIds = new Set();
  const seenIds = new Set();
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== header.length) {
      errors.push(`Riga ${i + 1}: Numero colonne non corrispondente (atteso ${header.length}, trovato ${values.length})`);
      continue;
    }
    
    // Build CCNL object
    const ccnl = {};
    header.forEach((col, idx) => {
      ccnl[col] = values[idx];
    });
    
    // Convert numeric fields
    if (ccnl.numeroLavoratori) {
      ccnl.numeroLavoratori = parseInt(ccnl.numeroLavoratori) || null;
    } else {
      ccnl.numeroLavoratori = null;
    }
    
    if (ccnl.numeroAziende) {
      ccnl.numeroAziende = parseInt(ccnl.numeroAziende) || null;
    } else {
      ccnl.numeroAziende = null;
    }
    
    // Generate ID
    const id = generateCCNLId(ccnl.nome);
    ccnl.id = id;
    
    // Check for duplicates
    if (seenIds.has(id)) {
      duplicateIds.add(id);
      errors.push(`Riga ${i + 1}: ID duplicato "${id}" (nome: "${ccnl.nome}")`);
      continue;
    }
    seenIds.add(id);
    
    // Validate
    const validationErrors = validateCCNL(ccnl, i + 1);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
      continue;
    }
    
    ccnls.push(ccnl);
  }
  
  return { ccnls, errors, duplicateIds };
}

// Generate SQL INSERT statements
function generateSQL(ccnls) {
  const statements = [];
  
  ccnls.forEach(ccnl => {
    const values = [
      `'${ccnl.id.replace(/'/g, "''")}'`, // externalId
      `'${ccnl.nome.replace(/'/g, "''")}'`, // name
      `'${ccnl.settore.replace(/'/g, "''")}'`, // sector
      `'${ccnl.emittente.replace(/'/g, "''")}'`, // issuer
      ccnl.numeroLavoratori !== null ? ccnl.numeroLavoratori : 'NULL', // workerCount
      ccnl.numeroAziende !== null ? ccnl.numeroAziende : 'NULL', // companyCount
      ccnl.fonteDati ? `'${ccnl.fonteDati.replace(/'/g, "''")}'` : 'NULL', // dataSource
      ccnl.dataAggiornamento ? `'${ccnl.dataAggiornamento}'` : 'NULL', // lastUpdatedINPS
      'FALSE', // isCustom
      'NULL', // createdBy
      'NOW()', // createdAt
      'NOW()' // updatedAt
    ];
    
    const sql = `INSERT INTO ccnls (externalId, name, sector, issuer, workerCount, companyCount, dataSource, lastUpdatedINPS, isCustom, createdBy, createdAt, updatedAt)
VALUES (${values.join(', ')})
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sector = VALUES(sector),
  issuer = VALUES(issuer),
  workerCount = VALUES(workerCount),
  companyCount = VALUES(companyCount),
  dataSource = VALUES(dataSource),
  lastUpdatedINPS = VALUES(lastUpdatedINPS),
  updatedAt = NOW();`;
    
    statements.push(sql);
  });
  
  return statements;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Uso: node scripts/import-cnel-csv.mjs <percorso-file-csv>');
    console.error('');
    console.error('Formato CSV atteso (con header):');
    console.error('nome,settore,emittente,numeroLavoratori,numeroAziende,fonteDati,dataAggiornamento');
    console.error('');
    console.error('Esempio:');
    console.error('CCNL Commercio,Commercio,Confcommercio,500000,45000,INPS-UNIEMENS,2024-12-31');
    process.exit(1);
  }
  
  const csvPath = path.resolve(args[0]);
  
  try {
    // Parse CSV
    const { ccnls, errors, duplicateIds } = parseCSV(csvPath);
    
    console.log('');
    console.log(`✅ CCNL validi trovati: ${ccnls.length}`);
    
    if (errors.length > 0) {
      console.log('');
      console.log(`⚠️  Errori di validazione: ${errors.length}`);
      errors.slice(0, 10).forEach(err => console.log(`   ${err}`));
      if (errors.length > 10) {
        console.log(`   ... e altri ${errors.length - 10} errori`);
      }
    }
    
    if (duplicateIds.size > 0) {
      console.log('');
      console.log(`⚠️  ID duplicati rilevati: ${Array.from(duplicateIds).join(', ')}`);
    }
    
    if (ccnls.length === 0) {
      console.log('');
      console.log('❌ Nessun CCNL valido da importare');
      process.exit(1);
    }
    
    // Generate SQL
    console.log('');
    console.log('📝 Generazione statement SQL...');
    const sqlStatements = generateSQL(ccnls);
    
    // Save to file
    const outputPath = path.join(__dirname, 'import-ccnl.sql');
    const sqlContent = sqlStatements.join('\n\n');
    fs.writeFileSync(outputPath, sqlContent, 'utf-8');
    
    console.log(`✅ File SQL generato: ${outputPath}`);
    console.log('');
    console.log('📌 Prossimi passi:');
    console.log('   1. Revisionare il file SQL generato');
    console.log('   2. Eseguire lo script SQL nel database MySQL');
    console.log('   3. Verificare i dati importati nella dashboard admin');
    console.log('');
    console.log('💡 Per eseguire lo script SQL:');
    console.log(`   mysql -u <user> -p <database> < ${outputPath}`);
    console.log('');
    console.log(`✨ Import completato: ${ccnls.length} CCNL pronti per l'importazione`);
    
  } catch (error) {
    console.error('');
    console.error('❌ Errore durante l\'import:', error.message);
    process.exit(1);
  }
}

main();
