import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { getAvatarUrl, formatBudget, renderStars } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'client') {
      api.get('/projects/my').then(res => setData({ projects: res.data })).finally(()=>setLoading(false));
    } else {
      Promise.all([api.get('/artisans/me'), api.get('/projects?limit=5')])
        .then(([a, p]) => setData({ artisan: a.data, projects: p.data.projects }))
        .finally(()=>setLoading(false));
    }
  }, [user]);

  if (!user || loading) return <Loader/>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-earth-900 to-earth-800 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"/>
          <div>
            <p className="text-earth-300 text-sm font-medium">Bonjour 👋</p>
            <h1 className="text-2xl font-display font-bold">{user.name}</h1>
            <span className="mt-1 inline-block px-3 py-0.5 bg-brand-500/30 border border-brand-400/40 text-brand-300 rounded-full text-xs font-semibold capitalize">
              {user.role === 'artisan' ? '🔨 Artisan' : '🏠 Client'}
            </span>
          </div>
        </div>
      </div>

      {user.role === 'client' ? (
        <ClientDashboard projects={data?.projects || []} />
      ) : (
        <ArtisanDashboard artisan={data?.artisan} projects={data?.projects || []} />
      )}
    </div>
  );
}

function ClientDashboard({ projects }) {
  const stats = [
    { label: 'Projets publiés', value: projects.length, icon: '📋' },
    { label: 'Projets ouverts', value: projects.filter(p=>p.statut==='ouvert').length, icon: '🟢' },
    { label: 'Budget total', value: formatBudget(projects.reduce((s,p)=>s+p.budget,0)), icon: '💰' },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-display font-bold text-earth-900">{s.value}</p>
            <p className="text-earth-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-earth-900">Mes projets</h2>
        <Link to="/create-project" className="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-brand transition-colors text-sm">+ Nouveau projet</Link>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-display font-bold text-earth-700">Aucun projet publié</h3>
          <p className="text-earth-400 mt-2 mb-6">Publiez votre premier projet pour recevoir des offres</p>
          <Link to="/create-project" className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-brand transition-colors">Publier un projet</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => <ProjectCard key={p._id} project={p}/>)}
        </div>
      )}
    </div>
  );
}

function ArtisanDashboard({ artisan, projects }) {
  return (
    <div className="space-y-8">
      {/* Profil rapide */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-earth-900 mb-1">Mon profil artisan</h2>
            {artisan ? (
              <div className="flex flex-wrap gap-3 mt-3 text-sm">
                <span className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full font-medium">{artisan.metier}</span>
                <span className="px-3 py-1.5 bg-earth-100 text-earth-700 rounded-full font-medium">📍 {artisan.ville}</span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full font-medium">{renderStars(artisan.note)} {artisan.note.toFixed(1)}</span>
                <span className={`px-3 py-1.5 rounded-full font-medium ${artisan.disponible?'bg-green-50 text-green-700':'bg-earth-100 text-earth-500'}`}>
                  {artisan.disponible ? '● Disponible' : '○ Occupé'}
                </span>
              </div>
            ) : (
              <p className="text-earth-400 mt-2">Complétez votre profil pour être visible</p>
            )}
          </div>
          <Link to="/profile" className="px-5 py-2.5 border-2 border-earth-200 text-earth-700 rounded-xl font-semibold hover:border-brand-300 hover:text-brand-600 transition-colors text-sm">
            {artisan ? 'Modifier profil' : 'Créer profil'}
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-earth-900">Projets disponibles</h2>
          <Link to="/projects" className="text-brand-600 font-semibold text-sm hover:text-brand-700">Voir tous →</Link>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-earth-500">Aucun projet disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map(p => <ProjectCard key={p._id} project={p}/>)}
          </div>
        )}
      </div>
    </div>
  );
}
