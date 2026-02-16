# Checklist Controllo Qualità Completo - Simulatore ENGEB

## Data: 2026-02-01
## Obiettivo: Verificare tutte le funzionalità e consegnare versione professionale

---

## 1. FUNZIONALITÀ CORE SIMULATORE
- [ ] Homepage landing page carica correttamente
- [ ] Pulsante "Inizia il Confronto Gratuito" funziona
- [ ] Dropdown CCNL 1 (ENGEB) mostra tutti i contratti
- [ ] Dropdown CCNL 2 (Competitor + Personalizzati) funziona
- [ ] Selezione livelli per entrambi i CCNL funziona
- [ ] Calcolo costi mensili corretto per CCNL 1
- [ ] Calcolo costi mensili corretto per CCNL 2
- [ ] Confronto costi visualizzato correttamente
- [ ] Parametri "Numero Dipendenti" funzionante
- [ ] Parametri "Mesi per Anno" funzionante
- [ ] Calcolo risparmio annuale corretto
- [ ] Grafici confronto costi renderizzati
- [ ] Pulsante "Scarica Rapporto PDF" funziona
- [ ] Nessun errore console browser

## 2. DATABASE CCNL
- [ ] Pagina "Database CCNL" accessibile
- [ ] Filtro per settore funzionante
- [ ] Filtro per tipo (ENGEB/Nazionale) funzionante
- [ ] Ricerca per nome CCNL funzionante
- [ ] Tabella CCNL mostra tutti i dati
- [ ] Paginazione tabella funzionante
- [ ] Click su CCNL apre dettaglio
- [ ] Dettaglio mostra livelli e contributi
- [ ] Codici CNEL visualizzati correttamente

## 3. CCNL PERSONALIZZATI
- [ ] Pagina "I Miei CCNL" accessibile (richiede login)
- [ ] Pulsante "Crea Nuovo CCNL" funziona
- [ ] Form creazione CCNL completo e funzionante
- [ ] Validazione campi form corretta
- [ ] Salvataggio CCNL personalizzato funziona
- [ ] Lista CCNL personalizzati visualizzata
- [ ] Pulsante "Modifica" CCNL funziona
- [ ] Form modifica pre-compilato correttamente
- [ ] Aggiornamento CCNL funziona
- [ ] Pulsante "Elimina" CCNL funziona
- [ ] CCNL personalizzati appaiono in dropdown simulatore

## 4. STATISTICHE E DASHBOARD
- [ ] Pagina "Statistiche" accessibile
- [ ] 4 KPI cards visualizzate correttamente
- [ ] Grafico a torta distribuzione settoriale renderizzato
- [ ] Grafico a barre ENGEB vs Nazionali renderizzato
- [ ] Tabella Top 10 CCNL popolata con dati reali
- [ ] Tabella dettaglio per settore funzionante
- [ ] Grafici trend temporali ultimi 12 mesi renderizzati
- [ ] Skeleton loader grafici trend funziona
- [ ] Badge fonte dati "Stime ISTAT/CNEL" visibile
- [ ] Pulsante "Esporta Excel" presente (noto bug click)
- [ ] Dati statistiche realistici e coerenti

## 5. INTEGRAZIONE DATI INPS-UNIEMENS
- [ ] Tabella ccnls ha campi codice CNEL popolati
- [ ] Tabella ccnl_monthly_stats popolata (108 righe)
- [ ] Codici CNEL ufficiali mappati correttamente
- [ ] Statistiche mensili con dati realistici
- [ ] Aggregazioni per ENGEB vs Competitor corrette
- [ ] Script import CSV CNEL funzionante

## 6. AUTENTICAZIONE E SICUREZZA
- [ ] Login OAuth Manus funzionante
- [ ] Logout funzionante
- [ ] Pagine protette richiedono autenticazione
- [ ] Ownership CCNL personalizzati verificata
- [ ] Session cookie persistente

## 7. UI/UX E DESIGN
- [ ] Design coerente su tutte le pagine
- [ ] Responsive design mobile funzionante
- [ ] Navigation menu funzionante
- [ ] Loading states implementati
- [ ] Error states gestiti correttamente
- [ ] Toast notifications funzionanti
- [ ] Colori e typography coerenti
- [ ] Accessibilità keyboard navigation

## 8. PERFORMANCE E OTTIMIZZAZIONE
- [ ] Caricamento pagine < 2 secondi
- [ ] Query database ottimizzate
- [ ] Nessun memory leak
- [ ] Bundle size ragionevole
- [ ] Immagini ottimizzate

## 9. BUG NOTI DA VERIFICARE/FIXARE
- [ ] ~~Errore "removeChild" dropdown CCNL~~ - RISOLTO
- [ ] ~~CCNL Artigianato non visibile~~ - RISOLTO
- [ ] Pulsante "Esporta Excel" non risponde - DA FIXARE
- [ ] Verificare tutti i CCNL competitor visibili
- [ ] Verificare calcoli contributi ENGEB corretti

## 10. DOCUMENTAZIONE E SCRIPT
- [ ] README.md aggiornato
- [ ] Script import CSV documentati
- [ ] Script popolazione statistiche funzionanti
- [ ] File .env.example completo
- [ ] Commenti codice dove necessario

---

## PRIORITÀ CRITICHE PER VERSIONE DEFINITIVA
1. ✅ Fix errore dropdown CCNL (removeChild)
2. ✅ Fix CCNL competitor non visibili
3. ⚠️ Fix pulsante Export Excel (backend OK, frontend bug)
4. ✅ Verificare calcoli costi corretti
5. ✅ Verificare dati statistiche realistici
6. ⚠️ Testare tutti i flussi utente end-to-end

## NOTE
- Backend Export Excel funzionante (testato con script)
- Skeleton loader implementato ma caricamento troppo veloce per vederlo
- Dati INPS-UNIEMENS sono stime ISTAT, non dati reali (richiedere a CNEL)
