const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    // Index Users
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { role: 1 }, name: 'role_idx' },
      { key: { city: 1 }, name: 'city_idx' },
      { key: { matricule: 1 }, sparse: true, name: 'matricule_idx' },
    ]);

    // Index Artisans
    await db.collection('artisans').createIndexes([
      { key: { ville: 1 }, name: 'ville_idx' },
      { key: { metier: 1 }, name: 'metier_idx' },
      { key: { note: -1 }, name: 'note_idx' },
      { key: { disponible: 1 }, name: 'disponible_idx' },
      { key: { verifie: 1 }, name: 'verifie_idx' },
      { key: { ville: 1, metier: 1 }, name: 'ville_metier_compound' },
      { key: { user: 1 }, unique: true, name: 'user_unique' },
    ]);

    // Index Projects
    await db.collection('projects').createIndexes([
      { key: { statut: 1 }, name: 'statut_idx' },
      { key: { client: 1 }, name: 'client_idx' },
      { key: { localisation: 1 }, name: 'localisation_idx' },
      { key: { categorie: 1 }, name: 'categorie_idx' },
      { key: { createdAt: -1 }, name: 'createdAt_idx' },
      { key: { statut: 1, localisation: 1 }, name: 'statut_location_compound' },
    ]);

    // Index Devis
    await db.collection('devis').createIndexes([
      { key: { client: 1, statut: 1 }, name: 'client_statut_idx' },
      { key: { artisan: 1, statut: 1 }, name: 'artisan_statut_idx' },
      { key: { projet: 1 }, name: 'projet_idx' },
      { key: { createdAt: -1 }, name: 'createdAt_idx' },
    ]);

    // Index Messages
    await db.collection('messages').createIndexes([
      { key: { expediteur: 1, destinataire: 1 }, name: 'conv_idx' },
      { key: { destinataire: 1 }, name: 'destinataire_idx' },
      { key: { createdAt: -1 }, name: 'createdAt_idx' },
    ]);

    // Index Contrats
    await db.collection('contrats').createIndexes([
      { key: { client: 1 }, name: 'client_idx' },
      { key: { artisan: 1 }, name: 'artisan_idx' },
      { key: { statut: 1 }, name: 'statut_idx' },
    ]);

    // Index Entreprises
    await db.collection('entreprises').createIndexes([
      { key: { ville: 1 }, name: 'ville_idx' },
      { key: { lotsTravauxPropose: 1 }, name: 'lots_idx' },
      { key: { verifie: 1 }, name: 'verifie_idx' },
      { key: { note: -1 }, name: 'note_idx' },
    ]);

    // Index Litiges
    await db.collection('litiges').createIndexes([
      { key: { statut: 1 }, name: 'statut_idx' },
      { key: { createdAt: -1 }, name: 'createdAt_idx' },
    ]);

    // Index Notifications OTP
    await db.collection('otpcodes').createIndexes([
      { key: { contact: 1, type: 1 }, name: 'contact_type_idx' },
      { key: { expires: 1 }, expireAfterSeconds: 0, name: 'ttl_idx' },
    ]);

    console.log('✅ Tous les index MongoDB créés avec succès');
  } catch(err) {
    console.error('❌ Erreur création index:', err.message);
  }
};

module.exports = { createIndexes };
