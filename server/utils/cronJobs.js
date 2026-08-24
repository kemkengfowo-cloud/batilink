const cron = require('node-cron');
const DemandeConducteur = require('../models/DemandeConducteur');
const { sendEmail } = require('./emails');

// Expire les offres non repondues apres 48h — tourne toutes les heures
cron.schedule('0 * * * *', async () => {
  try {
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const demandes = await DemandeConducteur.find({
      'offres.statut': 'envoyee',
      'offres.dateEnvoi': { $lt: limite48h }
    }).populate('offres.conducteur', 'name email');

    let totalExpires = 0;
    for (const demande of demandes) {
      let modifie = false;
      for (const offre of demande.offres) {
        if (offre.statut === 'envoyee' && offre.dateEnvoi < limite48h) {
          offre.statut = 'expiree';
          modifie = true;
          totalExpires++;
          // Email au conducteur
          if (offre.conducteur && offre.conducteur.email) {
            sendEmail({
              to: offre.conducteur.email,
              subject: 'OFFRE - Expiration mission BYH',
              html: '<p>Bonjour ' + offre.conducteur.name + ', votre offre pour la mission "' + demande.titreChantier + '" a expire car vous n avez pas repondu dans les 48h. Connectez-vous pour voir les nouvelles missions disponibles.</p>'
            }).catch(e => console.error('Email expiration:', e.message));
          }
        }
      }
      if (modifie) {
        // Si toutes les offres sont expirees/refusees, remettre en attente
        const offresActives = demande.offres.filter(o => o.statut === 'envoyee' || o.statut === 'acceptee');
        if (offresActives.length === 0 && demande.statut === 'offres_envoyees') {
          demande.statut = 'en_attente';
          console.log('Demande remise en attente:', demande.titreChantier);
        }
        await demande.save();
      }
    }
    if (totalExpires > 0) {
      console.log('[CRON] Offres expirees:', totalExpires);
    }
  } catch(err) {
    console.error('[CRON] Erreur expiration offres:', err.message);
  }
});

console.log('Cron jobs BYH demarres');
