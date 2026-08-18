const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { logAction } = require('../middleware/logger');

router.get('/', async (req, res) => {
  try {
    const { categorie, localisation, statut = 'ouvert', page = 1, limit = 10 } = req.query;
    const filter = { statut };
    if (categorie) filter.categorie = new RegExp(categorie, 'i');
    if (localisation) filter.localisation = new RegExp(localisation, 'i');
    const projects = await Project.find(filter)
      .populate('client', 'name avatar city')
      .sort({ createdAt: -1 })
      .limit(+limit).skip((+page - 1) * +limit);
    const total = await Project.countDocuments(filter);
    res.json({ projects, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', auth, async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $inc: { vues: 1 } }, { new: true })
      .populate('client', 'name avatar city phone');
    if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, upload.array('photos', 4), async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Seuls les clients peuvent publier.' });
    const { titre, description, budget, localisation, categorie } = req.body;
    if (!titre || !description || !budget || !localisation || !categorie)
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    const photos = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const project = await Project.create({ client: req.user.id, titre, description, budget: +budget, localisation, categorie, photos });
    const populated = await Project.findById(project._id).populate('client', 'name avatar city');
    notifierTousArtisans(populated);
    logAction({ userId: req.user.id, nom: '', email: '', role: req.user.role, action: 'PROJET_PUBLIE', details: { titre: populated.titre, localisation: populated.localisation, budget: populated.budget } });
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
    if (project.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    res.json(await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
    if (project.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    await project.deleteOne();
    res.json({ message: 'Projet supprimé.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// Fonction matching automatique
const notifierTousArtisans = async (projet) => {
  try {
    const User = require('../models/User');
    const Message = require('../models/Message');
    const Artisan = require('../models/Artisan');

    const artisans = await Artisan.find({ disponible: true })
      .populate('user', '_id name');

    if (!artisans.length) return;

    const admin = await User.findOne({ role: 'admin' });
    const expediteur = admin?._id || projet.client;

    const messages = artisans.map(a => ({
      expediteur,
      destinataire: a.user._id,
      contenu: `🔔 Nouveau projet disponible sur B.Y.H !\n\n📋 "${projet.titre}"\n🔨 Categorie : ${projet.categorie}\n📍 Localisation : ${projet.localisation}\n💰 Budget : ${projet.budget ? new Intl.NumberFormat('fr-FR').format(projet.budget) + ' FCFA' : 'A negocier'}\n\nVoir le projet : www.batilink.org/projects/${projet._id}`,
      lu: false
    }));

    await Message.insertMany(messages);
    console.log(`✅ ${messages.length} artisans notifies pour le projet ${projet._id}`);
  } catch(err) {
    console.error('Erreur matching:', err.message);
  }
};
