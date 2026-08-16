const express = require('express');
const router = express.Router();
const Avis = require('../models/Avis');
const Artisan = require('../models/Artisan');
const Entreprise = require('../models/Entreprise');
const auth = require('../middleware/auth');

// GET /api/avis/:userId
router.get('/:userId', async (req, res) => {
  try {
    const avis = await Avis.find({ cible: req.params.userId })
      .populate('auteur', 'name avatar city role')
      .sort({ createdAt: -1 });
    res.json(avis);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/avis
router.post('/', auth, async (req, res) => {
  try {
    const { cibleUserId, cibleType, cibleRefId, note, commentaire } = req.body;
    if (!cibleUserId || !cibleType || !cibleRefId || !note || !commentaire)
      return res.status(400).json({ message: 'Champs requis manquants.' });
    if (cibleUserId === req.user.id)
      return res.status(400).json({ message: 'Vous ne pouvez pas vous noter vous-meme.' });

    const existing = await Avis.findOne({ auteur: req.user.id, cible: cibleUserId });
    if (existing)
      return res.status(400).json({ message: 'Vous avez deja laisse un avis.' });

    const avis = await Avis.create({
      auteur: req.user.id, cible: cibleUserId,
      cibleType, cibleRef: cibleRefId,
      note: parseInt(note), commentaire
    });

    // Mettre à jour la note moyenne
    const tousLesAvis = await Avis.find({ cible: cibleUserId });
    const moyenne = Math.round((tousLesAvis.reduce((s,a)=>s+a.note,0)/tousLesAvis.length)*10)/10;

    if (cibleType === 'artisan') {
      await Artisan.findByIdAndUpdate(cibleRefId, { note: moyenne, nbAvis: tousLesAvis.length });
    } else if (cibleType === 'entreprise') {
      await Entreprise.findByIdAndUpdate(cibleRefId, { note: moyenne, nbAvis: tousLesAvis.length });
    }

    const populated = await Avis.findById(avis._id).populate('auteur', 'name avatar city role');
    res.status(201).json(populated);
  } catch(err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Vous avez deja laisse un avis.' });
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/avis/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ message: 'Avis non trouve.' });
    if (avis.auteur.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acces refuse.' });

    const { cible, cibleType, cibleRef } = avis;
    await avis.deleteOne();

    const tousLesAvis = await Avis.find({ cible });
    const moyenne = tousLesAvis.length > 0
      ? Math.round((tousLesAvis.reduce((s,a)=>s+a.note,0)/tousLesAvis.length)*10)/10
      : 4.0;

    if (cibleType === 'artisan') {
      await Artisan.findByIdAndUpdate(cibleRef, { note: moyenne, nbAvis: tousLesAvis.length });
    } else if (cibleType === 'entreprise') {
      await Entreprise.findByIdAndUpdate(cibleRef, { note: moyenne, nbAvis: tousLesAvis.length });
    }
    res.json({ message: 'Avis supprime.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
