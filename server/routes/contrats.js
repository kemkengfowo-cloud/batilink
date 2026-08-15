const express = require('express');
const router = express.Router();
const Contrat = require('../models/Contrat');
const auth = require('../middleware/auth');

router.get('/mes-contrats', auth, async (req, res) => {
  try {
    const contrats = await Contrat.find({
      $or: [{ employeur: req.user.id }, { technicien: req.user.id }]
    }).populate('employeur','name avatar city').populate('technicien','name avatar city').populate('mission','titre typePersonnel').sort({ createdAt: -1 });
    res.json(contrats);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id)
      .populate('employeur','name avatar phone city').populate('technicien','name avatar phone city').populate('mission','titre typePersonnel description localisation');
    if (!contrat) return res.status(404).json({ message: 'Contrat non trouve.' });
    const isParty = [contrat.employeur._id.toString(), contrat.technicien._id.toString()].includes(req.user.id);
    if (!isParty && req.user.role !== 'admin') return res.status(403).json({ message: 'Acces refuse.' });
    res.json(contrat);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'entreprise' && req.user.role !== 'client')
      return res.status(403).json({ message: 'Acces refuse.' });
    const { missionId, technicienId, typePersonnel, nombrePersonnes, dateDebut, dateFin, adresseChantier, horaires, equipementsFournis, remunerationTotal, obligations } = req.body;
    if (!technicienId || !typePersonnel || !dateDebut || !dateFin || !adresseChantier || !remunerationTotal)
      return res.status(400).json({ message: 'Champs requis manquants.' });
    const contrat = await Contrat.create({ mission: missionId, employeur: req.user.id, technicien: technicienId, typePersonnel, nombrePersonnes, dateDebut, dateFin, adresseChantier, horaires, equipementsFournis, remunerationTotal: +remunerationTotal, obligations });
    const populated = await Contrat.findById(contrat._id).populate('employeur','name avatar').populate('technicien','name avatar').populate('mission','titre');
    res.status(201).json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/signer', auth, async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat non trouve.' });
    const isEmployeur = contrat.employeur.toString() === req.user.id;
    const isTechnicien = contrat.technicien.toString() === req.user.id;
    if (!isEmployeur && !isTechnicien) return res.status(403).json({ message: 'Acces refuse.' });
    const signatureData = { signe: true, date: new Date(), nom: req.body.nom };
    if (isEmployeur) contrat.signatureEmployeur = signatureData;
    if (isTechnicien) contrat.signatureTechnicien = signatureData;
    if (contrat.signatureEmployeur.signe && contrat.signatureTechnicien.signe) contrat.statut = 'signe';
    await contrat.save();
    res.json(contrat);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/demarrer', auth, async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat non trouve.' });
    if (contrat.employeur.toString() !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (contrat.statut !== 'signe') return res.status(400).json({ message: 'Le contrat doit etre signe.' });
    contrat.statut = 'en_cours';
    await contrat.save();
    res.json(contrat);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/terminer', auth, async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat non trouve.' });
    if (contrat.employeur.toString() !== req.user.id) return res.status(403).json({ message: 'Seul l employeur peut valider.' });
    if (contrat.statut !== 'en_cours') return res.status(400).json({ message: 'Mission doit etre en cours.' });
    contrat.statut = 'termine';
    contrat.dateValidation = new Date();
    contrat.noteEmployeur = req.body.note || '';
    await contrat.save();
    res.json({ contrat, message: `Mission validee ! Technicien recevra ${new Intl.NumberFormat('fr-FR').format(contrat.montantTechnicien)} FCFA.` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/resilier', auth, async (req, res) => {
  try {
    const contrat = await Contrat.findById(req.params.id);
    if (!contrat) return res.status(404).json({ message: 'Contrat non trouve.' });
    const isParty = [contrat.employeur.toString(), contrat.technicien.toString()].includes(req.user.id);
    if (!isParty) return res.status(403).json({ message: 'Acces refuse.' });
    contrat.statut = 'resilie';
    await contrat.save();
    res.json({ contrat, message: 'Contrat resilie.' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
