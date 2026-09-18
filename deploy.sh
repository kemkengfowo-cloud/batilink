#!/bin/bash
echo "🚀 Build B.Y.H..."
cd /c/Users/Kemke/OneDrive/Desktop/batilink-projet-complet/batilink/client
npx react-scripts build 2>&1 | tail -2

echo "📦 Préparation déploiement..."
cd build

# Toujours recréer vercel.json
cat > vercel.json << 'EOF'
{
  "buildCommand": "echo done",
  "installCommand": "echo done",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF

echo "🌐 Déploiement Vercel..."
TOKEN=$(grep VERCEL_TOKEN /c/Users/Kemke/OneDrive/Desktop/batilink-projet-complet/batilink/.env.local | cut -d'=' -f2 | tr -d '\r\n')
vercel --prod --yes --force --token "$TOKEN"

echo "✅ Déployé sur www.byh-cm.com !"
