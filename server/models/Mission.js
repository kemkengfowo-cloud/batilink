const mongoose = require('mongoose');
const missionSchema = new mongoose.Schema({
  entreprise: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  typePersonnel: [{ type: String }],
  typeBesoin: { type: String, enum: ['individuel','equipe'], default: 'individuel' },
  nombrePersonnes: { type: Number, default: 1 },
  duree: { type: String, required: true },
  remuneration: { type: Number, required: true },
  localisation: { type: String, required: true },
  dateDebut: { type: Date },
  statut: { type: String, enum: ['ouverte','en_cours','terminee','annulee'], default: 'ouverte' },
  candidatures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
module.exports = mongoose.model('Mission', missionSchema);
