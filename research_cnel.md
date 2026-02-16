# Ricerca CNEL - Archivio Contratti Collettivi

## Fonti Ufficiali Identificate

### 1. Archivio Nazionale CNEL
- **URL Principale**: https://www.cnel.it/Archivio-Contratti-Collettivi/
- **Ricerca CCNL**: https://www.cnel.it/Archivio-Contratti-Collettivi/Archivio-Nazionale-dei-contratti-e-degli-accordi-collettivi-di-lavoro/Contrattazione-Nazionale/Ricerca-CCNL
- **Open Data**: https://www.cnel.it/Archivio-Contratti-Collettivi/Archivio-Nazionale-dei-contratti-e-degli-accordi-collettivi-di-lavoro/Contratti-in-Open-Data

### 2. Statistiche CCNL
- **Numero totale CCNL vigenti**: ~992 contratti (dato 31/12/2021)
- **Fonte**: Bollettino ADAPT - https://www.bollettinoadapt.it/wp-content/uploads/2022/06/14%C2%B0_report_CCNL_vigenti_31_12_2021.pdf
- **Note**: 438 contratti applicati in meno di 50 aziende, 343 coprono meno di 100 dipendenti

### 3. Report e Prospetti Mensili
- **URL**: https://www.cnel.it/Archivio-Contratti-Collettivi/Report-e-prospetti-mensili-dei-CCNL-depositati
- **Contenuto**: Report CCNL vigenti, contratti solidarietà, prospetti mensili

## Approcci Possibili per Integrazione

### Opzione A: Dataset Open Data CNEL
- **Pro**: Dati ufficiali, aggiornati, strutturati
- **Contro**: Necessita verifica disponibilità API o download bulk
- **Azione**: Verificare se esiste endpoint API o file scaricabile (JSON/CSV/XML)

### Opzione B: Report PDF/Excel
- **Pro**: Disponibili pubblicamente
- **Contro**: Richiede parsing, aggiornamento manuale
- **Fonte**: https://www.bollettinoadapt.it/ - Report periodici con elenchi completi

### Opzione C: Scraping Interfaccia Ricerca
- **Pro**: Accesso a tutti i dati disponibili
- **Contro**: Complesso, fragile, possibili limiti legali/tecnici
- **Azione**: Ultima risorsa se non disponibili API/dataset

## Prossimi Passi

1. ✅ Identificare fonti ufficiali CNEL
2. ⏳ Verificare disponibilità API o dataset scaricabile
3. ⏳ Se non disponibile, scaricare report PDF/Excel più recente
4. ⏳ Implementare import dati CCNL nel database
5. ⏳ Creare interfaccia ricerca/filtro per selezione CCNL 2

## Note Implementazione

Per il simulatore ENGEB, l'approccio più pratico potrebbe essere:
1. Scaricare report più recente con elenco completo CCNL
2. Importare dati base (nome, settore, emittente) nel database
3. Per dati dettagliati (livelli, contributi), permettere inserimento manuale tramite form personalizzato
4. Questo soddisfa entrambe le richieste: lista completa CNEL + CCNL personalizzato
