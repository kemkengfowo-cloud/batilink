const express = require('express');
const router = express.Router();
const Artisan = require('../models/Artisan');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { ville, metier, nom, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (ville) filter.ville = new RegExp(ville, 'i');
    if (metier) filter.metier = new RegExp(metier, 'i');
    if (nom) filter['user.name'] = new RegExp(nom, 'i');
    const artisans = await Artisan.find(filter)
      .populate('user', 'name email avatar phone')
      .sort({ note: -1 })
      .limit(+limit).skip((+page - 1) * +limit);
    const total = await Artisan.countDocuments(filter);
    res.json({ artisans, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user.id }).populate('user', 'name email avatar phone city');
    if (!artisan) return res.status(404).json({ message: 'Profil artisan non trouvé.' });
    res.json(artisan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id).populate('user', 'name email avatar phone city');
    if (!artisan) return res.status(404).json({ message: 'Artisan non trouvé.' });
    res.json(artisan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan') return res.status(403).json({ message: 'Accès refusé.' });
    const fields = ['metier', 'description', 'ville', 'whatsapp', 'experience', 'specialites', 'disponible'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const artisan = await Artisan.findOneAndUpdate({ user: req.user.id }, update, { new: true, upsert: true })
      .populate('user', 'name email avatar');
    res.json(artisan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/photos', auth, upload.array('photos', 6), async (req, res) => {
  try {
    if (req.user.role !== 'artisan') return res.status(403).json({ message: 'Accès refusé.' });
    if (!req.files?.length) return res.status(400).json({ message: 'Aucun fichier.' });
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    const artisan = await Artisan.findOneAndUpdate({ user: req.user.id }, { $push: { photos: { $each: urls } } }, { new: true });
    res.json({ photos: urls, artisan });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/artisans/portfolio — Ajouter une realisation au portfolio
router.post("/portfolio", auth, upload.fields([{ name: "avant", maxCount: 1 }, { name: "apres", maxCount: 1 }]), async (req, res) => {
  try {
    const { titre, description, categorie } = req.body;
    if (!titre) return res.status(400).json({ message: "Titre requis." });
    const artisan = await require("../models/Artisan").findOne({ user: req.user.id });
    if (!artisan) return res.status(404).json({ message: "Profil artisan introuvable." });
    const avant = req.files?.avant?.[0]?.path || req.files?.avant?.[0]?.filename;
    const apres = req.files?.apres?.[0]?.path || req.files?.apres?.[0]?.filename;
    artisan.portfolio.push({ titre, description, categorie, avant, apres });
    await artisan.save();
    res.status(201).json({ message: "Realisation ajoutee !", portfolio: artisan.portfolio });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/artisans/portfolio/:id — Supprimer une realisation
router.delete("/portfolio/:id", auth, async (req, res) => {
  try {
    const artisan = await require("../models/Artisan").findOne({ user: req.user.id });
    if (!artisan) return res.status(404).json({ message: "Profil artisan introuvable." });
    artisan.portfolio = artisan.portfolio.filter(p => p._id.toString() !== req.params.id);
    await artisan.save();
    res.json({ message: "Realisation supprimee !", portfolio: artisan.portfolio });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
