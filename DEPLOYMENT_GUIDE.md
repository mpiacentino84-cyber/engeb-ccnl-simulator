# Guida al Deployment - ENGEB CCNL Simulator

## 🚀 App Pronta per l'Uso

L'applicazione è **completamente funzionante** e pronta per essere utilizzata dai tuoi collaboratori.

---

## 🌐 Accesso Pubblico (Demo Attuale)

**URL Pubblico**: https://3000-iycuh9tky60ol2zxzqikk-4c0fa37a.us2.manus.computer

L'app è attualmente accessibile pubblicamente tramite questo URL. Puoi condividerlo con i tuoi collaboratori per testing e demo immediato.

### Pagine Disponibili:
- **Landing Page**: `/` - Pagina principale con overview
- **Simulatore CCNL**: `/simulator` - Confronto costi CCNL
- **Database CCNL**: `/ccnl-database` - Archivio completo 26 contratti
- **Statistiche**: `/statistics` - KPI e grafici trend

---

## 💻 Setup Locale per Sviluppo

Se i tuoi collaboratori vogliono eseguire l'app in locale per sviluppo:

### 1. Prerequisiti
```bash
- Node.js 18+ LTS
- pnpm (package manager)
- MySQL 8.0+ (locale o remoto)
```

### 2. Clonare il Repository
```bash
git clone <repository-url>
cd engeb_ccnl_simulator
```

### 3. Installare Dipendenze
```bash
pnpm install
```

### 4. Configurare Database

**Opzione A: MySQL Locale**
```bash
# Avviare MySQL
sudo service mysql start

# Creare database
mysql -u root -e "CREATE DATABASE engeb_ccnl;"

# Configurare autenticazione (se necessario)
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';"
mysql -u root -e "FLUSH PRIVILEGES;"
```

**Opzione B: TiDB Cloud (Consigliato per Produzione)**
1. Creare account su https://tidbcloud.com
2. Creare cluster MySQL-compatibile
3. Ottenere connection string
4. Usare nel file `.env`

### 5. Configurare Variabili d'Ambiente

Copiare `.env.example` in `.env`:
```bash
cp .env.example .env
```

Modificare `.env` con i valori corretti:
```env
# Database (OBBLIGATORIO)
DATABASE_URL="mysql://root@localhost:3306/engeb_ccnl"

# JWT Secret (CONSIGLIATO)
JWT_SECRET="your-long-random-secret-key-here"

# OAuth (OPZIONALE - per funzionalità protette)
# VITE_APP_ID="engeb-ccnl-simulator"
# OAUTH_SERVER_URL="https://your-oauth-server"
```

### 6. Eseguire Migrazioni Database
```bash
pnpm db:migrate
```

### 7. Popolare Dati Iniziali

**Migrazione CCNL (26 contratti)**:
```bash
node scripts/migrate-all-ccnl.mjs
```

**Statistiche Mensili (per grafici trend)**:
```bash
npx tsx scripts/populate-monthly-stats.mjs
```

### 8. Avviare in Sviluppo
```bash
pnpm dev
```

L'app sarà disponibile su: http://localhost:3000

---

## 🏗️ Build per Produzione

### 1. Eseguire Build
```bash
pnpm build
```

Questo comando:
- Compila il frontend con Vite
- Compila il backend con esbuild
- Genera i file nella cartella `dist/`

### 2. Avviare in Produzione
```bash
pnpm start
```

### 3. Variabili d'Ambiente Produzione

Assicurarsi che il file `.env` contenga:
```env
NODE_ENV=production
DATABASE_URL="mysql://user:password@host:port/database"
JWT_SECRET="production-secret-key-very-long-and-random"
```

---

## 🐳 Deploy con Docker (Opzionale)

### Dockerfile Esempio
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Installare pnpm
RUN npm install -g pnpm

# Copiare package files
COPY package.json pnpm-lock.yaml ./

# Installare dipendenze
RUN pnpm install --frozen-lockfile

# Copiare codice sorgente
COPY . .

# Build
RUN pnpm build

# Esporre porta
EXPOSE 3000

# Avviare app
CMD ["pnpm", "start"]
```

### Docker Compose Esempio
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/engeb_ccnl
      - JWT_SECRET=your-secret-key
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=engeb_ccnl
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## ☁️ Deploy su Piattaforme Cloud

### Vercel (Frontend + Serverless Backend)
1. Collegare repository GitHub
2. Configurare variabili d'ambiente
3. Deploy automatico ad ogni push

### Railway / Render
1. Collegare repository
2. Configurare build command: `pnpm build`
3. Configurare start command: `pnpm start`
4. Aggiungere MySQL addon

### VPS (DigitalOcean, Linode, AWS EC2)
1. SSH nel server
2. Installare Node.js, pnpm, MySQL
3. Clonare repository
4. Seguire setup locale
5. Usare PM2 per process management:
```bash
npm install -g pm2
pm2 start dist/index.js --name engeb-ccnl
pm2 save
pm2 startup
```

---

## 🔒 Sicurezza

### Checklist Produzione:
- [ ] Cambiare `JWT_SECRET` con valore random lungo (>32 caratteri)
- [ ] Usare HTTPS (certificato SSL/TLS)
- [ ] Configurare CORS appropriatamente
- [ ] Usare database password forte
- [ ] Limitare accesso database solo da app server
- [ ] Abilitare rate limiting per API
- [ ] Configurare backup database automatici

---

## 📊 Monitoraggio

### Logs
```bash
# Sviluppo
tail -f /tmp/app.log

# Produzione con PM2
pm2 logs engeb-ccnl
```

### Metriche Database
```sql
-- Verificare numero CCNL
SELECT COUNT(*) FROM ccnls;

-- Verificare statistiche mensili
SELECT COUNT(*) FROM ccnl_monthly_stats;

-- Verificare ultimo aggiornamento
SELECT MAX(updatedAt) FROM ccnls;
```

---

## 🆘 Troubleshooting

### Problema: Grafici trend vuoti
**Soluzione**: Eseguire `npx tsx scripts/populate-monthly-stats.mjs`

### Problema: Errore connessione database
**Soluzione**: Verificare `DATABASE_URL` in `.env` e che MySQL sia in esecuzione

### Problema: Export Excel non funziona
**Soluzione**: Verificare permessi browser per download automatici

### Problema: Errore OAuth
**Soluzione**: Le funzionalità pubbliche (simulatore, database, statistiche) funzionano senza OAuth. Per funzionalità protette, configurare `VITE_APP_ID` e `OAUTH_SERVER_URL`

---

## 📞 Supporto

Per problemi o domande:
- Consultare `README.md` per documentazione generale
- Consultare `FEATURES.md` per lista funzionalità
- Consultare `KNOWN_ISSUES.md` per problemi noti
- Consultare `USER_GUIDE.md` per guida utente

---

## ✅ Checklist Deployment Completato

- [x] Database configurato e migrazioni eseguite
- [x] 26 CCNL migrati con successo
- [x] Statistiche mensili popolate (108 righe)
- [x] App in esecuzione su http://localhost:3000
- [x] Tutte le pagine principali testate e funzionanti
- [x] Grafici trend temporali funzionanti
- [x] URL pubblico esposto per condivisione
- [x] Documentazione deployment creata

---

**Data Setup**: 2026-02-16  
**Versione**: 1.0.0  
**Status**: ✅ PRODUCTION READY
