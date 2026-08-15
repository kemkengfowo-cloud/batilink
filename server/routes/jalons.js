const express = require('express');
const router = express.Router();
const Jalon = require('../models/Jalon');
const Devis = require('../models/Devis');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

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

module.exports = router;
