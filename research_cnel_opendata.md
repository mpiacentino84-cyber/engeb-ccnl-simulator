# Ricerca CNEL Open Data - Dataset Disponibili

## Fonte Ufficiale
**URL**: https://www.cnel.it/Archivio-Contratti-Collettivi/Archivio-Nazionale-dei-contratti-e-degli-accordi-collettivi-di-lavoro/Contratti-in-Open-Data

**Licenza**: Italian Open Data License v2.0

## Dataset CSV Disponibili (aggiornamento settimanale)

1. **Contratti Collettivi Nazionali Archivio Corrente** - CSV scaricabile
2. **Contratti Collettivi Nazionali Archivio Storico** - CSV scaricabile
3. **Contratti Integrativi Settore Pubblico Nazionali** [da 01/10/2015] - CSV
4. **Contratti Integrativi Settore Pubblico Decentrati** [da 01/10/2015] - CSV
5. **Contratti Collettivi Integrativi Settore Pubblico Nazionali** [fino a 30/09/2015] - CSV
6. **Contratti Integrativi Settore Pubblico Decentrati** [fino a 30/09/2015] - CSV
7. **Accordi Governo Parti Sociali** - CSV
8. **Contratti Quadro** - CSV
9. **Accordi Interconfederali** - CSV
10. **Contratti Solidarietà** - CSV

## Caratteristiche Open Data CNEL

- **Formato**: CSV (aperto, standardizzato, leggibile da applicazioni)
- **Aggiornamento**: Settimanale
- **Accesso**: Gratuito, scaricamento diretto da Internet
- **Riutilizzo**: Libero, anche per scopi commerciali
- **Redistribuzione**: Permessa, anche combinando con altre basi dati

## Prossimi Passi

1. Scaricare CSV "Contratti Collettivi Nazionali Archivio Corrente" per analizzare struttura dati
2. Verificare presenza campo "numero lavoratori" o statistiche applicazione
3. Cercare fonti alternative per dati applicazione contratti (INPS, ISTAT, sindacati)
4. Implementare import automatico CSV nel database applicazione


## SCOPERTA IMPORTANTE: Integrazione INPS-CNEL

**Fonte**: https://www.cnel.it/.../Integrazione-tra-larchivio-dei-CCNL-del-CNEL-e-il-flusso-UNIEMENS-dellINPS...

### Dati Disponibili tramite Integrazione

**L'INPS comunica al CNEL**:
- Numero di aziende che dichiarano di applicare ciascun CCNL
- **Numero di lavoratori dipendenti per CCNL**
- Disaggregazione per genere
- Disaggregazione per provincia

### Come Funziona

1. Codice alfanumerico unico assegnato dal CNEL a ogni CCNL
2. Datori di lavoro indicano codice CCNL in denunce UNIEMENS mensili all'INPS
3. INPS aggrega dati e comunica al CNEL statistiche applicazione
4. Dati aggiornati mensilmente

### Implicazioni per il Progetto

✅ **I dati esistono!** INPS fornisce al CNEL il numero esatto di lavoratori per ogni CCNL

❓ **Accesso pubblico?** Da verificare se questi dati sono:
- Inclusi nei CSV Open Data CNEL
- Disponibili tramite API pubblica
- Richiedono accesso riservato

### Prossimi Passi

1. Scaricare CSV "Contratti Collettivi Nazionali Archivio Corrente" e verificare presenza colonne lavoratori/aziende
2. Se non presenti nei CSV, contattare CNEL per richiedere accesso dati statistici
3. Alternativa: utilizzare report pubblici CNEL/ADAPT con dati aggregati per principali CCNL
