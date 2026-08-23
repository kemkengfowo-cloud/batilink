const express = require('express');
const router = express.Router();
const Mission = require('../models/Mission');
const auth = require('../middleware/auth');
const { notifyUser } = require('../socket');
const { sendEmail } = require('../utils/emails');

// GET /api/missions — Admin voit tout, artisan voit ses missions assignées
router.get('/', auth, async (req, res) => {
  try {
    // Admin voit toutes les missions
    if (req.user.role === 'admin') {
      const { statut, page=1, limit=10 } = req.query;
      const filter = statut ? { statut } : {};
      const missions = await Mission.find(filter)
        .populate('entreprise', 'name city phone')
        .populate('artisansAssignes', 'name phone city')
        .sort({ createdAt: -1 })
        .limit(+limit).skip((+page-1)*+limit);
      const total = await Mission.countDocuments(filter);
      return res.json({ missions, total });
    }
    // Artisan voit uniquement ses missions assignées
    if (req.user.role === 'artisan') {
      const missions = await Mission.find({ artisansAssignes: req.user.id })
        .populate('entreprise', 'name city phone')
        .sort({ createdAt: -1 });
      return res.json({ missions, total: missions.length });
    }
    // Entreprise voit ses propres missions
    if (req.user.role === 'entreprise') {
      const missions = await Mission.find({ entreprise: req.user.id })
        .sort({ createdAt: -1 });
      return res.json({ missions, total: missions.length });
    }
    // Client et conducteur n'ont pas accès
    return res.status(403).json({ message: 'Accès refusé.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/missions/my — Mes missions
router.get('/my', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'entreprise') filter = { entreprise: req.user.id };
    else if (req.user.role === 'artisan') filter = { artisansAssignes: req.user.id };
    else if (req.user.role === 'admin') filter = {};
    else return res.status(403).json({ message: 'Accès refusé.' });
    const missions = await Mission.find(filter)
      .populate('entreprise', 'name city phone')
      .sort({ createdAt: -1 });
    res.json(missions);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/missions/:id — Détail mission
router.get('/:id', auth, async (req, res) => {
  try {
    const m = await Mission.findById(req.params.id)
      .populate('entreprise', 'name city phone')
      .populate('artisansAssignes', 'name phone city');
    if (!m) return res.status(404).json({ message: 'Mission non trouvée.' });
    // Vérifier accès
    const isAdmin = req.user.role === 'admin';
    const isEntreprise = m.entreprise?._id?.toString() === req.user.id;
    const isArtisan = m.artisansAssignes?.some(a => a._id?.toString() === req.user.id);
    if (!isAdmin && !isEntreprise && !isArtisan) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    res.json(m);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/missions — Entreprise ou admin crée une mission
router.post('/', auth, async (req, res) => {
  try {
    if (!['entreprise', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    const { titre, description, typePersonnel, typeBesoin, nombrePersonnes, duree, remuneration, localisation, dateDebut } = req.body;
    if (!titre || !description || !duree || !remuneration || !localisation) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }
    const mission = await Mission.create({
      entreprise: req.user.id, titre, description, typePersonnel,
      typeBesoin, nombrePersonnes, duree, remuneration: +remuneration,
      localisation, dateDebut, statut: 'ouverte'
    });
    // Notifier admin si c'est une entreprise qui crée
    if (req.user.role === 'entreprise') {
      sendEmail({
        to: 'kemkengpowo@byh-cm.com',
        subject: `🏗️ Nouvelle demande mission — ${titre}`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H Admin</h1></div><div style="padding:32px"><h2>Nouvelle demande de mission</h2><p><strong>Titre :</strong> ${titre}</p><p><strong>Type :</strong> ${typePersonnel}</p><p><strong>Localisation :</strong> ${localisation}</p><p><strong>Rémunération :</strong> ${new Intl.NumberFormat('fr-FR').format(remuneration)} FCFA</p><a href="https://www.byh-cm.com/admin" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Gérer la mission →</a></div></div>`
      }).catch(e => console.error('Email mission:', e.message));
    }
    res.status(201).json(mission);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/missions/:id/assigner — Admin assigne un artisan
router.put('/:id/assigner', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { artisanId } = req.body;
    if (!artisanId) return res.status(400).json({ message: 'artisanId requis.' });
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { artisansAssignes: artisanId }, statut: 'en_cours' },
      { new: true }
    ).populate('entreprise', 'name');
    if (!mission) return res.status(404).json({ message: 'Mission non trouvée.' });
    // Notifier l'artisan
    notifyUser(artisanId, 'mission_assignee', {
      missionTitre: mission.titre,
      missionId: mission._id,
    });
    // Email à l'artisan
    const User = require('../models/User');
    const artisan = await User.findById(artisanId);
    if (artisan) {
      sendEmail({
        to: artisan.email,
        subject: `🎯 Mission assignée — ${mission.titre}`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">🎯 Mission assignée !</h2><p>Bonjour ${artisan.name},</p><p>L'équipe B.Y.H vous a assigné une nouvelle mission :</p><p><strong>${mission.titre}</strong></p><p><strong>Localisation :</strong> ${mission.localisation}</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir ma mission →</a></div></div>`
      }).catch(e => console.error('Email artisan:', e.message));
    }
    res.json({ message: 'Artisan assigné avec succès !', mission });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/missions/:id/statut — Admin change le statut
router.put('/:id/statut', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const mission = await Mission.findByIdAndUpdate(
      req.params.id,
      { statut: req.body.statut },
      { new: true }
    );
    if (!mission) return res.status(404).json({ message: 'Mission non trouvée.' });
    res.json({ message: 'Statut mis à jour.', mission });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/missions/:id — Admin ou entreprise supprime
router.delete('/:id', auth, async (req, res) => {
  try {
    const m = await Mission.findById(req.params.id);
    if (!m) return res.status(404).json({ message: 'Mission non trouvée.' });
    if (req.user.role !== 'admin' && m.entreprise.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }
    await m.deleteOne();
    res.json({ message: 'Mission supprimée.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
