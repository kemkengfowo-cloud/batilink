const Historique = require('../models/Historique');
const geoip = require("geoip-lite");

const genMatricule = (userId) => {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth()+1).padStart(2,'0');
  const dd = String(date.getDate()).padStart(2,'0');
  const id = userId ? userId.toString().slice(-4).toUpperCase() : 'XXXX';
  const rand = Math.floor(Math.random()*9000+1000);
  return `BTL-${yy}${mm}${dd}-${id}-${rand}`;
};

const logAction = async ({ userId, nom, email, role, action, details={}, statut="succes", erreur="", ip="" }) => {
  const geo = geoip.lookup(ip);
  const ville = geo ? `${geo.city || ""} ${geo.country || ""}`.trim() : "Inconnu";
  try {
    await Historique.create({
      matricule: genMatricule(userId),
      utilisateur: { id: userId, nom, email, role },
      action,
      details: { ...details, ville },
      statut,
      erreur,
      ip
    });
  } catch(err) {
    console.error('Erreur log:', err.message);
  }
};

module.exports = { logAction };
