# Known Issues - Simulatore ENGEB CCNL

## Data Ultimo Aggiornamento: 2026-02-16

---

## ISSUE 1: Grafici Trend Temporali Vuoti ⚠️

**Pagina**: /statistics
**Descrizione**: I line chart "Evoluzione Lavoratori Ultimi 12 Mesi" e "Evoluzione Aziende Ultimi 12 Mesi" non mostrano dati

**Stato**: MITIGATO (UI + gestione errori/empty state)

**Analisi Tecnica**:
- ✅ Procedure tRPC `statistics.getMonthlyTrend` restituisce array time-series (`month`, `engebWorkers`, `nationalWorkers`, ecc.)
- ✅ Frontend: aggiunta gestione **loading/error/empty** per evitare grafici vuoti “silenziosi”
- ⚠️ Se i dati restano vuoti: probabile mancanza di seed/import su `ccnl_monthly_stats` nel DB di test

**Possibili Cause**:
1. Trasformazione dati nel backend non restituisce formato corretto
2. React Query cache problema
3. Superjson serializzazione issue

**Workaround**: Nessuno disponibile al momento

**Fix Proposto (se ancora vuoto)**:
1. Verificare presenza righe in `ccnl_monthly_stats` nel DB attivo (DATABASE_URL)
2. Eseguire eventuali script di seed/import presenti in `scripts/`
3. Controllare che i CCNL collegati abbiano `isCustom=0` (la query esclude i custom)

---

## ISSUE 2: Pulsante "Esporta Excel" Non Risponde ⚠️

**Pagina**: /statistics
**Descrizione**: Click sul pulsante "Esporta Excel" non genera download del file

**Stato**: FIX FRONTEND (da smoke-test su browser)

**Analisi Tecnica**:
- ✅ Backend `export.exportStatisticsExcel` restituisce base64 + filename + mimeType
- ✅ Frontend: refactor handler export in una funzione unica, con **toast** e controlli su `result.data`
- ✅ Download via `Blob + ObjectURL` con revoke ritardato (riduce race)

**Possibili Cause**:
1. Event handler onClick non collegato correttamente
2. Z-index o overlay impedisce click
3. Mutation non viene chiamata
4. Problema con conversione base64 → Blob

**Workaround**: Usare script manuale `/home/ubuntu/engeb_ccnl_simulator/scripts/test-export.mjs`

**Cosa verificare**:
1. Browser che blocca download automatici (consenti download per il sito)
2. In caso di errore: controllare console e rete (risposta tRPC)

---

## BUG RISOLTI ✅

### ✅ Card "Costo Aggiuntivo" Logica Errata
**Fix**: Invertita logica `savings < 0` → "Risparmio ENGEB"
**Commit**: 2026-02-01

### ✅ CCNL Artigianato Non Visibile
**Fix**: Corretto ID in NATIONAL_CCNL_IDS da "artigianato" → "ccnl_artigianato"
**Commit**: 2026-02-01

### ✅ Errore removeChild DOM
**Fix**: Usato SelectGroup/SelectLabel invece di div in SelectContent
**Commit**: 2026-02-01

### ✅ Errore Sintassi Statistics.tsx
**Fix**: Aggiunta parentesi chiusa mancante dopo Card trend
**Commit**: 2026-02-01

---

## PRIORITÀ

1. **ALTA**: Fix grafici trend temporali (Feature 14 non funzionante)
2. **MEDIA**: Fix pulsante Export Excel (Feature 15 non utilizzabile da UI)

---

## NOTE PER SVILUPPO FUTURO

- Considerare implementazione test E2E con Playwright per prevenire regressioni
- Aggiungere error boundary React per catturare errori runtime
- Implementare Sentry o simile per monitoring errori produzione
- Aggiungere unit test per procedure tRPC critiche

---

