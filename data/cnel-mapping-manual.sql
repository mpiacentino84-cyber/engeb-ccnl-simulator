-- Mapping manuale CCNL ENGEB con codici CNEL ufficiali
-- Basato su output script parse-cnel-codes.mjs

-- Aggiungi colonne codice CNEL alla tabella ccnl
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS codice_cnel VARCHAR(10);
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS macro_settore_cnel VARCHAR(100);
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS contraenti_datoriali TEXT;
ALTER TABLE ccnl ADD COLUMN IF NOT EXISTS contraenti_sindacali TEXT;

-- ENGEB Multisettore -> V716 (Multiservizi, Pulizie, Logistica)
UPDATE ccnl 
SET 
  codice_cnel = 'V716',
  macro_settore_cnel = 'CCNL PLURISETTORIALI, MICROSETTORIALI E ALTRI',
  contraenti_datoriali = 'CONFIMITALIA (aderente CIU); UNILAVORO PMI',
  contraenti_sindacali = 'CONFAEL NAZIONALE COMPARTO TERZIARIO; SNALP (aderente a CONFSAL); ENGEB; FAL (aderente a CONFAEL); CONFAEL; CONFSAL FISALS'
WHERE id = 'engeb_multisettore';

-- ENGEB Commercio e Distribuzione -> H167 (Commercio, Turismo e Servizi)
UPDATE ccnl 
SET 
  codice_cnel = 'H167',
  macro_settore_cnel = 'TERZIARIO E SERVIZI',
  contraenti_datoriali = 'CONFIMITALIA; CONFSAAU',
  contraenti_sindacali = 'CONFAEL; SNALP CONFSAL; CONFAEL TERZIARIO'
WHERE id = 'engeb_commercio';

-- ENGEB Edilizia e Affini -> F08U (Imprese edili ed affini)
UPDATE ccnl 
SET 
  codice_cnel = 'F08U',
  macro_settore_cnel = 'EDILIZIA, LEGNO E ARREDAMENTO',
  contraenti_datoriali = 'CONFIMITALIA (aderente CIU)',
  contraenti_sindacali = 'SNALP (aderente CIU); CONFAEL; CONFEPI'
WHERE id = 'engeb_edilizia';

-- ENGEB Turismo e Ospitalità -> H04S (Turismo - Pubblici esercizi, ristorazione, alberghi)
UPDATE ccnl 
SET 
  codice_cnel = 'H04S',
  macro_settore_cnel = 'TERZIARIO E SERVIZI',
  contraenti_datoriali = 'CONFIMITALIA',
  contraenti_sindacali = 'CONFAEL; SNALP; FAILM Servizi Terziario'
WHERE id = 'engeb_turismo';

-- ENGEB Trasporto e Spedizione Merci -> I14R (Trasporto e spedizione merci artigianato)
UPDATE ccnl 
SET 
  codice_cnel = 'I14R',
  macro_settore_cnel = 'TRASPORTI',
  contraenti_datoriali = 'CONFIMITALIA (aderente CIU)',
  contraenti_sindacali = 'SNALP (aderente CIU); CONFAEL; CONFEPI'
WHERE id = 'engeb_trasporti';

-- ENGEB Sanità e Assistenza -> T09R (Strutture sanitarie, RSA, socio-assistenziali)
UPDATE ccnl 
SET 
  codice_cnel = 'T09R',
  macro_settore_cnel = 'ISTRUZIONE, SANITA'', ASSISTENZA, CULTURA, ENTI',
  contraenti_datoriali = 'CONFIMITALIA (aderente CIU)',
  contraenti_sindacali = 'SNALP (aderente CIU); CONFAEL; CONFEPI; CONFEPI SANITA'''
WHERE id = 'engeb_sanita';

-- ENGEB Aziende Luce e Gas -> K325 (Gas e Acqua)
UPDATE ccnl 
SET 
  codice_cnel = 'K325',
  macro_settore_cnel = 'AZIENDE DI SERVIZI',
  contraenti_datoriali = 'CONFIMITALIA (aderente CIU)',
  contraenti_sindacali = 'SNALP (aderente CIU); CONFAEL; CONFEPI'
WHERE id = 'engeb_energia';

-- Principali CCNL Nazionali competitor

-- EBINTER Terziario -> H011 (Terziario, Distribuzione e Servizi - CONFCOMMERCIO)
UPDATE ccnl 
SET 
  codice_cnel = 'H011',
  macro_settore_cnel = 'TERZIARIO E SERVIZI',
  contraenti_datoriali = 'CONFCOMMERCIO',
  contraenti_sindacali = 'FILCAMS CGIL; FISASCAT CISL; UILTUCS UIL'
WHERE id = 'ebinter_terziario';

-- Artigianato -> F011 (Edilizia ANCE)
UPDATE ccnl 
SET 
  codice_cnel = 'F011',
  macro_settore_cnel = 'EDILIZIA, LEGNO E ARREDAMENTO',
  contraenti_datoriali = 'ANCE',
  contraenti_sindacali = 'FENEAL UIL; FILCA CISL; FILLEA CGIL'
WHERE id = 'artigianato';

-- Verifica mapping
SELECT 
  id,
  name,
  codice_cnel,
  macro_settore_cnel,
  emitter
FROM ccnl
WHERE codice_cnel IS NOT NULL
ORDER BY emitter, name;
