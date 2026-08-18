export const demanderPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const envoyerNotification = (titre, corps, options = {}) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  const notif = new Notification(titre, {
    body: corps,
    icon: '/favicon.ico',
    tag: options.tag || 'byhome',
    requireInteraction: options.important || false,
  });
  notif.onclick = () => {
    window.focus();
    if (options.url) window.location.href = options.url;
    notif.close();
  };
  if (!options.important) setTimeout(() => notif.close(), 5000);
};

export const NOTIF_TYPES = {
  DEVIS_RECU:     { titre:'Nouveau devis recu !' },
  DEVIS_ACCEPTE:  { titre:'Devis accepte !' },
  DEVIS_REFUSE:   { titre:'Devis refuse' },
  JALON_SOUMIS:   { titre:'Photos soumises pour validation' },
  JALON_VALIDE:   { titre:'Jalon valide — Paiement libere !' },
  MESSAGE_RECU:   { titre:'Nouveau message' },
  LITIGE_OUVERT:  { titre:'Litige ouvert' },
  VISITE_DISPO:   { titre:'Visite disponible dans votre ville' },
  VISITE_RAPPORT: { titre:'Rapport de visite disponible' },
  CONTRAT_SIGNE:  { titre:'Contrat signe' },
};
