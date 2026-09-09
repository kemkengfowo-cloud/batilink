const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// POST /api/feedback — soumettre un feedback
router.post('/', auth, async (req, res) => {
  try {
    const { note, categorie, commentaire, source, page } = req.body;
    if (!note || !commentaire) return res.status(400).json({ message: 'Note et commentaire requis.' });

    const feedback = await Feedback.create({
      user: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      note, categorie, commentaire, source: source || 'web', page
    });

    res.status(201).json({ feedback, message: 'Merci pour votre retour !' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/feedback — admin seulement
router.get('/', auth, async (req, res) => {
  try {
    if (!['admin', 'agent'].includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé.' });
    const feedbacks = await Feedback.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/feedback/:id/lu — marquer comme lu
router.put('/:id/lu', auth, async (req, res) => {
  try {
    if (!['admin', 'agent'].includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé.' });
    await Feedback.findByIdAndUpdate(req.params.id, { lu: true });
    res.json({ message: 'Feedback marqué comme lu.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/feedback/stats — statistiques
router.get('/stats', auth, async (req, res) => {
  try {
    if (!['admin', 'agent'].includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé.' });
    const total = await Feedback.countDocuments();
    const nonLus = await Feedback.countDocuments({ lu: false });
    const moyenneResult = await Feedback.aggregate([{ $group: { _id: null, moyenne: { $avg: '$note' } } }]);
    const moyenne = moyenneResult[0]?.moyenne?.toFixed(1) || 0;
    const parCategorie = await Feedback.aggregate([{ $group: { _id: '$categorie', count: { $sum: 1 } } }]);
    const parNote = await Feedback.aggregate([{ $group: { _id: '$note', count: { $sum: 1 } } }]);
    res.json({ total, nonLus, moyenne, parCategorie, parNote });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
