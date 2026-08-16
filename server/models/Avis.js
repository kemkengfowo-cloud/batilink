const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cible: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cibleType: { type: String, enum: ['artisan', 'entreprise'], required: true },
  cibleRef: { type: mongoose.Schema.Types.ObjectId, required: true },
  note: { type: Number, required: true, min: 1, max: 5 },
  commentaire: { type: String, required: true, minlength: 10 },
}, { timestamps: true });

avisSchema.index({ auteur: 1, cible: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
