import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ArtisanCard from '../components/ArtisanCard';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artisans, setArtisans] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/artisans?limit=6'), api.get('/projects?limit=4')])
      .then(([a, p]) => { setArtisans(a.data.artisans); setProjects(p.data.projects); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{background: 'linear-gradient(135deg, #0a1628 0%, #0d2044 40%, #0a3272 70%, #1a4a8a 100%)'}}>
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-semibold tracking-widest uppercase">Cameroun · BTP</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-[1.05] mb-8">
              Le bon technicien,{' '}
              <span className="text-blue-400">vérifié,</span>{' '}
              près de chez vous.
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-12 max-w-2xl opacity-90">
              Batilink relie les particuliers aux techniciens du bâtiment vérifiés : décrivez votre besoin, recevez des devis, louez de la main-d'œuvre qualifiée et suivez votre chantier.
            </p>

            {/* 3 CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link to={user?.role === 'client' ? '/create-project' : '/register?role=client'}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-center text-lg transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
                Je suis un client
              </Link>
              <Link to={user?.role === 'artisan' ? '/dashboard' : '/register?role=artisan'}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center text-lg transition-all border border-white/20 backdrop-blur">
                Je suis un technicien
              </Link>
              <Link to="/artisans?type=entreprise"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center text-lg transition-all border border-white/20 backdrop-blur">
                Je suis une entreprise BTP
              </Link>
            </div>

            {/* Quote */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg backdrop-blur">
              <div className="text-blue-300 text-3xl mb-2">"</div>
              <p className="text-white/80 italic text-sm leading-relaxed">La qualité n'est jamais un accident : elle est toujours le résultat d'un effort intelligent.</p>
              <p className="text-blue-300 text-xs mt-3 font-semibold">— John Ruskin</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Découvrir</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[['500+','Artisans vérifiés'],['1200+','Projets réalisés'],['98%','Clients satisfaits'],['48h','Délai moyen']].map(([v,l]) => (
              <div key={l}>
                <p className="text-4xl font-display font-black mb-1">{v}</p>
                <p className="text-blue-200 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Nos services</span>
            <h2 className="text-4xl font-display font-black text-gray-900 mt-3">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Une plateforme complète pour tous vos projets de construction et rénovation au Cameroun</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon:'🏗️', title:'Travaux & Rénovation', desc:'Trouvez le bon artisan pour tous vos travaux : maçonnerie, plomberie, électricité, peinture...', color:'bg-blue-50 text-blue-600' },
              { icon:'👷', title:'Location de Personnel', desc:'Louez de la main-d\'œuvre qualifiée à la journée ou à la semaine pour vos chantiers.', color:'bg-indigo-50 text-indigo-600' },
              { icon:'🏢', title:'Solutions Entreprises', desc:'Gérez vos projets BTP à grande échelle avec des équipes complètes et des devis sur mesure.', color:'bg-sky-50 text-sky-600' },
            ].map(s => (
              <div key={s.title} className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl mb-6`}>{s.icon}</div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>En savoir plus</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="py-24" style={{background:'linear-gradient(135deg, #f8faff 0%, #eff4ff 100%)'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Simple & Rapide</span>
            <h2 className="text-4xl font-display font-black text-gray-900 mt-3">Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num:'01', title:'Décrivez votre projet', desc:'Expliquez vos besoins, votre budget et votre localisation.' },
              { num:'02', title:'Recevez des devis', desc:'Les artisans qualifiés vous contactent rapidement.' },
              { num:'03', title:'Choisissez l\'artisan', desc:'Comparez les profils, notes et réalisations.' },
              { num:'04', title:'Suivez votre chantier', desc:'Photos, messages et validation des étapes.' },
            ].map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-px bg-blue-200 z-0"></div>}
                <div className="relative z-10 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-display font-black text-xl mx-auto mb-5 shadow-lg shadow-blue-600/20">{s.num}</div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTISANS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Notre réseau</span>
              <h2 className="text-4xl font-display font-black text-gray-900 mt-2">Artisans disponibles</h2>
            </div>
            <Link to="/artisans" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
              Voir tous <span>→</span>
            </Link>
          </div>
          {loading ? <Loader/> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map(a => <ArtisanCard key={a._id} artisan={a}/>)}
            </div>
          )}
          <div className="md:hidden text-center mt-8">
            <Link to="/artisans" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Voir tous les artisans</Link>
          </div>
        </div>
      </section>

      {/* PROJETS */}
      {projects.length > 0 && (
        <section className="py-24" style={{background:'linear-gradient(135deg, #f8faff 0%, #eff4ff 100%)'}}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Opportunités</span>
                <h2 className="text-4xl font-display font-black text-gray-900 mt-2">Projets ouverts</h2>
              </div>
              <Link to="/projects" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">Voir tous <span>→</span></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map(p => <ProjectCard key={p._id} project={p}/>)}
            </div>
          </div>
        </section>
      )}

      {/* TEMOIGNAGES */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Témoignages</span>
            <h2 className="text-4xl font-display font-black text-gray-900 mt-3">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name:'Marie Nkomo', role:'Cliente, Yaoundé', text:'J\'ai trouvé un excellent carreleur en moins de 24h. Travail impeccable et prix honnête !', note:5 },
              { name:'Paul Fotso', role:'Maçon, Douala', text:'Batilink m\'a permis de tripler mon nombre de clients. La plateforme est simple et efficace.', note:5 },
              { name:'Entreprise SOBTP', role:'Entreprise BTP, Bafoussam', text:'Nous utilisons Batilink pour louer du personnel qualifié pour nos chantiers. Excellent service.', note:5 },
            ].map(t => (
              <div key={t.name} className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <div className="text-amber-400 text-xl mb-4">{'★'.repeat(t.note)}</div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 relative overflow-hidden"
        style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #1a4a8a 100%)'}}>
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize:'50px 50px'}}></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">Prêt à lancer votre projet ?</h2>
          <p className="text-blue-200 text-xl mb-12 max-w-2xl mx-auto">Rejoignez des centaines de clients et d'artisans qui font confiance à Batilink au Cameroun.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
              Commencer gratuitement
            </Link>
            <Link to="/artisans" className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-lg transition-all border border-white/20">
              Voir les artisans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
