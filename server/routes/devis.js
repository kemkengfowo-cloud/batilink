const express = require('express');
const router = express.Router();
const Devis = require('../models/Devis');
const auth = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

router.get('/mes-devis', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'artisan' || req.user.role === 'entreprise'
      ? { artisan: req.user.id }
      : { client: req.user.id };
    const devis = await Devis.find(filter)
      .populate('artisan', 'name avatar')
      .populate('client', 'name avatar')
      .populate('projet', 'titre')
      .sort({ createdAt: -1 });
    res.json(devis);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id)
      .populate('artisan', 'name avatar phone city')
      .populate('client', 'name avatar phone city')
      .populate('projet', 'titre description localisation');
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.artisan._id.toString() !== req.user.id && devis.client._id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acces refuse.' });
    res.json(devis);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'artisan' && req.user.role !== 'entreprise')
      return res.status(403).json({ message: 'Seuls les artisans et entreprises peuvent creer des devis.' });
    const { clientId, projetId, titre, description, lignes, delaiExecution, validiteJours, conditionsPaiement, materielsInclus } = req.body;
    if (!clientId || !titre || !description || !lignes || !lignes.length)
      return res.status(400).json({ message: 'Champs requis manquants.' });
    const lignesCalculees = lignes.map(l => ({ ...l, total: l.quantite * l.prixUnitaire }));
    const sousTotal = lignesCalculees.reduce((s,l) => s + l.total, 0);
    const devis = await Devis.create({
      artisan: req.user.id, client: clientId, projet: projetId,
      titre, description, lignes: lignesCalculees, sousTotal, total: sousTotal,
      delaiExecution, validiteJours: validiteJours || 15,
      conditionsPaiement, materielsInclus
    });
    const populated = await Devis.findById(devis._id)
      .populate('artisan', 'name avatar')
      .populate('client', 'name avatar')
      .populate('projet', 'titre');
    logAction({ userId: req.user.id, nom:'', email:'', role: req.user.role, action: 'DEVIS_ENVOYE', details: { titre: populated.titre, total: populated.total, clientId } });
    res.status(201).json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/accepter', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (devis.statut !== 'envoye') return res.status(400).json({ message: 'Ce devis ne peut plus etre accepte.' });
    devis.statut = 'accepte';
    logAction({ userId: req.user.id, nom:'', email:'', role: req.user.role, action: 'DEVIS_ACCEPTE', details: { devisId: devis._id, numeroDevis: devis.numeroDevis, total: devis.total } });
    devis.dateAcceptation = new Date();
    devis.noteClient = req.body.note || '';
    await devis.save();
    res.json(devis);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/refuser', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    devis.statut = 'refuse';
    devis.noteClient = req.body.note || '';
    await devis.save();
    res.json(devis);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/counter', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (devis.statut !== 'envoye') return res.status(400).json({ message: 'Ce devis ne peut plus etre modifie.' });
    const { montantPropose, message } = req.body;
    if (!montantPropose) return res.status(400).json({ message: 'Montant requis.' });
    devis.noteClient = `Contre-offre: ${montantPropose} FCFA. ${message || ''}`;
    await devis.save();
    res.json({ devis, message: `Contre-offre de ${new Intl.NumberFormat('fr-FR').format(montantPropose)} FCFA envoyee.` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/terminer', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (devis.statut !== 'accepte') return res.status(400).json({ message: 'Les travaux doivent etre en cours.' });
    devis.statut = 'termine';
    logAction({ userId: req.user.id, nom:'', email:'', role: req.user.role, action: 'TRAVAUX_VALIDES', details: { devisId: devis._id, montantArtisan: devis.montantArtisan, montantCommission: devis.montantCommission } });
    devis.noteClient = req.body.note || '';
    await devis.save();
    res.json({
      devis,
      message: `Travaux valides ! L artisan recevra ${new Intl.NumberFormat('fr-FR').format(devis.montantArtisan)} FCFA (90%). B.Y.H percoit ${new Intl.NumberFormat('fr-FR').format(devis.montantCommission)} FCFA (10%).`
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// PUT /api/devis/:id — Artisan modifie son devis avant acceptation
router.put('/:id', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: 'Acces refuse.' });
    if (devis.statut !== 'envoye')
      return res.status(400).json({ message: 'Ce devis ne peut plus etre modifie.' });

    const { titre, description, lignes, delaiExecution, validiteJours, materielsInclus } = req.body;
    if (lignes) {
      const lignesCalculees = lignes.map(l => ({ ...l, total: l.quantite * l.prixUnitaire }));
      const sousTotal = lignesCalculees.reduce((s, l) => s + l.total, 0);
      devis.lignes = lignesCalculees;
      devis.sousTotal = sousTotal;
      devis.total = sousTotal;
      devis.montantCommission = Math.round(sousTotal * devis.commission / 100);
      devis.montantArtisan = sousTotal - devis.montantCommission;
    }
    if (titre) devis.titre = titre;
    if (description) devis.description = description;
    if (delaiExecution) devis.delaiExecution = delaiExecution;
    if (validiteJours) devis.validiteJours = validiteJours;
    if (materielsInclus !== undefined) devis.materielsInclus = materielsInclus;

    await devis.save();
    res.json(devis);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/devis/:id/annuler — Artisan annule son devis avant acceptation
router.put('/:id/annuler', auth, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: 'Acces refuse.' });
    if (devis.statut !== 'envoye')
      return res.status(400).json({ message: 'Ce devis ne peut plus etre annule.' });
    devis.statut = 'refuse';
    await devis.save();
    res.json({ message: 'Devis annule.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});
