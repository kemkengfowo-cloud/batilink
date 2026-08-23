const mongoose = require('mongoose');

const rapportChantierSchema = new mongoose.Schema({
  demande:        { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeConducteur', required: true },
  conducteur:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:           { type: Date, required: true, default: Date.now },
  type:           { type: String, enum: ['quotidien', 'hebdomadaire', 'mensuel'], default: 'quotidien' },

  // Météo
  meteo:          { type: String, enum: ['ensoleille', 'nuageux', 'pluvieux', 'orageux'], default: 'ensoleille' },

  // Avancement
  avancement:     { type: Number, min: 0, max: 100, default: 0 },
  activites:      [{ type: String }],
  problemes:      [{ type: String }],
  solutions:      [{ type: String }],

  // Personnel
  nombreOuvriers: { type: Number, default: 0 },
  equipes:        [{ type: String }],

  // Matériaux
  materiaux: [{
    nom:      { type: String },
    quantite: { type: String },
    statut:   { type: String, enum: ['disponible', 'manquant', 'commande'], default: 'disponible' }
  }],

  // Photos
  photos: [{
    url:       { type: String, required: true },
    legende:   { type: String },
    categorie: { type: String, enum: ['avancement', 'probleme', 'materiau', 'autre'], default: 'avancement' }
  }],

  // Notes
  noteGenerale:    { type: String },
  recommandations: { type: String },

  // Validation client
  statut:             { type: String, enum: ['soumis', 'vu', 'valide', 'conteste'], default: 'soumis' },
  commentaireClient:  { type: String },
  valideLe:           { type: Date },

}, { timestamps: true });

rapportChantierSchema.index({ demande: 1, date: -1 });
rapportChantierSchema.index({ conducteur: 1 });
rapportChantierSchema.index({ client: 1 });

module.exports = mongoose.model('RapportChantier', rapportChantierSchema);
