const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DemandeConducteur = require('../models/DemandeConducteur');
const RapportChantier = require('../models/RapportChantier');
const User = require('../models/User');
const { notifyUser, notifyAdmins } = require('../socket');
const { sendEmail } = require('../utils/emails');

// ===== DEMANDES CLIENT =====

// POST /api/conducteur-travaux/demandes — Client soumet une demande
router.post('/demandes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Seul un client peut faire une demande.' });
    const { titreChantier, description, localisation, ville, typeChantier, dateDebut, dateFin, superficie, budgetChantier, budgetPropose } = req.body;
    if (!titreChantier || !description || !localisation || !ville || !dateDebut) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }
    const demande = await DemandeConducteur.create({
      client: req.user.id, titreChantier, description, localisation, ville,
      typeChantier: typeChantier || 'construction', dateDebut, dateFin,
      superficie, budgetChantier, budgetPropose,
    });
    // Notifier admin
    notifyAdmins('nouvelle_demande_conducteur', { demandeId: demande._id, titreChantier, ville, clientId: req.user.id });
    // Email admin
    sendEmail({
      to: 'kemkengpowo@byh-cm.com',
      subject: `🏗️ Nouvelle demande conducteur — ${titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H Admin</h1></div><div style="padding:32px"><h2>Nouvelle demande conducteur</h2><p><strong>Chantier :</strong> ${titreChantier}</p><p><strong>Ville :</strong> ${ville}</p><p><strong>Localisation :</strong> ${localisation}</p><p><strong>Type :</strong> ${typeChantier}</p><p><strong>Date début :</strong> ${new Date(dateDebut).toLocaleDateString('fr-FR')}</p>${budgetPropose ? `<p><strong>Budget proposé :</strong> ${new Intl.NumberFormat('fr-FR').format(budgetPropose)} FCFA/jour</p>` : ''}<a href="https://www.byh-cm.com/admin" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Traiter la demande →</a></div></div>`
    }).catch(e => console.error('Email admin:', e.message));
    res.status(201).json({ message: 'Demande envoyée ! L\'équipe B.Y.H va vous contacter sous 24h.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/mes-demandes — Mes demandes (client)
router.get('/mes-demandes', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({ client: req.user.id })
      .populate('conducteur', 'name phone email')
      .populate('conducteurPropose', 'name phone')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/mes-chantiers — Chantiers du conducteur
router.get('/mes-chantiers', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({ conducteur: req.user.id, statut: { $in: ['en_cours', 'contrat_conducteur', 'valide_client'] } })
      .populate('client', 'name phone email city')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/demandes/:id/valider-contrat — Client valide le contrat
router.put('/demandes/:id/valider-contrat', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id)
      .populate('conducteurPropose', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (demande.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    demande.statut = 'valide_client';
    demande.contratClientValide = true;
    demande.dateValidationClient = new Date();
    await demande.save();
    // Notifier admin
    notifyAdmins('contrat_client_valide', { demandeId: demande._id, titreChantier: demande.titreChantier });
    res.json({ message: 'Contrat validé ! B.Y.H va maintenant envoyer le contrat au conducteur.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== ADMIN =====

// GET /api/conducteur-travaux/admin/demandes — Admin voit toutes les demandes
router.get('/admin/demandes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const demandes = await DemandeConducteur.find(filter)
      .populate('client', 'name phone email city')
      .populate('conducteur', 'name phone email')
      .populate('conducteurPropose', 'name phone email')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/proposer — Admin propose un conducteur
router.put('/admin/demandes/:id/proposer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { conducteurId, budgetFinal, message } = req.body;
    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    const conducteur = await User.findById(conducteurId);
    if (!conducteur) return res.status(404).json({ message: 'Conducteur non trouvé.' });
    demande.conducteurPropose = conducteurId;
    demande.budgetFinal = budgetFinal;
    demande.messagePropositon = message || '';
    demande.statut = 'conducteur_propose';
    await demande.save();
    // Notifier le client
    notifyUser(demande.client._id, 'conducteur_propose', { demandeId: demande._id, conducteurNom: conducteur.name });
    sendEmail({
      to: demande.client.email,
      subject: `✅ Conducteur trouvé pour votre chantier — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">✅ Conducteur trouvé !</h2><p>Bonjour ${demande.client.name},</p><p>L'équipe B.Y.H a trouvé un conducteur de travaux qualifié pour votre chantier <strong>${demande.titreChantier}</strong>.</p><p><strong>Conducteur :</strong> ${conducteur.name}</p>${budgetFinal ? `<p><strong>Tarif journalier :</strong> ${new Intl.NumberFormat('fr-FR').format(budgetFinal)} FCFA/jour</p>` : ''}${message ? `<p><strong>Message B.Y.H :</strong> ${message}</p>` : ''}<a href="https://www.byh-cm.com/conducteur-travaux" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir ma demande →</a></div></div>`
    }).catch(e => console.error('Email conducteur proposé:', e.message));
    res.json({ message: 'Conducteur proposé au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/envoyer-contrat-client — Admin envoie contrat au client
router.put('/admin/demandes/:id/envoyer-contrat-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    demande.statut = 'contrat_client';
    demande.contratClientUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.client._id, 'contrat_a_signer', { demandeId: demande._id });
    sendEmail({
      to: demande.client.email,
      subject: `📄 Contrat à signer — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>📄 Votre contrat est prêt</h2><p>Bonjour ${demande.client.name},</p><p>Le contrat pour votre chantier <strong>${demande.titreChantier}</strong> est prêt. Veuillez le lire et le valider depuis votre espace B.Y.H.</p><a href="https://www.byh-cm.com/conducteur-travaux" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir et signer le contrat →</a></div></div>`
    }).catch(e => console.error('Email contrat:', e.message));
    res.json({ message: 'Contrat envoyé au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/activer — Admin active la mission
router.put('/admin/demandes/:id/activer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id)
      .populate('client', 'name email')
      .populate('conducteurPropose', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    demande.conducteur = demande.conducteurPropose;
    demande.statut = 'en_cours';
    await demande.save();
    // Notifier client et conducteur
    notifyUser(demande.client._id, 'mission_activee', { demandeId: demande._id, titreChantier: demande.titreChantier });
    notifyUser(demande.conducteur._id, 'chantier_assigne', { demandeId: demande._id, titreChantier: demande.titreChantier });
    sendEmail({
      to: demande.conducteurPropose.email,
      subject: `🏗️ Chantier assigné — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">🏗️ Chantier assigné !</h2><p>Bonjour ${demande.conducteurPropose.name},</p><p>Vous avez été assigné comme conducteur de travaux pour le chantier <strong>${demande.titreChantier}</strong>.</p><p><strong>Localisation :</strong> ${demande.localisation}</p><p><strong>Client :</strong> ${demande.client.name}</p><a href="https://www.byh-cm.com/conducteur-travaux/mon-chantier/${demande._id}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Accéder à mon chantier →</a></div></div>`
    }).catch(e => console.error('Email conducteur assigné:', e.message));
    res.json({ message: 'Mission activée ! Le conducteur peut maintenant soumettre des rapports.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== RAPPORTS =====

// POST /api/conducteur-travaux/chantiers/:id/rapports — Conducteur soumet rapport
router.post('/chantiers/:id/rapports', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Chantier non trouvé.' });
    if (demande.conducteur?.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    if (demande.statut !== 'en_cours') return res.status(400).json({ message: 'Le chantier doit être en cours.' });
    const { meteo, avancement, activites, problemes, noteGenerale, nombreOuvriers, type } = req.body;
    const rapport = await RapportChantier.create({
      demande: req.params.id, conducteur: req.user.id, client: demande.client._id,
      date: new Date(), type: type || 'quotidien', meteo: meteo || 'ensoleille',
      avancement: parseInt(avancement) || 0,
      activites: activites ? (Array.isArray(activites) ? activites : [activites]) : [],
      problemes: problemes ? (Array.isArray(problemes) ? problemes : [problemes]) : [],
      nombreOuvriers: parseInt(nombreOuvriers) || 0,
      noteGenerale,
    });
    demande.avancementGlobal = parseInt(avancement) || demande.avancementGlobal;
    demande.nombreRapports += 1;
    demande.derniereActivite = new Date();
    await demande.save();
    notifyUser(demande.client._id, 'nouveau_rapport', { demandeId: demande._id, avancement: parseInt(avancement), type });
    const typeLabel = type === 'hebdomadaire' ? 'hebdomadaire' : type === 'mensuel' ? 'mensuel' : 'quotidien';
    sendEmail({
      to: demande.client.email,
      subject: `📊 Rapport ${typeLabel} — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H — Journal de Chantier</h1></div><div style="padding:32px"><h2>Rapport ${typeLabel}</h2><h3>${demande.titreChantier}</h3><p>Date : ${new Date().toLocaleDateString('fr-FR')}</p><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0"><p style="color:#1E40AF;font-size:20px;font-weight:bold;margin:0">Avancement : ${avancement}%</p></div>${noteGenerale ? `<p><strong>Note :</strong> ${noteGenerale}</p>` : ''}<a href="https://www.byh-cm.com/conducteur-travaux/chantier/${req.params.id}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir le rapport complet →</a></div></div>`
    }).catch(e => console.error('Email rapport:', e.message));
    res.status(201).json({ message: 'Rapport soumis avec succès !', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/chantiers/:id/rapports — Rapports d'un chantier
router.get('/chantiers/:id/rapports', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Chantier non trouvé.' });
    const isAuthorized = demande.client.toString() === req.user.id ||
      demande.conducteur?.toString() === req.user.id || req.user.role === 'admin';
    if (!isAuthorized) return res.status(403).json({ message: 'Accès refusé.' });
    const { type, page=1 } = req.query;
    const filter = { demande: req.params.id };
    if (type) filter.type = type;
    const rapports = await RapportChantier.find(filter)
      .populate('conducteur', 'name')
      .sort({ date: -1 })
      .skip((page-1)*10).limit(10);
    const total = await RapportChantier.countDocuments(filter);
    res.json({ rapports, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/rapports/:id/valider
router.put('/rapports/:id/valider', auth, async (req, res) => {
  try {
    const rapport = await RapportChantier.findById(req.params.id);
    if (!rapport) return res.status(404).json({ message: 'Rapport non trouvé.' });
    if (rapport.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    rapport.statut = 'valide';
    rapport.commentaireClient = req.body.commentaire || '';
    rapport.valideLe = new Date();
    await rapport.save();
    notifyUser(rapport.conducteur, 'rapport_valide', { rapportId: rapport._id });
    res.json({ message: 'Rapport validé !', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/rapports/:id/contester
router.put('/rapports/:id/contester', auth, async (req, res) => {
  try {
    const rapport = await RapportChantier.findById(req.params.id);
    if (!rapport) return res.status(404).json({ message: 'Rapport non trouvé.' });
    if (rapport.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    rapport.statut = 'conteste';
    rapport.commentaireClient = req.body.commentaire || '';
    await rapport.save();
    notifyUser(rapport.conducteur, 'rapport_conteste', { rapportId: rapport._id, commentaire: req.body.commentaire });
    res.json({ message: 'Rapport contesté.', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
