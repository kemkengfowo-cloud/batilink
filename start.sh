#!/bin/bash
echo "🏗️  Batilink — Démarrage"
echo ""

# Vérifier Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js non installé. Téléchargez sur https://nodejs.org"
  exit 1
fi

# Vérifier MongoDB
if ! command -v mongod &> /dev/null; then
  echo "⚠️  MongoDB non détecté localement."
  echo "   → Installez MongoDB : https://www.mongodb.com/try/download/community"
  echo "   → Ou utilisez MongoDB Atlas (cloud) et mettez à jour MONGO_URI dans server/.env"
fi

# Installer dépendances si besoin
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installation des dépendances backend..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 Installation des dépendances frontend..."
  cd client && npm install && cd ..
fi

# Créer .env si absent
if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "⚙️  Fichier server/.env créé depuis .env.example"
  echo "   → Modifiez MONGO_URI et JWT_SECRET si nécessaire"
fi

echo ""
echo "✅ Prêt ! Lancez dans deux terminaux séparés :"
echo ""
echo "   Terminal 1 (Backend)  : cd server && npm run dev"
echo "   Terminal 2 (Frontend) : cd client && npm start"
echo ""
echo "🌍 Application : http://localhost:3000"
echo "🔌 API         : http://localhost:5000/api/health"
