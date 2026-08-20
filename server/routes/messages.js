const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { notifyUser } = require('../socket');

router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ expediteur: req.user.id }, { destinataire: req.user.id }]
    }).populate('expediteur', 'name avatar role').populate('destinataire', 'name avatar role')
      .populate('projet', 'titre').sort({ createdAt: -1 });

    const map = {};
    messages.forEach(msg => {
      const isSender = msg.expediteur._id.toString() === req.user.id;
      const otherId = isSender ? msg.destinataire._id.toString() : msg.expediteur._id.toString();
      if (!map[otherId]) {
        map[otherId] = { contact: isSender ? msg.destinataire : msg.expediteur, lastMessage: msg, unread: 0 };
      }
      if (!msg.lu && msg.destinataire._id.toString() === req.user.id) map[otherId].unread++;
    });
    res.json(Object.values(map));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { expediteur: req.user.id, destinataire: req.params.userId },
        { expediteur: req.params.userId, destinataire: req.user.id }
      ]
    }).populate('expediteur', 'name avatar').populate('projet', 'titre').sort({ createdAt: 1 });
    await Message.updateMany({ expediteur: req.params.userId, destinataire: req.user.id, lu: false }, { lu: true });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { destinataire, contenu, projet } = req.body;
    if (!destinataire || !contenu) return res.status(400).json({ message: 'Champs requis manquants.' });
    const msg = await Message.create({ expediteur: req.user.id, destinataire, contenu, projet });
    notifyUser(destinataire, "nouveau_message", { expediteur: req.user.id, contenu, messageId: msg._id });
    res.status(201).json(await Message.findById(msg._id).populate('expediteur', 'name avatar').populate('destinataire', 'name avatar'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
