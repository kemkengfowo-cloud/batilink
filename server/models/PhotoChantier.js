const mongoose = require('mongoose');

const photoChantierSchema = new mongoose.Schema({
  devis: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis' },
  contrat: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat' },
  jalon: { type: mongoose.Schema.Types.ObjectId, ref: 'Jalon' },
  envoyePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [{ type: String }],
  description: { type: String },
  etape: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PhotoChantier', photoChantierSchema);
