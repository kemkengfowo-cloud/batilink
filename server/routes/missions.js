const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { typePersonnel, localisation, page=1, limit=10 } = req.query;
    const filter = { statut: 'ouverte' };
    if (typePersonnel) filter.typePersonnel = typePersonnel;
    if (localisation) filter.localisation = new RegExp(localisation,'i');
    const missions = await Mission.find(filter).populate('entreprise','name avatar city').sort({createdAt:-1}).limit(+limit).skip((+page-1)*+limit);
    const total = await Mission.countDocuments(filter);
    res.json({ missions, total, pages: Math.ceil(total/limit) });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', auth, async (req, res) => {
  try {
    const missions = await Mission.find({ entreprise: req.user.id }).sort({ createdAt: -1 });
    res.json(missions);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const m = await Mission.findById(req.params.id).populate('entreprise','name avatar city phone');
    if (!m) return res.status(404).json({ message: 'Mission non trouvée.' });
    res.json(m);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'entreprise') return res.status(403).json({ message: 'Seules les entreprises peuvent publier.' });
    const { titre, description, typePersonnel, typeBesoin, nombrePersonnes, duree, remuneration, localisation, dateDebut } = req.body;
    if (!titre || !description || !duree || !remuneration || !localisation)
      return res.status(400).json({ message: 'Champs requis manquants.' });
    const mission = await Mission.create({ entreprise: req.user.id, titre, description, typePersonnel, typeBesoin, nombrePersonnes, duree, remuneration:+remuneration, localisation, dateDebut });
    res.status(201).json(mission);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/candidater', auth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan') return res.status(403).json({ message: 'Seuls les techniciens peuvent candidater.' });
    const mission = await Mission.findByIdAndUpdate(req.params.id, { $addToSet: { candidatures: req.user.id } }, { new: true });
    res.json(mission);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const m = await Mission.findById(req.params.id);
    if (!m) return res.status(404).json({ message: 'Mission non trouvée.' });
    if (m.entreprise.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    await m.deleteOne();
    res.json({ message: 'Mission supprimée.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
