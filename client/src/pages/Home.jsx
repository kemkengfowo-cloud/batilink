import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ArtisanCard from '../components/ArtisanCard';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const METIERS = ['Plombier','Électricien','Maçon','Peintre','Menuisier','Carreleur','Couvreur','Climatiseur'];

export default function Home() {
  const { user } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/artisans?limit=6'), api.get('/projects?limit=4')])
      .then(([a, p]) => { setArtisans(a.data.artisans); setProjects(p.data.projects); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-earth-900 via-earth-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fb923c 0%, transparent 50%)'}}></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/20 border border-brand-500/30 rounded-full text-brand-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
              Plateforme #1 au Cameroun 🇨🇲
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Trouvez un artisan <span className="text-brand-400">fiable</span> au Cameroun
            </h1>
            <p className="mt-6 text-lg text-earth-300 leading-relaxed">
              Connectez-vous avec des artisans qualifiés près de chez vous. Plombiers, électriciens, maçons, peintres… Publiez votre projet et recevez des offres rapidement.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {user?.role === 'client' ? (
                <Link to="/create-project" className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-brand transition-all text-center text-lg">
                  + Publier mon projet
                </Link>
              ) : (
                <Link to="/register" className="px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-brand transition-all text-center text-lg">
                  Commencer gratuitement
                </Link>
              )}
              <Link to="/artisans" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 transition-all text-center text-lg">
                Voir les artisans
              </Link>
            </div>
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm">
              {[['500+','Artisans'],['1200+','Projets'],['4.8★','Note moy.']].map(([v,l]) => (
                <div key={l}>
                  <p className="text-2xl font-display font-bold text-white">{v}</p>
                  <p className="text-xs text-earth-400 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MÉTIERS */}
      <section className="py-12 bg-white border-b border-earth-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center text-sm font-semibold text-earth-400 uppercase tracking-widest mb-6">Tous les corps de métier</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {METIERS.map(m => (
              <Link key={m} to={`/artisans?metier=${m}`}
                className="px-4 py-2 bg-earth-50 hover:bg-brand-50 hover:text-brand-600 text-earth-600 rounded-full text-sm font-medium transition-colors border border-earth-200 hover:border-brand-200">
                {m}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ARTISANS */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-earth-900">Artisans récents</h2>
            <p className="text-earth-500 mt-1">Découvrez nos professionnels disponibles</p>
          </div>
          <Link to="/artisans" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors text-sm">
            Voir tous →
          </Link>
        </div>
        {loading ? <Loader/> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {artisans.map(a => <ArtisanCard key={a._id} artisan={a}/>)}
          </div>
        )}
      </section>

      {/* PROJETS */}
      {projects.length > 0 && (
        <section className="py-16 bg-earth-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-earth-900">Projets ouverts</h2>
                <p className="text-earth-500 mt-1">Des clients recherchent vos compétences</p>
              </div>
              <Link to="/projects" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors text-sm">Voir tous →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map(p => <ProjectCard key={p._id} project={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-earth-900">Vous êtes artisan ?</h2>
          <p className="mt-4 text-earth-500 text-lg">Créez votre profil gratuitement et recevez des demandes de projets directement.</p>
          <Link to="/register" className="mt-8 inline-block px-8 py-4 bg-earth-900 hover:bg-earth-800 text-white font-bold rounded-2xl transition-colors text-lg">
            Rejoindre Batilink
          </Link>
        </div>
      </section>
    </div>
  );
}
