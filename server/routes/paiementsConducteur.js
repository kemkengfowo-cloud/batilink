const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const PaiementConducteur = require("../models/PaiementConducteur");
const DemandeConducteur = require("../models/DemandeConducteur");
const { notifyUser, notifyAdmins } = require("../socket");
const { sendEmail } = require("../utils/emails");

const genRef = () => "BYH-CDT-" + Date.now() + "-" + Math.random().toString(36).substr(2,6).toUpperCase();
const OPERATEURS = {
  orange_money: { nom: "Orange Money", numero: "655 00 00 00" },
  mtn_momo:     { nom: "MTN MoMo",     numero: "677 00 00 00" },
};

router.post("/initier", auth, async (req, res) => {
  try {
    if (req.user.role !== "client") return res.status(403).json({ message: "Seul un client peut initier un paiement." });
    const { demandeId, operateur, telephone, nombreJours, type } = req.body;
    const demande = await DemandeConducteur.findById(demandeId).populate("conducteur", "name email phone").populate("client", "name email");
    if (demande.client._id.toString() !== req.user.id) return res.status(403).json({ message: "Acces refuse." });
    if (demande.statut !== "en_cours") return res.status(400).json({ message: "La mission doit etre en cours." });
    const tarifjour = demande.tarifjourFinal || 0;
    const dejaEnAttente = await PaiementConducteur.findOne({ demande: demandeId, statut: { $in: ["en_attente", "initie"] } });
    if (dejaEnAttente) return res.status(400).json({ message: "Un paiement est deja en cours pour cette mission." });
    const montant = tarifjour * nombreJours;
    const commission = Math.round(montant * 0.08);
    const montantConducteur = montant - commission;
    const reference = genRef();
    const op = OPERATEURS[operateur];
    const paiement = await PaiementConducteur.create({ demande: demandeId, client: req.user.id, conducteur: demande.conducteur._id, montant, montantConducteur, commission, operateur, telephone, statut: "en_attente", reference, type: type || "semaine", nombreJours, tarifjour });
    notifyAdmins("nouveau_paiement_conducteur", { paiementId: paiement._id, reference, montant, operateur: op.nom, clientNom: demande.client.name });
    res.status(201).json({ message: "Paiement initie via " + op.nom, paiement: { _id: paiement._id, reference, montant, montantConducteur, commission, statut: "en_attente" }, instructions: { etape1: "Envoyez " + new Intl.NumberFormat("fr-FR").format(montant) + " FCFA au numero " + op.nom + " de BYH", numeroByh: op.numero, etape2: "Reference: " + reference, etape3: "BYH va confirmer sous 30 minutes", conducteurRecevra: new Intl.NumberFormat("fr-FR").format(montantConducteur) + " FCFA (92%)", commission: new Intl.NumberFormat("fr-FR").format(commission) + " FCFA (8% BYH)" } });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get("/mes-paiements", auth, async (req, res) => {
  try {
    const paiements = await PaiementConducteur.find({ client: req.user.id }).populate("demande", "titreChantier ville").populate("conducteur", "name").sort({ createdAt: -1 });
    const totalPaye = paiements.filter(p => p.statut === "confirme").reduce((s, p) => s + p.montant, 0);
    res.json({ paiements, totalPaye });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get("/mes-revenus", auth, async (req, res) => {
  try {
    if (req.user.role !== "conducteur") return res.status(403).json({ message: "Acces refuse." });
    const paiements = await PaiementConducteur.find({ conducteur: req.user.id }).populate("demande", "titreChantier ville").populate("client", "name").sort({ createdAt: -1 });
    const totalConfirme = paiements.filter(p => p.statut === "confirme").reduce((s, p) => s + p.montantConducteur, 0);
    const enAttente = paiements.filter(p => p.statut === "en_attente").reduce((s, p) => s + p.montantConducteur, 0);
    res.json({ paiements, stats: { totalConfirme, enAttente, nbTransactions: paiements.length } });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get("/demande/:id", auth, async (req, res) => {
  try {
    const demande = await DemandeConducteur.findById(req.params.id);
    const isAuthorized = demande.client.toString() === req.user.id || (demande.conducteur && demande.conducteur.toString() === req.user.id) || req.user.role === "admin";
    const paiements = await PaiementConducteur.find({ demande: req.params.id }).sort({ createdAt: -1 });
    const totalPaye = paiements.filter(p => p.statut === "confirme").reduce((s, p) => s + p.montant, 0);
    res.json({ paiements, totalPaye, tarifjour: demande.tarifjourFinal || 0 });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/confirmer", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis." });
    const paiement = await PaiementConducteur.findById(req.params.id).populate("client", "name email").populate("conducteur", "name email").populate("demande", "titreChantier");
    if (paiement.statut === "confirme") return res.status(400).json({ message: "Deja confirme." });
    paiement.statut = "confirme"; paiement.confirmeParAdmin = true; paiement.dateConfirmation = new Date(); paiement.dateDistribution = new Date(); paiement.transactionId = req.body.transactionId || ""; paiement.notes = req.body.notes || "";
    await paiement.save();
    notifyUser(paiement.client._id, "paiement_conducteur_confirme", { montant: paiement.montant, reference: paiement.reference });
    notifyUser(paiement.conducteur._id, "paiement_conducteur_recu", { montant: paiement.montantConducteur, reference: paiement.reference });
    sendEmail({ to: paiement.client.email, subject: "OK - Paiement conducteur confirme", html: "<p>Paiement de " + new Intl.NumberFormat("fr-FR").format(paiement.montant) + " FCFA confirme pour " + paiement.demande.titreChantier + ". Ref: " + paiement.reference + "</p>" }).catch(e => console.error(e.message));
    sendEmail({ to: paiement.conducteur.email, subject: "OK - Paiement recu", html: "<p>Vous avez recu " + new Intl.NumberFormat("fr-FR").format(paiement.montantConducteur) + " FCFA pour " + paiement.demande.titreChantier + ". Ref: " + paiement.reference + "</p>" }).catch(e => console.error(e.message));
    res.json({ message: "Paiement confirme ! " + new Intl.NumberFormat("fr-FR").format(paiement.montantConducteur) + " FCFA distribues a " + paiement.conducteur.name, paiement });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.put("/:id/echouer", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis." });
    const paiement = await PaiementConducteur.findById(req.params.id).populate("client", "name email");
    if (paiement.statut === "confirme") return res.status(400).json({ message: "Impossible - deja confirme." });
    paiement.statut = "echoue"; paiement.notes = req.body.notes || "Paiement non recu";
    await paiement.save();
    notifyUser(paiement.client._id, "paiement_conducteur_echoue", { reference: paiement.reference });
    sendEmail({ to: paiement.client.email, subject: "ERREUR - Paiement non recu", html: "<p>Votre paiement ref " + paiement.reference + " n a pas ete recu. Raison: " + paiement.notes + ". Contactez contact@byh-cm.com</p>" }).catch(e => console.error(e.message));
    res.json({ message: "Paiement marque comme echoue.", paiement });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

router.get("/admin/tous", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin requis." });
    const { statut, page=1 } = req.query;
    const filter = statut ? { statut } : {};
    const paiements = await PaiementConducteur.find(filter).populate("client", "name email phone").populate("conducteur", "name email phone").populate("demande", "titreChantier ville").sort({ createdAt: -1 }).skip((page-1)*20).limit(20);
    const total = await PaiementConducteur.countDocuments(filter);
    res.json({ paiements, total });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
