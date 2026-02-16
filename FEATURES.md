# ENGEB CCNL Simulator - Funzionalità Implementate

## 📊 Simulatore Costi CCNL

### Funzionalità Base
- **Confronto CCNL**: Confronto diretto tra CCNL ENGEB e CCNL nazionali/personalizzati
- **Filtri Settore**: Filtro dinamico per settore merceologico (Commercio, Turismo, Servizi, ecc.)
- **Selezione Livelli**: Scelta livello professionale per ogni CCNL con descrizione dettagliata
- **Parametri Configurabili**: Numero dipendenti e mesi per anno personalizzabili

### Funzionalità Avanzate
- **Toggle Part-Time**: Sconto automatico 50% sul contributo ENGEB (€5 vs €10)
- **Tooltip Contributi**: Icone Info con spiegazioni dettagliate per ogni contributo (COASCO, Assistenza Sanitaria, ecc.)
- **Confronto Annuale Cumulativo**: 
  - Grafico andamento cumulativo mensile
  - Card risparmio annuale evidenziato
  - Breakdown costo annuale per dipendente
  - Tabella risparmio mensile dettagliata

### Visualizzazioni
- **Grafici a Barre**: Confronto costi mensili (Stipendio Base, Costi Aggiuntivi, Totale)
- **Grafici a Torta**: Breakdown costi per categoria
- **Tabelle Comparative**: Confronto livelli professionali e contributi specifici
- **Export PDF**: Scarica rapporto completo con tutti i dati

---

## 🗂️ CCNL Personalizzati

### Creazione CCNL
- **Form Multi-Step**: Wizard guidato con progress indicator
- **Dati Base**: Nome, settore, categoria, emittente, validità
- **Livelli Professionali**: Aggiunta multipla con stipendio base per ogni livello
- **Costi Aggiuntivi**: Configurazione TFR, contributi sociali, altri benefici (percentuali)
- **Contributi Specifici**: Aggiunta contributi fissi con nome, importo, descrizione e categoria

### Gestione CCNL
- **Pagina "I Miei CCNL"**: Visualizzazione lista completa CCNL personalizzati
- **Eliminazione**: Rimozione CCNL con conferma
- **Duplicazione**: Pulsante "Usa come Base" per duplicare qualsiasi CCNL (ENGEB o nazionale)
- **Pre-compilazione**: Form automaticamente popolato con dati del CCNL selezionato

### Integrazione Simulatore
- **Dropdown Separato**: Sezione "I Miei CCNL Personalizzati" nel selettore CCNL 2
- **Link Creazione**: Messaggio con link diretto quando non ci sono CCNL personalizzati
- **Calcoli Automatici**: Compatibilità completa con tutti i calcoli e visualizzazioni del simulatore

---

## 🔐 Dashboard Amministrazione

### Gestione CCNL
- **Tabella Completa**: Visualizzazione tutti i 26 CCNL (22 ENGEB + 4 nazionali)
- **Ordinamento**: Click su intestazioni per ordinare per Nome, Settore, Ultimo Aggiornamento
- **Indicatori Visivi**: Frecce ascendente/discendente per direzione ordinamento
- **Barra Ricerca**: Ricerca in tempo reale per nome, settore, emittente
- **Filtri Dropdown**: Filtro per settore e issuer (ENGEB/Nazionale)
- **Indicatore Risultati**: Contatore CCNL trovati dopo filtri/ricerca
- **Pulsante Reset**: Cancella tutti i filtri con un click

### Operazioni CRUD
- **Creazione**: Form dialog per nuovo CCNL con validazione
- **Modifica**: Form dialog pre-compilato per aggiornamento
- **Eliminazione**: Conferma prima di rimuovere CCNL
- **Autorizzazioni**: Solo utenti admin possono accedere

---

## 💾 Database e Migrazione

### Schema Database
- **Tabella `ccnls`**: Informazioni base CCNL (nome, settore, emittente, validità, isCustom, createdBy)
- **Tabella `ccnlLevels`**: Livelli professionali con stipendi base
- **Tabella `ccnlAdditionalCosts`**: Costi aggiuntivi (TFR, contributi sociali, altri benefici)
- **Tabella `ccnlContributions`**: Contributi specifici fissi

### Migrazione Dati
- **Script Automatico**: `scripts/migrate-all-ccnl.mjs` per migrazione completa
- **26 CCNL Migrati**: 22 ENGEB + 4 nazionali con tutti i dati
- **95 Livelli Professionali**: Tutti i livelli per ogni CCNL
- **78 Contributi Specifici**: Contributi dettagliati per ogni contratto
- **Integrità Verificata**: Zero duplicati, ID univoci

---

## 🎨 UX e Design

### Landing Page
- **Hero Section**: Titolo principale con CTA "Inizia il Confronto Gratuito"
- **Statistiche**: 7 CCNL, 1.400+ aziende, 18.000+ lavoratori, €3.1M fatturato
- **Features**: Nessuna registrazione, risultati istantanei, esportazione PDF
- **Navigation**: Link a Simulatore, I Miei CCNL, Dashboard Admin (se admin)

### Autenticazione
- **Manus OAuth**: Login con Google/Email tramite Manus
- **Ruoli**: Admin e User con permessi differenziati
- **Persistenza**: Stato autenticazione mantenuto tra sessioni

### Responsive Design
- **Mobile-First**: Layout ottimizzato per tutti i dispositivi
- **Tailwind CSS**: Utility-first styling con tema personalizzato
- **Componenti shadcn/ui**: Button, Card, Dialog, Select, Input, Tabs, ecc.

---

## 🔧 Tecnologie Utilizzate

### Frontend
- **React 19**: Libreria UI con hooks moderni
- **TypeScript**: Type safety completo
- **Tailwind CSS 4**: Styling utility-first
- **shadcn/ui**: Componenti UI accessibili
- **Recharts**: Grafici interattivi
- **Wouter**: Routing leggero
- **tRPC**: Type-safe API client

### Backend
- **Node.js + Express**: Server HTTP
- **tRPC 11**: API type-safe end-to-end
- **Drizzle ORM**: Database ORM con TypeScript
- **MySQL/TiDB**: Database relazionale
- **Superjson**: Serializzazione avanzata (Date, Map, Set)

### DevOps
- **Vite**: Build tool veloce con HMR
- **Vitest**: Testing framework
- **pnpm**: Package manager performante
- **Drizzle Kit**: Gestione migrazioni database

---

## 📈 Metriche e Performance

### Database
- **26 CCNL Totali**: 22 ENGEB + 4 nazionali
- **95 Livelli Professionali**: Media 3-4 livelli per CCNL
- **78 Contributi Specifici**: Dettaglio completo costi
- **Query Ottimizzate**: Relazioni caricate con join efficienti

### UX
- **Ricerca Istantanea**: Filtro in tempo reale senza lag
- **Ordinamento Veloce**: Click su colonna ordina immediatamente
- **Form Validato**: Feedback immediato su errori input
- **Toast Notifications**: Conferme operazioni con sonner

---

## 🚀 Prossimi Sviluppi Suggeriti

### Funzionalità Mancanti
1. **Modifica CCNL Personalizzati**: Pulsante "Modifica" nella pagina "I Miei CCNL"
2. **Cronologia Confronti**: Salvataggio automatico ultimi 5 confronti
3. **Export Batch**: Esportazione tutti i CCNL personalizzati in JSON/CSV
4. **Template CCNL**: 3-4 template predefiniti per creazione rapida
5. **Condivisione Confronti**: Link pubblico per visualizzare confronto specifico

### Integrazioni Esterne
1. **Lista CNEL Completa**: Import top 50-100 CCNL nazionali più utilizzati
2. **API CNEL**: Aggiornamenti automatici contratti
3. **Export Excel Avanzato**: Formato professionale con formule

### Performance
1. **Paginazione Tabella**: 10/25/50 risultati per pagina
2. **Lazy Loading**: Caricamento progressivo CCNL
3. **Cache Query**: Ridurre chiamate database ripetute

---

## 📝 Note Tecniche

### Contributi ENGEB
- **Full-Time**: €10 contributo ente bilaterale + €10 COASCO + €15 assistenza sanitaria = €35/mese
- **Part-Time**: €5 contributo ente bilaterale + €10 COASCO + €15 assistenza sanitaria = €30/mese

### Calcolo Costi
- **TFR**: 6.91% stipendio base
- **Contributi Sociali**: ~30% stipendio base (variabile per CCNL)
- **Altri Benefici**: Variabili per CCNL (ferie, permessi, malattia, ecc.)

### Formato Dati CCNL
```typescript
interface CCNL {
  id: number;
  externalId: string; // ID univoco per riferimento
  name: string;
  sector: string;
  sectorCategory: string;
  issuer: "ENGEB" | "Nazionale";
  validFrom: Date;
  validTo: Date | null;
  description: string | null;
  isCustom: boolean; // true per CCNL personalizzati
  createdBy: number | null; // ID utente creatore (se custom)
  levels: Level[]; // Livelli professionali
  additionalCosts: AdditionalCosts; // TFR, contributi sociali, altri benefici
  contributions: Contribution[]; // Contributi specifici fissi
}
```

---

**Versione**: 915006cd  
**Data Ultimo Aggiornamento**: 31 Gennaio 2026  
**Autore**: Manus AI per ENGEB
