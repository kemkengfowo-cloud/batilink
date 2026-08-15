const express = require('express');
const router = express.Router();
const PhotoChantier = require('../models/PhotoChantier');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/photos-chantier/:devisId
router.get('/:devisId', auth, async (req, res) => {
  try {
    const photos = await PhotoChantier.find({ devis: req.params.devisId })
      .populate('envoyePar','name avatar role')
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST /api/photos-chantier
router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'Aucune photo.' });
    const photos = req.files.map(f => `/uploads/${f.filename}`);
    const entry = await PhotoChantier.create({
      devis: req.body.devisId,
      contrat: req.body.contratId,
      jalon: req.body.jalonId,
      envoyePar: req.user.id,
      photos,
      description: req.body.description || '',
      etape: req.body.etape || ''
    });
    const populated = await PhotoChantier.findById(entry._id).populate('envoyePar','name avatar role');
    res.status(201).json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
