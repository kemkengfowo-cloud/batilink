const mongoose = require('mongoose');

const paiementConducteurSchema = new mongoose.Schema({
  demande:          { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeConducteur', required: true },
  client:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conducteur:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  montant:          { type: Number, required: true },
  montantConducteur:{ type: Number },
  commission:       { type: Number },
  operateur:        { type: String, enum: ['orange_money', 'mtn_momo', 'virement'], required: true },
  telephone:        { type: String },
  statut:           { type: String, enum: ['initie', 'en_attente', 'confirme', 'echoue', 'rembourse'], default: 'initie' },
  reference:        { type: String, unique: true, sparse: true },
  transactionId:    { type: String },
  notes:            { type: String },
  type:             { type: String, enum: ['acompte', 'semaine', 'solde', 'total'], default: 'semaine' },
  periodeDebut:     { type: Date },
  periodeFin:       { type: Date },
  nombreJours:      { type: Number },
  tarifjour:        { type: Number },
  confirmeParAdmin: { type: Boolean, default: false },
  dateConfirmation: { type: Date },
  dateDistribution: { type: Date },
}, { timestamps: true });

paiementConducteurSchema.index({ demande: 1 });
paiementConducteurSchema.index({ client: 1 });
paiementConducteurSchema.index({ conducteur: 1 });
paiementConducteurSchema.index({ statut: 1 });
paiementConducteurSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaiementConducteur', paiementConducteurSchema);
