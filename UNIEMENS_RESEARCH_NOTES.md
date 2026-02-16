# Ricerca Integrazione Dati INPS UNIEMENS

## Data Ricerca: 31 Gennaio 2026

### Contesto Normativo

L'articolo 16-quater del decreto-legge 16 luglio 2020, n. 76 (convertito nella legge 11 settembre 2020, n. 120) ha istituito il **codice alfanumerico unico** per i CCNL. Questo codice viene:

- Attribuito dal CNEL in sede di acquisizione del contratto all'archivio
- Utilizzato nelle comunicazioni obbligatorie al Ministero del Lavoro
- Utilizzato nelle denunce retributive mensili UNIEMENS all'INPS

### Integrazione CNEL-INPS

Il sistema prevede un'integrazione bidirezionale tra CNEL e INPS:

**CNEL → INPS:**
- Comunica le variazioni dei codici alfanumerici CCNL
- Fornisce mappatura contratti-codici aggiornata

**INPS → CNEL:**
- Comunica il numero di aziende che dichiarano di applicare ciascun CCNL
- Fornisce il numero di lavoratori dipendenti per CCNL
- Disaggrega i dati per genere e provincia

### Flusso UNIEMENS

Il flusso informativo UNIEMENS (Denuncia Unica Mensile) contiene:

- Denunce retributive mensili dei datori di lavoro
- Codice alfanumerico CCNL applicato per ogni lavoratore
- Dati contributivi e retributivi individuali
- Formato: XML strutturato secondo tracciato INPS

**Documento Tecnico:** Allegato Tecnico UNIEMENS v4.29.0 (28/02/2025)
- 382 pagine di specifiche tecniche
- Schema di validazione XML
- Tracciato record dettagliato

### File Excel Codici Contratto CNEL

INPS fornisce file Excel `ElencoContrattiCNEL.xlsx` con:
- Elenco codici contratto CNEL utilizzabili
- Valido da periodo di competenza 12/2021
- Utilizzabile nell'elemento XML del flusso UNIEMENS

**URL File:** https://www.inps.it/content/dam/inps-site/pdf/prestazioni-e-servizi/uniemens-aziende-private/CodContrUniemens_AZConDip.xlsx

### Implicazioni per il Simulatore ENGEB

#### Opportunità

1. **Dati Aggregati Disponibili**: L'INPS comunica al CNEL statistiche aggregate per CCNL (numero aziende, lavoratori, disaggregazione geografica e di genere)

2. **Codici Standardizzati**: Ogni CCNL depositato presso CNEL ha un codice alfanumerico unico utilizzabile per matching

3. **Aggiornamento Mensile**: I dati UNIEMENS sono denunce mensili, quindi statistiche potenzialmente aggiornabili mensilmente

#### Criticità

1. **Accesso Dati Riservato**: I dati UNIEMENS individuali sono riservati. L'accesso richiede convenzioni specifiche con INPS o CNEL

2. **Dati Aggregati Limitati**: INPS comunica al CNEL solo aggregati (numero aziende/lavoratori per CCNL), non dettagli su retribuzioni o contributi

3. **Privacy e Normativa**: Dati sensibili soggetti a GDPR e normative specifiche sulla protezione dati previdenziali

4. **Complessità Tecnica**: Il tracciato XML UNIEMENS è estremamente complesso (382 pagine di specifiche)

### Alternative Praticabili

#### Opzione A: Richiesta Dati Aggregati a CNEL

**Procedura:**
1. Richiedere al CNEL accesso ai dati aggregati che INPS comunica mensilmente
2. Dati disponibili: numero aziende e lavoratori per CCNL, disaggregati per provincia e genere
3. Contatto: archiviocontratti@cnel.it

**Pro:**
- Dati ufficiali e certificati
- Aggiornamento mensile automatico
- Nessuna elaborazione complessa richiesta

**Contro:**
- Richiede autorizzazione formale
- Solo dati aggregati (no dettaglio retribuzioni/contributi)
- Tempi burocratici per accesso

#### Opzione B: Convenzione Diretta con INPS

**Procedura:**
1. Stipulare convenzione con INPS per accesso dati statistici UNIEMENS
2. Accesso a dataset aggregati o anonimizzati per ricerca/analisi

**Pro:**
- Dati più dettagliati possibili
- Accesso a serie storiche complete
- Possibilità di analisi personalizzate

**Contro:**
- Procedura lunga e complessa
- Costi potenziali per convenzione
- Requisiti tecnici e legali stringenti

#### Opzione C: Integrazione con Open Data CNEL

**Procedura:**
1. Utilizzare dataset Open Data CNEL già disponibili
2. Integrare con statistiche ISTAT settoriali
3. Stimare penetrazione ENGEB con modelli statistici

**Pro:**
- Immediatamente disponibile
- Nessuna autorizzazione richiesta
- Dati pubblici e trasparenti

**Contro:**
- Dati meno dettagliati
- Stime invece di dati reali
- Aggiornamento meno frequente

#### Opzione D: Partnership con Enti Bilaterali

**Procedura:**
1. Collaborare con altri Enti Bilaterali per condividere statistiche aggregate
2. Creare dataset condiviso anonimizzato
3. Utilizzare per benchmark settoriali

**Pro:**
- Dati specifici su Enti Bilaterali
- Possibilità di confronto diretto
- Network di collaborazione

**Contro:**
- Richiede accordi multilaterali
- Qualità dati variabile
- Copertura parziale del mercato

### Raccomandazione Implementativa

**Approccio Ibrido Consigliato:**

1. **Fase 1 (Immediata)**: Utilizzare Open Data CNEL + ISTAT per popolare dashboard con stime realistiche basate su dati pubblici

2. **Fase 2 (Breve termine)**: Richiedere accesso a dati aggregati CNEL tramite email formale a archiviocontratti@cnel.it

3. **Fase 3 (Medio termine)**: Valutare convenzione INPS se necessari dati più dettagliati per analisi avanzate

4. **Fase 4 (Lungo termine)**: Esplorare partnership con altri Enti Bilaterali per dataset condiviso

### Struttura Dati Proposta per Database

Basandosi sui dati disponibili da CNEL-INPS, schema tabelle:

```sql
-- Statistiche mensili aggregate per CCNL
CREATE TABLE ccnl_monthly_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ccnl_id INT NOT NULL,
  reference_month DATE NOT NULL, -- Primo giorno del mese di riferimento
  num_companies INT NOT NULL,
  num_workers INT NOT NULL,
  num_workers_male INT,
  num_workers_female INT,
  data_source ENUM('cnel_inps', 'estimate', 'manual') DEFAULT 'estimate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ccnl_id) REFERENCES ccnl(id),
  UNIQUE KEY unique_ccnl_month (ccnl_id, reference_month)
);

-- Statistiche per provincia (opzionale, se disponibili)
CREATE TABLE ccnl_provincial_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ccnl_id INT NOT NULL,
  province_code CHAR(2) NOT NULL, -- Codice provincia ISTAT
  reference_month DATE NOT NULL,
  num_companies INT NOT NULL,
  num_workers INT NOT NULL,
  FOREIGN KEY (ccnl_id) REFERENCES ccnl(id),
  UNIQUE KEY unique_ccnl_province_month (ccnl_id, province_code, reference_month)
);

-- Log import dati
CREATE TABLE data_import_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_source VARCHAR(100) NOT NULL,
  reference_period VARCHAR(20) NOT NULL,
  records_imported INT NOT NULL,
  status ENUM('success', 'partial', 'failed') DEFAULT 'success',
  notes TEXT
);
```

### Prossimi Passi Tecnici

1. ✅ Ricerca completata - formato e fonti dati identificate
2. ⏳ Scaricare file Excel codici CCNL da INPS
3. ⏳ Mappare codici CNEL con CCNL database esistente
4. ⏳ Implementare schema database per statistiche mensili
5. ⏳ Creare script import dati da fonti Open Data
6. ⏳ Preparare email formale richiesta accesso dati CNEL
7. ⏳ Aggiornare dashboard per visualizzare dati reali quando disponibili

### Riferimenti Utili

- **CNEL Archivio Contratti**: https://www.cnel.it/Archivio-Contratti-Collettivi
- **INPS UNIEMENS**: https://www.inps.it/prestazioni-e-servizi/uniemens-aziende-private
- **Allegato Tecnico UNIEMENS**: https://www.inps.it/content/dam/inps-site/pdf/prestazioni-e-servizi/uniemens-aziende-private/UniemensInd_Allegato_Tecnico.pdf
- **File Excel Codici**: https://www.inps.it/content/dam/inps-site/pdf/prestazioni-e-servizi/uniemens-aziende-private/CodContrUniemens_AZConDip.xlsx
- **Email CNEL**: archiviocontratti@cnel.it
