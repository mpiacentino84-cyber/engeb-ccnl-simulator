# Import Massivo CCNL da CSV

Questo script permette di importare in massa contratti collettivi nazionali (CCNL) da file CSV Open Data CNEL.

## Formato CSV Richiesto

Il file CSV deve contenere un header con le seguenti colonne:

### Colonne Obbligatorie

- **nome**: Nome completo del CCNL (es. "CCNL Commercio")
- **settore**: Settore merceologico (es. "Commercio", "Metalmeccanica")
- **emittente**: Organizzazione emittente (es. "Confcommercio", "Federmeccanica")

### Colonne Opzionali

- **numeroLavoratori**: Numero di lavoratori applicanti il CCNL (intero)
- **numeroAziende**: Numero di aziende aderenti (intero)
- **fonteDati**: Fonte dei dati statistici (es. "INPS-UNIEMENS", "CNEL")
- **dataAggiornamento**: Data ultimo aggiornamento statistiche (formato YYYY-MM-DD)

## Esempio File CSV

```csv
nome,settore,emittente,numeroLavoratori,numeroAziende,fonteDati,dataAggiornamento
CCNL Commercio,Commercio,Confcommercio,500000,45000,INPS-UNIEMENS,2024-12-31
CCNL Metalmeccanici Industria,Metalmeccanica,Federmeccanica-Assistal,1600000,32000,INPS-UNIEMENS,2024-12-31
CCNL Edilizia Industria,Edilizia,ANCE,750000,28000,INPS-UNIEMENS,2024-12-31
```

Un file di esempio è disponibile in `example-ccnl-import.csv`.

## Uso dello Script

### 1. Preparare il File CSV

Creare o scaricare un file CSV con i dati CCNL nel formato specificato sopra.

### 2. Eseguire lo Script di Import

```bash
node scripts/import-cnel-csv.mjs path/to/your-ccnl-data.csv
```

Esempio con il file di esempio:

```bash
node scripts/import-cnel-csv.mjs scripts/example-ccnl-import.csv
```

### 3. Verificare l'Output

Lo script genererà:

- **Riepilogo validazione**: Numero di CCNL validi, errori rilevati, ID duplicati
- **File SQL**: `scripts/import-ccnl.sql` con gli statement INSERT/UPDATE

### 4. Eseguire lo Script SQL

Dopo aver verificato il file SQL generato, importarlo nel database:

```bash
# Metodo 1: MySQL CLI
mysql -u <username> -p <database_name> < scripts/import-ccnl.sql

# Metodo 2: Via Management UI Database
# Copiare il contenuto di import-ccnl.sql e eseguirlo nel pannello Database
```

### 5. Verificare i Dati Importati

- Aprire la **Dashboard Admin** (`/admin`)
- Verificare che i nuovi CCNL siano presenti nella tabella
- Controllare che i dati statistici siano corretti

## Gestione Duplicati

Lo script genera ID univoci dai nomi CCNL (es. "CCNL Commercio" → "ccnl_commercio").

Se un CCNL con lo stesso ID esiste già nel database:

- **ON DUPLICATE KEY UPDATE**: I dati esistenti vengono aggiornati con i nuovi valori
- **Nessun dato perso**: I livelli, contributi e costi aggiuntivi esistenti vengono preservati

## Validazione Dati

Lo script valida automaticamente:

- ✅ Nome CCNL (minimo 3 caratteri)
- ✅ Settore e emittente presenti
- ✅ Numero lavoratori e aziende (se presenti) devono essere numeri positivi
- ✅ ID univoci (nessun duplicato nel file CSV)

Errori di validazione vengono riportati nel terminale con numero di riga.

## Fonti Dati Consigliate

### Open Data CNEL

- **URL**: [https://www.cnel.it/Archivio-Contratti](https://www.cnel.it/Archivio-Contratti)
- **Formato**: Archivio contratti depositati presso CNEL
- **Contenuto**: Nome CCNL, settore, organizzazioni firmatarie

### INPS-UNIEMENS

- **Fonte**: Dati statistici lavoratori dipendenti
- **Contenuto**: Numero lavoratori per CCNL, numero aziende aderenti
- **Accesso**: Dati aggregati disponibili su richiesta o tramite Open Data INPS

### Altre Fonti

- **ISTAT**: Statistiche occupazione per settore
- **Ministero del Lavoro**: Archivio contratti collettivi
- **Organizzazioni sindacali**: Dati adesione per specifici CCNL

## Troubleshooting

### Errore: "File non trovato"

Verificare che il percorso del file CSV sia corretto (assoluto o relativo).

### Errore: "Colonne obbligatorie mancanti"

Il file CSV deve contenere almeno le colonne: `nome`, `settore`, `emittente`.

### Errore: "Numero colonne non corrispondente"

Verificare che tutte le righe abbiano lo stesso numero di colonne dell'header.

### ID Duplicati

Se lo script rileva ID duplicati, modificare i nomi CCNL nel CSV per renderli univoci.

## Note Tecniche

- **Encoding**: Il file CSV deve essere codificato in UTF-8
- **Separatore**: Virgola (`,`)
- **Quote**: Campi con virgole devono essere racchiusi tra virgolette (`"`)
- **Caratteri speciali**: Accenti e caratteri speciali sono supportati
- **ID Generation**: Gli ID vengono normalizzati (lowercase, senza accenti, underscore al posto di spazi)

## Esempio Completo

```bash
# 1. Creare file CSV
cat > my-ccnl-data.csv << EOF
nome,settore,emittente,numeroLavoratori,numeroAziende,fonteDati,dataAggiornamento
CCNL Turismo,Turismo,Federalberghi,380000,15000,INPS-UNIEMENS,2024-12-31
CCNL Alimentare,Alimentare,Federalimentare,420000,8500,INPS-UNIEMENS,2024-12-31
EOF

# 2. Eseguire import
node scripts/import-cnel-csv.mjs my-ccnl-data.csv

# 3. Verificare SQL generato
cat scripts/import-ccnl.sql

# 4. Importare nel database
mysql -u root -p engeb_db < scripts/import-ccnl.sql

# 5. Verificare in dashboard admin
# Aprire browser: https://your-app-url/admin
```

## Supporto

Per problemi o domande sull'import massivo CCNL, consultare la documentazione principale del progetto o contattare il team di sviluppo.
