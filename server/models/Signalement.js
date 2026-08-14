const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema({
  rapporteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['artisan', 'projet', 'mission', 'utilisateur'], required: true },
  cibleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  motif: { type: String, required: true },
  description: { type: String },
  statut: { type: String, enum: ['en_attente', 'traite', 'rejete'], default: 'en_attente' },
  actionAdmin: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Signalement', signalementSchema);
