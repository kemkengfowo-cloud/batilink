const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:    String,
  userRole:    String,
  note:        { type: Number, min: 1, max: 5, required: true },
  categorie:   { type: String, enum: ['design', 'fonctionnalite', 'bug', 'suggestion', 'autre'], default: 'autre' },
  commentaire: { type: String, required: true },
  source:      { type: String, enum: ['web', 'mobile'], default: 'web' },
  page:        String,
  lu:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
