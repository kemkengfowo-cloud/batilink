import React from 'react';

const BADGES = {
  verifie: {
    label: 'Vérifié',
    icon: '✓',
    bg: 'bg-blue-500',
    text: 'text-white',
    border: 'border-blue-600',
    title: 'Compte vérifié par Batilink'
  },
  complet: {
    label: 'Profil complet',
    icon: '★',
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-600',
    title: 'Profil 100% complété'
  },
  topRated: {
    label: 'Top prestataire',
    icon: '⭐',
    bg: 'bg-amber-500',
    text: 'text-white',
    border: 'border-amber-600',
    title: 'Note supérieure à 4.5 avec plus de 5 avis'
  },
  premium: {
    label: 'Premium',
    icon: '👑',
    bg: 'bg-purple-600',
    text: 'text-white',
    border: 'border-purple-700',
    title: 'Partenaire premium Batilink'
  }
};

export default function Badge({ type, size = 'sm' }) {
  const badge = BADGES[type];
  if (!badge) return null;

  const sizeClass = size === 'lg'
    ? 'px-3 py-1.5 text-sm gap-1.5'
    : 'px-2 py-0.5 text-xs gap-1';

  return (
    <span title={badge.title}
      className={`inline-flex items-center ${sizeClass} ${badge.bg} ${badge.text} border ${badge.border} rounded-full font-bold shadow-sm`}>
      <span>{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}

export function BadgeList({ badges = {}, size = 'sm' }) {
  if (!badges) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.verifie && <Badge type="verifie" size={size}/>}
      {badges.complet && <Badge type="complet" size={size}/>}
      {badges.topRated && <Badge type="topRated" size={size}/>}
      {badges.premium && <Badge type="premium" size={size}/>}
    </div>
  );
}
