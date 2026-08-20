const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    // Index Artisans - les plus importants pour la recherche
    await db.collection('artisans').createIndexes([
      { key: { ville: 1, metier: 1 }, name: 'byh_ville_metier', background: true },
      { key: { note: -1 }, name: 'byh_note', background: true },
      { key: { disponible: 1 }, name: 'byh_disponible', background: true },
      { key: { verifie: 1 }, name: 'byh_verifie', background: true },
    ]);

    // Index Projects
    await db.collection('projects').createIndexes([
      { key: { statut: 1, localisation: 1 }, name: 'byh_statut_loc', background: true },
      { key: { client: 1 }, name: 'byh_client', background: true },
      { key: { createdAt: -1 }, name: 'byh_created', background: true },
    ]);

    // Index Devis
    await db.collection('devis').createIndexes([
      { key: { client: 1, statut: 1 }, name: 'byh_client_statut', background: true },
      { key: { artisan: 1, statut: 1 }, name: 'byh_artisan_statut', background: true },
    ]);

    // Index Messages
    await db.collection('messages').createIndexes([
      { key: { expediteur: 1, destinataire: 1 }, name: 'byh_conv', background: true },
      { key: { createdAt: -1 }, name: 'byh_created', background: true },
    ]);

    // Index Entreprises
    await db.collection('entreprises').createIndexes([
      { key: { ville: 1 }, name: 'byh_ville', background: true },
      { key: { note: -1 }, name: 'byh_note', background: true },
    ]);

    console.log('✅ Index MongoDB B.Y.H créés avec succès');
  } catch(err) {
    if (err.code === 85 || err.code === 86) {
      console.log('ℹ️ Index déjà existants — OK');
    } else {
      console.error('❌ Erreur index:', err.message);
    }
  }
};

module.exports = { createIndexes };
