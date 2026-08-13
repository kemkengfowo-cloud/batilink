# 🏗️ Batilink — Plateforme Artisans Cameroun

Mise en relation entre clients et artisans du bâtiment au Cameroun.

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js 18+
- MongoDB installé localement (ou MongoDB Atlas)
- Git

---

### 1. Cloner & installer

```bash
# Backend
cd server
cp .env.example .env
npm install

# Frontend
cd ../client
npm install
```

### 2. Configurer le `.env` du serveur

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/batilink
JWT_SECRET=batilink_secret_super_securise_changez_moi
CLIENT_URL=http://localhost:3000
```

### 3. Démarrer

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm start
```

Ouvrir : **http://localhost:3000**

---

## 📁 Structure du projet

```
batilink/
├── server/
│   ├── index.js              # Point d'entrée Express
│   ├── .env.example
│   ├── middleware/
│   │   ├── auth.js           # Vérification JWT
│   │   └── upload.js         # Multer (images)
│   ├── models/
│   │   ├── User.js           # Schéma utilisateur
│   │   ├── Artisan.js        # Schéma profil artisan
│   │   ├── Project.js        # Schéma projet
│   │   └── Message.js        # Schéma message
│   ├── routes/
│   │   ├── auth.js           # /api/auth
│   │   ├── users.js          # /api/users
│   │   ├── artisans.js       # /api/artisans
│   │   ├── projects.js       # /api/projects
│   │   └── messages.js       # /api/messages
│   └── uploads/              # Images stockées localement
│
└── client/
    ├── public/index.html
    ├── tailwind.config.js
    └── src/
        ├── App.jsx            # Routes principales
        ├── index.js
        ├── index.css
        ├── context/
        │   └── AuthContext.js # Auth globale JWT
        ├── utils/
        │   ├── api.js         # Axios instance
        │   └── helpers.js     # Fonctions utilitaires
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ArtisanCard.jsx
        │   ├── ProjectCard.jsx
        │   └── Loader.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Profile.jsx
            ├── ArtisanList.jsx
            ├── ArtisanProfile.jsx
            ├── ProjectList.jsx
            ├── ProjectDetail.jsx
            ├── CreateProject.jsx
            └── Messages.jsx
```

---

## 🌐 API REST

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | /api/auth/register | Créer un compte | ❌ |
| POST | /api/auth/login | Se connecter | ❌ |
| GET | /api/auth/me | Profil connecté | ✅ |
| GET | /api/artisans | Liste artisans (filtres: ville, metier) | ❌ |
| GET | /api/artisans/:id | Profil d'un artisan | ❌ |
| GET | /api/artisans/me | Mon profil artisan | ✅ |
| PUT | /api/artisans/profile | Modifier profil artisan | ✅ artisan |
| POST | /api/artisans/photos | Ajouter photos réalisations | ✅ artisan |
| GET | /api/projects | Liste projets ouverts | ❌ |
| GET | /api/projects/:id | Détail projet | ❌ |
| GET | /api/projects/my | Mes projets | ✅ client |
| POST | /api/projects | Créer projet | ✅ client |
| PUT | /api/projects/:id | Modifier projet | ✅ propriétaire |
| DELETE | /api/projects/:id | Supprimer projet | ✅ propriétaire |
| GET | /api/messages/conversations | Mes conversations | ✅ |
| GET | /api/messages/:userId | Messages avec un user | ✅ |
| POST | /api/messages | Envoyer message | ✅ |
| PUT | /api/users/profile | Modifier profil user | ✅ |
| POST | /api/users/avatar | Changer photo profil | ✅ |

---

## ☁️ Déploiement production

### Backend → Railway

```bash
# 1. Créer un compte Railway.app
# 2. New Project → Deploy from GitHub
# 3. Ajouter variables d'environnement :
#    MONGO_URI=mongodb+srv://...  (MongoDB Atlas)
#    JWT_SECRET=votre_secret
#    CLIENT_URL=https://votre-app.vercel.app
# 4. Railway détecte Node.js automatiquement
```

### Frontend → Vercel

```bash
npm install -g vercel
cd client
vercel
# Suivre les instructions
# Ajouter variable : REACT_APP_API_URL=https://votre-api.railway.app
```

### Base de données → MongoDB Atlas

```
1. atlas.mongodb.com → créer compte gratuit
2. New Cluster → Shared (gratuit)
3. Créer user + whitelist IP 0.0.0.0/0
4. Copier l'URI de connexion dans Railway
```

---

## 🛠️ Technologies

| Couche | Stack |
|--------|-------|
| Frontend | React 18, React Router 6, Tailwind CSS 3 |
| Backend | Node.js, Express 4 |
| Base de données | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Upload | Multer (stockage local) |
| Fonts | Plus Jakarta Sans, Sora (Google Fonts) |

---

## ✨ Fonctionnalités

- ✅ Inscription / Connexion JWT (client & artisan)
- ✅ Page d'accueil hero + artisans + projets récents
- ✅ Liste artisans avec filtres (ville, métier)
- ✅ Profil artisan complet (photos, note, WhatsApp)
- ✅ Bouton WhatsApp direct depuis profil
- ✅ Publication de projets avec photos
- ✅ Liste projets avec filtres
- ✅ Messagerie interne (conversations)
- ✅ Dashboard client & artisan
- ✅ Upload photos de réalisations
- ✅ Design mobile-first responsive
- ✅ Protection des routes par rôle

---

## 📞 Support

Projet Batilink — Cameroun 🇨🇲
