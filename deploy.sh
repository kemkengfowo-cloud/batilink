#!/bin/bash
echo "🔨 Build React..."
cd client
npx react-scripts build 2>&1 | tail -2

echo "📝 Renommage fichiers JS..."
cd build
JS_FILE=$(ls static/js/main.*.js | grep -v LICENSE | grep -v map | head -1)
HASH=$(date +%s)
NEW_NAME="main.byh${HASH}.js"

cp $JS_FILE static/js/$NEW_NAME
cp ${JS_FILE}.LICENSE.txt static/js/${NEW_NAME}.LICENSE.txt 2>/dev/null || true

OLD_NAME=$(basename $JS_FILE)
sed -i "s/${OLD_NAME}/${NEW_NAME}/g" index.html

echo "✅ Nouveau fichier: $NEW_NAME"
grep -o "main\.[^.]*\.js" index.html

echo "🚀 Déploiement Vercel..."
vercel --prod --yes --force

echo "⏳ Attente propagation..."
sleep 20

echo "🔍 Vérification..."
curl -s https://www.byh-cm.com/ | grep -o "main\.[^.]*\.js"
