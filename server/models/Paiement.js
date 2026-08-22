const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  devis:          { type: mongoose.Schema.Types.ObjectId, ref: 'Devis', required: true },
  jalon:          { type: mongoose.Schema.Types.ObjectId, ref: 'Jalon' },
  client:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artisan:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  montant:        { type: Number, required: true },
  montantArtisan: { type: Number },
  commission:     { type: Number },
  operateur:      { type: String, enum: ['orange_money', 'mtn_momo', 'virement'], required: true },
  telephone:      { type: String },
  statut:         { type: String, enum: ['initie', 'en_attente', 'confirme', 'echoue', 'rembourse'], default: 'initie' },
  reference:      { type: String, unique: true, sparse: true },
  transactionId:  { type: String },
  notes:          { type: String },
  type:           { type: String, enum: ['acompte', 'jalon', 'solde', 'total'], default: 'jalon' },
  pourcentage:    { type: Number },
  confirmeParAdmin:   { type: Boolean, default: false },
  dateConfirmation:   { type: Date },
  dateDistribution:   { type: Date },
}, { timestamps: true });

paiementSchema.index({ devis: 1 });
paiementSchema.index({ client: 1 });
paiementSchema.index({ artisan: 1 });
paiementSchema.index({ statut: 1 });
paiementSchema.index({ jalon: 1 });
paiementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Paiement', paiementSchema);
