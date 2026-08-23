const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DemandeConducteur = require('../models/DemandeConducteur');
const RapportChantier = require('../models/RapportChantier');
const User = require('../models/User');
const { notifyUser, notifyAdmins } = require('../socket');
const { sendEmail } = require('../utils/emails');

router.post('/demandes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Seul un client peut faire une demande.' });
    const { titreChantier, description, localisation, ville, typeChantier, dateDebut, dateFin, superficie, budgetChantier, budgetPropose } = req.body;
    const demande = await DemandeConducteur.create({ client: req.user.id, titreChantier, description, localisation, ville, typeChantier: typeChantier || 'construction', dateDebut, dateFin, superficie, budgetChantier, budgetPropose });
    notifyAdmins('nouvelle_demande_conducteur', { demandeId: demande._id, titreChantier, ville });
    sendEmail({ to: 'kemkengpowo@byh-cm.com', subject: 'BYH - Nouvelle demande conducteur - ' + titreChantier, html: '<p>Nouvelle demande: ' + titreChantier + ' - ' + ville + '</p>' }).catch(e => console.error(e.message));
    res.status(201).json({ message: 'Demande envoyee ! L equipe B.Y.H va vous contacter sous 24h.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/mes-demandes', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({ client: req.user.id }).populate('conducteur','name phone email').populate('conducteurRetenu','name phone email').populate('offres.conducteur','name phone').sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/demandes/:id/valider-contrat', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id);
    if (demande.client.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    demande.statut = 'valide_client'; demande.contratClientValide = true; demande.dateValidationClient = new Date();
    await demande.save();
    notifyAdmins('contrat_client_valide', { demandeId: demande._id });
    res.json({ message: 'Contrat valide !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/mes-offres', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Acces reserve aux conducteurs.' });
    const demandes = await DemandeConducteur.find({ 'offres.conducteur': req.user.id, 'offres.statut': 'envoyee' }).populate('client','name city').sort({ createdAt: -1 });
    const offres = demandes.map(d => ({ demandeId: d._id, titreChantier: d.titreChantier, description: d.description, localisation: d.localisation, ville: d.ville, typeChantier: d.typeChantier, dateDebut: d.dateDebut, dateFin: d.dateFin, superficie: d.superficie, client: d.client, offre: d.offres.find(o => o.conducteur.toString() === req.user.id) }));
    res.json(offres);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/mes-chantiers', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({ conducteur: req.user.id, statut: { $in: ['en_cours','conducteur_valide','valide_client','contrat_client'] } }).populate('client','name phone email city').sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/offres/:demandeId/repondre', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Acces reserve aux conducteurs.' });
    const { reponse, messageReponse, contreProposition } = req.body;
    const demande = await DemandeConducteur.findById(req.params.demandeId).populate('client','name email');
    const offre = demande.offres.find(o => o.conducteur.toString() === req.user.id);
    if (offre.statut !== 'envoyee') return res.status(400).json({ message: 'Offre deja traitee.' });
    offre.statut = reponse; offre.messageReponse = messageReponse || ''; offre.dateReponse = new Date();
    if (reponse === 'acceptee') {
      demande.statut = 'conducteur_accepte'; demande.conducteurRetenu = req.user.id; demande.tarifjourFinal = contreProposition || offre.tarifjour;
      demande.offres.forEach(o => { if (o.conducteur.toString() !== req.user.id && o.statut === 'envoyee') o.statut = 'expiree'; });
      const conducteur = await User.findById(req.user.id);
      notifyAdmins('conducteur_accepte_offre', { demandeId: demande._id, titreChantier: demande.titreChantier, conducteurNom: conducteur ? conducteur.name : '' });
      sendEmail({ to: 'kemkengpowo@byh-cm.com', subject: 'OK - Conducteur accepte - ' + demande.titreChantier, html: '<p>Un conducteur a accepte la mission: ' + demande.titreChantier + '</p>' }).catch(e => console.error(e.message));
    }
    await demande.save();
    res.json({ message: reponse === 'acceptee' ? 'Offre acceptee ! B.Y.H va vous envoyer le contrat.' : 'Offre refusee.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/demandes/:id/valider-contrat-conducteur', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Acces reserve aux conducteurs.' });
    const demande = await DemandeConducteur.findById(req.params.id);
    if (demande.conducteurRetenu.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    demande.statut = 'conducteur_valide'; demande.contratConducteurValide = true; demande.dateValidationConducteur = new Date();
    await demande.save();
    notifyAdmins('contrat_conducteur_valide', { demandeId: demande._id });
    res.json({ message: 'Contrat signe !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/admin/demandes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const demandes = await DemandeConducteur.find(filter).populate('client','name phone email city').populate('conducteur','name phone email').populate('conducteurRetenu','name phone email').populate('offres.conducteur','name phone email city').sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});
router.post("/admin/demandes/:id/envoyer-offres", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis." });
    const { conducteurs } = req.body;
    if (!conducteurs || !conducteurs.length) return res.status(400).json({ message: "Aucun conducteur selectionne." });
    const demande = await DemandeConducteur.findById(req.params.id).populate("client","name");
    if (!demande) return res.status(404).json({ message: "Demande non trouvee." });
    for (const c of conducteurs) {
      const dejaOffert = demande.offres.find(o => o.conducteur.toString() === c.conducteurId);
      if (!dejaOffert) {
        demande.offres.push({ conducteur: c.conducteurId, tarifjour: c.tarifjour, message: c.message || "", statut: "envoyee" });
        notifyUser(c.conducteurId, "nouvelle_offre_chantier", { demandeId: demande._id, titreChantier: demande.titreChantier, tarifjour: c.tarifjour });
        const conducteur = await User.findById(c.conducteurId);
        if (conducteur) sendEmail({ to: conducteur.email, subject: "BYH - Nouvelle offre mission - " + demande.titreChantier, html: "<p>Nouvelle mission proposee: " + demande.titreChantier + ". Tarif: " + c.tarifjour + " FCFA/jour. Connectez-vous pour repondre.</p>" }).catch(e => console.error(e.message));
      }
    }
    demande.statut = "offres_envoyees";
    await demande.save();
    res.json({ message: "Offres envoyees !", demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});
});

router.put('/admin/demandes/:id/envoyer-contrat-conducteur', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('conducteurRetenu','name email');
    demande.statut = 'contrat_conducteur'; demande.contratConducteurUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.conducteurRetenu._id, 'contrat_a_signer', { demandeId: demande._id });
    sendEmail({ to: demande.conducteurRetenu.email, subject: 'CONTRAT - A signer - ' + demande.titreChantier, html: '<p>Bonjour ' + demande.conducteurRetenu.name + ', votre contrat pour ' + demande.titreChantier + ' est pret. Connectez-vous pour le signer.</p>' }).catch(e => console.error(e.message));
    res.json({ message: 'Contrat envoye au conducteur !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/admin/demandes/:id/proposer-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('client','name email').populate('conducteurRetenu','name phone');
    demande.statut = 'propose_client';
    await demande.save();
    notifyUser(demande.client._id, 'conducteur_propose', { demandeId: demande._id, conducteurNom: demande.conducteurRetenu.name });
    sendEmail({ to: demande.client.email, subject: 'OK - Conducteur trouve - ' + demande.titreChantier, html: '<p>Bonjour ' + demande.client.name + ', un conducteur a ete trouve pour ' + demande.titreChantier + '. Conducteur: ' + demande.conducteurRetenu.name + '. Tarif: ' + new Intl.NumberFormat('fr-FR').format(demande.tarifjourFinal) + ' FCFA/jour.</p>' }).catch(e => console.error(e.message));
    res.json({ message: 'Conducteur propose au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/admin/demandes/:id/envoyer-contrat-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('client','name email');
    demande.statut = 'contrat_client'; demande.contratClientUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.client._id, 'contrat_a_signer_client', { demandeId: demande._id });
    sendEmail({ to: demande.client.email, subject: 'CONTRAT - A signer - ' + demande.titreChantier, html: '<p>Bonjour ' + demande.client.name + ', votre contrat pour ' + demande.titreChantier + ' est pret.</p>' }).catch(e => console.error(e.message));
    res.json({ message: 'Contrat envoye au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/admin/demandes/:id/activer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('client','name email').populate('conducteurRetenu','name email');
    demande.conducteur = demande.conducteurRetenu._id; demande.statut = 'en_cours';
    await demande.save();
    notifyUser(demande.client._id, 'mission_activee', { demandeId: demande._id });
    notifyUser(demande.conducteurRetenu._id, 'chantier_assigne', { demandeId: demande._id });
    sendEmail({ to: demande.conducteurRetenu.email, subject: 'START - Mission demarree - ' + demande.titreChantier, html: '<p>Bonjour ' + demande.conducteurRetenu.name + ', votre mission ' + demande.titreChantier + ' est active ! Connectez-vous pour soumettre vos rapports.</p>' }).catch(e => console.error(e.message));
    res.json({ message: 'Mission activee !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/chantiers/:id/rapports', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id).populate('client','name email');
    if (demande.conducteur.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (demande.statut !== 'en_cours') return res.status(400).json({ message: 'Chantier non en cours.' });
    const { meteo, avancement, activites, problemes, noteGenerale, nombreOuvriers, type } = req.body;
    const rapport = await RapportChantier.create({ demande: req.params.id, conducteur: req.user.id, client: demande.client._id, date: new Date(), type: type || 'quotidien', meteo: meteo || 'ensoleille', avancement: parseInt(avancement)||0, activites: activites ? (Array.isArray(activites)?activites:[activites]) : [], problemes: problemes ? (Array.isArray(problemes)?problemes:[problemes]) : [], nombreOuvriers: parseInt(nombreOuvriers)||0, noteGenerale });
    demande.avancementGlobal = parseInt(avancement)||demande.avancementGlobal; demande.nombreRapports+=1; demande.derniereActivite=new Date();
    await demande.save();
    notifyUser(demande.client._id, 'nouveau_rapport', { demandeId: demande._id, avancement: parseInt(avancement) });
    const typeLabel = type==='hebdomadaire'?'hebdomadaire':type==='mensuel'?'mensuel':'quotidien';
    sendEmail({ to: demande.client.email, subject: 'RAPPORT ' + typeLabel + ' - ' + demande.titreChantier, html: '<p>Rapport ' + typeLabel + ' soumis. Avancement: ' + avancement + '%. Connectez-vous pour valider.</p>' }).catch(e => console.error(e.message));
    res.status(201).json({ message: 'Rapport soumis !', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/chantiers/:id/rapports', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id);
    const isAuthorized = demande.client.toString()===req.user.id || (demande.conducteur && demande.conducteur.toString()===req.user.id) || req.user.role==='admin';
    const { type, page=1 } = req.query;
    const filter = { demande: req.params.id };
    if (type) filter.type = type;
    const rapports = await RapportChantier.find(filter).populate('conducteur','name').sort({ date: -1 }).skip((page-1)*10).limit(10);
    const total = await RapportChantier.countDocuments(filter);
    res.json({ rapports, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/rapports/:id/valider', auth, async (req, res) => {
  try {
    const rapport = await RapportChantier.findById(req.params.id);
    if (rapport.client.toString()!==req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    rapport.statut='valide'; rapport.commentaireClient=req.body.commentaire||''; rapport.valideLe=new Date();
    await rapport.save();
    notifyUser(rapport.conducteur, 'rapport_valide', { rapportId: rapport._id });
    res.json({ message: 'Rapport valide !', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/rapports/:id/contester', auth, async (req, res) => {
  try {
    const rapport = await RapportChantier.findById(req.params.id);
    if (rapport.client.toString()!==req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    rapport.statut='conteste'; rapport.commentaireClient=req.body.commentaire||'';
    await rapport.save();
    notifyUser(rapport.conducteur, 'rapport_conteste', { rapportId: rapport._id });
    res.json({ message: 'Rapport conteste.', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
