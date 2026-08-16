const express = require('express');
const router = express.Router();
const Litige = require('../models/Litige');
const auth = require('../middleware/auth');
const { logAction } = require('../middleware/logger');
const upload = require('../middleware/upload');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acces reserve aux admins.' });
  next();
};

// GET /api/litiges/mes-litiges
router.get('/mes-litiges', auth, async (req, res) => {
  try {
    const litiges = await Litige.find({
      $or: [{ plaignant: req.user.id }, { accuse: req.user.id }]
    }).populate('plaignant','name avatar').populate('accuse','name avatar')
      .populate('devis','titre').populate('contrat','numeroContrat')
      .sort({ createdAt: -1 });
    res.json(litiges);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/litiges — Admin
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const litiges = await Litige.find()
      .populate('plaignant','name avatar email').populate('accuse','name avatar email')
      .populate('devis','titre').populate('contrat','numeroContrat')
      .sort({ createdAt: -1 });
    res.json(litiges);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/litiges
router.post('/', auth, upload.array('preuves', 5), async (req, res) => {
  try {
    const { devisId, contratId, jalonId, accuseId, motif, description } = req.body;
    if (!accuseId || !motif || !description)
      return res.status(400).json({ message: 'Champs requis manquants.' });
    const preuves = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const litige = await Litige.create({
      devis: devisId, contrat: contratId, jalon: jalonId,
      plaignant: req.user.id, accuse: accuseId,
      motif, description, preuves
    });
    res.status(201).json(litige);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/litiges/:id/resoudre — Admin résout
router.put('/:id/resoudre', auth, adminOnly, async (req, res) => {
  try {
    const { statut, decisionAdmin, montantRembourse } = req.body;
    const litige = await Litige.findByIdAndUpdate(req.params.id, {
      statut, decisionAdmin,
      montantRembourse: montantRembourse || 0,
      adminTraitant: req.user.id,
      dateResolution: new Date()
    }, { new: true });
    res.json(litige);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
