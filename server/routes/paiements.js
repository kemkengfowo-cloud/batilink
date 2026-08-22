const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Paiement = require('../models/Paiement');
const Devis = require('../models/Devis');
const Jalon = require('../models/Jalon');
const { notifyUser, notifyAdmins } = require('../socket');

const genReference = () => `BYH-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
const OPERATEURS = {
  orange_money: { nom: 'Orange Money', numero: '655 00 00 00' },
  mtn_momo:     { nom: 'MTN MoMo',     numero: '677 00 00 00' },
};

router.post('/initier', auth, async (req, res) => {
  try {
    const { devisId, jalonId, operateur, telephone } = req.body;
    if (!devisId || !operateur || !telephone) return res.status(400).json({ message: 'Champs requis manquants.' });
    if (!OPERATEURS[operateur]) return res.status(400).json({ message: 'Operateur invalide.' });
    const devis = await Devis.findById(devisId).populate('client','name email').populate('artisan','name email');
    if (!devis) return res.status(404).json({ message: 'Devis non trouve.' });
    if (devis.client._id.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    let montant = devis.total;
    let typePaiement = 'total';
    let jalonRef = null;
    if (jalonId) {
      const jalon = await Jalon.findById(jalonId);
      if (!jalon) return res.status(404).json({ message: 'Jalon non trouve.' });
      const dejaPayé = await Paiement.findOne({ jalon: jalonId, statut: { $in: ['en_attente','confirme'] } });
      if (dejaPayé) return res.status(400).json({ message: 'Ce jalon a deja un paiement en cours.' });
      montant = jalon.montant;
      typePaiement = 'jalon';
      jalonRef = jalonId;
    }
    const commission = Math.round(montant * 0.10);
    const montantArtisan = montant - commission;
    const reference = genReference();
    const op = OPERATEURS[operateur];
    const paiement = await Paiement.create({
      devis: devisId, jalon: jalonRef, client: req.user.id, artisan: devis.artisan._id,
      montant, montantArtisan, commission, operateur, telephone,
      statut: 'en_attente', reference, type: typePaiement,
    });
    notifyAdmins('nouveau_paiement', { paiementId: paiement._id, reference, montant, operateur: op.nom, clientNom: devis.client.name, telephone });
    res.status(201).json({
      message: `Paiement initie via ${op.nom}`,
      paiement: { _id: paiement._id, reference, montant, montantArtisan, commission, operateur: op.nom, statut: 'en_attente', type: typePaiement },
      instructions: {
        etape1: `Envoyez ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA au numero ${op.nom} de B.Y.H`,
        numeroByh: op.numero,
        etape2: `Reference a indiquer : ${reference}`,
        etape3: "L equipe B.Y.H va confirmer votre paiement sous 30 minutes",
        artisanRecevra: `${new Intl.NumberFormat('fr-FR').format(montantArtisan)} FCFA (90%)`,
        commission: `${new Intl.NumberFormat('fr-FR').format(commission)} FCFA (10% B.Y.H)`,
      }
    });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/mes-paiements', auth, async (req, res) => {
  try {
    const paiements = await Paiement.find({ client: req.user.id })
      .populate('devis','titre numeroDevis total')
      .populate('artisan','name')
      .populate('jalon','titre ordre')
      .sort({ createdAt: -1 });
    res.json(paiements);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/mes-revenus', auth, async (req, res) => {
  try {
    const paiements = await Paiement.find({ artisan: req.user.id })
      .populate('devis','titre numeroDevis')
      .populate('client','name')
      .populate('jalon','titre ordre')
      .sort({ createdAt: -1 });
    const total = paiements.filter(p=>p.statut==='confirme').reduce((s,p)=>s+p.montantArtisan,0);
    const enAttente = paiements.filter(p=>p.statut==='en_attente').reduce((s,p)=>s+p.montantArtisan,0);
    res.json({ paiements, stats: { total, enAttente, nbTransactions: paiements.length } });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/devis/:devisId', auth, async (req, res) => {
  try {
    const paiements = await Paiement.find({ devis: req.params.devisId })
      .populate('jalon','titre ordre montant statut')
      .sort({ createdAt: 1 });
    const devis = await Devis.findById(req.params.devisId);
    const totalPaye = paiements.filter(p=>p.statut==='confirme').reduce((s,p)=>s+p.montant,0);
    const restant = devis ? devis.total - totalPaye : 0;
    res.json({ paiements, totalPaye, restant, total: devis?.total||0 });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/confirmer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const paiement = await Paiement.findById(req.params.id)
      .populate('client','name email')
      .populate('artisan','name email');
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouve.' });
    if (paiement.statut === 'confirme') return res.status(400).json({ message: 'Paiement deja confirme.' });
    paiement.statut = 'confirme';
    paiement.confirmeParAdmin = true;
    paiement.dateConfirmation = new Date();
    paiement.transactionId = req.body.transactionId || '';
    paiement.notes = req.body.notes || '';
    await paiement.save();
    notifyUser(paiement.client._id, 'paiement_confirme', { montant: paiement.montant, reference: paiement.reference });
    notifyUser(paiement.artisan._id, 'paiement_recu', { montant: paiement.montantArtisan, reference: paiement.reference });
    res.json({ message: 'Paiement confirme et distribue !', paiement });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/echouer', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const paiement = await Paiement.findByIdAndUpdate(req.params.id,
      { statut: 'echoue', notes: req.body.notes||'Paiement non recu' }, { new: true });
    if (!paiement) return res.status(404).json({ message: 'Paiement non trouve.' });
    notifyUser(paiement.client, 'paiement_echoue', { reference: paiement.reference });
    res.json({ message: 'Paiement marque comme echoue.', paiement });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/admin/tous', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin requis.' });
    const { statut, page=1 } = req.query;
    const filter = statut ? { statut } : {};
    const paiements = await Paiement.find(filter)
      .populate('client','name email phone')
      .populate('artisan','name email phone')
      .populate('devis','titre numeroDevis')
      .populate('jalon','titre ordre')
      .sort({ createdAt: -1 })
      .skip((page-1)*20).limit(20);
    const total = await Paiement.countDocuments(filter);
    res.json({ paiements, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
