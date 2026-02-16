# ENGEB CCNL Simulator → App Consulenza Lavoro (Base)

Questo repository è un **monorepo full‑stack** (React/Vite + Express + tRPC + Drizzle + MySQL) che implementa:

- **Simulatore confronto CCNL** (ENGEB vs Nazionali/Custom)
- **Database CCNL** (ricerca/filtri/dettaglio)
- **CCNL personalizzati** (CRUD con ownership)
- **Statistiche** (KPI + grafici + export Excel)
- **Admin** (gestione utenti/ruoli)
- **Normativa & Prassi** (repository fonti + pagine pubbliche + admin)
- **Toolkit consulente** (checklist + template + export documento)
- **Servizi Sindacati / Enti Bilaterali** (catalogo + richieste + upload + tracking)

> Nota: alcune aree richiedono autenticazione OAuth. Le pagine pubbliche (landing, simulatore, database, statistiche) funzionano anche senza OAuth.

---

## Quick start (sviluppo)

### 1) Prerequisiti
- Node.js LTS recente
- `pnpm`
- MySQL (locale o remoto)

### 2) Installazione
```bash
pnpm install
```

### 3) Configurazione ambiente
1. Copia `.env.example` in `.env`
2. Compila almeno `DATABASE_URL` (obbligatorio).

Esempio:
```env
DATABASE_URL="mysql://root:password@localhost:3306/engeb_ccnl"
JWT_SECRET="change_me_to_a_long_random_secret"
```

### 4) Database & migrazioni
Assicurati che il database esista (es. `engeb_ccnl`).

Poi esegui le migrazioni:
```bash
pnpm db:migrate
```

> Se devi generare nuove migrazioni da schema Drizzle:
```bash
pnpm db:generate
pnpm db:migrate
```

### 5) Avvio in sviluppo
```bash
pnpm dev
```

Apri:
- `http://localhost:3000/` (Landing)
- `http://localhost:3000/simulator` (Simulatore)
- `http://localhost:3000/ccnl-database` (Database)
- `http://localhost:3000/statistics` (Statistiche)

Altri moduli:
- `http://localhost:3000/legal` (Normativa & Prassi)
- `http://localhost:3000/toolkit` (Toolkit)
- `http://localhost:3000/services` (Servizi)
- `http://localhost:3000/requests` (Richieste – richiede login)
- `http://localhost:3000/admin/legal` (Admin Normativa – richiede ruolo staff)
- `http://localhost:3000/admin/requests` (Admin Richieste – richiede ruolo staff)

### (Opzionale) Seed contenuti di esempio

Dopo le migrazioni, puoi popolare contenuti dimostrativi (ESEMPIO) per Normativa/Toolkit/Servizi:

```bash
pnpm seed:content
```

---

## Autenticazione (OAuth) – opzionale

Le sezioni protette (**/my-ccnl**, **/admin**, **/users**) richiedono OAuth.

Variabili utili:
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `JWT_SECRET`

Se OAuth non è configurato, puoi comunque lavorare sulle feature pubbliche.

---

## Struttura progetto (high level)

- `client/` → React UI (wouter routing, Tailwind, Radix/shadcn)
- `server/` → Express + tRPC + auth/session
- `drizzle/` → schema + migrazioni SQL
- `scripts/` → import/seed (CNEL, statistiche mensili, ecc.)
- `shared/` → costanti e tipi condivisi

Documentazione utile:
- `FEATURES.md`
- `USER_GUIDE.md`
- `QA_CHECKLIST.md`
- `KNOWN_ISSUES.md`

---

## Build & produzione

```bash
pnpm build
pnpm start
```

---

## Troubleshooting rapido

### Statistiche vuote / errore API
- Verifica `DATABASE_URL` e connessione MySQL
- Assicurati di aver eseguito `pnpm db:migrate`
- Se mancano dati di trend mensile, esegui gli script di seed presenti in `scripts/`

### Download Excel bloccato
- Alcuni browser bloccano download automatici: prova a consentire i download per il sito.
