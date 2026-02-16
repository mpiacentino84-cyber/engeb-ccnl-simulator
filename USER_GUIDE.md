# Guida Utente - ENGEB CCNL Simulator

## 📖 Introduzione

Il **ENGEB CCNL Simulator** è uno strumento professionale che permette di confrontare i costi del lavoro tra i Contratti Collettivi Nazionali di Lavoro (CCNL) di ENGEB e i contratti nazionali o personalizzati. L'applicazione offre analisi dettagliate, visualizzazioni grafiche e report esportabili per supportare decisioni aziendali informate.

---

## 🚀 Accesso Rapido

### Senza Registrazione
Puoi utilizzare il simulatore base senza registrazione per confrontare CCNL ENGEB con contratti nazionali predefiniti.

1. Visita la **Landing Page**
2. Click su **"Inizia il Confronto Gratuito"**
3. Seleziona CCNL e parametri
4. Visualizza risultati e scarica PDF

### Con Registrazione (Consigliato)
Registrandoti ottieni accesso a funzionalità avanzate come CCNL personalizzati e dashboard amministrazione.

1. Click su **"Accedi"** in alto a destra
2. Login con Google o Email tramite Manus OAuth
3. Accesso completo a tutte le funzionalità

---

## 🎯 Funzionalità Principali

### 1. Simulatore Costi CCNL

#### Selezione CCNL 1 (ENGEB)
1. **Filtro Settore**: Seleziona categoria merceologica (Commercio, Turismo, Servizi, ecc.)
2. **Scelta CCNL**: Dropdown con CCNL ENGEB filtrati per settore
3. **Livello Professionale**: Seleziona livello di inquadramento (es. "1° Livello - Quadri")
4. **Pulsante "Usa come Base"**: Duplica CCNL per creare versione personalizzata (solo utenti autenticati)

#### Selezione CCNL 2 (Confronto)
1. **Sezione CCNL Nazionali**: CCNL competitor predefiniti (EBINTER Terziario, Confcommercio, ecc.)
2. **Sezione I Miei CCNL Personalizzati**: Contratti creati dall'utente (solo autenticati)
3. **Link "Crea il tuo primo CCNL"**: Shortcut per creare CCNL personalizzato
4. **Pulsante "Usa come Base"**: Duplica CCNL selezionato

#### Parametri Configurabili
- **Numero Dipendenti**: Quanti lavoratori applicare il calcolo (default: 10)
- **Mesi per Anno**: Quanti mesi di lavoro annui (default: 12, range: 1-12)
- **Toggle Part-Time**: Attiva sconto 50% sul contributo ENGEB (€5 invece di €10)

#### Visualizzazioni Risultati

**Card Riepilogo Costi**
- Costo mensile per dipendente (CCNL 1 vs CCNL 2)
- Costo annuale totale (moltiplicato per numero dipendenti e mesi)
- Differenza evidenziata (risparmio o maggior costo)
- Percentuale vantaggio ENGEB

**Grafico Confronto Costi Mensili**
- Barre affiancate per Stipendio Base, Costi Aggiuntivi, Costo Totale
- Legenda interattiva (click per nascondere/mostrare serie)
- Tooltip con valori esatti al passaggio mouse

**Grafico Breakdown Costi**
- Torta con ripartizione: Stipendio Base, TFR, Contributi Sociali, Altri Benefici
- Percentuali e valori assoluti
- Colori distintivi per categoria

**Tabella Confronto Livelli**
- Tutti i livelli professionali di entrambi i CCNL
- Stipendio base mensile per livello
- Evidenziazione livelli selezionati

**Tabella Confronto Contributi**
- Contributi specifici fissi (COASCO, Assistenza Sanitaria, ecc.)
- Importo mensile per contributo
- Icona Info con tooltip esplicativo (descrizione contributo)
- Categoria contributo (Welfare, Formazione, ecc.)

**Confronto Annuale Cumulativo** (Nuova sezione)
- Card risparmio annuale evidenziato
- Grafico lineare andamento cumulativo mensile (CCNL 1 vs CCNL 2)
- Breakdown costo annuale per dipendente
- Tabella risparmio mensile dettagliata (12 mesi)

#### Export Risultati
Click su **"Scarica Rapporto"** per generare PDF con:
- Parametri di confronto
- Costo mensile per dipendente (tabella comparativa)
- Costo annuale totale
- Differenza e percentuale risparmio

---

### 2. CCNL Personalizzati

#### Creazione Nuovo CCNL

**Accesso**
- Dalla Landing Page: Click su **"I Miei CCNL"** nel menu
- Dal Simulatore: Click su link **"Crea il tuo primo CCNL →"** nel dropdown CCNL 2

**Step 1: Informazioni Base**
- **Nome Contratto**: Nome identificativo (es. "CCNL Commercio Personalizzato")
- **Settore**: Settore merceologico (Commercio, Turismo, Servizi, ecc.)
- **Categoria Settore**: Sottocategoria (Alimentari, Abbigliamento, ecc.)
- **Emittente**: Chi emette il contratto (ENGEB, Confcommercio, ecc.)
- **Data Inizio Validità**: Data inizio contratto
- **Data Fine Validità**: Data scadenza contratto (opzionale)
- **Descrizione**: Note aggiuntive (opzionale)

**Step 2: Livelli Professionali**
- Click **"+ Aggiungi Livello"** per ogni livello
- **Codice Livello**: Identificativo (es. "1°", "2°", "A1", ecc.)
- **Descrizione**: Ruolo (es. "Quadri", "Impiegati Direttivi", ecc.)
- **Stipendio Base Mensile**: RAL mensile lordo in €
- Ripeti per tutti i livelli necessari
- Click **"Rimuovi"** per eliminare livello

**Step 3: Costi Aggiuntivi**
- **Percentuale TFR**: Percentuale stipendio base per TFR (default: 6.91%)
- **Percentuale Contributi Sociali**: Contributi INPS/INAIL (default: 30%)
- **Altri Benefici (€/mese)**: Ferie, permessi, malattia, ecc. (default: 50€)

**Step 4: Contributi Specifici**
- Click **"+ Aggiungi Contributo"** per ogni contributo fisso
- **Nome Contributo**: Identificativo (es. "COASCO", "Assistenza Sanitaria")
- **Importo Mensile**: Costo fisso mensile in €
- **Descrizione**: Spiegazione contributo (es. "Fondo assistenza sanitaria integrativa")
- **Categoria**: Tipo contributo (Welfare, Formazione, Previdenza, Altro)
- Ripeti per tutti i contributi necessari
- Click **"Rimuovi"** per eliminare contributo

**Salvataggio**
- Click **"Crea CCNL"** per salvare
- Toast di conferma con messaggio successo
- Redirect automatico a pagina "I Miei CCNL"

#### Gestione CCNL Esistenti

**Visualizzazione Lista**
- Pagina **"I Miei CCNL"** mostra tutti i contratti creati
- Card per ogni CCNL con:
  - Nome contratto
  - Settore e categoria
  - Emittente
  - Numero livelli professionali
  - Numero contributi specifici
  - Data creazione

**Eliminazione**
- Click su **"Elimina"** nella card CCNL
- Conferma eliminazione nel dialog
- CCNL rimosso permanentemente dal database

**Duplicazione (Usa come Base)**
- Nel simulatore, seleziona CCNL da duplicare
- Click su **"📋 Usa come Base per CCNL Personalizzato"**
- Form pre-compilato con tutti i dati del CCNL selezionato
- Nome automaticamente suffissato con "(Copia)"
- Modifica campi desiderati
- Salva come nuovo CCNL

#### Utilizzo nel Simulatore
- I CCNL personalizzati appaiono automaticamente nel dropdown **"CCNL 2 - Confronto"**
- Sezione separata **"I Miei CCNL Personalizzati"**
- Seleziona come qualsiasi altro CCNL nazionale
- Tutti i calcoli e visualizzazioni funzionano identicamente

---

### 3. Dashboard Amministrazione

**Accesso**: Solo utenti con ruolo **Admin**
- Click su **"Dashboard Admin"** nel menu (visibile solo per admin)
- URL diretto: `/admin`

#### Gestione CCNL

**Tabella CCNL**
- Visualizzazione tutti i 26 CCNL (22 ENGEB + 4 nazionali)
- Colonne: Nome, Settore, Emittente, Ultimo Aggiornamento, Azioni

**Ordinamento**
- Click su intestazione colonna per ordinare
- Freccia ↑ = ordine ascendente
- Freccia ↓ = ordine discendente
- Freccia ↕ = nessun ordinamento attivo

**Ricerca e Filtri**
- **Barra Ricerca**: Cerca per nome, settore o emittente (ricerca in tempo reale)
- **Filtro Settore**: Dropdown per filtrare per settore merceologico
- **Filtro Issuer**: Dropdown per filtrare ENGEB o Nazionali
- **Indicatore Risultati**: Mostra quanti CCNL trovati dopo filtri
- **Pulsante "Cancella Filtri"**: Reset tutti i filtri con un click

**Operazioni CRUD**
- **Crea Nuovo CCNL**: Click su **"+ Nuovo CCNL"** (form dialog)
- **Modifica CCNL**: Click su icona matita nella riga CCNL (form pre-compilato)
- **Elimina CCNL**: Click su icona cestino (conferma richiesta)

#### Gestione Utenti
- Visualizzazione lista utenti registrati
- Promozione utente a ruolo Admin
- Visualizzazione data ultima autenticazione

---

## 💡 Consigli e Best Practices

### Confronto CCNL Efficace
1. **Seleziona Livelli Equivalenti**: Confronta livelli con responsabilità simili (es. Quadri vs Quadri)
2. **Considera Part-Time**: Attiva toggle se confronti contratti part-time
3. **Analizza Contributi**: Usa tooltip per capire cosa include ogni contributo
4. **Visualizza Annuale**: Usa sezione "Confronto Annuale Cumulativo" per visione lungo termine

### Creazione CCNL Personalizzati
1. **Usa "Usa come Base"**: Parti da CCNL esistente simile invece di creare da zero
2. **Nomi Descrittivi**: Usa nomi chiari (es. "CCNL Commercio Milano 2026")
3. **Verifica Percentuali**: Controlla che TFR e contributi sociali siano realistici
4. **Aggiungi Descrizioni**: Compila campo descrizione per ricordare particolarità contratto

### Dashboard Admin
1. **Usa Ricerca**: Più veloce che scorrere tabella manualmente
2. **Combina Filtri**: Ricerca + filtro settore + filtro issuer per risultati precisi
3. **Ordina per Data**: Trova rapidamente CCNL aggiornati di recente

---

## ❓ FAQ (Domande Frequenti)

### Generale

**Q: Devo registrarmi per usare il simulatore?**  
A: No, puoi usare il simulatore base senza registrazione. La registrazione è necessaria solo per CCNL personalizzati e dashboard admin.

**Q: I dati sono salvati?**  
A: I CCNL personalizzati sono salvati nel database e accessibili dopo login. I confronti non sono salvati (funzionalità futura).

**Q: Posso condividere un confronto?**  
A: Attualmente no, ma puoi esportare PDF e condividerlo. Link pubblico condivisione è pianificato per futuro.

### CCNL Personalizzati

**Q: Quanti CCNL personalizzati posso creare?**  
A: Nessun limite attualmente. Puoi creare tutti i CCNL necessari.

**Q: Posso modificare un CCNL personalizzato dopo creazione?**  
A: Non ancora, ma la funzionalità è in sviluppo. Attualmente puoi duplicarlo con "Usa come Base", modificare e salvare come nuovo.

**Q: Posso condividere CCNL personalizzati con altri utenti?**  
A: No, i CCNL personalizzati sono privati e visibili solo al creatore.

### Calcoli

**Q: Come viene calcolato il TFR?**  
A: TFR = Stipendio Base × Percentuale TFR (default 6.91%)

**Q: Cosa include "Altri Benefici"?**  
A: Ferie, permessi, malattia, festività, tredicesima/quattordicesima, ecc. Valore stimato variabile per CCNL.

**Q: Il contributo ENGEB part-time è sempre €5?**  
A: Sì, per contratti part-time il contributo ente bilaterale ENGEB è €5/mese invece di €10/mese full-time.

### Dashboard Admin

**Q: Come divento Admin?**  
A: Solo il proprietario del progetto o altri admin possono promuoverti. Contatta l'amministratore ENGEB.

**Q: Posso eliminare CCNL predefiniti?**  
A: Sì, ma è sconsigliato. Elimina solo CCNL obsoleti o errati. I CCNL eliminati non sono recuperabili.

**Q: Le modifiche ai CCNL sono immediate?**  
A: Sì, le modifiche sono salvate nel database e visibili immediatamente nel simulatore.

---

## 🆘 Supporto

### Problemi Tecnici
- **Errori di caricamento**: Ricarica pagina (F5) o svuota cache browser
- **Login non funziona**: Verifica email/password o usa metodo alternativo (Google)
- **Dati non salvati**: Controlla connessione internet e riprova

### Contatti
- **Email Supporto**: support@engeb.it (da configurare)
- **Sito Web**: https://www.engeb.it
- **Telefono**: +39 XXX XXXXXXX (da configurare)

---

## 📚 Risorse Aggiuntive

### Documentazione Tecnica
- **FEATURES.md**: Elenco completo funzionalità implementate
- **IMPROVEMENTS.md**: Roadmap miglioramenti futuri
- **README.md**: Informazioni tecniche per sviluppatori

### Video Tutorial (Pianificati)
1. Introduzione al Simulatore CCNL (3 min)
2. Creare CCNL Personalizzati (5 min)
3. Dashboard Amministrazione (4 min)
4. Analisi Avanzata Costi (6 min)

---

**Versione Guida**: 1.0  
**Data Ultimo Aggiornamento**: 31 Gennaio 2026  
**Autore**: ENGEB con supporto Manus AI
