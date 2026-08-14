import React from 'react';
import { Link } from 'react-router-dom';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';

const STATUT_COLORS = { ouvert:'bg-green-50 text-green-700', en_cours:'bg-blue-50 text-blue-700', termine:'bg-gray-100 text-gray-500', annule:'bg-red-50 text-red-500' };
const STATUT_LABELS = { ouvert:'Ouvert', en_cours:'En cours', termine:'Terminé', annule:'Annulé' };

export default function ProjectCard({ project }) {
  const { titre, description, budget, localisation, categorie, statut, client, createdAt, vues } = project;
  return (
    <Link to={`/projects/${project._id}`} className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 p-5 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">{categorie}</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUT_COLORS[statut]}`}>{STATUT_LABELS[statut]}</span>
      </div>
      <h3 className="font-display font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{titre}</h3>
      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{description}</p>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-blue-600">{formatBudget(budget)}</p>
          <p className="text-xs text-gray-400 mt-0.5">📍 {localisation}</p>
        </div>
        {client && (
          <div className="flex items-center gap-2">
            <img src={getAvatarUrl(client.avatar, client.name)} alt={client.name} className="w-8 h-8 rounded-lg object-cover"/>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-gray-700">{client.name}</p>
              <p className="text-xs text-gray-400">{formatDate(createdAt)}</p>
            </div>
          </div>
        )}
      </div>
      {vues > 0 && <p className="mt-2 text-xs text-gray-300">{vues} vue{vues > 1 ? 's' : ''}</p>}
    </Link>
  );
}
