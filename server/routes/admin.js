const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Entreprise = require('../models/Entreprise');
const Project = require('../models/Project');
const Mission = require('../models/Mission');
const Message = require('../models/Message');
const Signalement = require('../models/Signalement');
const Devis = require('../models/Devis');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
  next();
};

// Créer premier admin
router.post('/create-first-admin', async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_SECRET_KEY)
      return res.status(403).json({ message: 'Clé secrète invalide.' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé.' });
    const user = await new User({ name, email, password, role: 'admin', city: 'Yaoundé' }).save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ message: 'Compte admin créé !', token, user });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Stats globales
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const il7jours = new Date(now - 7*24*60*60*1000);
    const il30jours = new Date(now - 30*24*60*60*1000);

    const [clients, artisans, entreprises, projects, missions, signalements,
           newUsers7j, newUsers30j, projectsOuverts, missionsOuvertes] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ role: 'entreprise' }),
      Project.countDocuments(),
      Mission.countDocuments(),
      Signalement.countDocuments({ statut: 'en_attente' }),
      User.countDocuments({ createdAt: { $gte: il7jours } }),
      User.countDocuments({ createdAt: { $gte: il30jours } }),
      Project.countDocuments({ statut: 'ouvert' }),
      Mission.countDocuments({ statut: 'ouverte' }),
    ]);
    const devisTermines = await Devis.find({ statut: "termine" });
    const commissionTotale = devisTermines.reduce((s,d)=>s+(d.montantCommission||0),0);
    const commissionCeMois = devisTermines.filter(d=>new Date(d.updatedAt).getMonth()===now.getMonth()).reduce((s,d)=>s+(d.montantCommission||0),0);
    const chiffreAffaires = devisTermines.reduce((s,d)=>s+(d.total||0),0);
    const nbTransactions = devisTermines.length;

    // Inscriptions par jour sur 7 jours
    const inscriptionsParJour = await User.aggregate([
      { $match: { createdAt: { $gte: il7jours } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Villes les plus actives
    const villesActives = await User.aggregate([
      { $match: { city: { $exists: true, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Métiers les plus demandés
    const metiersTop = await Artisan.aggregate([
      { $group: { _id: '$metier', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const devisTermines = await Devis.find({ statut: "termine" });
    const commissionTotale = devisTermines.reduce((s,d)=>s+(d.montantCommission||0),0);
    const devisTerminesCeMois = devisTermines.filter(d=>new Date(d.updatedAt).getMonth()===now.getMonth());
    const commissionCeMois = devisTerminesCeMois.reduce((s,d)=>s+(d.montantCommission||0),0);
    const chiffreAffaires = devisTermines.reduce((s,d)=>s+(d.total||0),0);
    const nbTransactions = devisTermines.length;
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      clients, artisans, entreprises, projects, missions, signalements,
      commissionTotale, commissionCeMois, chiffreAffaires, nbTransactions,
      newUsers7j, newUsers30j, projectsOuverts, missionsOuvertes,
      inscriptionsParJour, villesActives, metiersTop, recentUsers
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Liste utilisateurs
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(+limit).skip((+page-1)*+limit);
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Supprimer utilisateur
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Bloquer/débloquer utilisateur
router.put('/users/:id/block', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: req.body.blocked }, { new: true });
    res.json(user);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Liste artisans
router.get('/artisans', auth, adminOnly, async (req, res) => {
  try {
    const { verifie } = req.query;
    const filter = verifie !== undefined ? { verifie: verifie === 'true' } : {};
    const artisans = await Artisan.find(filter).populate('user', 'name email phone city avatar').sort({ createdAt: -1 });
    res.json({ artisans, total: artisans.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Vérifier artisan
router.put('/artisans/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(req.params.id, { verifie: req.body.verifie }, { new: true }).populate('user', 'name email');
    res.json(artisan);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Liste entreprises
router.get('/entreprises', auth, adminOnly, async (req, res) => {
  try {
    const { verifie } = req.query;
    const filter = verifie !== undefined ? { verifie: verifie === 'true' } : {};
    const entreprises = await Entreprise.find(filter).populate('user', 'name email phone city avatar').sort({ createdAt: -1 });
    res.json({ entreprises, total: entreprises.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Vérifier entreprise
router.put('/entreprises/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const e = await Entreprise.findByIdAndUpdate(req.params.id, { verifie: req.body.verifie }, { new: true }).populate('user', 'name email');
    res.json(e);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Signalements
router.get('/signalements', auth, adminOnly, async (req, res) => {
  try {
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const signalements = await Signalement.find(filter)
      .populate('rapporteur', 'name email avatar')
      .populate('cible', 'name email avatar role')
      .sort({ createdAt: -1 });
    res.json(signalements);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/signalements/:id', auth, adminOnly, async (req, res) => {
  try {
    const s = await Signalement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(s);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Messagerie admin — envoyer message à tous
router.post('/broadcast', auth, adminOnly, async (req, res) => {
  try {
    const { contenu, roleFilter } = req.body;
    if (!contenu) return res.status(400).json({ message: 'Message requis.' });
    const filter = roleFilter ? { role: roleFilter } : {};
    const users = await User.find(filter).select('_id');
    const messages = users.map(u => ({
      expediteur: req.user.id,
      destinataire: u._id,
      contenu: `📢 [Message Admin] ${contenu}`,
      lu: false
    }));
    await Message.insertMany(messages);
    res.json({ message: `Message envoyé à ${messages.length} utilisateur(s).`, count: messages.length });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Projets admin
router.get('/projects', auth, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().populate('client', 'name email').sort({ createdAt: -1 }).limit(50);
    res.json(projects);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.delete('/projects/:id', auth, adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Projet supprimé.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// PUT /api/admin/badges/artisan/:id
router.put('/badges/artisan/:id', auth, adminOnly, async (req, res) => {
  try {
    const { verifie, complet, topRated, premium } = req.body;
    const update = {};
    if (verifie !== undefined) update['badges.verifie'] = verifie;
    if (complet !== undefined) update['badges.complet'] = complet;
    if (topRated !== undefined) update['badges.topRated'] = topRated;
    if (premium !== undefined) update['badges.premium'] = premium;
    const artisan = await Artisan.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user', 'name email');
    res.json(artisan);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/admin/badges/entreprise/:id
router.put('/badges/entreprise/:id', auth, adminOnly, async (req, res) => {
  try {
    const { verifie, complet, topRated, premium } = req.body;
    const update = {};
    if (verifie !== undefined) update['badges.verifie'] = verifie;
    if (complet !== undefined) update['badges.complet'] = complet;
    if (topRated !== undefined) update['badges.topRated'] = topRated;
    if (premium !== undefined) update['badges.premium'] = premium;
    const entreprise = await Entreprise.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user', 'name email');
    res.json(entreprise);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Litiges admin
const Litige = require('../models/Litige');
router.get('/litiges', auth, adminOnly, async (req, res) => {
  try {
    const litiges = await Litige.find()
      .populate('plaignant','name avatar email')
      .populate('accuse','name avatar email')
      .sort({ createdAt: -1 });
    res.json(litiges);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/litiges/:id/resoudre', auth, adminOnly, async (req, res) => {
  try {
    const litige = await Litige.findByIdAndUpdate(req.params.id, {
      ...req.body,
      adminTraitant: req.user.id,
      dateResolution: new Date()
    }, { new: true });
    res.json(litige);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Stats litiges
const Litige2 = require('../models/Litige');
router.get('/stats-litiges', auth, adminOnly, async (req, res) => {
  try {
    const ouverts = await Litige2.countDocuments({ statut: 'ouvert' });
    const enExamen = await Litige2.countDocuments({ statut: 'en_examen' });
    res.json({ ouverts, enExamen });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/export/users — Export CSV utilisateurs
router.get('/export/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const csv = [
      'Nom,Email,Role,Ville,Date inscription',
      ...users.map(u => `${u.name},${u.email},${u.role},${u.city||''},${new Date(u.createdAt).toLocaleDateString('fr-FR')}`)
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=batilink-users.csv');
    res.send(csv);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/export/historique — Export CSV historique
router.get('/export/historique', auth, adminOnly, async (req, res) => {
  try {
    const Historique = require('../models/Historique');
    const hist = await Historique.find().sort({ createdAt: -1 }).limit(1000);
    const csv = [
      'Matricule,Utilisateur,Role,Action,Statut,Date',
      ...hist.map(h => `${h.matricule},${h.utilisateur?.nom||''},${h.utilisateur?.role||''},${h.action},${h.statut},${new Date(h.createdAt).toLocaleString('fr-FR')}`)
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=batilink-historique.csv');
    res.send(csv);
  } catch(err) { res.status(500).json({ message: err.message }); }
});
