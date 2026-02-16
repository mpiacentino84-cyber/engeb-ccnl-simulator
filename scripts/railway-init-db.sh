#!/bin/bash
# Script di inizializzazione database per Railway
# Eseguito automaticamente al primo deploy

set -e

echo "🔄 Inizio inizializzazione database..."

# Esegui migrazioni
echo "📊 Esecuzione migrazioni Drizzle..."
pnpm db:migrate

# Popola CCNL
echo "📦 Migrazione CCNL..."
node scripts/migrate-all-ccnl.mjs

# Popola statistiche mensili
echo "📈 Popolamento statistiche mensili..."
npx tsx scripts/populate-monthly-stats.mjs

echo "✅ Inizializzazione database completata!"
