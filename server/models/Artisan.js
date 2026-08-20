const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  metier:      { type: String, required: true },
  description: { type: String },
  ville:       { type: String, required: true },
  whatsapp:    { type: String },
  experience:  { type: Number, default: 0 },
  specialites: [{ type: String }],
  photos:      [{ type: String }],
  portfolio:   [{
    titre:       { type: String, required: true },
    description: { type: String },
    avant:       { type: String },
    apres:       { type: String },
    categorie:   { type: String },
    createdAt:   { type: Date, default: Date.now }
  }],
  note:        { type: Number, default: 4.0, min: 0, max: 5 },
  nbAvis:      { type: Number, default: 0 },
  disponible:  { type: Boolean, default: true },
  verifie:     { type: Boolean, default: false },
  badges: {
    verifie:    { type: Boolean, default: false },
    complet:    { type: Boolean, default: false },
    topRated:   { type: Boolean, default: false },
    premium:    { type: Boolean, default: false },
  }
}, { timestamps: true });

module.exports = mongoose.model('Artisan', artisanSchema);
