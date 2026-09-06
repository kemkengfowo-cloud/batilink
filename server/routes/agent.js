const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { agentOrAdmin } = require('../middleware/agentAuth');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const Entreprise = require('../models/Entreprise');
const Paiement = require('../models/Paiement');
const PaiementConducteur = require('../models/PaiementConducteur');
const Litige = require('../models/Litige');
const Visite = require('../models/VisiteEvaluation');

// Middleware combiné
router.use(auth, agentOrAdmin);

// GET /api/agent/stats — Statistiques de base
router.get('/stats', async (req, res) => {
  try {
    const [
      artisansEnAttente,
      entreprisesEnAttente,
      paiementsEnAttente,
      litigesOuverts,
      visitesEnAttente,
      totalArtisans,
      totalClients,
    ] = await Promise.all([
      Artisan.countDocuments({ verified: false }),
      Entreprise.countDocuments({ verified: false }),
      Paiement.countDocuments({ statut: 'en_attente' }),
      Litige.countDocuments({ statut: { $in: ['ouvert', 'en_attente_reponse', 'en_examen'] } }),
      Visite.countDocuments({ statut: 'en_attente' }),
      Artisan.countDocuments(),
      User.countDocuments({ role: 'client' }),
    ]);

    res.json({
      artisansEnAttente,
      entreprisesEnAttente,
      paiementsEnAttente,
      litigesOuverts,
      visitesEnAttente,
      totalArtisans,
      totalClients,
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/agent/artisans-a-valider
router.get('/artisans-a-valider', async (req, res) => {
  try {
    const artisans = await Artisan.find({ verified: false })
      .populate('user', 'name email phone createdAt city')
      .sort({ createdAt: -1 });
    res.json(artisans);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/agent/artisans/:id/valider
router.put('/artisans/:id/valider', async (req, res) => {
  try {
    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { verified: true, verifiedBy: req.user.id, verifiedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');
    if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' });

    // Notifier l'artisan
    const { notifyUser } = require('../socket');
    notifyUser(artisan.user._id.toString(), 'profil_valide', {
      message: '🎉 Votre profil artisan a été validé par B.Y.H !'
    });

    // Email
    const { sendEmail } = require('../utils/emails');
    sendEmail({
      to: artisan.user.email,
      subject: '✅ Votre profil B.Y.H est validé !',
      html: `<p>Bonjour ${artisan.user.name},</p><p>Votre profil artisan a été validé par l'équipe B.Y.H. Vous pouvez maintenant recevoir des missions !</p>`
    }).catch(() => {});

    res.json({ artisan, message: `✅ Profil de ${artisan.user.name} validé !` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/agent/artisans/:id/rejeter
router.put('/artisans/:id/rejeter', async (req, res) => {
  try {
    const { raison } = req.body;
    const artisan = await Artisan.findById(req.params.id).populate('user', 'name email');
    if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' });

    artisan.verified = false;
    artisan.rejectionRaison = raison || 'Profil incomplet ou non conforme';
    await artisan.save();

    const { sendEmail } = require('../utils/emails');
    sendEmail({
      to: artisan.user.email,
      subject: 'Profil B.Y.H — Informations complémentaires requises',
      html: `<p>Bonjour ${artisan.user.name},</p><p>Votre profil nécessite des informations complémentaires :</p><p><strong>${raison || 'Profil incomplet'}</strong></p><p>Veuillez mettre à jour votre profil sur B.Y.H.</p>`
    }).catch(() => {});

    res.json({ message: 'Profil rejeté, artisan notifié.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/agent/entreprises-a-valider
router.get('/entreprises-a-valider', async (req, res) => {
  try {
    const entreprises = await Entreprise.find({ verified: false })
      .populate('user', 'name email phone createdAt city')
      .sort({ createdAt: -1 });
    res.json(entreprises);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/agent/entreprises/:id/valider
router.put('/entreprises/:id/valider', async (req, res) => {
  try {
    const entreprise = await Entreprise.findByIdAndUpdate(
      req.params.id,
      { verified: true, verifiedBy: req.user.id, verifiedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');
    if (!entreprise) return res.status(404).json({ message: 'Entreprise introuvable.' });

    const { sendEmail } = require('../utils/emails');
    sendEmail({
      to: entreprise.user.email,
      subject: '✅ Votre entreprise B.Y.H est validée !',
      html: `<p>Bonjour ${entreprise.user.name},</p><p>Votre profil entreprise a été validé par l'équipe B.Y.H !</p>`
    }).catch(() => {});

    res.json({ entreprise, message: `✅ Entreprise ${entreprise.nomEntreprise} validée !` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/agent/paiements
router.get('/paiements', async (req, res) => {
  try {
    const paiements = await Paiement.find({ statut: 'en_attente' })
      .populate('client', 'name email phone')
      .populate('artisan', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(paiements);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/agent/paiements/:id/confirmer
router.put('/paiements/:id/confirmer', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const paiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      { statut: 'confirme', transactionId, dateConfirmation: new Date(), confirmedBy: req.user.id },
      { new: true }
    ).populate('client', 'name email').populate('artisan', 'name email');

    if (!paiement) return res.status(404).json({ message: 'Paiement introuvable.' });

    const { notifyUser } = require('../socket');
    notifyUser(paiement.client._id.toString(), 'paiement_confirme', {
      message: `✅ Votre paiement de ${paiement.montant.toLocaleString('fr-FR')} FCFA est confirmé !`
    });

    res.json({ paiement, message: '✅ Paiement confirmé !' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/agent/litiges
router.get('/litiges', async (req, res) => {
  try {
    const litiges = await Litige.find({
      statut: { $in: ['ouvert', 'en_attente_reponse', 'en_examen'] }
    })
      .populate('plaignant', 'name email role')
      .populate('accuse', 'name email role')
      .populate('devis', 'titre total')
      .sort({ urgent: -1, createdAt: -1 });
    res.json(litiges);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/agent/litiges/:id/resoudre
router.put('/litiges/:id/resoudre', async (req, res) => {
  try {
    const { statut, decisionAdmin, montantPlaignant, montantAccuse } = req.body;

    const litige = await Litige.findById(req.params.id)
      .populate('plaignant', 'name email phone whatsapp')
      .populate('accuse', 'name email phone whatsapp')
      .populate('devis');

    if (!litige) return res.status(404).json({ message: 'Litige introuvable.' });

    // Paiement MeSomb si nécessaire
    let disbursementOk = false;
    if (litige.devis && (montantPlaignant > 0 || montantAccuse > 0)) {
      const paiement = await Paiement.findOne({ devis: litige.devis._id, statut: 'confirme' });
      if (paiement) {
        const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');
        const payment = new PaymentOperation({
          applicationKey: process.env.MESOMB_APP_KEY,
          accessKey: process.env.MESOMB_ACCESS_KEY,
          secretKey: process.env.MESOMB_SECRET_KEY,
        });
        const service = paiement.operateur === 'orange_money' ? 'ORANGE' : 'MTN';

        if (montantPlaignant > 0) {
          const tel = litige.plaignant.phone || litige.plaignant.whatsapp;
          if (tel) await payment.makeDeposit({ amount: montantPlaignant, service, receiver: tel.replace('+237','').replace('237',''), nonce: RandomGenerator.nonce(), currency: 'XAF', message: 'B.Y.H résolution litige' });
        }
        if (montantAccuse > 0) {
          const tel = litige.accuse.phone || litige.accuse.whatsapp;
          if (tel) await payment.makeDeposit({ amount: montantAccuse, service, receiver: tel.replace('+237','').replace('237',''), nonce: RandomGenerator.nonce(), currency: 'XAF', message: 'B.Y.H résolution litige' });
        }
        disbursementOk = true;
      }
    }

    litige.statut = statut;
    litige.decisionAdmin = decisionAdmin;
    litige.montantPlaignant = montantPlaignant || 0;
    litige.montantAccuse = montantAccuse || 0;
    litige.adminTraitant = req.user.id;
    litige.dateResolution = new Date();
    litige.disbursementEffectue = disbursementOk;
    litige.messages.push({ auteur: req.user.id, contenu: `⚖️ Décision agent B.Y.H: ${decisionAdmin}`, role: 'admin', date: new Date() });
    await litige.save();

    const { notifyUser } = require('../socket');
    notifyUser(litige.plaignant._id.toString(), 'litige_resolu', { message: `Votre litige a été résolu. Décision: ${decisionAdmin}` });
    notifyUser(litige.accuse._id.toString(), 'litige_resolu', { message: `Le litige vous concernant a été résolu. Décision: ${decisionAdmin}` });

    res.json({ litige, message: `Litige résolu.${disbursementOk ? ' Paiements effectués.' : ''}` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET /api/agent/visites
router.get('/visites', async (req, res) => {
  try {
    const visites = await Visite.find({ statut: 'en_attente' })
      .populate('client', 'name email phone')
      .populate('artisan', 'name email')
      .sort({ createdAt: -1 });
    res.json(visites);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/agent/visites/:id/confirmer
router.put('/visites/:id/confirmer', async (req, res) => {
  try {
    const visite = await Visite.findByIdAndUpdate(
      req.params.id,
      { statut: 'confirmee', confirmedBy: req.user.id },
      { new: true }
    ).populate('client', 'name email');
    if (!visite) return res.status(404).json({ message: 'Visite introuvable.' });
    res.json({ visite, message: '✅ Visite confirmée !' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
