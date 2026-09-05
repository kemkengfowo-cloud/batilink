const express = require('express');
const router = express.Router();
const Jalon = require('../models/Jalon');
const Devis = require('../models/Devis');
const auth = require('../middleware/auth');
const { logAction } = require('../middleware/logger');
const { sendJalonValide } = require("../utils/emails");
const upload = require('../middleware/upload');
// GET /api/jalons/en-attente
router.get("/en-attente", auth, async (req, res) => {
  try {
    const devisClient = await Devis.find({ client: req.user.id, statut: "accepte" });
    const devisIds = devisClient.map(d => d._id);
    const jalons = await Jalon.find({ devis: { $in: devisIds }, statut: "soumis" })
      .populate("devis", "titre numeroDevis");
    res.json(Array.isArray(jalons) ? jalons : []);
  } catch(err) { res.status(500).json({ message: err.message }); }
});


// GET /api/jalons/:devisId
router.get('/:devisId', auth, async (req, res) => {
  try {
    const jalons = await Jalon.find({ devis: req.params.devisId }).sort({ ordre: 1 });
    res.json(jalons);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/jalons — Créer jalons pour un devis
router.post('/', auth, async (req, res) => {
  try {
    const { devisId, jalons } = req.body;
    const devis = await Devis.findById(devisId);
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: 'Acces refuse.' });

    const total = jalons.reduce((s,j) => s + j.pourcentage, 0);
    if (total !== 100) return res.status(400).json({ message: 'Les jalons doivent totaliser 100%.' });

    await Jalon.deleteMany({ devis: devisId });
    const created = await Jalon.insertMany(jalons.map((j,i) => ({
      devis: devisId,
      titre: j.titre,
      description: j.description,
      pourcentage: j.pourcentage,
      montant: Math.round(devis.total * j.pourcentage / 100),
      ordre: i + 1
    })));
    res.status(201).json(created);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/jalons/:id/photos — Artisan soumet photos
router.post('/:id/photos', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id);
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouve.' });
    const photos = req.files?.map(f => `/uploads/${f.filename}`) || [];
    jalon.photos.push(...photos);
    jalon.commentaireArtisan = req.body.commentaire || '';
    jalon.dateSoumission = new Date();
    jalon.statut = 'soumis';
    await jalon.save();
    res.json(jalon);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/jalons/:id/valider — Client valide le jalon
router.put('/:id/valider', auth, async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id).populate('devis');
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouve.' });
    if (jalon.devis.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'Seul le client peut valider.' });
    if (jalon.statut !== 'soumis')
      return res.status(400).json({ message: 'Le jalon doit etre soumis.' });

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 48);
    jalon.statut = 'valide';
    jalon.dateValidation = new Date();
    jalon.delaiContestationExpire = expiration;
    jalon.commentaireClient = req.body.commentaire || '';
    await jalon.save();

    res.json({ jalon, message: `Jalon valide ! Vous avez 48h pour contester. L artisan recevra ${new Intl.NumberFormat('fr-FR').format(jalon.montant)} FCFA apres ce delai.` });
    const artisan = await require("../models/User").findById(jalon.devis.artisan); if(artisan) sendJalonValide({ artisanEmail: artisan.email, artisanName: artisan.name, jalonTitre: jalon.titre, montantJalon: jalon.montant }).catch(e => console.error("Email jalon:", e.message));
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/jalons/:id/contester — Client conteste
router.put('/:id/contester', auth, async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id).populate('devis');
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouve.' });
    if (jalon.devis.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'Acces refuse.' });

    const now = new Date();
    if (jalon.delaiContestationExpire && now > jalon.delaiContestationExpire)
      return res.status(400).json({ message: 'Le delai de contestation de 48h est expire.' });

    jalon.statut = 'conteste';
    jalon.commentaireClient = req.body.raison || '';
    await jalon.save();
    res.json({ jalon, message: 'Contestation enregistree. L admin va examiner le litige.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});




// PUT /api/jalons/:id/proposer-modification — Client propose modification du jalon
router.put('/:id/proposer-modification', auth, async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id).populate('devis');
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouvé.' });
    if (jalon.devis.client.toString() !== req.user.id)
      return res.status(403).json({ message: 'Seul le client peut proposer des modifications.' });
    if (!['en_attente'].includes(jalon.statut))
      return res.status(400).json({ message: 'Impossible de modifier ce jalon.' });

    const { nouveauPourcentage, nouveauTitre, nouvelleDescription, raison } = req.body;
    
    jalon.propositionClient = {
      pourcentage: nouveauPourcentage,
      titre: nouveauTitre || jalon.titre,
      description: nouvelleDescription || jalon.description,
      raison: raison || '',
      dateProposition: new Date()
    };
    jalon.statut = 'en_negociation';
    await jalon.save();

    const { notifyUser } = require('../socket');
    notifyUser(jalon.devis.artisan.toString(), 'modification_jalon', {
      message: `Le client propose une modification sur le jalon "${jalon.titre}"`,
      jalonId: jalon._id
    });

    res.json({ jalon, message: 'Proposition envoyée à l\'artisan.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/jalons/:id/accepter-modification — Artisan accepte modification du client
router.put('/:id/accepter-modification', auth, async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id).populate('devis');
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouvé.' });
    if (jalon.devis.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: 'Seul l\'artisan peut accepter.' });
    if (jalon.statut !== 'en_negociation')
      return res.status(400).json({ message: 'Pas de proposition en cours.' });

    const prop = jalon.propositionClient;
    if (prop.pourcentage) {
      jalon.pourcentage = prop.pourcentage;
      jalon.montant = Math.round(jalon.devis.total * prop.pourcentage / 100);
    }
    if (prop.titre) jalon.titre = prop.titre;
    if (prop.description) jalon.description = prop.description;
    jalon.propositionClient = null;
    jalon.statut = 'en_attente';
    await jalon.save();

    res.json({ jalon, message: 'Modification acceptée ! Jalon mis à jour.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/jalons/:id/refuser-modification — Artisan refuse modification
router.put('/:id/refuser-modification', auth, async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id).populate('devis');
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouvé.' });
    if (jalon.devis.artisan.toString() !== req.user.id)
      return res.status(403).json({ message: 'Seul l\'artisan peut refuser.' });

    jalon.propositionClient = null;
    jalon.statut = 'en_attente';
    await jalon.save();

    res.json({ jalon, message: 'Modification refusée. Jalon conservé.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/jalons/:id/payer — Paiement automatique après validation
router.put('/:id/payer', auth, async (req, res) => {
  try {
    const jalon = await Jalon.findById(req.params.id)
      .populate({ path: 'devis', populate: [{ path: 'client' }, { path: 'artisan' }] });
    if (!jalon) return res.status(404).json({ message: 'Jalon non trouvé.' });
    if (jalon.statut !== 'valide') return res.status(400).json({ message: 'Le jalon doit être validé.' });
    if (jalon.paiementEffectue) return res.status(400).json({ message: 'Ce jalon a déjà été payé.' });

    const isClient = jalon.devis.client._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isClient && !isAdmin) return res.status(403).json({ message: 'Accès refusé.' });

    // Récupérer infos paiement original
    const Paiement = require('../models/Paiement');
    const paiementOriginal = await Paiement.findOne({ devis: jalon.devis._id, statut: 'confirme' });
    
    if (!paiementOriginal) {
      return res.status(400).json({ message: 'Aucun paiement confirmé trouvé pour ce devis.' });
    }

    const { PaymentOperation, RandomGenerator } = require('@hachther/mesomb');
    const payment = new PaymentOperation({
      applicationKey: process.env.MESOMB_APP_KEY,
      accessKey: process.env.MESOMB_ACCESS_KEY,
      secretKey: process.env.MESOMB_SECRET_KEY,
    });

    const telephoneArtisan = jalon.devis.artisan.phone || jalon.devis.artisan.whatsapp;
    if (!telephoneArtisan) return res.status(400).json({ message: 'Numéro artisan manquant.' });

    const service = paiementOriginal.operateur === 'orange_money' ? 'ORANGE' : 'MTN';
    const montantJalon = jalon.montant;
    const commissionJalon = Math.round(montantJalon * 0.08);
    const montantArtisanJalon = montantJalon - commissionJalon;

    const response = await payment.makeDeposit({
      amount: montantArtisanJalon,
      service,
      receiver: telephoneArtisan.replace('+237', '').replace('237', ''),
      nonce: RandomGenerator.nonce(),
      currency: 'XAF',
      message: `B.Y.H Jalon "${jalon.titre}" — ${jalon.devis.titre}`,
    });

    if (response.isOperationSuccess() && response.isTransactionSuccess()) {
      jalon.paiementEffectue = true;
      jalon.datePaiement = new Date();
      jalon.montantPaye = montantArtisanJalon;
      await jalon.save();

      console.log(`✅ Jalon payé: ${montantArtisanJalon} FCFA → artisan`);
      return res.json({
        message: `✅ ${montantArtisanJalon.toLocaleString('fr-FR')} FCFA envoyés à l'artisan !`,
        jalon,
      });
    } else {
      return res.status(400).json({ message: 'Échec du paiement jalon.', details: response.message });
    }
  } catch(err) {
    console.error('Erreur paiement jalon:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
