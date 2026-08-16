const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
  matricule: { type: String, required: true },
  utilisateur: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nom: { type: String },
    email: { type: String },
    role: { type: String }
  },
  action: {
    type: String,
    enum: [
      'INSCRIPTION',
      'CONNEXION',
      'DECONNEXION',
      'PROJET_PUBLIE',
      'PROJET_MODIFIE',
      'PROJET_SUPPRIME',
      'DEVIS_ENVOYE',
      'DEVIS_ACCEPTE',
      'DEVIS_REFUSE',
      'DEVIS_COUNTER_OFFRE',
      'JALON_SOUMIS',
      'JALON_VALIDE',
      'JALON_CONTESTE',
      'TRAVAUX_VALIDES',
      'CONTRAT_CREE',
      'CONTRAT_SIGNE',
      'CONTRAT_DEMARRE',
      'CONTRAT_TERMINE',
      'CONTRAT_RESILIE',
      'LITIGE_OUVERT',
      'LITIGE_RESOLU',
      'VISITE_DEMANDEE',
      'VISITE_ACCEPTEE',
      'RAPPORT_SOUMIS',
      'AVIS_LAISSE',
      'SIGNALEMENT_SOUMIS',
      'MESSAGE_ENVOYE',
      'PHOTOS_SOUMISES',
      'PROFIL_MODIFIE',
      'BADGE_ATTRIBUE',
      'MISSION_PUBLIEE',
    ],
    required: true
  },
  details: { type: mongoose.Schema.Types.Mixed },
  statut: { type: String, enum: ['succes', 'echec'], default: 'succes' },
  ip: { type: String },
  erreur: { type: String }
}, { timestamps: true });

// Index pour recherche rapide
historiqueSchema.index({ matricule: 1 });
historiqueSchema.index({ 'utilisateur.id': 1 });
historiqueSchema.index({ action: 1 });
historiqueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Historique', historiqueSchema);
