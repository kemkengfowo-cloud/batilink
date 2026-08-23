const mongoose = require('mongoose');

const demandeConducteurSchema = new mongoose.Schema({
  client:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conducteur:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Infos chantier
  titreChantier:    { type: String, required: true },
  description:      { type: String, required: true },
  localisation:     { type: String, required: true },
  ville:            { type: String, required: true },
  typeChantier:     { type: String, enum: ['construction', 'renovation', 'amenagement', 'gros_oeuvre', 'finition', 'autre'], default: 'construction' },
  dateDebut:        { type: Date, required: true },
  dateFin:          { type: Date },
  superficie:       { type: String },
  budgetChantier:   { type: Number },

  // Budget conducteur
  budgetPropose:    { type: Number },
  budgetFinal:      { type: Number },

  // Statut de la demande
  statut:           { type: String, enum: [
    'en_attente',      // Client vient de soumettre
    'en_traitement',   // B.Y.H cherche un conducteur
    'conducteur_propose', // B.Y.H propose un conducteur au client
    'contrat_client',  // Contrat envoyé au client
    'valide_client',   // Client a validé le contrat
    'contrat_conducteur', // Contrat envoyé au conducteur
    'en_cours',        // Mission en cours
    'terminee',        // Mission terminée
    'annulee'          // Annulée
  ], default: 'en_attente' },

  // Conducteur proposé par admin
  conducteurPropose: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messagePropositon: { type: String },

  // Contrats
  contratClientUrl:     { type: String },
  contratConducteurUrl: { type: String },
  contratClientValide:  { type: Boolean, default: false },
  contratConducteurValide: { type: Boolean, default: false },
  dateValidationClient: { type: Date },

  // Notes admin
  notesAdmin:       { type: String },

  // Statistiques
  nombreRapports:   { type: Number, default: 0 },
  avancementGlobal: { type: Number, default: 0, min: 0, max: 100 },
  derniereActivite: { type: Date },

}, { timestamps: true });

demandeConducteurSchema.index({ client: 1, statut: 1 });
demandeConducteurSchema.index({ conducteur: 1, statut: 1 });
demandeConducteurSchema.index({ statut: 1 });

module.exports = mongoose.model('DemandeConducteur', demandeConducteurSchema);
