const express = require('express');
const router = express.Router();
const DemandePersonnel = require('../models/DemandePersonnel');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Acces refuse.' });
  next();
};

// GET /api/demandes-personnel/mes-demandes
router.get('/mes-demandes', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { entreprise: req.user.id };
    const demandes = await DemandePersonnel.find(filter)
      .populate('entreprise', 'name avatar phone city')
      .populate('artisansProposes.artisan', 'name avatar phone')
      .populate('contrat')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/demandes-personnel/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const demande = await DemandePersonnel.findById(req.params.id)
      .populate('entreprise', 'name avatar phone city')
      .populate('artisansProposes.artisan', 'name avatar phone city')
      .populate('propositions.auteur', 'name role')
      .populate('contrat');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });
    res.json(demande);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/demandes-personnel — Entreprise soumet une demande
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'entreprise')
      return res.status(403).json({ message: 'Seules les entreprises peuvent soumettre une demande.' });

    const { typePersonnel, nombrePersonnes, ville, adresseChantier, dateDebut, dateFin, description, budgetPropose } = req.body;

    if (!typePersonnel?.length || !ville || !dateDebut || !dateFin || !budgetPropose)
      return res.status(400).json({ message: 'Champs requis manquants.' });

    const demande = await DemandePersonnel.create({
      entreprise: req.user.id,
      typePersonnel, nombrePersonnes: nombrePersonnes || 1,
      ville, adresseChantier, dateDebut, dateFin,
      description, budgetPropose
    });

    // Notifier l'admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Message.create({
        expediteur: req.user.id,
        destinataire: admin._id,
        contenu: `🏗️ Nouvelle demande de personnel !\n\nEntreprise: ${req.user.name || 'Inconnue'}\nType: ${typePersonnel.join(', ')}\nNombre: ${nombrePersonnes || 1} personne(s)\nVille: ${ville}\nPeriode: du ${new Date(dateDebut).toLocaleDateString('fr-FR')} au ${new Date(dateFin).toLocaleDateString('fr-FR')}\nBudget propose: ${new Intl.NumberFormat('fr-FR').format(budgetPropose)} FCFA\n\nTraitez cette demande dans le panel admin.`
      });
    }

    logAction({
      userId: req.user.id, nom: '', email: '', role: req.user.role,
      action: 'MISSION_PUBLIEE',
      details: { typePersonnel, ville, budgetPropose, nombrePersonnes }
    });

    const populated = await DemandePersonnel.findById(demande._id)
      .populate('entreprise', 'name avatar');
    res.status(201).json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/demandes-personnel/:id/proposer-artisans — Admin propose des artisans
router.put('/:id/proposer-artisans', auth, adminOnly, async (req, res) => {
  try {
    const { artisansIds, prixParArtisan, message } = req.body;
    const demande = await DemandePersonnel.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });

    demande.artisansProoses = artisansIds.map(id => ({
      artisan: id,
      statut: 'propose',
      prixPropose: prixParArtisan
    }));
    demande.statut = 'en_negociation';
    demande.noteAdmin = message || '';
    await demande.save();

    // Notifier l'entreprise
    await Message.create({
      expediteur: req.user.id,
      destinataire: demande.entreprise,
      contenu: `✅ L'admin BYHOME a trouve des techniciens pour votre demande !\n\n${artisansIds.length} technicien(s) disponible(s) propose(s).\nPrix propose: ${new Intl.NumberFormat('fr-FR').format(prixParArtisan)} FCFA\n${message ? '\nMessage: ' + message : ''}\n\nConnectez-vous pour voir les profils et accepter ou negocier.`
    });

    // Notifier chaque artisan proposé
    for (const artisanId of artisansIds) {
      const artisanUser = await User.findById(artisanId);
      if (artisanUser) {
        await Message.create({
          expediteur: req.user.id,
          destinataire: artisanId,
          contenu: `🔔 BYHOME vous propose une mission de location !\n\nType: ${demande.typePersonnel.join(', ')}\nVille: ${demande.ville}\nPeriode: du ${new Date(demande.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(demande.dateFin).toLocaleDateString('fr-FR')}\nRemuneration proposee: ${new Intl.NumberFormat('fr-FR').format(prixParArtisan)} FCFA\n\nContactez l'admin pour negocier ou accepter.`
        });
      }
    }

    res.json(demande);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/demandes-personnel/:id/contre-offre — Entreprise ou artisan fait une contre-offre
router.put('/:id/contre-offre', auth, async (req, res) => {
  try {
    const { montant, message } = req.body;
    if (!montant) return res.status(400).json({ message: 'Montant requis.' });

    const demande = await DemandePersonnel.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });

    demande.propositions.push({
      auteur: req.user.id,
      role: req.user.role,
      montant,
      message: message || ''
    });
    demande.statut = 'en_negociation';
    await demande.save();

    // Notifier l'admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Message.create({
        expediteur: req.user.id,
        destinataire: admin._id,
        contenu: `💰 Nouvelle contre-offre sur une demande de personnel !\n\nMontant propose: ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA\nMessage: ${message || 'Aucun'}\n\nTraitez cette negociation dans le panel admin.`
      });
    }

    res.json(demande);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/demandes-personnel/:id/annuler
router.put('/:id/annuler', auth, async (req, res) => {
  try {
    const demande = await DemandePersonnel.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });
    if (demande.entreprise.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acces refuse.' });
    demande.statut = 'annulee';
    await demande.save();
    res.json({ message: 'Demande annulee.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// PUT /api/demandes-personnel/:id — Entreprise modifie sa demande
router.put('/:id', auth, async (req, res) => {
  try {
    const demande = await DemandePersonnel.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });
    if (demande.entreprise.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acces refuse.' });
    if (!['en_attente'].includes(demande.statut))
      return res.status(400).json({ message: 'Cette demande ne peut plus etre modifiee.' });

    const { typePersonnel, nombrePersonnes, ville, adresseChantier, dateDebut, dateFin, description, budgetPropose } = req.body;

    if (typePersonnel) demande.typePersonnel = typePersonnel;
    if (nombrePersonnes) demande.nombrePersonnes = nombrePersonnes;
    if (ville) demande.ville = ville;
    if (adresseChantier !== undefined) demande.adresseChantier = adresseChantier;
    if (dateDebut) demande.dateDebut = dateDebut;
    if (dateFin) demande.dateFin = dateFin;
    if (description !== undefined) demande.description = description;
    if (budgetPropose) demande.budgetPropose = budgetPropose;

    await demande.save();
    res.json(demande);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/demandes-personnel/:id/valider-accord — Admin PROPOSE un prix (pas valide directement)
router.put('/:id/valider-accord', auth, adminOnly, async (req, res) => {
  try {
    const { budgetFinal, message } = req.body;
    const demande = await DemandePersonnel.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });

    // Admin ajoute sa proposition — pas encore accord_trouve
    demande.propositions.push({
      auteur: req.user.id,
      role: 'admin',
      montant: budgetFinal,
      message: message || ''
    });
    demande.statut = 'en_negociation';
    await demande.save();

    // Notifier l'entreprise
    await Message.create({
      expediteur: req.user.id,
      destinataire: demande.entreprise,
      contenu: `💰 L'admin BYHOME vous propose un prix pour votre demande de personnel !\n\nMontant propose: ${new Intl.NumberFormat('fr-FR').format(budgetFinal)} FCFA\n${message ? 'Message: ' + message : ''}\n\nConnectez-vous pour accepter ou faire une contre-offre : www.byhome.org/demandes-personnel/${demande._id}`
    });

    res.json({ demande, message: 'Proposition envoyee a l entreprise. En attente de sa reponse.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/demandes-personnel/:id/accepter-accord — Entreprise accepte le prix propose
router.put('/:id/accepter-accord', auth, async (req, res) => {
  try {
    const { montant } = req.body;
    const demande = await DemandePersonnel.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvee.' });
    if (demande.entreprise.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Acces refuse.' });

    demande.budgetFinal = montant;
    demande.statut = 'accord_trouve';
    await demande.save();

    // Notifier l'admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await Message.create({
        expediteur: req.user.id,
        destinataire: admin._id,
        contenu: `✅ L'entreprise a accepte votre prix pour la demande de personnel !\n\nMontant final: ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA\n\nVous pouvez maintenant generer le contrat officiel.`
      });
    }

    res.json({ demande, message: 'Accord confirme ! L admin va generer le contrat.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});
