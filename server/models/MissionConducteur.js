const mongoose = require('mongoose');

const missionConducteurSchema = new mongoose.Schema({
  client:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conducteur:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  titre:          { type: String, required: true },
  description:    { type: String, required: true },
  localisation:   { type: String, required: true },
  dateDebut:      { type: Date },
  dateFin:        { type: Date },
  budgetJournalier: { type: Number },
  statut:         { type: String, enum: ['ouverte', 'en_cours', 'terminee', 'annulee'], default: 'ouverte' },
  typeChantier:   { type: String, enum: ['construction', 'renovation', 'amenagement', 'autre'], default: 'construction' },
  avancementGlobal: { type: Number, min: 0, max: 100, default: 0 },
  candidatures:   [{
    conducteur:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message:      { type: String },
    tarif:        { type: Number },
    statut:       { type: String, enum: ['en_attente', 'accepte', 'refuse'], default: 'en_attente' },
    createdAt:    { type: Date, default: Date.now }
  }],
  nombreJournaux: { type: Number, default: 0 },
  derniereActivite: { type: Date },
}, { timestamps: true });

missionConducteurSchema.index({ client: 1, statut: 1 });
missionConducteurSchema.index({ conducteur: 1, statut: 1 });
missionConducteurSchema.index({ statut: 1 });

module.exports = mongoose.model('MissionConducteur', missionConducteurSchema);
