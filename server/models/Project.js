const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  client:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  titre:        { type: String, required: true },
  description:  { type: String, required: true },
  budget:       { type: Number, required: true },
  localisation: { type: String, required: true },
  categorie:    { type: String, required: true },
  photos:       [{ type: String }],
  statut:       { type: String, enum: ['ouvert', 'en_cours', 'termine', 'annule'], default: 'ouvert' },
  vues:         { type: Number, default: 0 },
  typeClient:   { type: String, enum: ['artisan', 'entreprise', 'tous'], default: 'artisan' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
