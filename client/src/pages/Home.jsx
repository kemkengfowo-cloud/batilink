import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PHOTOS = {
  hero: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1920',
  stats: 'https://images.pexels.com/photos/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=1920',
  service1: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800',
  service2: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800',
  service3: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
};

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="bg-white">

      {/* HERO avec photo de fond */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Photo de fond */}
        <div className="absolute inset-0">
          <img src={PHOTOS.hero} alt="Chantier BTP" className="w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(13,32,68,0.88) 40%, rgba(26,74,138,0.75) 100%)'}}></div>
        </div>

        {/* Grille decorative */}
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
              BYHOME connecte clients, artisans et entreprises BTP au Cameroun. Devis securise, paiement garanti, suivi photos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
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

            {/* Badges confiance */}
            <div className="flex flex-wrap gap-6 text-blue-200 text-sm">
              <span className="flex items-center gap-2"><span className="text-green-400">✓</span> Paiement securise</span>
              <span className="flex items-center gap-2"><span className="text-blue-400">✓</span> Artisans verifies</span>
              <span className="flex items-center gap-2"><span className="text-amber-400">✓</span> Inscription gratuite</span>
              <span className="flex items-center gap-2"><span className="text-purple-400">✓</span> Support 24/7</span>
            </div>
          </div>
        </div>

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

      {/* 3 SERVICES avec photos */}
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
                photo: PHOTOS.service1,
                icon:'🏗️',
                titre:'Travaux & Renovation',
                desc:'Trouvez le bon artisan pour tous vos travaux. Devis securise et paiement garanti.',
                link:'/register',
                cta:'Trouver un artisan'
              },
              {
                photo: PHOTOS.service2,
                icon:'👷',
                titre:'Location de Personnel',
                desc:'Louez de la main-d oeuvre qualifiee. Coffreur, Ferrailleur, Dalleur disponibles.',
                link:'/register?role=entreprise',
                cta:'Voir les missions'
              },
              {
                photo: PHOTOS.service3,
                icon:'🏢',
                titre:'Entreprises BTP',
                desc:'Pour vos grands travaux, faites appel a des entreprises certifiees.',
                link:'/register',
                cta:'Voir les entreprises'
              },
            ].map(s=>(
              <div key={s.titre} className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Photo */}
                <div className="relative h-48 overflow-hidden">
                  <img src={s.photo} alt={s.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-4 left-4 text-3xl">{s.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{s.titre}</h3>
                  <p className="text-gray-500 leading-relaxed mb-6">{s.desc}</p>
                  <Link to={s.link} className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                    {s.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROTECTION */}
      <section className="py-16" style={{background:'linear-gradient(135deg, #f8faff 0%, #eff4ff 100%)'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-gray-900">🔒 Votre protection avec BYHOME</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'💳', titre:'Paiement securise', desc:'L argent est bloque et libere uniquement apres votre validation des travaux.'},
              {icon:'⏰', titre:'Delai de contestation', desc:'48h apres validation pour contester si les travaux ne sont pas conformes.'},
              {icon:'⚖️', titre:'Systeme de litige', desc:'En cas de probleme, l admin BYHOME arbitre et decide sous 72h maximum.'},
            ].map(p=>(
              <div key={p.titre} className="bg-white rounded-2xl border border-blue-100 p-6 text-center shadow-sm">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{p.titre}</h3>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center max-w-2xl mx-auto">
            ⚠️ Tout echange financier hors de la plateforme BYHOME annule automatiquement toute protection.
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
              {name:'Marie Nkomo', role:'Cliente, Yaounde', color:'bg-blue-600', text:'J ai trouve un excellent carreleur en moins de 24h. Travail impeccable et prix honnete. Je recommande vivement BYHOME !'},
              {name:'Paul Fotso', role:'Macon, Douala', color:'bg-green-600', text:'BYHOME m a permis de tripler mon nombre de clients. La plateforme est simple et le paiement est toujours garanti.'},
              {name:'SOBTP Sarl', role:'Entreprise BTP, Bafoussam', color:'bg-purple-600', text:'Nous utilisons BYHOME pour louer du personnel qualifie. Service excellent et contrats securises.'},
            ].map(t=>(
              <div key={t.name} className="p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all">
                <div className="text-amber-400 text-xl mb-4">★★★★★</div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>{t.name[0]}</div>
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

      {/* CTA FINAL avec photo de fond */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={PHOTOS.stats} alt="Construction" className="w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(13,32,68,0.88) 100%)'}}></div>
        </div>
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
