# Debug Statistiche - Problema Dati Uniformi

## Problema
Tutti i CCNL mostrano ancora **gli stessi valori** (46.391 lavoratori, 3.299 aziende) nella dashboard.

## Verifica Database
Query eseguita:
```sql
SELECT externalId, name, numeroLavoratori, numeroAziende 
FROM ccnls 
WHERE numeroLavoratori IS NOT NULL 
ORDER BY numeroLavoratori DESC;
```

**Risultato atteso**: Valori diversi per ogni CCNL (es. 1.789.643 per Terziario, 958.941 per Artigianato, etc.)

## Ipotesi
1. ❌ Script popolazione errato → Verificato, script corretto
2. ❌ Procedure tRPC non leggono dal DB → Verificato, usano query corrette
3. ⚠️ **Cache browser/React Query** → Dati vecchi in cache
4. ⚠️ **Aggregazione errata** nelle procedure statistics

## Prossimo Step
1. Verificare output query SQL diretta
2. Controllare logica aggregazione in statistics.ts
3. Forzare invalidazione cache React Query
