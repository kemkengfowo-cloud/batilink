const lancerTousLesRappels = async () => {
  try {
    const Devis = require('../models/Devis');
    const Contrat = require('../models/Contrat');
    const Message = require('../models/Message');
    const User = require('../models/User');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) return;

    // Rappels devis en attente depuis 3 jours
    const il3jours = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const devisEnAttente = await Devis.find({ statut: 'envoye', createdAt: { $lte: il3jours } })
      .populate('client', '_id').populate('artisan', '_id');

    for (const d of devisEnAttente) {
      await Message.create({
        expediteur: admin._id,
        destinataire: d.client._id,
        contenu: `📢 Rappel : Vous avez un devis en attente de reponse "${d.titre}". Il expire bientot.`
      });
    }

    // Rappels contrats non signes depuis 2 jours
    const il2jours = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const contratsEnAttente = await Contrat.find({ statut: 'en_attente_signatures', createdAt: { $lte: il2jours } })
      .populate('employeur', '_id').populate('technicien', '_id');

    for (const c of contratsEnAttente) {
      if (!c.signatureEmployeur?.signe) {
        await Message.create({
          expediteur: admin._id,
          destinataire: c.employeur._id,
          contenu: `📢 Rappel : Le contrat ${c.numeroContrat} attend votre signature.`
        });
      }
      if (!c.signatureTechnicien?.signe) {
        await Message.create({
          expediteur: admin._id,
          destinataire: c.technicien._id,
          contenu: `📢 Rappel : Le contrat ${c.numeroContrat} attend votre signature.`
        });
      }
    }

    console.log('✅ Rappels automatiques envoyes');
  } catch(err) {
    console.error('Erreur rappels:', err.message);
  }
};

module.exports = { lancerTousLesRappels };
