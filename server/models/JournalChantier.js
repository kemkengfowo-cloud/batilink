const mongoose = require('mongoose');

const journalChantierSchema = new mongoose.Schema({
  mission:        { type: mongoose.Schema.Types.ObjectId, ref: 'MissionConducteur', required: true },
  conducteur:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:           { type: Date, required: true, default: Date.now },
  type:           { type: String, enum: ['quotidien', 'hebdomadaire', 'mensuel'], default: 'quotidien' },

  // Météo
  meteo:          { type: String, enum: ['ensoleille', 'nuageux', 'pluvieux', 'orageux'], default: 'ensoleille' },

  // Avancement
  avancement:     { type: Number, min: 0, max: 100, default: 0 }, // % d'avancement
  activites:      [{ type: String }], // Travaux effectués ce jour
  problemes:      [{ type: String }], // Problèmes rencontrés
  solutions:      [{ type: String }], // Solutions appliquées

  // Personnel présent
  nombreOuvriers: { type: Number, default: 0 },
  equipes:        [{ type: String }], // Maçons, électriciens présents

  // Matériaux
  materiaux:      [{
    nom:          { type: String },
    quantite:     { type: String },
    statut:       { type: String, enum: ['disponible', 'manquant', 'commande'], default: 'disponible' }
  }],

  // Photos
  photos:         [{
    url:          { type: String, required: true },
    legende:      { type: String },
    categorie:    { type: String, enum: ['avancement', 'probleme', 'materiau', 'autre'], default: 'avancement' }
  }],

  // Notes
  noteGenerale:   { type: String },
  recommandations:{ type: String },

  // Validation client
  statut:         { type: String, enum: ['soumis', 'vu', 'valide', 'conteste'], default: 'soumis' },
  commentaireClient: { type: String },
  vuLe:           { type: Date },
  valideLe:       { type: Date },

}, { timestamps: true });

journalChantierSchema.index({ mission: 1, date: -1 });
journalChantierSchema.index({ conducteur: 1 });
journalChantierSchema.index({ client: 1 });
journalChantierSchema.index({ statut: 1 });

module.exports = mongoose.model('JournalChantier', journalChantierSchema);
