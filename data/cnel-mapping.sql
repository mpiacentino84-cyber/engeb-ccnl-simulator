
-- Aggiungi colonna codice_cnel alla tabella ccnl
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS codice_cnel VARCHAR(10) UNIQUE;
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS macro_settore_cnel VARCHAR(100);
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS contraenti_datoriali TEXT;
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS contraenti_sindacali TEXT;


-- Mapping CCNL ENGEB con codici CNEL (da verificare manualmente)

UPDATE ccnl 
SET 
  codice_cnel = 'A00M',
  macro_settore_cnel = 'AGRICOLTURA',
  contraenti_datoriali = 'CONFIMITALIA (aderente CIU)',
  contraenti_sindacali = 'SNALP (aderente CIU); CONFAEL; CONFEPI'
WHERE id = 'engeb_multisettore';
-- CONFIMITALIA - Operatori Agricoli: CCNL per gli Operatori Agricoli e Florovivaisti

-- ⚠️ Codice CNEL H00M non trovato per engeb_commercio
-- ⚠️ Codice CNEL F00M non trovato per engeb_edilizia
-- ⚠️ Codice CNEL H00N non trovato per engeb_turismo
-- ⚠️ Codice CNEL I00M non trovato per engeb_trasporti
-- ⚠️ Codice CNEL T00M non trovato per engeb_sanita
-- ⚠️ Codice CNEL K00M non trovato per engeb_energia