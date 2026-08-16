const express = require('express');
const router = express.Router();
const Historique = require('../models/Historique');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acces refuse.' });
  next();
};

// GET /api/historique — Admin voit tout
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { action, role, matricule, page=1, limit=50, debut, fin } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (role) filter['utilisateur.role'] = role;
    if (matricule) filter.matricule = new RegExp(matricule, 'i');
    if (debut || fin) {
      filter.createdAt = {};
      if (debut) filter.createdAt.$gte = new Date(debut);
      if (fin) filter.createdAt.$lte = new Date(fin);
    }
    const total = await Historique.countDocuments(filter);
    const historique = await Historique.find(filter)
      .sort({ createdAt: -1 })
      .limit(+limit)
      .skip((+page-1)*+limit);
    res.json({ historique, total, pages: Math.ceil(total/limit) });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/historique/mon-historique — Utilisateur voit le sien
router.get('/mon-historique', auth, async (req, res) => {
  try {
    const historique = await Historique.find({ 'utilisateur.id': req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(historique);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/historique/stats — Stats pour admin
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [parAction, parRole, parJour] = await Promise.all([
      Historique.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Historique.aggregate([
        { $group: { _id: '$utilisateur.role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Historique.aggregate([
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: -1 } },
        { $limit: 7 }
      ])
    ]);
    res.json({ parAction, parRole, parJour });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
