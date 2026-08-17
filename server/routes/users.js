const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', auth, async (req, res) => {
  try { res.json(await User.findById(req.user.id)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get("/profile/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouve." });
    res.json(user);
  } catch(err) { res.status(500).json({ message: err.message }); }
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

// GET /api/users/search?email=xxx
router.get('/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email requis.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouve.' });
    res.json(user);
  } catch(err) { res.status(500).json({ message: err.message }); }
});
