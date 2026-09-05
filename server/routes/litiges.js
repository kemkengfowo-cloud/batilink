const express = require('express');
const router = express.Router();
const Litige = require('../models/Litige');
const Paiement = require('../models/Paiement');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { notifyUser, notifyAdmins } = require('../socket');
const { sendEmail } = require('../utils/emails');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès réservé aux admins.' });
  next();
};

// GET /api/litiges/mes-litiges
router.get('/mes-litiges', auth, async (req, res) => {
  try {
    const litiges = await Litige.find({
      $or: [{ plaignant: req.user.id }, { accuse: req.user.id }]
    }).populate('plaignant','name avatar role')
      .populate('accuse','name avatar role')
      .populate('devis','titre')
      .populate('messages.auteur','name role')
      .sort({ createdAt: -1 });
    res.json(litiges);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/litiges — Admin
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const litiges = await Litige.find()
      .populate('plaignant','name avatar email role')
      .populate('accuse','name avatar email role')
      .populate('devis','titre total')
      .populate('adminTraitant','name')
      .sort({ urgent: -1, createdAt: -1 });
    res.json(litiges);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/litiges — Ouvrir un litige
router.post('/', auth, upload.array('preuves', 5), async (req, res) => {
  try {
    const { devisId, contratId, jalonId, accuseId, motif, description, montantEnJeu } = req.body;
    if (!accuseId || !motif || !description)
      return res.status(400).json({ message: 'Champs requis manquants.' });

    const preuves = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const delaiReponse = new Date();
    delaiReponse.setHours(delaiReponse.getHours() + 72); // 72h pour répondre

    const litige = await Litige.create({
      devis: devisId, contrat: contratId, jalon: jalonId,
      plaignant: req.user.id, accuse: accuseId,
      motif, description, preuves,
      statut: 'en_attente_reponse',
      delaiReponse,
      montantEnJeu: montantEnJeu || 0,
      urgent: montantEnJeu > 500000
    });

    // Notifier l'accusé
    notifyUser(accuseId, 'nouveau_litige', {
      message: `Un litige a été ouvert contre vous. Vous avez 72h pour répondre.`,
      litigeId: litige._id
    });

    // Notifier les admins
    notifyAdmins('nouveau_litige', {
      message: `Nouveau litige ouvert — Montant en jeu: ${montantEnJeu || 0} FCFA`,
      litigeId: litige._id,
      urgent: litige.urgent
    });

    res.status(201).json({ litige, message: 'Litige ouvert. L\'accusé a 72h pour répondre.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/litiges/:id/repondre — Accusé répond au litige
router.put('/:id/repondre', auth, upload.array('preuves', 5), async (req, res) => {
  try {
    const litige = await Litige.findById(req.params.id)
      .populate('plaignant', 'name email')
      .populate('accuse', 'name email');
    
    if (!litige) return res.status(404).json({ message: 'Litige introuvable.' });
    if (litige.accuse._id.toString() !== req.user.id)
      return res.status(403).json({ message: 'Seul l\'accusé peut répondre.' });
    if (!['en_attente_reponse', 'ouvert'].includes(litige.statut))
      return res.status(400).json({ message: 'Vous avez déjà répondu à ce litige.' });

    const preuvesAccuse = req.files?.map(f => `/uploads/${f.filename}`) || [];
    
    litige.reponseAccuse = req.body.reponse;
    litige.preuvesAccuse = preuvesAccuse;
    litige.dateReponse = new Date();
    litige.statut = 'en_examen';
    
    // Ajouter message dans le fil
    litige.messages.push({
      auteur: req.user.id,
      contenu: req.body.reponse,
      role: 'accuse',
      date: new Date()
    });
    
    await litige.save();

    // Notifier admin et plaignant
    notifyAdmins('litige_repondu', {
      message: `L'accusé a répondu au litige — En attente de décision admin`,
      litigeId: litige._id
    });
    notifyUser(litige.plaignant._id.toString(), 'litige_repondu', {
      message: `L'accusé a répondu à votre litige. Un admin va trancher.`,
      litigeId: litige._id
    });

    res.json({ litige, message: 'Réponse enregistrée. Un admin va examiner le dossier.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/litiges/:id/message — Ajouter un message dans le litige
router.post('/:id/message', auth, async (req, res) => {
  try {
    const litige = await Litige.findById(req.params.id);
    if (!litige) return res.status(404).json({ message: 'Litige introuvable.' });
    
    const isPartie = litige.plaignant.toString() === req.user.id || 
                     litige.accuse.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isPartie && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });
    if (['resolu_plaignant','resolu_accuse','resolu_partage','classe'].includes(litige.statut))
      return res.status(400).json({ message: 'Ce litige est clôturé.' });

    const role = isAdmin ? 'admin' : 
                 litige.plaignant.toString() === req.user.id ? 'plaignant' : 'accuse';

    litige.messages.push({
      auteur: req.user.id,
      contenu: req.body.contenu,
      role,
      date: new Date()
    });
    await litige.save();

    // Notifier l'autre partie
    const destinataire = role === 'plaignant' ? litige.accuse : litige.plaignant;
    notifyUser(destinataire.toString(), 'message_litige', {
      message: `Nouveau message dans le litige`,
      litigeId: litige._id
    });

    res.json(litige.messages[litige.messages.length - 1]);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/litiges/:id/resoudre — Admin résout avec paiement automatique
router.put('/:id/resoudre', auth, adminOnly, async (req, res) => {
  try {
    const { statut, decisionAdmin, montantPlaignant, montantAccuse } = req.body;
    
    const litige = await Litige.findById(req.params.id)
      .populate('plaignant', 'name email phone whatsapp')
      .populate('accuse', 'name email phone whatsapp')
      .populate('devis');
    
    if (!litige) return res.status(404).json({ message: 'Litige introuvable.' });
    if (litige.disbursementEffectue) return res.status(400).json({ message: 'Paiement déjà effectué.' });

    // Trouver le paiement original
    const paiement = litige.devis ? 
      await Paiement.findOne({ devis: litige.devis._id, statut: 'confirme' }) : null;

    let disbursementOk = false;

    if (paiement && (montantPlaignant > 0 || montantAccuse > 0)) {
      const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');
      const payment = new PaymentOperation({
        applicationKey: process.env.MESOMB_APP_KEY,
        accessKey: process.env.MESOMB_ACCESS_KEY,
        secretKey: process.env.MESOMB_SECRET_KEY,
      });
      const service = paiement.operateur === 'orange_money' ? 'ORANGE' : 'MTN';

      // Payer le plaignant si décision en sa faveur
      if (montantPlaignant > 0) {
        const telPlaignant = litige.plaignant.phone || litige.plaignant.whatsapp;
        if (telPlaignant) {
          await payment.makeDeposit({
            amount: montantPlaignant,
            service,
            receiver: telPlaignant.replace('+237','').replace('237',''),
            nonce: RandomGenerator.nonce(),
            currency: 'XAF',
            message: `B.Y.H Résolution litige — En votre faveur`,
          });
        }
      }

      // Payer l'accusé si décision en sa faveur
      if (montantAccuse > 0) {
        const telAccuse = litige.accuse.phone || litige.accuse.whatsapp;
        if (telAccuse) {
          await payment.makeDeposit({
            amount: montantAccuse,
            service,
            receiver: telAccuse.replace('+237','').replace('237',''),
            nonce: RandomGenerator.nonce(),
            currency: 'XAF',
            message: `B.Y.H Résolution litige — Paiement travaux`,
          });
        }
      }
      disbursementOk = true;
    }

    litige.statut = statut;
    litige.decisionAdmin = decisionAdmin;
    litige.montantPlaignant = montantPlaignant || 0;
    litige.montantAccuse = montantAccuse || 0;
    litige.adminTraitant = req.user.id;
    litige.dateResolution = new Date();
    litige.disbursementEffectue = disbursementOk;

    // Message admin dans le fil
    litige.messages.push({
      auteur: req.user.id,
      contenu: `⚖️ Décision admin: ${decisionAdmin}`,
      role: 'admin',
      date: new Date()
    });

    await litige.save();

    // Notifier les deux parties
    notifyUser(litige.plaignant._id.toString(), 'litige_resolu', {
      message: `Votre litige a été résolu. Décision: ${decisionAdmin}`,
      litigeId: litige._id
    });
    notifyUser(litige.accuse._id.toString(), 'litige_resolu', {
      message: `Le litige vous concernant a été résolu. Décision: ${decisionAdmin}`,
      litigeId: litige._id
    });

    // Emails
    sendEmail({
      to: litige.plaignant.email,
      subject: 'B.Y.H — Résolution de votre litige',
      html: `<p>Votre litige a été résolu par l'équipe B.Y.H.</p><p><strong>Décision :</strong> ${decisionAdmin}</p>${montantPlaignant > 0 ? `<p>Montant versé : ${montantPlaignant.toLocaleString('fr-FR')} FCFA</p>` : ''}`
    }).catch(() => {});

    sendEmail({
      to: litige.accuse.email,
      subject: 'B.Y.H — Résolution du litige vous concernant',
      html: `<p>Le litige vous concernant a été résolu par l'équipe B.Y.H.</p><p><strong>Décision :</strong> ${decisionAdmin}</p>${montantAccuse > 0 ? `<p>Montant versé : ${montantAccuse.toLocaleString('fr-FR')} FCFA</p>` : ''}`
    }).catch(() => {});

    res.json({ litige, message: `Litige résolu.${disbursementOk ? ' Paiements effectués via MeSomb.' : ''}` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/litiges/:id/classer — Admin classe sans suite
router.put('/:id/classer', auth, adminOnly, async (req, res) => {
  try {
    const litige = await Litige.findByIdAndUpdate(req.params.id, {
      statut: 'classe',
      decisionAdmin: req.body.raison || 'Classé sans suite',
      adminTraitant: req.user.id,
      dateResolution: new Date()
    }, { new: true });
    res.json({ litige, message: 'Litige classé sans suite.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
