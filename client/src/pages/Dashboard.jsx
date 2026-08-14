import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { getAvatarUrl, formatBudget, renderStars, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ projects:[], missions:[], artisan:null, entreprise:null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
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
                <h1 className="text-2xl font-display font-bold text-gray-900">Bonjour, {user.name.split(' ')[0]} 👋</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role==='client'?'bg-blue-100 text-blue-700':user.role==='artisan'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>
                  {user.role==='client'?'🏠 Client':user.role==='artisan'?'🔨 Technicien':'🏢 Entreprise BTP'}
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm">{user.city} • {user.email}</p>
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
  const safeProjects = Array.isArray(projects) ? projects : [];
  const stats = [
    { label:'Projets publiés', value:safeProjects.length, icon:'📋', color:'bg-blue-50 text-blue-700' },
    { label:'Projets ouverts', value:safeProjects.filter(p=>p.statut==='ouvert').length, icon:'🟢', color:'bg-green-50 text-green-700' },
    { label:'En cours', value:safeProjects.filter(p=>p.statut==='en_cours').length, icon:'⚡', color:'bg-yellow-50 text-yellow-700' },
    { label:'Budget total', value:formatBudget(safeProjects.reduce((s,p)=>s+(p.budget||0),0)), icon:'💰', color:'bg-purple-50 text-purple-700' },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-display font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">Mes demandes</h2>
        <Link to="/create-project" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-600/20">+ Nouvelle demande</Link>
      </div>
      {safeProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune demande publiée</h3>
          <p className="text-gray-400 mb-8">Publiez votre premier projet pour recevoir des offres</p>
          <Link to="/create-project" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Publier une demande</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeProjects.map(p=><ProjectCard key={p._id} project={p}/>)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
cat > client/src/pages/Dashboard.jsx << 'JSEOF'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { getAvatarUrl, formatBudget, renderStars, formatDate } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ projects:[], missions:[], artisan:null, entreprise:null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
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
                <h1 className="text-2xl font-display font-bold text-gray-900">Bonjour, {user.name.split(' ')[0]} 👋</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role==='client'?'bg-blue-100 text-blue-700':user.role==='artisan'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>
                  {user.role==='client'?'🏠 Client':user.role==='artisan'?'🔨 Technicien':'🏢 Entreprise BTP'}
                </span>
              </div>
              <p className="text-gray-500 mt-1 text-sm">{user.city} • {user.email}</p>
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
  const safeProjects = Array.isArray(projects) ? projects : [];
  const stats = [
    { label:'Projets publiés', value:safeProjects.length, icon:'📋', color:'bg-blue-50 text-blue-700' },
    { label:'Projets ouverts', value:safeProjects.filter(p=>p.statut==='ouvert').length, icon:'🟢', color:'bg-green-50 text-green-700' },
    { label:'En cours', value:safeProjects.filter(p=>p.statut==='en_cours').length, icon:'⚡', color:'bg-yellow-50 text-yellow-700' },
    { label:'Budget total', value:formatBudget(safeProjects.reduce((s,p)=>s+(p.budget||0),0)), icon:'💰', color:'bg-purple-50 text-purple-700' },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-display font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-gray-900">Mes demandes</h2>
        <Link to="/create-project" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-600/20">+ Nouvelle demande</Link>
      </div>
      {safeProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune demande publiée</h3>
          <p className="text-gray-400 mb-8">Publiez votre premier projet pour recevoir des offres</p>
          <Link to="/create-project" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Publier une demande</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeProjects.map(p=><ProjectCard key={p._id} project={p}/>)}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/artisans" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🔨</div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Trouver un artisan</h3>
              <p className="text-gray-400 text-sm">Parcourez notre réseau de techniciens vérifiés</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-blue-400">→</span>
          </div>
        </Link>
        <Link to="/entreprises" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">🏢</div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Entreprises BTP</h3>
              <p className="text-gray-400 text-sm">Pour vos grands travaux de construction</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-blue-400">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

function ArtisanDashboard({ artisan, projects, missions }) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeMissions = Array.isArray(missions) ? missions : [];
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-gray-900 mb-3">Mon profil technicien</h2>
            {artisan ? (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{artisan.metier}</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">📍 {artisan.ville}</span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold">{renderStars(artisan.note)} {artisan.note?.toFixed(1)}</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${artisan.disponible?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                  {artisan.disponible?'● Disponible':'○ Occupé'}
                </span>
              </div>
            ) : <p className="text-gray-400">Complétez votre profil pour être visible</p>}
          </div>
          <Link to="/profile" className="px-5 py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm">
            {artisan ? 'Modifier profil' : 'Créer profil'}
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Missions disponibles</h2>
          <Link to="/missions" className="text-blue-600 font-semibold text-sm hover:text-blue-700">Voir toutes →</Link>
        </div>
        {safeMissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="text-4xl mb-3">👷</div>
            <p className="text-gray-400 text-sm">Aucune mission disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeMissions.map(m=>(
              <div key={m._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex flex-wrap gap-1 mb-3">
                  {(m.typePersonnel||[]).map(t=>(
                    <span key={t} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{t}</span>
                  ))}
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-1">{m.titre}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{m.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{formatBudget(m.remuneration)}<span className="text-xs text-gray-400 font-normal">/{m.duree}</span></p>
                    <p className="text-xs text-gray-400">📍 {m.localisation}</p>
                  </div>
                  <Link to={`/missions/${m._id}`} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Postuler</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Projets clients</h2>
          <Link to="/projects" className="text-blue-600 font-semibold text-sm hover:text-blue-700">Voir tous →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeProjects.slice(0,4).map(p=><ProjectCard key={p._id} project={p}/>)}
        </div>
      </div>
    </div>
  );
}

function EntrepriseDashboard({ entreprise, missions }) {
  const safeMissions = Array.isArray(missions) ? missions : [];
  const stats = [
    { label:'Missions publiées', value:safeMissions.length, icon:'📋', color:'bg-blue-50 text-blue-700' },
    { label:'Ouvertes', value:safeMissions.filter(m=>m.statut==='ouverte').length, icon:'🟢', color:'bg-green-50 text-green-700' },
    { label:'En cours', value:safeMissions.filter(m=>m.statut==='en_cours').length, icon:'⚡', color:'bg-yellow-50 text-yellow-700' },
    { label:'Budget total', value:formatBudget(safeMissions.reduce((s,m)=>s+(m.remuneration||0),0)), icon:'💰', color:'bg-purple-50 text-purple-700' },
  ];
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-gray-900 mb-2">Mon profil entreprise</h2>
            {entreprise ? (
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold">🏢 {entreprise.nomEntreprise}</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">📍 {entreprise.ville}</span>
                {entreprise.verifie && <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold">✓ Vérifiée</span>}
                {(entreprise.lotsTravauxPropose||[]).slice(0,2).map(l=>(
                  <span key={l} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">{l}</span>
                ))}
              </div>
            ) : <p className="text-gray-400">Complétez votre profil entreprise</p>}
          </div>
          <Link to="/profile" className="px-5 py-2.5 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm">
            {entreprise ? 'Modifier profil' : 'Créer profil'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <p className="text-2xl font-display font-bold text-gray-900">{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/create-mission" className="bg-blue-600 rounded-2xl p-6 text-white hover:bg-blue-700 transition-colors group">
          <div className="text-3xl mb-3">👷</div>
          <h3 className="font-display font-bold text-lg mb-1">Louer du personnel</h3>
          <p className="text-blue-200 text-sm">Coffreur, Ferrailleur, Manœuvre, Dalleur...</p>
          <div className="mt-4 text-blue-200 font-semibold text-sm">Publier une mission →</div>
        </Link>
        <Link to="/artisans" className="bg-white rounded-2xl border-2 border-blue-200 p-6 hover:bg-blue-50 transition-colors group">
          <div className="text-3xl mb-3">🔨</div>
          <h3 className="font-display font-bold text-lg text-gray-900 mb-1">Trouver un technicien</h3>
          <p className="text-gray-500 text-sm">Parcourez notre réseau de techniciens</p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">Voir les techniciens →</div>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-gray-900">Mes missions</h2>
          <Link to="/create-mission" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">+ Nouvelle mission</Link>
        </div>
        {safeMissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">👷</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune mission publiée</h3>
            <p className="text-gray-400 mb-8">Publiez une mission pour trouver du personnel</p>
            <Link to="/create-mission" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Publier une mission</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeMissions.map(m=>(
              <div key={m._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="flex flex-wrap gap-1 mb-3">
                  {(m.typePersonnel||[]).slice(0,2).map(t=>(
                    <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{t}</span>
                  ))}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ml-auto ${m.statut==='ouverte'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>
                    {m.statut==='ouverte'?'Ouverte':m.statut}
                  </span>
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-1">{m.titre}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{m.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{formatBudget(m.remuneration)}<span className="text-xs text-gray-400 font-normal">/{m.duree}</span></p>
                    <p className="text-xs text-gray-400">{m.candidatures?.length||0} candidature(s)</p>
                  </div>
                  <Link to={`/missions/${m._id}`} className="px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors">Détails</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
