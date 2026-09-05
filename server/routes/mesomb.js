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


// POST /api/mesomb/liberer/:paiementId — Libérer le paiement à l'artisan
router.post('/liberer/:paiementId', auth, async (req, res) => {
  try {
    // Vérification admin ou client propriétaire
    const Paiement = require('../models/Paiement');
    const User = require('../models/User');
    
    const paiement = await Paiement.findById(req.params.paiementId)
      .populate('artisan', 'name phone whatsapp')
      .populate('client', 'name email');

    if (!paiement) return res.status(404).json({ message: 'Paiement introuvable.' });
    if (paiement.statut !== 'confirme') return res.status(400).json({ message: 'Ce paiement n\'est pas encore confirmé.' });
    if (paiement.disbursementStatut === 'effectue') return res.status(400).json({ message: 'Le paiement a déjà été libéré à l\'artisan.' });

    // Vérifier droits : admin ou client du paiement
    const isAdmin = req.user.role === 'admin';
    const isClient = paiement.client._id.toString() === req.user.id;
    if (!isAdmin && !isClient) return res.status(403).json({ message: 'Accès refusé.' });

    // Récupérer le numéro téléphone de l'artisan
    const artisan = await User.findById(paiement.artisan._id);
    const telephoneArtisan = artisan.phone || artisan.whatsapp;
    if (!telephoneArtisan) return res.status(400).json({ message: 'L\'artisan n\'a pas de numéro de téléphone enregistré.' });

    const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');
    const payment = new PaymentOperation({
      applicationKey: process.env.MESOMB_APP_KEY,
      accessKey: process.env.MESOMB_ACCESS_KEY,
      secretKey: process.env.MESOMB_SECRET_KEY,
    });

    const service = paiement.operateur === 'orange_money' ? 'ORANGE' : 'MTN';
    const nonce = RandomGenerator.nonce();

    const response = await payment.makeDeposit({
      amount: paiement.montantArtisan,
      service,
      receiver: telephoneArtisan.replace('+237', '').replace('237', ''),
      nonce,
      currency: 'XAF',
      message: `B.Y.H — Paiement travaux ref: ${paiement.reference}`,
    });

    if (response.isOperationSuccess() && response.isTransactionSuccess()) {
      paiement.disbursementStatut = 'effectue';
      paiement.disbursementRef = nonce;
      await paiement.save();

      console.log(`✅ Disbursement effectué: ${paiement.montantArtisan} FCFA → ${telephoneArtisan}`);
      return res.json({
        message: `✅ ${paiement.montantArtisan.toLocaleString('fr-FR')} FCFA envoyés à l\'artisan sur ${service} !`,
        paiement,
      });
    } else {
      paiement.disbursementStatut = 'echoue';
      await paiement.save();
      return res.status(400).json({ message: 'Échec du virement vers l\'artisan. Réessayez.', details: response.message });
    }
  } catch(err) {
    console.error('Erreur disbursement MeSomb:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/mesomb/rembourser/:paiementId — Rembourser le client
router.post('/rembourser/:paiementId', auth, async (req, res) => {
  try {
    const Paiement = require('../models/Paiement');
    const paiement = await Paiement.findById(req.params.paiementId)
      .populate('client', 'name phone');

    if (!paiement) return res.status(404).json({ message: 'Paiement introuvable.' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Réservé à l\'admin.' });
    if (paiement.statut === 'rembourse') return res.status(400).json({ message: 'Déjà remboursé.' });
    if (paiement.disbursementStatut === 'effectue') return res.status(400).json({ message: 'Fonds déjà libérés à l\'artisan — remboursement impossible.' });

    const telephoneClient = paiement.telephone;
    if (!telephoneClient) return res.status(400).json({ message: 'Numéro client introuvable.' });

    const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');
    const payment = new PaymentOperation({
      applicationKey: process.env.MESOMB_APP_KEY,
      accessKey: process.env.MESOMB_ACCESS_KEY,
      secretKey: process.env.MESOMB_SECRET_KEY,
    });

    const service = paiement.operateur === 'orange_money' ? 'ORANGE' : 'MTN';

    const response = await payment.makeDeposit({
      amount: paiement.montant,
      service,
      receiver: telephoneClient.replace('+237', '').replace('237', ''),
      nonce: RandomGenerator.nonce(),
      currency: 'XAF',
      message: `B.Y.H — Remboursement ref: ${paiement.reference}`,
    });

    if (response.isOperationSuccess() && response.isTransactionSuccess()) {
      paiement.statut = 'rembourse';
      await paiement.save();
      return res.json({ message: `✅ ${paiement.montant.toLocaleString('fr-FR')} FCFA remboursés au client !`, paiement });
    } else {
      return res.status(400).json({ message: 'Échec du remboursement.', details: response.message });
    }
  } catch(err) {
    console.error('Erreur remboursement MeSomb:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
