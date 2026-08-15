const mongoose = require('mongoose');

const contratSchema = new mongoose.Schema({
  mission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
  employeur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicien: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  numeroContrat: { type: String, unique: true },

  // Détails mission
  typePersonnel: { type: String, required: true },
  nombrePersonnes: { type: Number, default: 1 },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  adresseChantier: { type: String, required: true },
  horaires: { type: String, default: '7h00 - 17h00' },
  equipementsFournis: { type: Boolean, default: false },

  // Financier
  remunerationTotal: { type: Number, required: true },
  commission: { type: Number, default: 10 },
  montantCommission: { type: Number },
  montantTechnicien: { type: Number },

  // Obligations
  obligations: { type: String },
  conditionsResiliation: { type: String, default: 'Préavis de 48h requis pour toute résiliation' },

  // Signatures
  signatureEmployeur: {
    signe: { type: Boolean, default: false },
    date: { type: Date },
    nom: { type: String }
  },
  signatureTechnicien: {
    signe: { type: Boolean, default: false },
    date: { type: Date },
    nom: { type: String }
  },

  statut: {
    type: String,
    enum: ['en_attente_signatures', 'signe', 'en_cours', 'termine', 'resilie'],
    default: 'en_attente_signatures'
  },

  dateValidation: { type: Date },
  noteEmployeur: { type: String },
  noteTechnicien: { type: String }
}, { timestamps: true });

contratSchema.pre('save', function(next) {
  if (!this.numeroContrat) {
    this.numeroContrat = `CTR-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  }
  this.montantCommission = Math.round(this.remunerationTotal * this.commission / 100);
  this.montantTechnicien = this.remunerationTotal - this.montantCommission;
  next();
});

module.exports = mongoose.model('Contrat', contratSchema);
