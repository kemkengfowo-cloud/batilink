const mongoose = require('mongoose');

const visiteEvaluationSchema = new mongoose.Schema({
  projet: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  evaluateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adresse: { type: String, required: true },
  ville: { type: String, required: true },
  description: { type: String, required: true },
  typeProbleme: { type: String },
  dateVisite: { type: Date },
  fraisVisite: { type: Number, default: 5000 },
  fraisPaies: { type: Boolean, default: false },

  // Rapport de visite
  rapport: {
    problemesIdentifies: { type: String },
    travauxRecommandes: { type: String },
    estimationCout: { type: Number },
    estimationDuree: { type: String },
    photos: [{ type: String }],
    observations: { type: String },
    dateRapport: { type: Date }
  },

  statut: {
    type: String,
    enum: ['en_attente','evaluateur_assigne','visite_effectuee','rapport_soumis','devis_genere','annulee'],
    default: 'en_attente'
  },

  devisGenere: { type: mongoose.Schema.Types.ObjectId, ref: 'Devis' },
  fraisDeduits: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VisiteEvaluation', visiteEvaluationSchema);
