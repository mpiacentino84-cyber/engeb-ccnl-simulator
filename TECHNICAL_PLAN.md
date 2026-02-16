# Piano Tecnico - Rendere l'App Completamente Funzionante

## Data: 2026-02-16

---

## 1. Analisi Stato Attuale

### ✅ Componenti Presenti
- **Frontend completo**: React 19 + Vite + TypeScript + TailwindCSS
- **Backend completo**: Express + tRPC + Drizzle ORM
- **Schema database**: Migrazioni Drizzle pronte
- **Script di seed**: Disponibili per popolamento dati
- **Documentazione**: README, FEATURES, USER_GUIDE, KNOWN_ISSUES

### ⚠️ Problemi Identificati
1. **Manca file .env**: Necessario per configurazione database e JWT
2. **Database non configurato**: Serve MySQL locale o remoto
3. **Dipendenze non installate**: Serve `pnpm install`
4. **Problemi noti**:
   - Grafici trend temporali vuoti (mancano dati in `ccnl_monthly_stats`)
   - Export Excel potrebbe non funzionare su alcuni browser

---

## 2. Strategia di Implementazione

### Fase 1: Setup Ambiente e Dipendenze
1. ✅ Installare dipendenze con `pnpm install`
2. ✅ Creare file `.env` con configurazione appropriata
3. ✅ Configurare database MySQL (usare TiDB Cloud o MySQL locale)

### Fase 2: Database Setup
1. ✅ Verificare connessione database
2. ✅ Eseguire migrazioni Drizzle (`pnpm db:migrate`)
3. ✅ Popolare dati iniziali con script di seed
4. ✅ Verificare presenza dati CCNL e livelli

### Fase 3: Fix Problemi Noti
1. ✅ Popolare tabella `ccnl_monthly_stats` per grafici trend
2. ✅ Verificare funzionamento export Excel
3. ✅ Testare tutte le funzionalità principali

### Fase 4: Ottimizzazione e Testing
1. ✅ Eseguire build di produzione
2. ✅ Testare in modalità sviluppo
3. ✅ Verificare tutte le pagine principali
4. ✅ Controllare console per errori

### Fase 5: Deployment e Condivisione
1. ✅ Preparare l'app per deployment (build + start)
2. ✅ Esporre porta per accesso pubblico
3. ✅ Creare documentazione deployment
4. ✅ Preparare istruzioni per collaboratori

---

## 3. Decisioni Tecniche

### Database
**Opzione scelta**: MySQL locale nel sandbox
- **Pro**: Veloce da configurare, nessuna dipendenza esterna
- **Pro**: Sufficiente per testing e sviluppo
- **Contro**: Non persistente tra sessioni sandbox (ma OK per demo)

**Alternativa**: TiDB Cloud
- **Pro**: Persistente, scalabile, compatibile MySQL
- **Contro**: Richiede configurazione account esterno

### Configurazione OAuth
**Decisione**: OAuth opzionale disabilitato
- Le funzionalità pubbliche (simulatore, database, statistiche) funzionano senza OAuth
- Le sezioni protette (/my-ccnl, /admin) richiederebbero configurazione OAuth
- Per demo e condivisione, le funzionalità pubbliche sono sufficienti

### Port Exposure
**Decisione**: Esporre porta 3000 per accesso pubblico
- Permette ai collaboratori di accedere all'app via URL pubblico
- Utile per testing e demo immediata

---

## 4. Checklist Implementazione

### Setup Iniziale
- [ ] Installare dipendenze (`pnpm install`)
- [ ] Creare file `.env` con DATABASE_URL e JWT_SECRET
- [ ] Avviare MySQL nel sandbox
- [ ] Creare database `engeb_ccnl`

### Database
- [ ] Eseguire migrazioni Drizzle
- [ ] Verificare tabelle create
- [ ] Eseguire script di seed per CCNL
- [ ] Popolare statistiche mensili
- [ ] Verificare presenza dati

### Testing
- [ ] Avviare app in dev mode (`pnpm dev`)
- [ ] Testare landing page
- [ ] Testare simulatore CCNL
- [ ] Testare database CCNL
- [ ] Testare statistiche (inclusi grafici)
- [ ] Testare export Excel
- [ ] Verificare console per errori

### Build Produzione
- [ ] Eseguire build (`pnpm build`)
- [ ] Testare in production mode (`pnpm start`)
- [ ] Verificare bundle size e performance

### Deployment
- [ ] Esporre porta 3000 pubblicamente
- [ ] Testare accesso da URL pubblico
- [ ] Creare documentazione deployment
- [ ] Preparare istruzioni per collaboratori

---

## 5. Rischi e Mitigazioni

### Rischio 1: MySQL non disponibile nel sandbox
**Mitigazione**: Usare SQLite come fallback (richiede modifica drizzle.config)

### Rischio 2: Dipendenze incompatibili
**Mitigazione**: Usare pnpm con lock file esistente, versioni già testate

### Rischio 3: Grafici trend vuoti anche dopo seed
**Mitigazione**: Verificare script `populate-monthly-stats.mjs` e eseguirlo manualmente

### Rischio 4: Export Excel non funziona
**Mitigazione**: Testare su browser diversi, verificare permessi download

---

## 6. Timeline Stimata

- **Fase 1** (Setup): ~5 minuti
- **Fase 2** (Database): ~10 minuti
- **Fase 3** (Fix): ~5 minuti
- **Fase 4** (Testing): ~10 minuti
- **Fase 5** (Deployment): ~5 minuti

**Totale stimato**: ~35 minuti

---

## 7. Output Attesi

### Deliverables
1. ✅ App completamente funzionante accessibile via URL pubblico
2. ✅ Database popolato con dati CCNL completi
3. ✅ Tutte le funzionalità principali testate e funzionanti
4. ✅ Documentazione deployment per collaboratori
5. ✅ URL pubblico condivisibile

### Criteri di Successo
- ✅ Simulatore CCNL calcola correttamente i confronti
- ✅ Database CCNL mostra tutti i 26 contratti
- ✅ Statistiche mostrano KPI e grafici (inclusi trend temporali)
- ✅ Export Excel genera e scarica file correttamente
- ✅ Nessun errore critico in console
- ✅ App accessibile pubblicamente via URL

---

**Status**: READY TO IMPLEMENT
