const mongoose = require('mongoose');

const jalonSchema = new mongoose.Schema({
  devis: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis', required: true },
  titre: { type: String, required: true },
  description: { type: String },
  pourcentage: { type: Number, required: true },
  montant: { type: Number, required: true },
  ordre: { type: Number, required: true },
  statut: { type: String, enum: ['en_attente','en_cours','soumis','valide','conteste'], default: 'en_attente' },
  photos: [{ type: String }],
  dateDebut: { type: Date },
  dateSoumission: { type: Date },
  dateValidation: { type: Date },
  commentaireArtisan: { type: String },
  commentaireClient: { type: String },
  delaiContestationExpire: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Jalon', jalonSchema);
