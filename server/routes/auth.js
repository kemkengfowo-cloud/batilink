const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const auth = require('../middleware/auth');

const genToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, city } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Champs requis manquants.' });
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email déjà utilisé.' });
    const user = await new User({ name, email, password, role, phone, city }).save();
    if (role === 'artisan') await Artisan.create({ user: user._id, metier: 'Non défini', ville: city || 'Yaoundé' });
    res.status(201).json({ token: genToken(user), user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    res.json({ token: genToken(user), user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
