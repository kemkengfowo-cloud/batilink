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

  // Budget
  budgetPropose:    { type: Number },
  budgetFinal:      { type: Number },

  // Offres envoyées aux conducteurs par l'admin
  offres: [{
    conducteur:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tarifjour:      { type: Number, required: true },
    message:        { type: String },
    statut:         { type: String, enum: ['envoyee', 'acceptee', 'refusee', 'expiree'], default: 'envoyee' },
    messageReponse: { type: String },
    dateEnvoi:      { type: Date, default: Date.now },
    dateReponse:    { type: Date },
  }],

  // Statut global
  statut: { type: String, enum: [
    'en_attente',           // Client vient de soumettre
    'offres_envoyees',      // Admin a envoyé offres aux conducteurs
    'conducteur_accepte',   // Un conducteur a accepté
    'contrat_conducteur',   // Contrat envoyé au conducteur
    'conducteur_valide',    // Conducteur a signé son contrat
    'propose_client',       // Admin propose le conducteur au client
    'contrat_client',       // Contrat envoyé au client
    'valide_client',        // Client a validé
    'en_cours',             // Mission en cours
    'terminee',             // Mission terminée
    'annulee'               // Annulée
  ], default: 'en_attente' },

  // Conducteur retenu
  conducteurRetenu:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tarifjourFinal:       { type: Number },

  // Contrats
  contratClientUrl:         { type: String },
  contratConducteurUrl:     { type: String },
  contratClientValide:      { type: Boolean, default: false },
  contratConducteurValide:  { type: Boolean, default: false },
  dateValidationClient:     { type: Date },
  dateValidationConducteur: { type: Date },

  // Notes admin
  notesAdmin:       { type: String },

  // Statistiques
  nombreRapports:   { type: Number, default: 0 },
  avancementGlobal: { type: Number, default: 0, min: 0, max: 100 },
  derniereActivite: { type: Date },

}, { timestamps: true });

demandeConducteurSchema.index({ client: 1, statut: 1 });
demandeConducteurSchema.index({ conducteur: 1, statut: 1 });
demandeConducteurSchema.index({ 'offres.conducteur': 1 });
demandeConducteurSchema.index({ statut: 1 });

module.exports = mongoose.model('DemandeConducteur', demandeConducteurSchema);
