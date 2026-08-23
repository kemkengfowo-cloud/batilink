const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MissionConducteur = require('../models/MissionConducteur');
const JournalChantier = require('../models/JournalChantier');
const { notifyUser } = require('../socket');
const { sendEmail } = require('../utils/emails');

// GET /api/conducteur/missions
router.get('/missions', auth, async (req, res) => {
  try {
    const { statut, localisation } = req.query;
    const filter = { statut: statut || 'ouverte' };
    if (localisation) filter.localisation = new RegExp(localisation, 'i');
    const missions = await MissionConducteur.find(filter)
      .populate('client', 'name city phone')
      .populate('conducteur', 'name')
      .sort({ createdAt: -1 });
    res.json(missions);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur/mes-missions
router.get('/mes-missions', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'client'
      ? { client: req.user.id }
      : { conducteur: req.user.id };
    const missions = await MissionConducteur.find(filter)
      .populate('client', 'name phone city')
      .populate('conducteur', 'name phone')
      .sort({ createdAt: -1 });
    res.json(missions);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/conducteur/missions
router.post('/missions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Seul un client peut creer une mission.' });
    const { titre, description, localisation, dateDebut, dateFin, budgetJournalier, typeChantier } = req.body;
    if (!titre || !description || !localisation) return res.status(400).json({ message: 'Titre, description et localisation requis.' });
    const mission = await MissionConducteur.create({
      client: req.user.id, titre, description, localisation,
      dateDebut, dateFin, budgetJournalier, typeChantier: typeChantier || 'construction'
    });
    res.status(201).json(mission);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/conducteur/missions/:id/postuler
router.post('/missions/:id/postuler', auth, async (req, res) => {
  try {
    const mission = await MissionConducteur.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission non trouvee.' });
    if (mission.statut !== 'ouverte') return res.status(400).json({ message: 'Mission non disponible.' });
    const dejaPostule = mission.candidatures.find(c => c.conducteur.toString() === req.user.id);
    if (dejaPostule) return res.status(400).json({ message: 'Vous avez deja postule.' });
    mission.candidatures.push({ conducteur: req.user.id, message: req.body.message || '', tarif: req.body.tarif || 0 });
    await mission.save();
    notifyUser(mission.client, 'nouvelle_candidature', { missionTitre: mission.titre, missionId: mission._id });
    res.json({ message: 'Candidature envoyee !' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur/missions/:id/accepter/:conducteurId
router.put('/missions/:id/accepter/:conducteurId', auth, async (req, res) => {
  try {
    const mission = await MissionConducteur.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission non trouvee.' });
    if (mission.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    const candidature = mission.candidatures.find(c => c.conducteur.toString() === req.params.conducteurId);
    if (!candidature) return res.status(404).json({ message: 'Candidature non trouvee.' });
    mission.conducteur = req.params.conducteurId;
    mission.statut = 'en_cours';
    mission.dateDebut = mission.dateDebut || new Date();
    candidature.statut = 'accepte';
    mission.candidatures.forEach(c => { if (c.conducteur.toString() !== req.params.conducteurId) c.statut = 'refuse'; });
    await mission.save();
    notifyUser(req.params.conducteurId, 'mission_acceptee', { missionTitre: mission.titre, missionId: mission._id });
    res.json({ message: 'Conducteur accepte !', mission });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur/missions/:id/journaux
router.get('/missions/:id/journaux', auth, async (req, res) => {
  try {
    const mission = await MissionConducteur.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission non trouvee.' });
    const isAuthorized = mission.client.toString() === req.user.id ||
      mission.conducteur?.toString() === req.user.id || req.user.role === 'admin';
    if (!isAuthorized) return res.status(403).json({ message: 'Acces refuse.' });
    const { type, page=1 } = req.query;
    const filter = { mission: req.params.id };
    if (type) filter.type = type;
    const journaux = await JournalChantier.find(filter)
      .populate('conducteur', 'name')
      .sort({ date: -1 })
      .skip((page-1)*10).limit(10);
    const total = await JournalChantier.countDocuments(filter);
    res.json({ journaux, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/conducteur/missions/:id/journaux
router.post('/missions/:id/journaux', auth, async (req, res) => {
  try {
    const mission = await MissionConducteur.findById(req.params.id).populate('client', 'name email');
    if (!mission) return res.status(404).json({ message: 'Mission non trouvee.' });
    if (mission.conducteur?.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (mission.statut !== 'en_cours') return res.status(400).json({ message: 'Mission non en cours.' });
    const { meteo, avancement, activites, problemes, noteGenerale, nombreOuvriers, type } = req.body;
    const journal = await JournalChantier.create({
      mission: req.params.id, conducteur: req.user.id, client: mission.client._id,
      date: new Date(), type: type || 'quotidien', meteo: meteo || 'ensoleille',
      avancement: parseInt(avancement) || 0,
      activites: activites ? [activites] : [],
      problemes: problemes ? [problemes] : [],
      nombreOuvriers: parseInt(nombreOuvriers) || 0,
      noteGenerale,
    });
    mission.avancementGlobal = parseInt(avancement) || mission.avancementGlobal;
    mission.nombreJournaux += 1;
    mission.derniereActivite = new Date();
    await mission.save();
    notifyUser(mission.client._id, 'nouveau_journal', { missionTitre: mission.titre, avancement: parseInt(avancement) });
    const typeLabel = type === 'hebdomadaire' ? 'hebdomadaire' : type === 'mensuel' ? 'mensuel' : 'quotidien';
    sendEmail({
      to: mission.client.email,
      subject: `📊 Rapport ${typeLabel} — ${mission.titre}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0">B.Y.H — Journal de Chantier</h1></div><div style="padding:32px;background:#F8FAFC"><h2>Rapport ${typeLabel} — ${mission.titre}</h2><p>Avancement : <strong>${avancement}%</strong></p>${noteGenerale ? `<p>${noteGenerale}</p>` : ''}<a href="https://www.byh-cm.com/conducteur/missions/${req.params.id}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none">Voir le rapport →</a></div></div>`
    }).catch(e => console.error('Email journal:', e.message));
    res.status(201).json({ message: 'Rapport soumis !', journal });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur/journaux/:id/valider
router.put('/journaux/:id/valider', auth, async (req, res) => {
  try {
    const journal = await JournalChantier.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal non trouve.' });
    if (journal.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    journal.statut = 'valide';
    journal.commentaireClient = req.body.commentaire || '';
    journal.valideLe = new Date();
    await journal.save();
    notifyUser(journal.conducteur, 'rapport_valide', { journalId: journal._id });
    res.json({ message: 'Rapport valide !', journal });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur/journaux/:id/contester
router.put('/journaux/:id/contester', auth, async (req, res) => {
  try {
    const journal = await JournalChantier.findById(req.params.id);
    if (!journal) return res.status(404).json({ message: 'Journal non trouve.' });
    if (journal.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    journal.statut = 'conteste';
    journal.commentaireClient = req.body.commentaire || '';
    await journal.save();
    notifyUser(journal.conducteur, 'rapport_conteste', { journalId: journal._id, commentaire: req.body.commentaire });
    res.json({ message: 'Rapport conteste.', journal });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur/missions/:id/stats
router.get('/missions/:id/stats', auth, async (req, res) => {
  try {
    const mission = await MissionConducteur.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission non trouvee.' });
    const journaux = await JournalChantier.find({ mission: req.params.id });
    res.json({
      totalJournaux: journaux.length,
      journauxValides: journaux.filter(j => j.statut === 'valide').length,
      journauxContestes: journaux.filter(j => j.statut === 'conteste').length,
      avancementActuel: mission.avancementGlobal,
      totalPhotos: journaux.reduce((s, j) => s + j.photos.length, 0),
      derniereActivite: mission.derniereActivite,
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
