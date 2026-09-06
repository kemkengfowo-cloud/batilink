import React from 'react';
import { Link } from 'react-router-dom';
import { getAvatarUrl, renderStars } from '../utils/helpers';
import { BadgeList } from './Badge';

export default function ArtisanCard({ artisan }) {
  const { user, metier, ville, description, note, nbAvis, disponible, badges, experience } = artisan;
  const name = user?.name || 'Artisan';

  return (
    <div className="card-premium overflow-hidden group">
      {/* Header coloré */}
      <div className="h-2 bg-blue-purple"/>

      <div className="p-5">
        {/* Avatar + infos */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img src={getAvatarUrl(user?.avatar, name)} alt={name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-100"/>
            {disponible && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"/>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-black text-slate-900 leading-tight">{name}</h3>
            <p className="text-blue-600 font-bold text-sm mt-0.5">{metier}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-amber-400 text-xs">{renderStars(note || 4)}</span>
                <span className="font-bold text-slate-700 text-xs">{(note || 4).toFixed(1)}</span>
                <span className="text-slate-300 text-xs">({nbAvis || 0} avis)</span>
              </span>
              <span className="text-slate-200">•</span>
              <span className="text-slate-500 text-xs font-medium">📍 {ville}</span>
            </div>
          </div>
          {disponible ? (
            <span className="flex-shrink-0 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
              ✓ Dispo
            </span>
          ) : (
            <span className="flex-shrink-0 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              Occupé
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{description}</p>
        )}

        {/* Badges */}
        {badges && Object.values(badges).some(Boolean) && (
          <div className="mb-4">
            <BadgeList badges={badges} size="sm"/>
          </div>
        )}

        {/* Expérience */}
        {experience && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
              🏆 {experience} ans d'expérience
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Link to={`/artisans/${artisan._id}`}
            className="flex-1 text-center py-2.5 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all">
            Voir profil →
          </Link>
        </div>
      </div>
    </div>
  );
}
