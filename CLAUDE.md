# B.Y.H — Build Your Home — Contexte Projet

## INFOS DÉPLOIEMENT
- **Frontend (Vercel):** https://www.byh-cm.com
- **Backend (Railway):** https://batilink-production-9d9f.up.railway.app (PORT 8080)
- **GitHub web:** https://github.com/kemkengfowo-cloud/batilink (branch: main)
- **Dossier web:** C:\Users\Kemke\OneDrive\Desktop\batilink-projet-complet\batilink
- **App mobile:** C:\Users\Kemke\OneDrive\Desktop\byh-mobile-v2 (SDK 57, Expo Go)
- **GitHub mobile:** https://github.com/kemkengfowo-cloud/byh-mobile

## WORKFLOW DÉPLOIEMENT (CRITIQUE)
```bash
# Déployer le frontend
cd /c/Users/Kemke/OneDrive/Desktop/batilink-projet-complet/batilink && bash deploy.sh
```
- GitHub est DÉCONNECTÉ de Vercel — déploiement UNIQUEMENT via deploy.sh
- Token Vercel stocké dans .env.local

## VARIABLES D'ENVIRONNEMENT
- Railway : MONGO_URI, JWT_SECRET, CLIENT_URL, EMAIL_USER, EMAIL_PASS, MESOMB_APP_KEY
- .env.production client : REACT_APP_API_URL=https://batilink-production-9d9f.up.railway.app

## COMPTES DE TEST
- Admin: admin@batilink.cm / Admin2024Batilink
- Client: client@byh-cm.com / byh2026demo (BYH-CLI-0006)
- Artisan: artisan@byh-cm.com / byh2026demo (BYH-ART-0004)
- Entreprise: entreprise@byh-cm.com / byh2026demo (BYH-ENT-0006)

## STACK TECHNIQUE
- Frontend: React.js + TailwindCSS
- Backend: Node.js + Express + MongoDB Atlas
- Paiements: MeSomb (Orange Money + MTN MoMo)
- Stockage: Cloudinary
- Mobile: Expo SDK 57 (React Native)

## ARCHITECTURE
- client/src/pages/ — Pages React web
- client/src/components/ — Composants réutilisables
- server/routes/ — Routes API backend
- server/models/ — Modèles MongoDB
- src/screens/ — Écrans app mobile (dossier byh-mobile-v2)
- src/navigation/AppNavigator.js — Navigation mobile

## FONCTIONNALITÉS PRINCIPALES
- Marketplace BTP Cameroun
- Artisans/Entreprises vérifiés par B.Y.H
- Paiement escrow (bloqué jusqu'à validation travaux)
- Orange Money + MTN MoMo via MeSomb
- Devis, Contrats, Jalons, Photos chantier
- Conducteur de travaux
- Location de personnel
- Messagerie temps réel
- Panel Admin complet
- Feedback widget
- App mobile Expo

## CE QUI A ÉTÉ FAIT
- Refonte visuelle complète web (Home, Login, Register, Artisans, Entreprises, Projets, Profils)
- Photos dynamiques par rôle sur Register
- Corrections orthographe/grammaire partout
- App mobile : RegisterScreen champs dynamiques, DashboardScreen stats réelles, ProfilScreen modal édition
- Script deploy.sh automatique
- Route notifications et PUT /users/me ajoutées

## PRIORITÉS RESTANTES
1. Build APK Android
2. Intégration Se Construire (commandes matériaux)
3. Backups MongoDB Atlas
4. Notifications push Expo
5. Compléter profil MeSomb (CNI)
