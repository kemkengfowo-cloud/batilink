import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { getAvatarUrl, formatBudget, renderStars, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ projects:[], missions:[], artisan:null, entreprise:null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') { navigate('/admin'); return; }
    if (user.role === 'client') {
      api.get('/projects/my')
        .then(res => setData({ projects: res.data || [], missions:[], artisan:null, entreprise:null }))
        .catch(() => setData({ projects:[], missions:[], artisan:null, entreprise:null }))
        .finally(() => setLoading(false));
    } else if (user.role === 'artisan') {
      Promise.allSettled([api.get('/artisans/me'), api.get('/projects?limit=6'), api.get('/missions?limit=4')])
        .then(([a, p, m]) => setData({
          artisan: a.status==='fulfilled' ? a.value.data : null,
          projects: p.status==='fulfilled' ? (p.value.data.projects || []) : [],
          missions: m.status==='fulfilled' ? (m.value.data.missions || []) : [],
          entreprise: null
        }))
        .finally(() => setLoading(false));
    } else if (user.role === 'entreprise') {
      Promise.allSettled([api.get('/entreprises/me'), api.get('/missions/my')])
        .then(([e, m]) => setData({
          entreprise: e.status==='fulfilled' ? e.value.data : null,
          missions: m.status==='fulfilled' ? (m.value.data || []) : [],
          projects: [],
          artisan: null
        }))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user || loading) return <Loader/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-100"/>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-gray-900">Bonjour, {user.name.split(' ')[0]}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role==='client'?'bg-blue-100 text-blue-700':user.role==='artisan'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>
                  {user.role==='client'?'Client':user.role==='artisan'?'Technicien':'Entreprise BTP'}
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm">{user.city} - {user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {user.role === 'client' && <ClientDashboard projects={data.projects}/>}
        {user.role === 'artisan' && <ArtisanDashboard artisan={data.artisan} projects={data.projects} missions={data.missions}/>}
        {user.role === 'entreprise' && <EntrepriseDashboard entreprise={data.entreprise} missions={data.missions}/>}
      </div>
    </div>
  );
}

function ClientDashboard({ projects }) {
  const p = Array.isArray(projects) ? projects : [];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Projets', value:p.length, icon:'📋', color:'bg-blue-50 text-blue-700' },
          { label:'Ouverts', value:p.filter(x=>x.statut==='ouvert').length, icon:'🟢', color:'bg-green-50 text-green-700' },
          { label:'En cours', value:p.filter(x=>x.statut==='en_cours').length, icon:'⚡', color:'bg-yellow-50 text-yellow-700' },
          { label:'Budget', value:formatBudget(p.reduce((s,x)=>s+(x.budget||0),0)), icon:'💰', color:'bg-purple-50 text-purple-700' },
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-display font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">Mes demandes</h2>
        <Link to="/create-project" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 text-sm">+ Nouvelle demande</Link>
      </div>
      {p.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune demande</h3>
          <p className="text-gray-400 mb-8">Publiez votre premier projet</p>
          <Link to="/create-project" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold">Publier</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {p.map(x=><ProjectCard key={x._id} project={x}/>)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/artisans" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🔨</div>
            <div>
              <h3 className="font-bold text-gray-900">Trouver un artisan</h3>
              <p className="text-gray-400 text-sm">Techniciens verifies</p>
            </div>
            <span className="ml-auto text-gray-300">→</span>
          </div>
        </Link>
        <Link to="/entreprises" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">🏢</div>
            <div>
              <h3 className="font-bold text-gray-900">Entreprises BTP</h3>
              <p className="text-gray-400 text-sm">Grands travaux</p>
            </div>
            <span className="ml-auto text-gray-300">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function ArtisanDashboard({ artisan, projects, missions }) {
  const p = Array.isArray(projects) ? projects : [];
  const m = Array.isArray(missions) ? missions : [];
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-gray-900 mb-3">Mon profil technicien</h2>
            {artisan ? (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{artisan.metier}</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">📍 {artisan.ville}</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${artisan.disponible?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                  {artisan.disponible?'Disponible':'Occupe'}
                </span>
              </div>
            ) : <p className="text-gray-400">Completez votre profil</p>}
          </div>
          <Link to="/profile" className="px-5 py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm">Modifier profil</Link>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Missions disponibles</h2>
          <Link to="/missions" className="text-blue-600 font-semibold text-sm">Voir toutes →</Link>
        </div>
        {m.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="text-4xl mb-3">👷</div>
            <p className="text-gray-400 text-sm">Aucune mission disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {m.map(x=>(
              <div key={x._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-wrap gap-1 mb-3">
                  {(x.typePersonnel||[]).map(t=><span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{t}</span>)}
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-1">{x.titre}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{x.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-600">{formatBudget(x.remuneration)}</p>
                  <Link to={`/missions/${x._id}`} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Postuler</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Projets clients</h2>
          <Link to="/projects" className="text-blue-600 font-semibold text-sm">Voir tous →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {p.slice(0,4).map(x=><ProjectCard key={x._id} project={x}/>)}
        </div>
      </div>
    </div>
  );
}

function EntrepriseDashboard({ entreprise, missions }) {
  const m = Array.isArray(missions) ? missions : [];
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-gray-900 mb-2">Mon profil entreprise</h2>
            {entreprise ? (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold">🏢 {entreprise.nomEntreprise}</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">📍 {entreprise.ville}</span>
              </div>
            ) : <p className="text-gray-400">Completez votre profil</p>}
          </div>
          <Link to="/profile" className="px-5 py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm">Modifier</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/contrats/creer" className="bg-white rounded-2xl border-2 border-blue-200 p-6 hover:bg-blue-50 transition-colors">
          <div className="text-3xl mb-3">✍️</div>
          <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Creer un contrat</h3>
          <p className="text-gray-500 text-sm">Location de personnel officielle</p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">Nouveau contrat →</div>
        </Link>
        <Link to="/create-mission" className="bg-blue-600 rounded-2xl p-6 text-white hover:bg-blue-700 transition-colors">
          <div className="text-3xl mb-3">👷</div>
          <h3 className="font-display font-bold text-lg mb-1">Louer du personnel</h3>
          <p className="text-blue-200 text-sm">Coffreur, Ferrailleur, Manoeuvre</p>
          <div className="mt-4 text-blue-200 font-semibold text-sm">Publier une mission →</div>
        </Link>
        <Link to="/artisans" className="bg-white rounded-2xl border-2 border-blue-200 p-6 hover:bg-blue-50 transition-colors">
          <div className="text-3xl mb-3">🔨</div>
          <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Trouver un technicien</h3>
          <p className="text-gray-500 text-sm">Notre reseau de techniciens</p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">Voir les techniciens →</div>
        </Link>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Mes missions</h2>
          <Link to="/create-mission" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm">+ Nouvelle</Link>
        </div>
        {m.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">👷</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune mission</h3>
            <Link to="/create-mission" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold">Publier</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {m.map(x=>(
              <div key={x._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-display font-bold text-gray-900 mb-1">{x.titre}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{x.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-blue-600">{formatBudget(x.remuneration)}</p>
                  <Link to={`/missions/${x._id}`} className="px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-xl text-sm font-semibold">Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
