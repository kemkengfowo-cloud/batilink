const mongoose = require('mongoose');

const demandePersonnelSchema = new mongoose.Schema({
  entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  typePersonnel: [{ type: String, required: true }],
  nombrePersonnes: { type: Number, default: 1 },
  ville: { type: String, required: true },
  adresseChantier: { type: String },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  description: { type: String },
  budgetPropose: { type: Number, required: true },
  budgetFinal: { type: Number },

  // Négociation
  propositions: [{
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['entreprise', 'artisan', 'admin'] },
    montant: { type: Number },
    message: { type: String },
    date: { type: Date, default: Date.now }
  }],

  // Artisans proposés par l'admin
  artisansProposes: [{
    artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statut: { type: String, enum: ['propose', 'accepte', 'refuse'], default: 'propose' },
    prixPropose: { type: Number },
    prixFinal: { type: Number }
  }],

  statut: {
    type: String,
    enum: ['en_attente', 'en_negociation', 'accord_trouve', 'contrat_genere', 'en_cours', 'termine', 'annulee'],
    default: 'en_attente'
  },

  contrat: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat' },
  noteEntreprise: { type: String },
  noteAdmin: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DemandePersonnel', demandePersonnelSchema);
