const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  numeroDevis: { type: String, unique: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  lignes: [{
    designation: { type: String, required: true },
    quantite: { type: Number, required: true },
    unite: { type: String, default: 'unite' },
    prixUnitaire: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  sousTotal: { type: Number, required: true },
  commission: { type: Number, default: 10 },
  montantCommission: { type: Number },
  montantArtisan: { type: Number },
  total: { type: Number, required: true },
  delaiExecution: { type: String, required: true },
  validiteJours: { type: Number, default: 15 },
  conditionsPaiement: { type: String, default: 'Paiement via B.Y.H - Libere apres validation des travaux' },
  materielsInclus: { type: Boolean, default: false },
  statut: { type: String, enum: ['envoye','accepte','refuse','expire','termine'], default: 'envoye' },
  modePaiement: { type: String, enum: ["total", "acompte", "jalons"], default: "total" },
  soldeVerse:    { type: Boolean, default: false },
  acompteVerse:  { type: Boolean, default: false },
  dateAcceptation: { type: Date },
  dateExpiration: { type: Date },
  noteClient: { type: String },
  noteArtisan: { type: String }
}, { timestamps: true });

devisSchema.pre('save', function(next) {
  if (!this.numeroDevis) {
    this.numeroDevis = `BL-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  }
  this.montantCommission = Math.round(this.total * this.commission / 100);
  this.montantArtisan = this.total - this.montantCommission;
  if (!this.dateExpiration) {
    const exp = new Date();
    exp.setDate(exp.getDate() + this.validiteJours);
    this.dateExpiration = exp;
  }
  next();
});

module.exports = mongoose.model('Devis', devisSchema);
// Index pour performance
// devisSchema.index({ client: 1, statut: 1 });
// devisSchema.index({ artisan: 1, statut: 1 });
