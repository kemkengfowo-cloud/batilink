const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Paiement = require('../models/Paiement');
const Devis = require('../models/Devis');
const crypto = require('crypto');

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

// POST /api/mesomb/webhook — Recevoir notifications MeSomb
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Vérifier la signature webhook
    const signature = req.headers['x-mesomb-signature'];
    const webhookSecret = process.env.MESOMB_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Signature webhook MeSomb invalide');
        return res.status(401).json({ message: 'Signature invalide.' });
      }
    }

    const data = JSON.parse(req.body.toString());
    console.log('Webhook MeSomb reçu:', data);

    // Traiter selon le statut
    if (data.status === 'SUCCESS' && data.reference) {
      await Paiement.findOneAndUpdate(
        { reference: data.reference },
        { statut: 'confirme', transactionId: data.transaction_id }
      );
      console.log('✅ Paiement MeSomb confirmé:', data.reference);
    } else if (data.status === 'FAILED' && data.reference) {
      await Paiement.findOneAndUpdate(
        { reference: data.reference },
        { statut: 'echoue' }
      );
      console.log('❌ Paiement MeSomb échoué:', data.reference);
    }

    res.json({ message: 'OK' });
  } catch(err) {
    console.error('Erreur webhook MeSomb:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
