const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Entreprise = require('../models/Entreprise');
const Project = require('../models/Project');
const Mission = require('../models/Mission');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
  next();
};

// POST /api/admin/create-first-admin — route secrète
router.post('/create-first-admin', async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Clé secrète invalide.' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé.' });
    const user = await new User({ name, email, password, role: 'admin', city: 'Yaoundé' }).save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ message: 'Compte admin créé !', token, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [clients, artisans, entreprises, projects, missions] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ role: 'entreprise' }),
      Project.countDocuments(),
      Mission.countDocuments()
    ]);
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);
    res.json({ clients, artisans, entreprises, projects, missions, recentUsers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(+limit).skip((+page-1)*+limit);
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/users/:id/block
router.put('/users/:id/block', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: req.body.blocked }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/artisans/:id/verify
router.put('/artisans/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(req.params.id, { verifie: req.body.verifie }, { new: true }).populate('user', 'name email');
    res.json(artisan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/entreprises/:id/verify
router.put('/entreprises/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const entreprise = await Entreprise.findByIdAndUpdate(req.params.id, { verifie: req.body.verifie }, { new: true }).populate('user', 'name email');
    res.json(entreprise);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/artisans — tous les artisans avec statut vérification
router.get('/artisans', auth, adminOnly, async (req, res) => {
  try {
    const { verifie, page = 1, limit = 20 } = req.query;
    const filter = verifie !== undefined ? { verifie: verifie === 'true' } : {};
    const artisans = await Artisan.find(filter).populate('user', 'name email phone city').sort({ createdAt: -1 }).limit(+limit).skip((+page-1)*+limit);
    const total = await Artisan.countDocuments(filter);
    res.json({ artisans, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/entreprises
router.get('/entreprises', auth, adminOnly, async (req, res) => {
  try {
    const { verifie, page = 1, limit = 20 } = req.query;
    const filter = verifie !== undefined ? { verifie: verifie === 'true' } : {};
    const entreprises = await Entreprise.find(filter).populate('user', 'name email phone city').sort({ createdAt: -1 }).limit(+limit).skip((+page-1)*+limit);
    const total = await Entreprise.countDocuments(filter);
    res.json({ entreprises, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/admin/projects/:id
router.delete('/projects/:id', auth, adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Projet supprimé.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
