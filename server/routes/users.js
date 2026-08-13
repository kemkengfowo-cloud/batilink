const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, async (req, res) => {
  try { res.json(await User.findById(req.user.id)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    res.json(await User.findByIdAndUpdate(req.user.id, { name, phone, city }, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier.' });
    const avatar = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
    res.json({ avatar, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
