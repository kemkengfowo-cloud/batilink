import React from 'react';
import { Link } from 'react-router-dom';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';

const STATUT_COLORS = {
  ouvert: 'bg-green-50 text-green-700',
  en_cours: 'bg-blue-50 text-blue-700',
  termine: 'bg-earth-100 text-earth-500',
  annule: 'bg-red-50 text-red-500',
};
const STATUT_LABELS = { ouvert:'Ouvert', en_cours:'En cours', termine:'Terminé', annule:'Annulé' };

export default function ProjectCard({ project }) {
  const { titre, description, budget, localisation, categorie, statut, client, createdAt, vues } = project;
  return (
    <Link to={`/projects/${project._id}`} className="block bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 p-5 group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full">{categorie}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUT_COLORS[statut]}`}>{STATUT_LABELS[statut]}</span>
      </div>
      <h3 className="font-display font-bold text-earth-900 text-lg leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">{titre}</h3>
      <p className="mt-2 text-sm text-earth-500 line-clamp-2">{description}</p>
      <div className="mt-4 pt-4 border-t border-earth-100 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-brand-600">{formatBudget(budget)}</p>
          <p className="text-xs text-earth-400 flex items-center gap-1 mt-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            {localisation}
          </p>
        </div>
        {client && (
          <div className="flex items-center gap-2">
            <img src={getAvatarUrl(client.avatar, client.name)} alt={client.name} className="w-8 h-8 rounded-lg object-cover"/>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-earth-700">{client.name}</p>
              <p className="text-xs text-earth-400">{formatDate(createdAt)}</p>
            </div>
          </div>
        )}
      </div>
      {vues > 0 && <p className="mt-2 text-xs text-earth-300">{vues} vue{vues > 1 ? 's' : ''}</p>}
    </Link>
  );
}
