const mongoose = require('mongoose');

const litigeSchema = new mongoose.Schema({
  devis: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis' },
  contrat: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat' },
  jalon: { type: mongoose.Schema.Types.ObjectId, ref: 'Jalon' },
  plaignant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accuse: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motif: { type: String, required: true },
  description: { type: String, required: true },
  preuves: [{ type: String }],
  statut: { type: String, enum: ['ouvert','en_examen','resolu_plaignant','resolu_accuse','classe'], default: 'ouvert' },
  decisionAdmin: { type: String },
  adminTraitant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateResolution: { type: Date },
  montantRembourse: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Litige', litigeSchema);
