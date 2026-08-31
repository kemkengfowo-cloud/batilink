const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Paiement = require('../models/Paiement');
const Devis = require('../models/Devis');
const Jalon = require('../models/Jalon');
const { notifyUser, notifyAdmins } = require('../socket');
const { sendEmail } = require('../utils/emails');

const genReference = () => `BYH-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;

const OPERATEURS = {
  orange_money: { nom: 'Orange Money', numero: '655 00 00 00' },
  mtn_momo:     { nom: 'MTN MoMo',     numero: '677 00 00 00' },
};

// POST /api/paiements/initier
router.post('/initier', auth, async (req, res) => {
  try {
    const { devisId, jalonId, operateur, telephone } = req.body;

    if (!devisId || !operateur || !telephone) {
      return res.status(400).json({ message: 'Champs requis manquants.' });
    }
    if (!OPERATEURS[operateur]) {
      return res.status(400).json({ message: 'Operateur invalide.' });
    }
    if (!/^\+?[0-9]{8,15}$/.test(telephone)) {
      return res.status(400).json({ message: 'Numero de telephone invalide.' });
    }

    const devis = await Devis.findById(devisId)
      .populate('client', 'name email phone')
      .populate('artisan', 'name email phone');

    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.client._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acces refuse.' });
    }
    if (!['accepte', 'en_cours'].includes(devis.statut)) {
      return res.status(400).json({ message: 'Le devis doit etre accepte pour effectuer un paiement.' });
    }

    let montant = devis.total;
    let typePaiement = 'total';
    let jalonRef = null;

    if (jalonId) {
      const jalon = await Jalon.findById(jalonId);
      if (!jalon) return res.status(404).json({ message: 'Jalon non trouve.' });
      if (jalon.statut !== 'valide') {
        return res.status(400).json({ message: 'Le jalon doit etre valide avant le paiement.' });
      }
      // Vérifier qu'il n'y a pas déjà un paiement pour ce jalon
      const dejaPayé = await Paiement.findOne({
        jalon: jalonId,
        statut: { $in: ['en_attente', 'confirme'] }
      });
      if (dejaPayé) {
        return res.status(400).json({ message: 'Ce jalon a deja un paiement en cours ou confirme.' });
      }
      montant = jalon.montant;
      typePaiement = 'jalon';
      jalonRef = jalonId;
    } else {
      const modePaiement = devis.modePaiement || "total";
      if (modePaiement === "jalons") {
        return res.status(400).json({ message: "Ce devis necessite un paiement par jalons. Selectionnez un jalon." });
      }
      const dejaEnAttente = await Paiement.findOne({ devis: devisId, jalon: null, statut: { $in: ["en_attente","confirme"] } });
      if (dejaEnAttente) return res.status(400).json({ message: "Un paiement est deja en cours pour ce devis." });
      if (modePaiement === "acompte") {
        if (!devis.acompteVerse) {
          montant = Math.round(devis.total * 0.50);
          typePaiement = "acompte";
        } else if (!devis.soldeVerse) {
          montant = devis.total - Math.round(devis.total * 0.50);
          typePaiement = "solde";
        } else {
          return res.status(400).json({ message: "Ce devis est entierement paye." });
        }
      } else {
        montant = devis.total;
        typePaiement = "total";
      }
    }

    const commission = Math.round(montant * 0.08);
    const montantArtisan = montant - commission;
    const reference = genReference();
    const op = OPERATEURS[operateur];

    const paiement = await Paiement.create({
      devis: devisId,
      jalon: jalonRef,
      client: req.user.id,
      artisan: devis.artisan._id,
      montant,
      montantArtisan,
      commission,
      operateur,
      telephone,
      statut: 'en_attente',
      reference,
      type: typePaiement,
    });

    // Notifier admin
    notifyAdmins('nouveau_paiement', {
      paiementId: paiement._id,
      reference,
      montant,
      operateur: op.nom,
      clientNom: devis.client.name,
      telephone,
    });

    res.status(201).json({
      message: `Paiement initie via ${op.nom}`,
      paiement: {
        _id: paiement._id,
        reference,
        montant,
        montantArtisan,
        commission,
        operateur: op.nom,
        statut: 'en_attente',
        type: typePaiement,
      },
      instructions: {
        etape1: `Envoyez ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA au numero ${op.nom} de B.Y.H`,
        numeroByh: op.numero,
        etape2: `Reference a indiquer : ${reference}`,
        etape3: "L equipe B.Y.H va confirmer votre paiement sous 30 minutes",
        artisanRecevra: `${new Intl.NumberFormat('fr-FR').format(montantArtisan)} FCFA (90%)`,
        commission: `${new Intl.NumberFormat('fr-FR').format(commission)} FCFA (8% B.Y.H)`,
      }
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/paiements/mes-paiements
router.get('/mes-paiements', auth, async (req, res) => {
  try {
    const paiements = await Paiement.find({ client: req.user.id })
      .populate('devis', 'titre numeroDevis total')
      .populate('artisan', 'name')
      .populate('jalon', 'titre ordre')
      .sort({ createdAt: -1 });
    res.json(paiements);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/paiements/mes-revenus
router.get('/mes-revenus', auth, async (req, res) => {
  try {
    const paiements = await Paiement.find({ artisan: req.user.id })
      .populate('devis', 'titre numeroDevis')
      .populate('client', 'name')
      .populate('jalon', 'titre ordre')
      .sort({ createdAt: -1 });
    const total = paiements.filter(p=>p.statut==='confirme').reduce((s,p)=>s+p.montantArtisan,0);
    const enAttente = paiements.filter(p=>p.statut==='en_attente').reduce((s,p)=>s+p.montantArtisan,0);
    res.json({ paiements, stats: { total, enAttente, nbTransactions: paiements.length } });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/paiements/devis/:devisId
router.get('/devis/:devisId', auth, async (req, res) => {
  try {
    const paiements = await Paiement.find({ devis: req.params.devisId })
      .populate('jalon', 'titre ordre montant statut')
      .sort({ createdAt: 1 });
    const devis = await Devis.findById(req.params.devisId);
    const totalPaye = paiements.filter(p=>p.statut==='confirme').reduce((s,p)=>s+p.montant,0);
    const restant = devis ? devis.total - totalPaye : 0;
    res.json({ paiements, totalPaye, restant, total: devis?.total||0 });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/paiements/:id/confirmer — Admin uniquement
router.put('/:id/confirmer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });

    const paiement = await Paiement.findById(req.params.id)
      .populate('client', 'name email')
      .populate('artisan', 'name email phone')
      .populate('devis', 'titre numeroDevis');

    if (!paiement) return res.status(404).json({ message: 'Paiement non trouve.' });
    if (paiement.statut === 'confirme') return res.status(400).json({ message: 'Paiement deja confirme.' });
    if (paiement.statut === 'echoue') return res.status(400).json({ message: 'Paiement echoue — ne peut pas etre confirme.' });

    paiement.statut = 'confirme';
    paiement.confirmeParAdmin = true;
    paiement.dateConfirmation = new Date();
    paiement.dateDistribution = new Date();
    paiement.transactionId = req.body.transactionId || '';
    paiement.notes = req.body.notes || '';
    await paiement.save();
    // Mettre a jour acompteVerse ou soldeVerse
    if (paiement.type === "acompte" || paiement.type === "solde" || paiement.type === "total") {
      const devisAUpdate = await Devis.findById(paiement.devis);
      if (devisAUpdate) {
        if (paiement.type === "acompte") devisAUpdate.acompteVerse = true;
        if (paiement.type === "solde" || paiement.type === "total") devisAUpdate.soldeVerse = true;
        await devisAUpdate.save();
      }
    }

    // Notifications temps réel
    notifyUser(paiement.client._id, 'paiement_confirme', {
      montant: paiement.montant,
      reference: paiement.reference,
    });
    notifyUser(paiement.artisan._id, 'paiement_recu', {
      montant: paiement.montantArtisan,
      reference: paiement.reference,
    });

    // Email client
    sendEmail({
      to: paiement.client.email,
      subject: `Paiement confirme — ${paiement.reference}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0">B.Y.H</h1></div><div style="padding:32px;background:#F8FAFC"><h2 style="color:#16A34A">✅ Paiement confirme !</h2><p>Votre paiement de <strong>${new Intl.NumberFormat('fr-FR').format(paiement.montant)} FCFA</strong> a ete confirme.</p><p>Reference : <strong>${paiement.reference}</strong></p><p>L artisan <strong>${paiement.artisan.name}</strong> a ete paye et va finaliser les travaux.</p></div></div>`
    }).catch(e => console.error('Email paiement confirme:', e.message));

    // Email artisan
    sendEmail({
      to: paiement.artisan.email,
      subject: `Paiement recu — ${new Intl.NumberFormat('fr-FR').format(paiement.montantArtisan)} FCFA`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0">B.Y.H</h1></div><div style="padding:32px;background:#F8FAFC"><h2 style="color:#16A34A">💰 Paiement recu !</h2><p>Vous avez recu <strong>${new Intl.NumberFormat('fr-FR').format(paiement.montantArtisan)} FCFA</strong> sur votre Mobile Money.</p><p>Reference : <strong>${paiement.reference}</strong></p><p>Projet : ${paiement.devis?.titre}</p></div></div>`
    }).catch(e => console.error('Email artisan paiement:', e.message));

    res.json({
      message: `Paiement confirme ! ${new Intl.NumberFormat('fr-FR').format(paiement.montantArtisan)} FCFA distribues a ${paiement.artisan.name}`,
      paiement
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/paiements/:id/echouer — Admin uniquement
router.put('/:id/echouer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const paiement = await Paiement.findById(req.params.id)
      .populate('client', 'name email');
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouve.' });
    if (paiement.statut === 'confirme') return res.status(400).json({ message: 'Impossible — paiement deja confirme.' });

    paiement.statut = 'echoue';
    paiement.notes = req.body.notes || 'Paiement non recu';
    await paiement.save();

    notifyUser(paiement.client._id, 'paiement_echoue', { reference: paiement.reference });

    sendEmail({
      to: paiement.client.email,
      subject: `Paiement echoue — ${paiement.reference}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:24px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:#fff;margin:0">B.Y.H</h1></div><div style="padding:32px;background:#F8FAFC"><h2 style="color:#E11D48">❌ Paiement non recu</h2><p>Votre paiement reference <strong>${paiement.reference}</strong> n a pas ete recu.</p><p>Raison : ${paiement.notes}</p><p>Veuillez reessayer ou contacter le support : contact@byh-cm.com</p></div></div>`
    }).catch(e => console.error('Email paiement echoue:', e.message));

    res.json({ message: 'Paiement marque comme echoue.', paiement });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/paiements/admin/tous — Admin uniquement
router.get('/admin/tous', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { statut, page=1 } = req.query;
    const filter = statut ? { statut } : {};
    const paiements = await Paiement.find(filter)
      .populate('client', 'name email phone')
      .populate('artisan', 'name email phone')
      .populate('devis', 'titre numeroDevis')
      .populate('jalon', 'titre ordre')
      .sort({ createdAt: -1 })
      .skip((page-1)*20).limit(20);
    const total = await Paiement.countDocuments(filter);
    const statsAgg = await Paiement.aggregate([
      { $match: { statut: 'confirme' } },
      { $group: { _id: null, totalMontant: { $sum: '$montant' }, totalCommission: { $sum: '$commission' } } }
    ]);
    const stats = statsAgg[0] || { totalMontant: 0, totalCommission: 0 };
    res.json({ paiements, total, stats });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
