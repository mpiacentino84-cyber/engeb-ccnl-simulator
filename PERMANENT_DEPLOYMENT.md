# 🌐 Deployment Permanente - ENGEB CCNL Simulator

## Guida Completa per Hosting Permanente

Questa guida ti aiuterà a deployare l'applicazione su una piattaforma cloud per renderla accessibile permanentemente con un URL pubblico stabile.

---

## 🚀 Opzione 1: Railway (Consigliata - Gratuita con MySQL)

Railway offre hosting gratuito con database MySQL incluso e deployment automatico da GitHub.

### Vantaggi
- ✅ Piano gratuito generoso ($5/mese di crediti)
- ✅ MySQL incluso (no setup esterno)
- ✅ Deploy automatico da Git
- ✅ SSL/HTTPS automatico
- ✅ Dominio personalizzato gratuito
- ✅ Logs e monitoring integrati

### Prerequisiti
- Account GitHub (gratuito)
- Account Railway (gratuito): https://railway.app

### Passo 1: Preparare Repository GitHub

```bash
# 1. Creare repository su GitHub (via web)
# Nome suggerito: engeb-ccnl-simulator

# 2. Collegare repository locale
cd /home/ubuntu/engeb_ccnl_simulator
git remote add origin https://github.com/TUO_USERNAME/engeb-ccnl-simulator.git

# 3. Commit e push
git add .
git commit -m "Initial commit - ENGEB CCNL Simulator"
git branch -M main
git push -u origin main
```

### Passo 2: Deploy su Railway

1. **Login su Railway**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Seleziona** il repository `engeb-ccnl-simulator`
4. **Add MySQL Database**:
   - Click su "+ New" → "Database" → "Add MySQL"
   - Railway creerà automaticamente il database

### Passo 3: Configurare Variabili d'Ambiente

Nel dashboard Railway, vai su **Variables** e aggiungi:

```env
# Database (Railway lo fornisce automaticamente come MYSQL_URL)
DATABASE_URL=${{MYSQL.DATABASE_URL}}

# JWT Secret (genera una stringa random lunga)
JWT_SECRET=your-super-long-random-secret-key-here-min-32-chars

# Node Environment
NODE_ENV=production

# Port (Railway lo gestisce automaticamente)
PORT=3000
```

**Nota**: Railway fornisce automaticamente `MYSQL_URL` quando aggiungi il database MySQL. Puoi usare `${{MYSQL.DATABASE_URL}}` per referenziarlo.

### Passo 4: Inizializzare Database

Dopo il primo deploy, esegui lo script di inizializzazione:

1. Nel dashboard Railway, vai su **Deployments**
2. Click sull'ultimo deployment
3. Apri la **Console** (tab "Shell")
4. Esegui:

```bash
bash scripts/railway-init-db.sh
```

Oppure manualmente:

```bash
pnpm db:migrate
node scripts/migrate-all-ccnl.mjs
npx tsx scripts/populate-monthly-stats.mjs
```

### Passo 5: Ottenere URL Pubblico

1. Nel dashboard Railway, vai su **Settings**
2. Sezione **Networking** → **Generate Domain**
3. Railway genererà un URL tipo: `engeb-ccnl-simulator.up.railway.app`

**Opzionale**: Puoi aggiungere un dominio personalizzato (es. `ccnl.tuodominio.it`)

---

## 🌟 Opzione 2: Vercel + PlanetScale (Gratuita)

### Vantaggi
- ✅ Completamente gratuito
- ✅ Deploy automatico da Git
- ✅ Edge network globale (velocissimo)
- ✅ SSL/HTTPS automatico
- ✅ Dominio personalizzato gratuito

### Svantaggi
- ⚠️ Richiede database esterno (PlanetScale o TiDB Cloud)
- ⚠️ Più complesso da configurare

### Setup

1. **Database PlanetScale**:
   - Registrati su https://planetscale.com
   - Crea database MySQL-compatibile
   - Ottieni connection string

2. **Deploy Vercel**:
   - Registrati su https://vercel.com
   - Collega repository GitHub
   - Aggiungi variabile `DATABASE_URL` con connection string PlanetScale
   - Deploy automatico

---

## 🐳 Opzione 3: Docker + VPS (Controllo Completo)

### Vantaggi
- ✅ Controllo totale
- ✅ Nessun limite di risorse (dipende dal VPS)
- ✅ Costo fisso prevedibile

### Svantaggi
- ⚠️ Richiede gestione server
- ⚠️ Costo mensile VPS (~$5-10/mese)

### Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Installare pnpm
RUN npm install -g pnpm

# Copiare package files
COPY package.json pnpm-lock.yaml ./

# Installare dipendenze
RUN pnpm install --frozen-lockfile --prod=false

# Copiare codice sorgente
COPY . .

# Build
RUN pnpm build

# Esporre porta
EXPOSE 3000

# Variabili d'ambiente
ENV NODE_ENV=production

# Avviare app
CMD ["pnpm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/engeb_ccnl
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=engeb_ccnl
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

### Deploy su VPS

```bash
# 1. SSH nel VPS
ssh user@your-vps-ip

# 2. Installare Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install docker-compose

# 3. Clonare repository
git clone https://github.com/TUO_USERNAME/engeb-ccnl-simulator.git
cd engeb-ccnl-simulator

# 4. Configurare .env
cp .env.example .env
nano .env  # Modificare DATABASE_URL e JWT_SECRET

# 5. Build e avvio
docker-compose up -d

# 6. Inizializzare database
docker-compose exec app bash scripts/railway-init-db.sh

# 7. Verificare
curl http://localhost:3000
```

---

## 🔒 Checklist Sicurezza Produzione

Prima di rendere il sito pubblico, assicurati di:

- [ ] **JWT_SECRET** è una stringa random lunga (>32 caratteri)
- [ ] **HTTPS** è abilitato (automatico su Railway/Vercel)
- [ ] **Database password** è forte (se VPS)
- [ ] **Backup database** è configurato
- [ ] **Variabili d'ambiente** non sono committate su Git
- [ ] **CORS** è configurato correttamente
- [ ] **Rate limiting** è abilitato per API
- [ ] **Logs** sono monitorati

---

## 📊 Monitoraggio Post-Deploy

### Verificare Deployment

```bash
# Test endpoint API
curl https://tuo-dominio.railway.app/api/health

# Test pagina principale
curl https://tuo-dominio.railway.app/
```

### Logs

**Railway**:
- Dashboard → Deployments → View Logs

**Vercel**:
- Dashboard → Deployments → Function Logs

**VPS/Docker**:
```bash
docker-compose logs -f app
```

### Metriche Database

```sql
-- Verificare CCNL
SELECT COUNT(*) FROM ccnls;

-- Verificare statistiche
SELECT COUNT(*) FROM ccnl_monthly_stats;

-- Verificare ultimo aggiornamento
SELECT MAX(updatedAt) FROM ccnls;
```

---

## 🆘 Troubleshooting

### Problema: Build fallisce

**Soluzione**:
1. Verificare che `pnpm-lock.yaml` sia committato
2. Verificare versione Node.js (richiede 18+)
3. Controllare logs di build per errori specifici

### Problema: Database connection error

**Soluzione**:
1. Verificare `DATABASE_URL` nelle variabili d'ambiente
2. Verificare che database sia in running
3. Testare connessione con MySQL client

### Problema: App si avvia ma pagine vuote

**Soluzione**:
1. Verificare che migrazioni siano state eseguite
2. Verificare che dati CCNL siano stati popolati
3. Controllare logs per errori runtime

### Problema: Grafici trend vuoti

**Soluzione**:
```bash
# Eseguire script statistiche mensili
npx tsx scripts/populate-monthly-stats.mjs
```

---

## 🔄 Aggiornamenti Futuri

### Deploy Automatico (Railway/Vercel)

Ogni push su GitHub triggera automaticamente un nuovo deploy:

```bash
git add .
git commit -m "Update: descrizione modifiche"
git push origin main
```

### Deploy Manuale (VPS)

```bash
# SSH nel VPS
ssh user@your-vps-ip
cd engeb-ccnl-simulator

# Pull ultime modifiche
git pull origin main

# Rebuild e restart
docker-compose down
docker-compose up -d --build
```

---

## 💰 Costi Stimati

### Railway (Piano Gratuito)
- **Costo**: $0/mese (fino a $5 di crediti gratuiti)
- **Sufficiente per**: ~500 ore/mese di runtime
- **Ideale per**: Demo, MVP, progetti piccoli

### Railway (Piano Hobby)
- **Costo**: $5/mese
- **Include**: $5 di crediti + risorse extra
- **Ideale per**: Produzione piccola-media

### Vercel + PlanetScale
- **Costo**: $0/mese (entrambi hanno piano gratuito)
- **Limiti**: 1GB storage DB, 100GB bandwidth
- **Ideale per**: Progetti personali, startup

### VPS (DigitalOcean/Linode)
- **Costo**: $5-10/mese
- **Include**: Server dedicato, controllo totale
- **Ideale per**: Produzione, controllo completo

---

## 📞 Supporto

Per problemi di deployment:
- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- PlanetScale: https://planetscale.com/docs

---

**Buon deployment! 🚀**
