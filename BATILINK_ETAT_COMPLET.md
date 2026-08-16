# BATILINK — État Complet du Projet
Date: 17 Août 2026

## URLS DE PRODUCTION
- Frontend: https://www.batilink.org
- Backend: https://batilink-production.up.railway.app
- GitHub: https://github.com/kemkengfowo-cloud/batilink

## COMPTES
- Admin: admin@batilink.cm / Admin2024Batilink
- Client test: kemkengfowo@gmail.com
- Artisan test: artisan@test.cm / test123456
- Entreprise test: entreprise@test.cm / test123456

## MONGODB
- URI: mongodb+srv://kemkengfowo_db_user:v8c1fkGZ0np4jEWK@cluster0.qt226kf.mongodb.net/batilink
- Collections: users, artisans, entreprises, projects, missions, messages, devis, contrats, jalons, litiges, avis, historiques, visiteEvaluations, signalements, photochantiers

## BACKEND ROUTES
- /api/auth - register, login
- /api/users - profile, avatar
- /api/artisans - liste, me, profil, photos
- /api/entreprises - liste, me, profil
- /api/projects - CRUD + matching auto
- /api/missions - CRUD
- /api/messages - conversations, send
- /api/devis - creer, accepter, refuser, counter, terminer
- /api/contrats - creer, signer, demarrer, terminer
- /api/jalons - creer, photos, valider
- /api/litiges - ouvrir, resoudre
- /api/avis - creer, supprimer
- /api/historique - journal, stats
- /api/visites - demander, accepter, rapport
- /api/signalements - signaler, traiter
- /api/admin - stats, users, badges, broadcast

## PAGES FRONTEND
Publiques: / /login /register /comment-ca-marche /cgu /confidentialite
Protegees: /dashboard /profile /messages /artisans /artisans/:id
           /entreprises /entreprises/:id /projects /projects/:id
           /create-project /missions /missions/:id /create-mission
           /devis /devis/creer /devis/:id /contrats /contrats/creer
           /contrats/:id /visites /visites/demander /visites/:id
           /admin /admin/historique

## FONCTIONNALITES
- 4 roles: client, artisan, entreprise, admin
- Diaspora: case + pays residence
- Badges: verifie, complet, topRated, premium
- Flux devis: projet -> devis -> jalons -> photos -> validation -> facture PDF
- Contrats location: signature electronique 2 parties
- Visites evaluation: rapport photos + estimation cout (UNIQUE en Afrique)
- Historique: matricule BTL-YYMMDD-XXXX-RAND + timestamps complets
- Matching: notification tous artisans a publication projet
- Rappels: automatiques toutes 6h
- Admin: 9 onglets + journal activite

## PENDING
1. Test flux complet end-to-end
2. Paiements Mobile Money (Orange Money + MTN MoMo)
3. Application mobile React Native Android
4. Chatbot FAQ
5. Changement nom plateforme
