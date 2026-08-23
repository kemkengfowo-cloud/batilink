const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DemandeConducteur = require('../models/DemandeConducteur');
const RapportChantier = require('../models/RapportChantier');
const User = require('../models/User');
const { notifyUser, notifyAdmins } = require('../socket');
const { sendEmail } = require('../utils/emails');

// ===== CLIENT =====

// POST /api/conducteur-travaux/demandes — Client soumet demande
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
    notifyAdmins('nouvelle_demande_conducteur', { demandeId: demande._id, titreChantier, ville });
    sendEmail({
      to: 'kemkengpowo@byh-cm.com',
      subject: `🏗️ Nouvelle demande conducteur — ${titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H Admin</h1></div><div style="padding:32px"><h2>Nouvelle demande conducteur</h2><p><strong>Chantier :</strong> ${titreChantier}</p><p><strong>Ville :</strong> ${ville}</p><p><strong>Localisation :</strong> ${localisation}</p><p><strong>Budget proposé :</strong> ${budgetPropose ? new Intl.NumberFormat('fr-FR').format(budgetPropose)+' FCFA/jour' : 'Non défini'}</p><a href="https://www.byh-cm.com/admin" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Traiter la demande →</a></div></div>`
    }).catch(e => console.error('Email admin:', e.message));
    res.status(201).json({ message: "Demande envoyée ! L'équipe B.Y.H va vous contacter sous 24h.", demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/mes-demandes — Client voit ses demandes
router.get('/mes-demandes', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({ client: req.user.id })
      .populate('conducteur', 'name phone email')
      .populate('conducteurRetenu', 'name phone email')
      .populate('offres.conducteur', 'name phone')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/demandes/:id/valider-contrat — Client valide son contrat
router.put('/demandes/:id/valider-contrat', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (demande.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    demande.statut = 'valide_client';
    demande.contratClientValide = true;
    demande.dateValidationClient = new Date();
    await demande.save();
    notifyAdmins('contrat_client_valide', { demandeId: demande._id, titreChantier: demande.titreChantier });
    res.json({ message: 'Contrat validé ! La mission va démarrer bientôt.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== CONDUCTEUR =====

// GET /api/conducteur-travaux/mes-offres — Conducteur voit les offres reçues
router.get('/mes-offres', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Accès réservé aux conducteurs.' });
    const demandes = await DemandeConducteur.find({
      'offres.conducteur': req.user.id,
      'offres.statut': 'envoyee'
    }).populate('client', 'name city').sort({ createdAt: -1 });
    // Filtrer pour n'afficher que les offres de ce conducteur
    const offres = demandes.map(d => ({
      demandeId: d._id,
      titreChantier: d.titreChantier,
      description: d.description,
      localisation: d.localisation,
      ville: d.ville,
      typeChantier: d.typeChantier,
      dateDebut: d.dateDebut,
      dateFin: d.dateFin,
      superficie: d.superficie,
      client: d.client,
      offre: d.offres.find(o => o.conducteur.toString() === req.user.id),
    }));
    res.json(offres);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/mes-chantiers — Chantiers actifs du conducteur
router.get('/mes-chantiers', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({
      conducteur: req.user.id,
      statut: { $in: ['en_cours', 'conducteur_valide', 'valide_client', 'contrat_client'] }
    }).populate('client', 'name phone email city').sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/offres/:demandeId/repondre — Conducteur accepte/refuse
router.put('/offres/:demandeId/repondre', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Accès réservé aux conducteurs.' });
    const { reponse, messageReponse, contreProposition } = req.body;
    if (!['acceptee', 'refusee'].includes(reponse)) {
      return res.status(400).json({ message: 'Réponse invalide. Utilisez acceptee ou refusee.' });
    }
    const demande = await DemandeConducteur.findById(req.params.demandeId)
      .populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    const offre = demande.offres.find(o => o.conducteur.toString() === req.user.id);
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée.' });
    if (offre.statut !== 'envoyee') return res.status(400).json({ message: 'Cette offre a déjà reçu une réponse.' });

    offre.statut = reponse;
    offre.messageReponse = messageReponse || '';
    offre.dateReponse = new Date();

    if (reponse === 'acceptee') {
      demande.statut = 'conducteur_accepte';
      demande.conducteurRetenu = req.user.id;
      demande.tarifjourFinal = contreProposition || offre.tarifjour;
      // Refuser les autres offres
      demande.offres.forEach(o => {
        if (o.conducteur.toString() !== req.user.id && o.statut === 'envoyee') {
          o.statut = 'expiree';
        }
      });
      // Notifier admin
      const conducteur = await User.findById(req.user.id);
      notifyAdmins('conducteur_accepte_offre', {
        demandeId: demande._id,
        titreChantier: demande.titreChantier,
        conducteurNom: conducteur?.name,
        tarifjour: demande.tarifjourFinal,
      });
      sendEmail({
        to: 'kemkengpowo@byh-cm.com',
        subject: `[OK] Conducteur accepte — ${demande.titreChantier}`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H Admin</h1></div><div style="padding:32px"><h2 style="color:#16A34A">✅ Un conducteur a accepté !</h2><p><strong>Chantier :</strong> ${demande.titreChantier}</p><p><strong>Conducteur :</strong> ${conducteur?.name}</p><p><strong>Tarif/jour :</strong> ${new Intl.NumberFormat('fr-FR').format(demande.tarifjourFinal)} FCFA</p>${messageReponse ? `<p><strong>Message :</strong> ${messageReponse}</p>` : ''}<p>Envoyez maintenant le contrat au conducteur puis proposez-le au client.</p><a href="https://www.byh-cm.com/admin" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Gérer →</a></div></div>`
      }).catch(e => console.error('Email admin:', e.message));
    }

    await demande.save();
    res.json({
      message: reponse === 'acceptee' ? "Offre acceptée ! L'équipe B.Y.H va vous envoyer le contrat." : "Offre refusée.",
      demande
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/demandes/:id/valider-contrat-conducteur — Conducteur signe contrat
router.put('/demandes/:id/valider-contrat-conducteur', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Accès réservé aux conducteurs.' });
    const demande = await DemandeConducteur.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (demande.conducteurRetenu?.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    demande.statut = 'conducteur_valide';
    demande.contratConducteurValide = true;
    demande.dateValidationConducteur = new Date();
    await demande.save();
    notifyAdmins('contrat_conducteur_valide', { demandeId: demande._id, titreChantier: demande.titreChantier });
    res.json({ message: 'Contrat signé ! L\'admin va maintenant proposer votre profil au client.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== ADMIN =====

// GET /api/conducteur-travaux/admin/demandes — Admin voit tout
router.get('/admin/demandes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const demandes = await DemandeConducteur.find(filter)
      .populate('client', 'name phone email city')
      .populate('conducteur', 'name phone email')
      .populate('conducteurRetenu', 'name phone email')
      .populate('offres.conducteur', 'name phone email city')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/conducteur-travaux/admin/demandes/:id/envoyer-offres — Admin envoie offres à conducteurs
router.post('/admin/demandes/:id/envoyer-offres', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { conducteurs } = req.body; // [{conducteurId, tarifjour, message}]
    if (!conducteurs || !conducteurs.length) return res.status(400).json({ message: 'Aucun conducteur sélectionné.' });

    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });

    // Ajouter les offres
    for (const c of conducteurs) {
      const dejaOffert = demande.offres.find(o => o.conducteur.toString() === c.conducteurId);
      if (!dejaOffert) {
        demande.offres.push({
          conducteur: c.conducteurId,
          tarifjour: c.tarifjour,
          message: c.message || '',
          statut: 'envoyee',
        });
        // Notifier le conducteur
        notifyUser(c.conducteurId, 'nouvelle_offre_chantier', {
          demandeId: demande._id,
          titreChantier: demande.titreChantier,
          tarifjour: c.tarifjour,
        });
        // Email au conducteur
        const conducteur = await User.findById(c.conducteurId);
        if (conducteur) {
          sendEmail({
            to: conducteur.email,
            subject: `🏗️ Nouvelle offre de mission — ${demande.titreChantier}`,
            html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>🏗️ Nouvelle offre de mission</h2><p>Bonjour ${conducteur.name},</p><p>L'équipe B.Y.H vous propose une mission de conducteur de travaux :</p><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0"><p><strong>Chantier :</strong> ${demande.titreChantier}</p><p><strong>Localisation :</strong> ${demande.localisation} — ${demande.ville}</p><p><strong>Type :</strong> ${demande.typeChantier}</p><p><strong>Date début :</strong> ${new Date(demande.dateDebut).toLocaleDateString('fr-FR')}</p><p><strong>Tarif proposé :</strong> ${new Intl.NumberFormat('fr-FR').format(c.tarifjour)} FCFA/jour</p>${c.message ? `<p><strong>Message :</strong> ${c.message}</p>` : ''}</div><p>Connectez-vous pour accepter ou refuser cette offre.</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir l'offre →</a></div></div>`
          }).catch(e => console.error('Email conducteur:', e.message));
        }
      }
    }

    demande.statut = 'offres_envoyees';
    await demande.save();
    res.json({ message: `Offres envoyées à ${conducteurs.length} conducteur(s) !`, demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/envoyer-contrat-conducteur
router.put('/admin/demandes/:id/envoyer-contrat-conducteur', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('conducteurRetenu', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (!demande.conducteurRetenu) return res.status(400).json({ message: 'Aucun conducteur retenu.' });
    demande.statut = 'contrat_conducteur';
    demande.contratConducteurUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.conducteurRetenu._id, 'contrat_a_signer', { demandeId: demande._id });
    sendEmail({
      to: demande.conducteurRetenu.email,
      subject: `📄 Contrat à signer — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>📄 Votre contrat est prêt</h2><p>Bonjour ${demande.conducteurRetenu.name},</p><p>Votre contrat pour le chantier <strong>${demande.titreChantier}</strong> est prêt. Connectez-vous pour le signer.</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Signer le contrat →</a></div></div>`
    }).catch(e => console.error('Email contrat conducteur:', e.message));
    res.json({ message: 'Contrat envoyé au conducteur !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/proposer-client — Admin propose au client
router.put('/admin/demandes/:id/proposer-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id)
      .populate('client', 'name email')
      .populate('conducteurRetenu', 'name phone');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (!demande.conducteurRetenu) return res.status(400).json({ message: 'Aucun conducteur retenu.' });
    demande.statut = 'propose_client';
    await demande.save();
    notifyUser(demande.client._id, 'conducteur_propose', {
      demandeId: demande._id,
      conducteurNom: demande.conducteurRetenu.name,
    });
    sendEmail({
      to: demande.client.email,
      subject: `[OK] Conducteur trouvé — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">✅ Conducteur trouvé !</h2><p>Bonjour ${demande.client.name},</p><p>L'équipe B.Y.H a trouvé un conducteur pour votre chantier <strong>${demande.titreChantier}</strong>.</p><div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:16px;margin:16px 0"><p><strong>Conducteur :</strong> ${demande.conducteurRetenu.name}</p><p><strong>Tarif/jour :</strong> ${new Intl.NumberFormat('fr-FR').format(demande.tarifjourFinal)} FCFA</p></div><a href="https://www.byh-cm.com/conducteur-travaux" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir et valider →</a></div></div>`
    }).catch(e => console.error('Email client:', e.message));
    res.json({ message: 'Conducteur proposé au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/envoyer-contrat-client
router.put('/admin/demandes/:id/envoyer-contrat-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    demande.statut = 'contrat_client';
    demande.contratClientUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.client._id, 'contrat_a_signer_client', { demandeId: demande._id });
    sendEmail({
      to: demande.client.email,
      subject: `📄 Contrat à signer — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>📄 Votre contrat est prêt</h2><p>Bonjour ${demande.client.name},</p><p>Le contrat pour le chantier <strong>${demande.titreChantier}</strong> est prêt. Validez-le depuis votre espace.</p><a href="https://www.byh-cm.com/conducteur-travaux" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Signer le contrat →</a></div></div>`
    }).catch(e => console.error('Email contrat client:', e.message));
    res.json({ message: 'Contrat envoyé au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/activer
router.put('/admin/demandes/:id/activer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id)
      .populate('client', 'name email')
      .populate('conducteurRetenu', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    demande.conducteur = demande.conducteurRetenu._id;
    demande.statut = 'en_cours';
    await demande.save();
    notifyUser(demande.client._id, 'mission_activee', { demandeId: demande._id });
    notifyUser(demande.conducteurRetenu._id, 'chantier_assigne', { demandeId: demande._id });
    sendEmail({
      to: demande.conducteurRetenu.email,
      subject: `🚀 Mission démarrée — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">🚀 Votre mission démarre !</h2><p>Bonjour ${demande.conducteurRetenu.name},</p><p>La mission <strong>${demande.titreChantier}</strong> est maintenant active. Rendez-vous sur le chantier et soumettez votre premier rapport.</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Accéder à mon chantier →</a></div></div>`
    }).catch(e => console.error('Email activation:', e.message));
    res.json({ message: 'Mission activée !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== RAPPORTS =====

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
    notifyUser(demande.client._id, 'nouveau_rapport', { demandeId: demande._id, avancement: parseInt(avancement) });
    const typeLabel = type === 'hebdomadaire' ? 'hebdomadaire' : type === 'mensuel' ? 'mensuel' : 'quotidien';
    sendEmail({
      to: demande.client.email,
      subject: `📊 Rapport ${typeLabel} — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H — Journal de Chantier</h1></div><div style="padding:32px"><h2>Rapport ${typeLabel} — ${demande.titreChantier}</h2><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0"><p style="color:#1E40AF;font-size:20px;font-weight:bold;margin:0">Avancement : ${avancement}%</p></div>${noteGenerale ? `<p>${noteGenerale}</p>
cat > server/routes/conducteurTravaux.js << 'ENDOFFILE'
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DemandeConducteur = require('../models/DemandeConducteur');
const RapportChantier = require('../models/RapportChantier');
const User = require('../models/User');
const { notifyUser, notifyAdmins } = require('../socket');
const { sendEmail } = require('../utils/emails');

// ===== CLIENT =====

// POST /api/conducteur-travaux/demandes — Client soumet demande
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
    notifyAdmins('nouvelle_demande_conducteur', { demandeId: demande._id, titreChantier, ville });
    sendEmail({
      to: 'kemkengpowo@byh-cm.com',
      subject: `🏗️ Nouvelle demande conducteur — ${titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H Admin</h1></div><div style="padding:32px"><h2>Nouvelle demande conducteur</h2><p><strong>Chantier :</strong> ${titreChantier}</p><p><strong>Ville :</strong> ${ville}</p><p><strong>Localisation :</strong> ${localisation}</p><p><strong>Budget proposé :</strong> ${budgetPropose ? new Intl.NumberFormat('fr-FR').format(budgetPropose)+' FCFA/jour' : 'Non défini'}</p><a href="https://www.byh-cm.com/admin" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Traiter la demande →</a></div></div>`
    }).catch(e => console.error('Email admin:', e.message));
    res.status(201).json({ message: "Demande envoyée ! L'équipe B.Y.H va vous contacter sous 24h.", demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/mes-demandes — Client voit ses demandes
router.get('/mes-demandes', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({ client: req.user.id })
      .populate('conducteur', 'name phone email')
      .populate('conducteurRetenu', 'name phone email')
      .populate('offres.conducteur', 'name phone')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/demandes/:id/valider-contrat — Client valide son contrat
router.put('/demandes/:id/valider-contrat', auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (demande.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    demande.statut = 'valide_client';
    demande.contratClientValide = true;
    demande.dateValidationClient = new Date();
    await demande.save();
    notifyAdmins('contrat_client_valide', { demandeId: demande._id, titreChantier: demande.titreChantier });
    res.json({ message: 'Contrat validé ! La mission va démarrer bientôt.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== CONDUCTEUR =====

// GET /api/conducteur-travaux/mes-offres — Conducteur voit les offres reçues
router.get('/mes-offres', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Accès réservé aux conducteurs.' });
    const demandes = await DemandeConducteur.find({
      'offres.conducteur': req.user.id,
      'offres.statut': 'envoyee'
    }).populate('client', 'name city').sort({ createdAt: -1 });
    // Filtrer pour n'afficher que les offres de ce conducteur
    const offres = demandes.map(d => ({
      demandeId: d._id,
      titreChantier: d.titreChantier,
      description: d.description,
      localisation: d.localisation,
      ville: d.ville,
      typeChantier: d.typeChantier,
      dateDebut: d.dateDebut,
      dateFin: d.dateFin,
      superficie: d.superficie,
      client: d.client,
      offre: d.offres.find(o => o.conducteur.toString() === req.user.id),
    }));
    res.json(offres);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/conducteur-travaux/mes-chantiers — Chantiers actifs du conducteur
router.get('/mes-chantiers', auth, async (req, res) => {
  try {
    const demandes = await DemandeConducteur.find({
      conducteur: req.user.id,
      statut: { $in: ['en_cours', 'conducteur_valide', 'valide_client', 'contrat_client'] }
    }).populate('client', 'name phone email city').sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/offres/:demandeId/repondre — Conducteur accepte/refuse
router.put('/offres/:demandeId/repondre', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Accès réservé aux conducteurs.' });
    const { reponse, messageReponse, contreProposition } = req.body;
    if (!['acceptee', 'refusee'].includes(reponse)) {
      return res.status(400).json({ message: 'Réponse invalide. Utilisez acceptee ou refusee.' });
    }
    const demande = await DemandeConducteur.findById(req.params.demandeId)
      .populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    const offre = demande.offres.find(o => o.conducteur.toString() === req.user.id);
    if (!offre) return res.status(404).json({ message: 'Offre non trouvée.' });
    if (offre.statut !== 'envoyee') return res.status(400).json({ message: 'Cette offre a déjà reçu une réponse.' });

    offre.statut = reponse;
    offre.messageReponse = messageReponse || '';
    offre.dateReponse = new Date();

    if (reponse === 'acceptee') {
      demande.statut = 'conducteur_accepte';
      demande.conducteurRetenu = req.user.id;
      demande.tarifjourFinal = contreProposition || offre.tarifjour;
      // Refuser les autres offres
      demande.offres.forEach(o => {
        if (o.conducteur.toString() !== req.user.id && o.statut === 'envoyee') {
          o.statut = 'expiree';
        }
      });
      // Notifier admin
      const conducteur = await User.findById(req.user.id);
      notifyAdmins('conducteur_accepte_offre', {
        demandeId: demande._id,
        titreChantier: demande.titreChantier,
        conducteurNom: conducteur?.name,
        tarifjour: demande.tarifjourFinal,
      });
      sendEmail({
        to: 'kemkengpowo@byh-cm.com',
        subject: `[OK] Conducteur accepte — ${demande.titreChantier}`,
        html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H Admin</h1></div><div style="padding:32px"><h2 style="color:#16A34A">✅ Un conducteur a accepté !</h2><p><strong>Chantier :</strong> ${demande.titreChantier}</p><p><strong>Conducteur :</strong> ${conducteur?.name}</p><p><strong>Tarif/jour :</strong> ${new Intl.NumberFormat('fr-FR').format(demande.tarifjourFinal)} FCFA</p>${messageReponse ? `<p><strong>Message :</strong> ${messageReponse}</p>` : ''}<p>Envoyez maintenant le contrat au conducteur puis proposez-le au client.</p><a href="https://www.byh-cm.com/admin" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Gérer →</a></div></div>`
      }).catch(e => console.error('Email admin:', e.message));
    }

    await demande.save();
    res.json({
      message: reponse === 'acceptee' ? "Offre acceptée ! L'équipe B.Y.H va vous envoyer le contrat." : "Offre refusée.",
      demande
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/demandes/:id/valider-contrat-conducteur — Conducteur signe contrat
router.put('/demandes/:id/valider-contrat-conducteur', auth, async (req, res) => {
  try {
    if (req.user.role !== 'conducteur') return res.status(403).json({ message: 'Accès réservé aux conducteurs.' });
    const demande = await DemandeConducteur.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (demande.conducteurRetenu?.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    demande.statut = 'conducteur_valide';
    demande.contratConducteurValide = true;
    demande.dateValidationConducteur = new Date();
    await demande.save();
    notifyAdmins('contrat_conducteur_valide', { demandeId: demande._id, titreChantier: demande.titreChantier });
    res.json({ message: 'Contrat signé ! L\'admin va maintenant proposer votre profil au client.', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== ADMIN =====

// GET /api/conducteur-travaux/admin/demandes — Admin voit tout
router.get('/admin/demandes', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { statut } = req.query;
    const filter = statut ? { statut } : {};
    const demandes = await DemandeConducteur.find(filter)
      .populate('client', 'name phone email city')
      .populate('conducteur', 'name phone email')
      .populate('conducteurRetenu', 'name phone email')
      .populate('offres.conducteur', 'name phone email city')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/conducteur-travaux/admin/demandes/:id/envoyer-offres — Admin envoie offres à conducteurs
router.post('/admin/demandes/:id/envoyer-offres', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { conducteurs } = req.body; // [{conducteurId, tarifjour, message}]
    if (!conducteurs || !conducteurs.length) return res.status(400).json({ message: 'Aucun conducteur sélectionné.' });

    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });

    // Ajouter les offres
    for (const c of conducteurs) {
      const dejaOffert = demande.offres.find(o => o.conducteur.toString() === c.conducteurId);
      if (!dejaOffert) {
        demande.offres.push({
          conducteur: c.conducteurId,
          tarifjour: c.tarifjour,
          message: c.message || '',
          statut: 'envoyee',
        });
        // Notifier le conducteur
        notifyUser(c.conducteurId, 'nouvelle_offre_chantier', {
          demandeId: demande._id,
          titreChantier: demande.titreChantier,
          tarifjour: c.tarifjour,
        });
        // Email au conducteur
        const conducteur = await User.findById(c.conducteurId);
        if (conducteur) {
          sendEmail({
            to: conducteur.email,
            subject: `🏗️ Nouvelle offre de mission — ${demande.titreChantier}`,
            html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>🏗️ Nouvelle offre de mission</h2><p>Bonjour ${conducteur.name},</p><p>L'équipe B.Y.H vous propose une mission de conducteur de travaux :</p><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0"><p><strong>Chantier :</strong> ${demande.titreChantier}</p><p><strong>Localisation :</strong> ${demande.localisation} — ${demande.ville}</p><p><strong>Type :</strong> ${demande.typeChantier}</p><p><strong>Date début :</strong> ${new Date(demande.dateDebut).toLocaleDateString('fr-FR')}</p><p><strong>Tarif proposé :</strong> ${new Intl.NumberFormat('fr-FR').format(c.tarifjour)} FCFA/jour</p>${c.message ? `<p><strong>Message :</strong> ${c.message}</p>` : ''}</div><p>Connectez-vous pour accepter ou refuser cette offre.</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir l'offre →</a></div></div>`
          }).catch(e => console.error('Email conducteur:', e.message));
        }
      }
    }

    demande.statut = 'offres_envoyees';
    await demande.save();
    res.json({ message: `Offres envoyées à ${conducteurs.length} conducteur(s) !`, demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/envoyer-contrat-conducteur
router.put('/admin/demandes/:id/envoyer-contrat-conducteur', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('conducteurRetenu', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (!demande.conducteurRetenu) return res.status(400).json({ message: 'Aucun conducteur retenu.' });
    demande.statut = 'contrat_conducteur';
    demande.contratConducteurUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.conducteurRetenu._id, 'contrat_a_signer', { demandeId: demande._id });
    sendEmail({
      to: demande.conducteurRetenu.email,
      subject: `📄 Contrat à signer — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>📄 Votre contrat est prêt</h2><p>Bonjour ${demande.conducteurRetenu.name},</p><p>Votre contrat pour le chantier <strong>${demande.titreChantier}</strong> est prêt. Connectez-vous pour le signer.</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Signer le contrat →</a></div></div>`
    }).catch(e => console.error('Email contrat conducteur:', e.message));
    res.json({ message: 'Contrat envoyé au conducteur !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/proposer-client — Admin propose au client
router.put('/admin/demandes/:id/proposer-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id)
      .populate('client', 'name email')
      .populate('conducteurRetenu', 'name phone');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    if (!demande.conducteurRetenu) return res.status(400).json({ message: 'Aucun conducteur retenu.' });
    demande.statut = 'propose_client';
    await demande.save();
    notifyUser(demande.client._id, 'conducteur_propose', {
      demandeId: demande._id,
      conducteurNom: demande.conducteurRetenu.name,
    });
    sendEmail({
      to: demande.client.email,
      subject: `[OK] Conducteur trouvé — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">✅ Conducteur trouvé !</h2><p>Bonjour ${demande.client.name},</p><p>L'équipe B.Y.H a trouvé un conducteur pour votre chantier <strong>${demande.titreChantier}</strong>.</p><div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:16px;margin:16px 0"><p><strong>Conducteur :</strong> ${demande.conducteurRetenu.name}</p><p><strong>Tarif/jour :</strong> ${new Intl.NumberFormat('fr-FR').format(demande.tarifjourFinal)} FCFA</p></div><a href="https://www.byh-cm.com/conducteur-travaux" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir et valider →</a></div></div>`
    }).catch(e => console.error('Email client:', e.message));
    res.json({ message: 'Conducteur proposé au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/envoyer-contrat-client
router.put('/admin/demandes/:id/envoyer-contrat-client', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id).populate('client', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    demande.statut = 'contrat_client';
    demande.contratClientUrl = req.body.contratUrl || '';
    await demande.save();
    notifyUser(demande.client._id, 'contrat_a_signer_client', { demandeId: demande._id });
    sendEmail({
      to: demande.client.email,
      subject: `📄 Contrat à signer — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2>📄 Votre contrat est prêt</h2><p>Bonjour ${demande.client.name},</p><p>Le contrat pour le chantier <strong>${demande.titreChantier}</strong> est prêt. Validez-le depuis votre espace.</p><a href="https://www.byh-cm.com/conducteur-travaux" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Signer le contrat →</a></div></div>`
    }).catch(e => console.error('Email contrat client:', e.message));
    res.json({ message: 'Contrat envoyé au client !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/conducteur-travaux/admin/demandes/:id/activer
router.put('/admin/demandes/:id/activer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const demande = await DemandeConducteur.findById(req.params.id)
      .populate('client', 'name email')
      .populate('conducteurRetenu', 'name email');
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée.' });
    demande.conducteur = demande.conducteurRetenu._id;
    demande.statut = 'en_cours';
    await demande.save();
    notifyUser(demande.client._id, 'mission_activee', { demandeId: demande._id });
    notifyUser(demande.conducteurRetenu._id, 'chantier_assigne', { demandeId: demande._id });
    sendEmail({
      to: demande.conducteurRetenu.email,
      subject: `🚀 Mission démarrée — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H</h1></div><div style="padding:32px"><h2 style="color:#16A34A">🚀 Votre mission démarre !</h2><p>Bonjour ${demande.conducteurRetenu.name},</p><p>La mission <strong>${demande.titreChantier}</strong> est maintenant active. Rendez-vous sur le chantier et soumettez votre premier rapport.</p><a href="https://www.byh-cm.com/dashboard" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Accéder à mon chantier →</a></div></div>`
    }).catch(e => console.error('Email activation:', e.message));
    res.json({ message: 'Mission activée !', demande });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// ===== RAPPORTS =====

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
    notifyUser(demande.client._id, 'nouveau_rapport', { demandeId: demande._id, avancement: parseInt(avancement) });
    const typeLabel = type === 'hebdomadaire' ? 'hebdomadaire' : type === 'mensuel' ? 'mensuel' : 'quotidien';
    sendEmail({
      to: demande.client.email,
      subject: `📊 Rapport ${typeLabel} — ${demande.titreChantier}`,
      html: `<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center"><h1 style="color:#fff">B.Y.H — Journal de Chantier</h1></div><div style="padding:32px"><h2>Rapport ${typeLabel} — ${demande.titreChantier}</h2><div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0"><p style="color:#1E40AF;font-size:20px;font-weight:bold;margin:0">Avancement : ${avancement}%</p></div>${noteGenerale ? `<p>${noteGenerale}</p>` : ''}<a href="https://www.byh-cm.com/conducteur-travaux/chantier/${req.params.id}" style="display:inline-block;background:#2563EB;color:#fff;padding:12px 24px;border-radius:10px;font-weight:bold;text-decoration:none;margin-top:16px">Voir le rapport →</a></div></div>`
    }).catch(e => console.error('Email rapport:', e.message));
    res.status(201).json({ message: 'Rapport soumis !', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

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

router.put('/rapports/:id/contester', auth, async (req, res) => {
  try {
    const rapport = await RapportChantier.findById(req.params.id);
    if (!rapport) return res.status(404).json({ message: 'Rapport non trouvé.' });
    if (rapport.client.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé.' });
    rapport.statut = 'conteste';
    rapport.commentaireClient = req.body.commentaire || '';
    await rapport.save();
    notifyUser(rapport.conducteur, 'rapport_conteste', { rapportId: rapport._id });
    res.json({ message: 'Rapport contesté.', rapport });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
