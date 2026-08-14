export const formatBudget = (n) => n ? new Intl.NumberFormat('fr-FR').format(n) + ' FCFA' : '—';
export const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '';
export const getWhatsAppLink = (phone, msg='') => `https://wa.me/${phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
export const getAvatarUrl = (avatar, name='') => {
  if (avatar?.startsWith('/uploads')) return `${process.env.REACT_APP_API_URL || ''}${avatar}`;
  if (avatar?.startsWith('http')) return avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563EB&color=fff&bold=true&size=128`;
};
export const getImageUrl = (p) => p?.startsWith('/uploads') ? `${process.env.REACT_APP_API_URL || ''}${p}` : p;
export const renderStars = (note) => Array.from({length:5},(_,i) => i < Math.round(note||0) ? '★':'☆').join('');

export const CATEGORIES = [
  'Maçonnerie','Plomberie','Électricité','Peinture','Menuiserie',
  'Carrelage','Toiture','Climatisation','Soudure','Jardinage',
  'Nettoyage','Déménagement','Coffreur','Ferrailleur','Dalleur','Autre'
];

export const VILLES = [
  'Yaoundé','Douala','Bafoussam','Bamenda','Garoua',
  'Maroua','Ngaoundéré','Bertoua','Ebolowa','Kribi','Limbé',
  'Edéa','Nkongsamba','Foumban','Kumba','Buea','Sangmélima'
];
