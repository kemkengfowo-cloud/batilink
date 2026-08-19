const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Entreprise = require('../models/Entreprise');
const { logAction } = require('../middleware/logger');

const genToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET manquant'); })(),
  { expiresIn: '7d' }
);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, city, metier, whatsapp, experience,
            nomEntreprise, nomResponsable, rccm, lotsTravauxPropose, typePersonnel,
            estDiaspora, paysDiaspora, specialites } = req.body;

    const exists = await User.findOne({ email: email?.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email deja utilise.' });

    const userName = role === 'entreprise' ? (nomResponsable || name) : name;
    const Counter = require('../models/Counter');
    const count = await Counter.getNext('user_' + role);
    const prefix = role === "client" ? "CLI" : role === "artisan" ? "ART" : role === "entreprise" ? "ENT" : "ADM";
    const matricule = `BYH-${prefix}-${String(count + 1).padStart(4, "0")}`;
    const user = await new User({ name: userName, email, password, role, phone, city, estDiaspora, pays: paysDiaspora, matricule }).save();

    // Creer profil artisan
    if (role === 'artisan') {
      await Artisan.create({
        user: user._id,
        metier: metier || 'Non specifie',
        ville: city || '',
        whatsapp: whatsapp || '',
        experience: parseInt(experience) || 0,
        specialites: specialites ? specialites.split(',').map(s=>s.trim()).filter(Boolean) : []
      });
    }

    // Creer profil entreprise
    if (role === 'entreprise') {
      await Entreprise.create({
        user: user._id,
        nomEntreprise: nomEntreprise || userName,
        nomResponsable: nomResponsable || userName,
        ville: city || '',
        rccm: rccm || '',
        lotsTravauxPropose: lotsTravauxPropose || [],
        typePersonnel: typePersonnel || []
      });
    }

    // Logger inscription
    await logAction({
      userId: user._id,
      nom: user.name,
      email: user.email,
      role: user.role,
      action: 'INSCRIPTION',
      details: { ville: city, role, estDiaspora: estDiaspora || false },
      ip: req.ip
    });

    const token = genToken(user);
    res.status(201).json({ token, user });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      // Logger echec connexion
      await logAction({
        userId: null, nom: 'Inconnu', email: email || '', role: 'inconnu',
        action: 'CONNEXION',
        details: { email, raison: 'Email ou mot de passe incorrect' },
        statut: 'echec',
        ip: req.ip
      });
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    if (user.blocked) return res.status(403).json({ message: 'Compte bloque. Contactez l administrateur.' });

    // Logger connexion reussie
    await logAction({
      userId: user._id,
      nom: user.name,
      email: user.email,
      role: user.role,
      action: 'CONNEXION',
      details: { ville: user.city },
      statut: 'succes',
      ip: req.ip
    });

    const token = genToken(user);
    res.json({ token, user });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// GET /api/auth/me — Récupérer l'utilisateur connecté
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve.' });
    res.json(user);
  } catch(err) { res.status(500).json({ message: err.message }); }
});
