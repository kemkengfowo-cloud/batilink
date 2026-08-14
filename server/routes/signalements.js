const express = require('express');
const router = express.Router();
const Signalement = require('../models/Signalement');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé.' });
  next();
};

// POST /api/signalements — Signaler un contenu
router.post('/', auth, async (req, res) => {
  try {
    const { cible, type, cibleId, motif, description } = req.body;
    if (!cible || !type || !cibleId || !motif)
      return res.status(400).json({ message: 'Champs requis manquants.' });
    const s = await Signalement.create({
      rapporteur: req.user.id, cible, type, cibleId, motif, description
    });
    res.status(201).json(s);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/signalements — Admin voir tous les signalements
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const signalements = await Signalement.find(filter)
      .populate('rapporteur', 'name email avatar')
      .populate('cible', 'name email avatar role')
      .sort({ createdAt: -1 });
    res.json(signalements);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/signalements/:id — Traiter un signalement
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { statut, actionAdmin } = req.body;
    const s = await Signalement.findByIdAndUpdate(
      req.params.id, { statut, actionAdmin }, { new: true }
    ).populate('rapporteur', 'name email').populate('cible', 'name email');
    res.json(s);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
