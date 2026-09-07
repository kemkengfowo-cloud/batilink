#!/bin/bash
set -e
TOKEN="VERCEL_TOKEN_ICI"

echo "🔨 Build React..."
cd client
npx react-scripts build 2>&1 | tail -2
cd build

echo "📝 Préparation du déploiement..."
# Trouver le nouveau fichier JS
NEW_JS=$(ls static/js/main.*.js | grep -v "ba48ff88\|byh\|LICENSE\|map" | head -1)
echo "Nouveau JS: $NEW_JS"

# Écraser l'ancien avec le nouveau
cp "$NEW_JS" static/js/main.ba48ff88.js
echo "✅ main.ba48ff88.js mis à jour"

# Vérifier
COUNT=$(grep -c "create-agent" static/js/main.ba48ff88.js || true)
echo "create-agent occurrences: $COUNT"

# Mettre à jour index.html
sed -i 's/main\.[a-zA-Z0-9]*\.js/main.ba48ff88.js/g' index.html
grep -o "main\.[^.]*\.js" index.html

echo "🚀 Déploiement..."
vercel --prod --yes --force --token "$TOKEN"

echo "⏳ Attente 30s..."
sleep 30

echo "🔍 Vérification..."
RESULT=$(curl -s https://www.byh-cm.com/static/js/main.ba48ff88.js | grep -c "create-agent" || true)
echo "create-agent sur le serveur: $RESULT"
