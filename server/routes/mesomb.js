const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Paiement = require('../models/Paiement');
const Devis = require('../models/Devis');

// POST /api/mesomb/initier — Initier un paiement via MeSomb
router.post('/initier', auth, async (req, res) => {
  try {
    const { devisId, telephone, operateur } = req.body;
    if (!devisId || !telephone || !operateur)
      return res.status(400).json({ message: 'Champs requis manquants.' });

    const devis = await Devis.findById(devisId).populate('client').populate('artisan');
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });
    if (devis.client._id.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé.' });
    if (devis.statut !== 'accepte')
      return res.status(400).json({ message: 'Le devis doit être accepté.' });

    const montant = devis.total;
    const commission = Math.round(montant * 0.08);
    const montantArtisan = montant - commission;
    const reference = 'BYH-' + Date.now() + '-' + Math.random().toString(36).substr(2,6).toUpperCase();

    const { PaymentOperation } = require('@hachther/mesomb');
    const payment = new PaymentOperation({
      applicationKey: process.env.MESOMB_APP_KEY,
      accessKey: process.env.MESOMB_ACCESS_KEY,
      secretKey: process.env.MESOMB_SECRET_KEY,
    });

    const response = await payment.makeCollect({
      amount: montant,
      service: operateur === 'orange_money' ? 'ORANGE' : 'MTN',
      payer: telephone,
      nonce: reference,
      currency: 'XAF',
      message: `Paiement B.Y.H - ${devis.titre}`,
    });

    if (response.isOperationSuccess() && response.isTransactionSuccess()) {
      const paiement = await Paiement.create({
        devis: devisId,
        client: req.user.id,
        artisan: devis.artisan._id,
        montant, commission, montantArtisan,
        operateur, telephone, reference,
        statut: 'confirme',
        provider: 'mesomb',
        transactionId: response.transaction?.pk,
      });
      devis.statut = 'en_cours';
      await devis.save();
      return res.json({ message: 'Paiement confirmé !', paiement, reference });
    } else {
      return res.status(400).json({ message: 'Paiement échoué. Vérifiez votre solde.', details: response.message });
    }
  } catch(err) {
    console.error('Erreur MeSomb:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/mesomb/webhook
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook MeSomb:', req.body);
    res.json({ message: 'OK' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
