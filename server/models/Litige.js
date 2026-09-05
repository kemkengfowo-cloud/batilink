const mongoose = require('mongoose');
const litigeSchema = new mongoose.Schema({
  devis:          { type: mongoose.Schema.Types.ObjectId, ref: 'Devis' },
  contrat:        { type: mongoose.Schema.Types.ObjectId, ref: 'Contrat' },
  jalon:          { type: mongoose.Schema.Types.ObjectId, ref: 'Jalon' },
  plaignant:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accuse:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  motif:          { type: String, required: true },
  description:    { type: String, required: true },
  preuves:        [{ type: String }],
  
  // Réponse de l'accusé
  reponseAccuse:  { type: String },
  preuvesAccuse:  [{ type: String }],
  dateReponse:    { type: Date },
  delaiReponse:   { type: Date }, // 72h après ouverture
  
  // Messages de médiation
  messages: [{
    auteur:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contenu:   { type: String },
    date:      { type: Date, default: Date.now },
    role:      { type: String, enum: ['plaignant', 'accuse', 'admin'] }
  }],
  
  statut:         { type: String, enum: ['ouvert','en_attente_reponse','en_examen','resolu_plaignant','resolu_accuse','resolu_partage','classe'], default: 'ouvert' },
  decisionAdmin:  { type: String },
  adminTraitant:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dateResolution: { type: Date },
  
  // Paiements de résolution
  montantRembourse:       { type: Number, default: 0 },
  montantPlaignant:       { type: Number, default: 0 },
  montantAccuse:          { type: Number, default: 0 },
  disbursementEffectue:   { type: Boolean, default: false },
  
  // Urgence
  urgent:         { type: Boolean, default: false },
  montantEnJeu:   { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Litige', litigeSchema);
