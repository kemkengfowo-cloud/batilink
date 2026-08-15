import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 40%, #0a3272 70%, #1a4a8a 100%)'}}>
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize:'50px 50px'}}></div>

        <div className="relative max-w-6xl mx-auto px-6 py-32 md:py-40">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm font-semibold tracking-widest uppercase">Cameroun · BTP</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight mb-8">
              Le bon technicien,{' '}
              <span className="text-blue-400">verifie,</span>{' '}
              pres de chez vous.
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-12 max-w-2xl opacity-90">
              Batilink connecte clients, artisans et entreprises BTP au Cameroun. Devis securise, paiement garanti, suivi photos.
            </p>

            {/* 3 CTA */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link to={user?.role==='client'?'/create-project':'/register?role=client'}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-center text-lg transition-all shadow-lg">
                Je suis un client
              </Link>
              <Link to={user?.role==='artisan'?'/dashboard':'/register?role=artisan'}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center text-lg transition-all border border-white/20 backdrop-blur">
                Je suis un technicien
              </Link>
              <Link to={user?.role==='entreprise'?'/dashboard':'/register?role=entreprise'}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center text-lg transition-all border border-white/20 backdrop-blur">
                Je suis une entreprise BTP
              </Link>
            </div>

            {/* Citation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-lg backdrop-blur">
              <div className="text-blue-300 text-3xl mb-2">"</div>
              <p className="text-white/80 italic text-sm leading-relaxed">La qualite n est jamais un accident : elle est toujours le resultat d un effort intelligent.</p>
              <p className="text-blue-300 text-xs mt-3 font-semibold">— John Ruskin</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Decouvrir</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent animate-pulse"></div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              ['500+','Artisans verifies'],
              ['1200+','Projets realises'],
              ['98%','Clients satisfaits'],
              ['48h','Delai moyen'],
            ].map(([v,l])=>(
              <div key={l}>
                <p className="text-4xl font-display font-black mb-1">{v}</p>
                <p className="text-blue-200 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 SERVICES */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Nos services</span>
            <h2 className="text-4xl font-display font-black text-gray-900 mt-3">Tout ce dont vous avez besoin</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Une plateforme complete pour tous vos projets de construction et renovation au Cameroun</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon:'🏗️',
                titre:'Travaux & Renovation',
                desc:'Trouvez le bon artisan pour tous vos travaux : maconnerie, plomberie, electricite, peinture. Devis securise et paiement garanti.',
                color:'bg-blue-50 text-blue-600',
                link:'/artisans',
                cta:'Trouver un artisan'
              },
              {
                icon:'👷',
                titre:'Location de Personnel',
                desc:'Louez de la main-d oeuvre qualifiee a la journee ou a la semaine. Coffreur, Ferrailleur, Dalleur, Macon disponibles.',
                color:'bg-indigo-50 text-indigo-600',
                link:'/missions',
                cta:'Voir les missions'
              },
              {
                icon:'🏢',
                titre:'Entreprises BTP',
                desc:'Pour vos grands travaux, faites appel a des entreprises certifiees. Gros oeuvre, finition, renovation et architecture.',
                color:'bg-sky-50 text-sky-600',
                link:'/entreprises',
                cta:'Voir les entreprises'
              },
            ].map(s=>(
              <div key={s.titre} className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center text-2xl mb-6`}>{s.icon}</div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{s.titre}</h3>
                <p className="text-gray-500 leading-relaxed mb-6">{s.desc}</p>
                <Link to={s.link} className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  {s.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROTECTION */}
      <section className="py-16" style={{background:'linear-gradient(135deg, #f8faff 0%, #eff4ff 100%)'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-gray-900">🔒 Votre protection avec Batilink</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'💳', titre:'Paiement securise', desc:'L argent est bloque et libere uniquement apres votre validation des travaux.'},
              {icon:'⏰', titre:'Delai de contestation', desc:'48h apres validation pour contester si les travaux ne sont pas conformes.'},
              {icon:'⚖️', titre:'Systeme de litige', desc:'En cas de probleme, l admin Batilink arbitre et decide sous 72h maximum.'},
            ].map(p=>(
              <div key={p.titre} className="bg-white rounded-2xl border border-blue-100 p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{p.titre}</h3>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center max-w-2xl mx-auto">
            ⚠️ Tout echange financier hors de la plateforme Batilink annule automatiquement toute protection.
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Temoignages</span>
            <h2 className="text-4xl font-display font-black text-gray-900 mt-3">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {name:'Marie Nkomo', role:'Cliente, Yaounde', text:'J ai trouve un excellent carreleur en moins de 24h. Travail impeccable et prix honnete. Je recommande vivement Batilink !'},
              {name:'Paul Fotso', role:'Macon, Douala', text:'Batilink m a permis de tripler mon nombre de clients. La plateforme est simple et le paiement est toujours garanti.'},
              {name:'SOBTP Sarl', role:'Entreprise BTP, Bafoussam', text:'Nous utilisons Batilink pour louer du personnel qualifie pour nos chantiers. Service excellent et contrats securises.'},
            ].map(t=>(
              <div key={t.name} className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <div className="text-amber-400 text-xl mb-4">★★★★★</div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
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
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-6">
            Pret a lancer votre projet ?
          </h2>
          <p className="text-blue-200 text-xl mb-12 max-w-2xl mx-auto">
            Inscription gratuite. Rejoignez des centaines de clients et artisans au Cameroun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register" className="px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-lg transition-all shadow-lg">
              Commencer gratuitement
            </Link>
            <Link to="/comment-ca-marche" className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-lg transition-all border border-white/20">
              Comment ca marche ?
            </Link>
          </div>
          <p className="text-blue-300 text-sm">
            Deja un compte ?{' '}
            <Link to="/login" className="text-white underline font-semibold">Se connecter</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
