const express = require('express');
const router = express.Router();
const Entreprise = require('../models/Entreprise');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { ville, lot, page=1, limit=12 } = req.query;
    const filter = {};
    if (ville) filter.ville = new RegExp(ville,'i');
    if (lot) filter.lotsTravauxPropose = lot;
    const entreprises = await Entreprise.find(filter).populate('user','name email avatar phone').sort({note:-1}).limit(+limit).skip((+page-1)*+limit);
    const total = await Entreprise.countDocuments(filter);
    res.json({ entreprises, total, pages: Math.ceil(total/limit) });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const e = await Entreprise.findOne({ user: req.user.id }).populate('user','name email avatar phone city');
    if (!e) return res.status(404).json({ message: 'Profil non trouvé.' });
    res.json(e);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const e = await Entreprise.findById(req.params.id).populate('user','name email avatar phone city');
    if (!e) return res.status(404).json({ message: 'Entreprise non trouvée.' });
    res.json(e);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'entreprise') return res.status(403).json({ message: 'Accès refusé.' });
    const fields = ['nomEntreprise','nomResponsable','description','ville','whatsapp','rccm','lotsTravauxPropose','typePersonnel','disponible'];
    const update = {};
    fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
    const e = await Entreprise.findOneAndUpdate({ user: req.user.id }, update, { new: true, upsert: true }).populate('user','name email avatar');
    res.json(e);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/photos', auth, upload.array('photos',8), async (req, res) => {
  try {
    if (req.user.role !== 'entreprise') return res.status(403).json({ message: 'Accès refusé.' });
    if (!req.files?.length) return res.status(400).json({ message: 'Aucun fichier.' });
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    const e = await Entreprise.findOneAndUpdate({ user: req.user.id }, { $push: { photos: { $each: urls } } }, { new: true });
    res.json({ photos: urls, entreprise: e });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
