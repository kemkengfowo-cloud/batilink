// Demander permission notifications navigateur
export const demanderPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Envoyer notification navigateur
export const envoyerNotification = (titre, corps, options = {}) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const notif = new Notification(titre, {
    body: corps,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: options.tag || 'batilink',
    requireInteraction: options.important || false,
    ...options
  });

  notif.onclick = () => {
    window.focus();
    if (options.url) window.location.href = options.url;
    notif.close();
  };

  // Fermer automatiquement après 5 secondes
  if (!options.important) {
    setTimeout(() => notif.close(), 5000);

cat > client/src/utils/notifications.js << 'EOF'
// Demander permission notifications navigateur
export const demanderPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Envoyer notification navigateur
export const envoyerNotification = (titre, corps, options = {}) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  
  const notif = new Notification(titre, {
    body: corps,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: options.tag || 'batilink',
    requireInteraction: options.important || false,
    ...options
  });

  notif.onclick = () => {
    window.focus();
    if (options.url) window.location.href = options.url;
    notif.close();
  };

  // Fermer automatiquement après 5 secondes
  if (!options.important) {
    setTimeout(() => notif.close(), 5000);
  }
};

// Types de notifications
export const NOTIF_TYPES = {
  DEVIS_RECU:     { titre:'📄 Nouveau devis recu !', important: false },
  DEVIS_ACCEPTE:  { titre:'✅ Devis accepte !', important: true },
  DEVIS_REFUSE:   { titre:'❌ Devis refuse', important: false },
  JALON_SOUMIS:   { titre:'🔨 Photos soumises pour validation', important: true },
  JALON_VALIDE:   { titre:'💰 Jalon valide — Paiement libere !', important: true },
  MESSAGE_RECU:   { titre:'💬 Nouveau message', important: false },
  LITIGE_OUVERT:  { titre:'⚖️ Litige ouvert', important: true },
  VISITE_DISPO:   { titre:'🔍 Visite disponible dans votre ville', important: false },
  VISITE_RAPPORT: { titre:'📋 Rapport de visite disponible', important: true },
  CONTRAT_SIGNE:  { titre:'✍️ Contrat signe', important: true },
};
