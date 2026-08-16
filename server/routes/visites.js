const express = require('express');
const router = express.Router();
const VisiteEvaluation = require('../models/VisiteEvaluation');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { logAction } = require('../middleware/logger');
const upload = require('../middleware/upload');

// GET /api/visites/mes-visites
router.get('/mes-visites', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'client'
      ? { client: req.user.id }
      : { evaluateur: req.user.id };
    const visites = await VisiteEvaluation.find(filter)
      .populate('client', 'name avatar phone city')
      .populate('evaluateur', 'name avatar phone')
      .populate('projet', 'titre')
      .sort({ createdAt: -1 });
    res.json(visites);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/visites/disponibles — Artisans voient les visites sans evaluateur
router.get('/disponibles', auth, async (req, res) => {
  try {
    const artisan = await Artisan.findOne({ user: req.user.id });
    const filter = {
      statut: 'en_attente',
      evaluateur: null
    };
    if (artisan?.ville) filter.ville = artisan.ville;
    const visites = await VisiteEvaluation.find(filter)
      .populate('client', 'name avatar city')
      .populate('projet', 'titre')
      .sort({ createdAt: -1 });
    res.json(visites);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/visites/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const visite = await VisiteEvaluation.findById(req.params.id)
      .populate('client', 'name avatar phone city')
      .populate('evaluateur', 'name avatar phone city')
      .populate('projet', 'titre description')
      .populate('devisGenere');
    if (!visite) return res.status(404).json({ message: 'Visite non trouvee.' });
    res.json(visite);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/visites — Client demande une visite
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client')
      return res.status(403).json({ message: 'Seuls les clients peuvent demander une visite.' });

    const { projetId, adresse, ville, description, typeProbleme, dateVisite, fraisVisite } = req.body;

    if (!adresse || !ville || !description)
      return res.status(400).json({ message: 'Champs requis manquants.' });

    const visite = await VisiteEvaluation.create({
      projet: projetId,
      client: req.user.id,
      adresse, ville, description,
      typeProbleme, dateVisite,
      fraisVisite: fraisVisite || 5000
    });

    // Notifier les artisans disponibles dans la ville
    const artisans = await Artisan.find({ ville, disponible: true }).populate('user', '_id');
    const admin = await User.findOne({ role: 'admin' });

    if (artisans.length > 0) {
      const messages = artisans.map(a => ({
        expediteur: admin?._id || req.user.id,
        destinataire: a.user._id,
        contenu: `🔍 Nouvelle demande de visite d evaluation !\n\n📍 Adresse : ${adresse}, ${ville}\n📋 Probleme : ${description}\n💰 Frais de visite : ${new Intl.NumberFormat('fr-FR').format(fraisVisite || 5000)} FCFA\n\nConnectez-vous pour accepter cette visite : www.batilink.org/visites/${visite._id}`
      }));
      await Message.insertMany(messages);
    }

    const populated = await VisiteEvaluation.findById(visite._id)
      .populate('client', 'name avatar')
      .populate('projet', 'titre');

    res.status(201).json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/visites/:id/accepter — Artisan accepte la visite
router.put('/:id/accepter', auth, async (req, res) => {
  try {
    const visite = await VisiteEvaluation.findById(req.params.id);
    if (!visite) return res.status(404).json({ message: 'Visite non trouvee.' });
    if (visite.statut !== 'en_attente')
      return res.status(400).json({ message: 'Cette visite a deja ete assignee.' });

    visite.evaluateur = req.user.id;
    visite.statut = 'evaluateur_assigne';
    await visite.save();

    // Notifier le client
    await Message.create({
      expediteur: req.user.id,
      destinataire: visite.client,
      contenu: `✅ Un technicien a accepte votre demande de visite d evaluation !\n\nIl se presentera a votre chantier le ${visite.dateVisite ? new Date(visite.dateVisite).toLocaleDateString('fr-FR') : 'date a confirmer'}.\n\nAdresse : ${visite.adresse}, ${visite.ville}`
    });

    const populated = await VisiteEvaluation.findById(visite._id)
      .populate('client', 'name avatar phone')
      .populate('evaluateur', 'name avatar phone');

    res.json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/visites/:id/rapport — Artisan soumet le rapport
router.post('/:id/rapport', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const visite = await VisiteEvaluation.findById(req.params.id);
    if (!visite) return res.status(404).json({ message: 'Visite non trouvee.' });
    if (visite.evaluateur?.toString() !== req.user.id)
      return res.status(403).json({ message: 'Acces refuse.' });

    const photos = req.files?.map(f => `/uploads/${f.filename}`) || [];

    visite.rapport = {
      problemesIdentifies: req.body.problemesIdentifies,
      travauxRecommandes: req.body.travauxRecommandes,
      estimationCout: parseInt(req.body.estimationCout) || 0,
      estimationDuree: req.body.estimationDuree,
      photos,
      observations: req.body.observations,
      dateRapport: new Date()
    };
    visite.statut = 'rapport_soumis';
    await visite.save();

    // Notifier le client
    await Message.create({
      expediteur: req.user.id,
      destinataire: visite.client,
      contenu: `📋 Le rapport de visite de votre chantier est disponible !\n\n🔍 Problemes identifies : ${req.body.problemesIdentifies}\n🔨 Travaux recommandes : ${req.body.travauxRecommandes}\n💰 Estimation : ${new Intl.NumberFormat('fr-FR').format(req.body.estimationCout)} FCFA\n⏱️ Duree estimee : ${req.body.estimationDuree}\n\nConsultez le rapport complet : www.batilink.org/visites/${visite._id}`
    });

    res.json(visite);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/visites/:id/annuler
router.put('/:id/annuler', auth, async (req, res) => {
  try {
    const visite = await VisiteEvaluation.findById(req.params.id);
    if (!visite) return res.status(404).json({ message: 'Visite non trouvee.' });
    if (visite.client.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acces refuse.' });
    visite.statut = 'annulee';
    await visite.save();
    res.json({ visite, message: 'Visite annulee.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/visites/admin/toutes — Admin voit toutes les visites
router.get('/admin/toutes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acces refuse.' });
    const visites = await VisiteEvaluation.find()
      .populate('client', 'name avatar phone city')
      .populate('evaluateur', 'name avatar phone')
      .sort({ createdAt: -1 });
    res.json(visites);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
