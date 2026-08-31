import React from 'react';
import { Link } from 'react-router-dom';
import { getAvatarUrl, getWhatsAppLink, renderStars } from '../utils/helpers';
import { BadgeList } from './Badge';

export default function ArtisanCard({ artisan }) {
  const { user, metier, ville, description, note, nbAvis, whatsapp, disponible, badges } = artisan;
  const name = user?.name || 'Artisan';
  const waMsg = `Bonjour ${name}, j'ai vu votre profil sur B.Y.H et je souhaite vous contacter.`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img src={getAvatarUrl(user?.avatar, name)} alt={name} className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100"/>
            {disponible && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-gray-900 leading-tight">{name}</h3>
                <p className="text-blue-600 font-semibold text-sm mt-0.5">{metier}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-sm">
                <span className="text-amber-400 text-xs">{renderStars(note||4)}</span>
                <span className="font-semibold text-gray-800 text-xs">{(note||4).toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({nbAvis||0})</span>
              </span>
              <span className="text-gray-200">•</span>
              <span className="text-gray-500 text-xs">📍 {ville}</span>
            </div>
            {badges && Object.values(badges).some(Boolean) && (
              <div className="mt-2">
                <BadgeList badges={badges} size="sm"/>
              </div>
            )}
          </div>
        </div>
        {description && <p className="mt-3 text-sm text-gray-500 line-clamp-2">{description}</p>}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <Link to={`/artisans/${artisan._id}`} className="flex-1 text-center px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-blue-300 hover:text-blue-600 transition-colors">
          Voir profil
        </Link>
      </div>
    </div>
  );
}
