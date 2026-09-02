const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Entreprise = require('../models/Entreprise');
const { sendBienvenue } = require("../utils/emails");
const { logAction } = require('../middleware/logger');

const genToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

const generateRefreshToken = async (userId) => {
  const crypto = require("crypto");
  const RefreshToken = require("../models/RefreshToken");
  const token = crypto.randomBytes(64).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, token, expires });
  return token;
};
const setCookies = (res, token, refreshToken) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("byh_token", token, { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  if (refreshToken) res.cookie("byh_refresh", refreshToken, { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 30 * 24 * 60 * 60 * 1000 });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  // INSCRIPTION TEMPORAIREMENT BLOQUEE - Lancement imminent
  return res.status(503).json({ message: "Les inscriptions sont temporairement suspendues. Le lancement officiel de B.Y.H est imminent. Revenez très bientôt !" });
  try {
    const { name, email, password, role, phone, city, metier, whatsapp, experience,
            nomEntreprise, nomResponsable, rccm, lotsTravauxPropose, typePersonnel,
            estDiaspora, paysDiaspora, specialites } = req.body;

    const exists = await User.findOne({ email: email?.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email deja utilise.' });

    const userName = role === 'entreprise' ? (nomResponsable || name) : name;
    const Counter = require('../models/Counter');
    const count = await Counter.getNext('user_' + role);
    const prefix = role === "client" ? "CLI" : role === "artisan" ? "ART" : role === "entreprise" ? "ENT" : role === "conducteur" ? "CDT" : "ADM";
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
    setCookies(res, token, null);
    res.status(201).json({ token, user });
    sendBienvenue(user).catch(e => console.error("Email bienvenue:", e.message));
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
    const refreshToken = await generateRefreshToken(user._id);
    setCookies(res, token, refreshToken);
    res.json({ token, refreshToken, user });
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

const OTPCode = require('../models/OTPCode');
const { generateOTP, sendEmailOTP, sendSMSOTP } = require('../utils/otp');

// POST /api/auth/send-otp — Envoyer code OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { contact, type } = req.body;
    if (!contact || !type) return res.status(400).json({ message: 'Contact et type requis.' });
    if (!['email', 'sms'].includes(type)) return res.status(400).json({ message: 'Type invalide.' });

    const code = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTPCode.findOneAndDelete({ contact, type });
    await OTPCode.create({ contact, code, type, expires });

    if (type === 'email') {
      await sendEmailOTP(contact, code);
    } else {
      await sendSMSOTP(contact, code);
    }

    res.json({ message: `Code envoye par ${type === 'email' ? 'email' : 'SMS'} !` });
  } catch(err) {
    console.error('OTP error:', err.message);
    res.status(500).json({ message: 'Erreur envoi code: ' + err.message });
  }
});

// POST /api/auth/verify-otp — Vérifier code OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { contact, type, code } = req.body;
    if (!contact || !type || !code) return res.status(400).json({ message: 'Champs requis manquants.' });

    const otp = await OTPCode.findOne({ contact, type, verified: false });
    if (!otp) return res.status(400).json({ message: 'Code invalide ou expire.' });
    if (otp.expires < new Date()) return res.status(400).json({ message: 'Code expire. Demandez un nouveau code.' });
    if (otp.code !== code) return res.status(400).json({ message: 'Code incorrect.' });

    await OTPCode.findByIdAndUpdate(otp._id, { verified: true });
    await User.findOneAndUpdate({ $or: [{ email: contact }, { phone: contact }] }, { emailVerified: true });

    res.json({ message: 'Verification reussie !' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');

// POST /api/auth/refresh — Rafraichir le token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token manquant.' });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(401).json({ message: 'Refresh token invalide.' });
    if (stored.expires < new Date()) {
      await RefreshToken.findByIdAndDelete(stored._id);
      return res.status(401).json({ message: 'Refresh token expire. Reconnectez-vous.' });
    }

    const user = await User.findById(stored.userId);
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable.' });

    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: newToken, user });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/logout — Déconnexion et suppression refresh token
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await RefreshToken.findOneAndDelete({ token: refreshToken });
    res.json({ message: 'Deconnexion reussie.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

