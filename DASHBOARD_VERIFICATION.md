# Verifica Dashboard Statistiche - 31 Gen 2026

## Problema Rilevato

La dashboard mostra ancora **dati vecchi/mock** invece dei nuovi dati realistici popolati nel database.

### Dati Mostrati (ERRATI):
- Totale Lavoratori: **1.144.260**
- ENGEB: 220.050 | Nazionali: 924.210
- Penetrazione ENGEB: 19.2%
- Tutti i CCNL mostrano **44.010 lavoratori** e **3.130 aziende** (identici!)

### Dati Attesi (dal database):
- Totale Lavoratori: **3.011.000**
- ENGEB: 141.000 (4.7%) | Nazionali: 2.870.000
- Distribuzione realistica per settore

## Causa Probabile

La pagina Statistics.tsx usa ancora **dati mock hardcoded** invece di chiamare le procedure tRPC che leggono dal database.

## Azione Richiesta

1. Verificare che Statistics.tsx chiami `trpc.statistics.getAggregateStats.useQuery()`
2. Rimuovere qualsiasi dato mock/hardcoded
3. Assicurarsi che i grafici usino dati da tRPC
4. Rimuovere badge "Dati simulati" e sostituire con fonte reale

## Next Steps

- [ ] Leggere Statistics.tsx per trovare dati mock
- [ ] Sostituire con chiamate tRPC
- [ ] Testare dashboard aggiornata
- [ ] Rimuovere badge "dati simulati"
