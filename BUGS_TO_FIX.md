# Bug da Correggere - QA Finale

## Data: 2026-02-01

---

## BUG CRITICI

### 1. ❌ Card "Costo Aggiuntivo" Logica Errata
**Pagina**: /simulator
**Descrizione**: La card mostra "Costo Aggiuntivo €8.880" quando ENGEB costa MENO del competitor. Dovrebbe mostrare "Risparmio ENGEB €8.880"
**Impatto**: ALTO - Confonde l'utente sul vantaggio economico
**Fix Richiesto**:
- Invertire logica: se CCNL1 < CCNL2 → "Risparmio ENGEB"
- Cambiare icona da rossa (negativa) a verde (positiva)
- Aggiornare testo descrittivo

### 2. ❌ Grafici Trend Temporali Vuoti
**Pagina**: /statistics
**Descrizione**: I line chart "Evoluzione Lavoratori" e "Evoluzione Aziende" sono vuoti - nessun dato visualizzato
**Impatto**: ALTO - Feature 14 non funzionante
**Fix Richiesto**:
- Verificare query tRPC `statistics.getMonthlyTrend`
- Controllare se `ccnl_monthly_stats` ha dati
- Debug aggregazione ENGEB vs Nazionali

---

## BUG MINORI

### 3. ⚠️ Pulsante "Esporta Excel" Non Risponde
**Pagina**: /statistics
**Descrizione**: Click sul pulsante "Esporta Excel" non genera download
**Impatto**: MEDIO - Feature 15 non utilizzabile da UI
**Stato**: KNOWN ISSUE documentato
**Note**: Backend funzionante (testato con script), problema frontend

---

## BUG RISOLTI

### ✅ Errore Sintassi Statistics.tsx
**Descrizione**: Parentesi chiusa mancante causava errore compilazione
**Fix**: Aggiunta `)` dopo secondo Card trend
**Stato**: RISOLTO

### ✅ CCNL Artigianato Non Visibile
**Descrizione**: ID errato in NATIONAL_CCNL_IDS
**Fix**: Corretto da "artigianato" a "ccnl_artigianato"
**Stato**: RISOLTO

### ✅ Errore removeChild DOM
**Descrizione**: Uso di `<div>` dentro `<SelectContent>`
**Fix**: Usato `<SelectGroup>` e `<SelectLabel>`
**Stato**: RISOLTO

---

## PRIORITÀ FIX

1. **ALTA**: Fix logica card "Costo Aggiuntivo" → "Risparmio ENGEB"
2. **ALTA**: Debug grafici trend temporali vuoti
3. **MEDIA**: Fix pulsante Export Excel frontend

---

