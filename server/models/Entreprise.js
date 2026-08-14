const mongoose = require('mongoose');
const entrepriseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  nomEntreprise: { type: String, required: true },
  nomResponsable: { type: String, required: true },
  description: { type: String },
  ville: { type: String, required: true },
  whatsapp: { type: String },
  rccm: { type: String },
  lotsTravauxPropose: [{ type: String }],
  typePersonnel: [{ type: String }],
  photos: [{ type: String }],
  note: { type: Number, default: 4.0 },
  nbAvis: { type: Number, default: 0 },
  disponible: { type: Boolean, default: true },
  verifie: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Entreprise', entrepriseSchema);
