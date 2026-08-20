import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PHOTOS = {
  hero: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1920',
  artisan: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800',
  entreprise: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800',
  maison: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  chantier: 'https://images.pexels.com/photos/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

const STATS = [
  { num: '500+', label: 'Artisans vérifiés', icon: '🔨' },
  { num: '1200+', label: 'Projets réalisés', icon: '🏗️' },
  { num: '98%', label: 'Clients satisfaits', icon: '⭐' },
  { num: '10+', label: 'Villes couvertes', icon: '📍' },
];

const SERVICES = [
  {
    icon: '🔨',
    titre: 'Artisans Qualifiés',
    desc: 'Maçons, électriciens, plombiers, carreleurs — tous vérifiés et notés par notre équipe B.Y.H.',
    photo: PHOTOS.artisan,
    lien: '/artisans',
    btnLabel: 'Trouver un artisan',
    color: 'from-blue-600 to-blue-800',
  },
  {
    icon: '🏢',
    titre: 'Entreprises BTP',
    desc: 'Pour vos projets d\'envergure — géotechnique, gros œuvre, finition — faites appel aux meilleurs.',
    photo: PHOTOS.entreprise,
    lien: '/entreprises',
    btnLabel: 'Voir les entreprises',
    color: 'from-purple-600 to-purple-800',
  },
  {
    icon: '🏠',
    titre: 'Votre Projet',
    desc: 'Publiez votre projet, recevez des devis comparatifs et choisissez en toute confiance.',
    photo: PHOTOS.maison,
    lien: '/create-project',
    btnLabel: 'Publier un projet',
    color: 'from-emerald-600 to-emerald-800',
  },
];

const ETAPES = [
  { num: '01', titre: 'Publiez votre projet', desc: 'Décrivez vos travaux, votre budget et votre ville en quelques minutes.', icon: '📋' },
  { num: '02', titre: 'Recevez des devis', desc: 'Des artisans qualifiés vous contactent avec leurs meilleures offres.', icon: '📄' },
  { num: '03', titre: 'Choisissez & Contractez', desc: 'Comparez les devis, signez votre contrat et suivez les travaux en temps réel.', icon: '✅' },
  { num: '04', titre: 'Validez & Évaluez', desc: 'Validez les jalons, effectuez le paiement sécurisé et laissez un avis.', icon: '⭐' },
];

const TEMOIGNAGES = [
  { nom: 'Marie K.', ville: 'Yaoundé', role: 'Cliente', texte: 'J\'ai trouvé un excellent électricien en 24h. Le suivi par jalons m\'a rassuré tout au long des travaux.', note: 5 },
  { nom: 'Jean B.', ville: 'Douala', role: 'Client', texte: 'La comparaison des devis m\'a permis d\'économiser 15% sur ma rénovation. Service impeccable !', note: 5 },
  { nom: 'Paul M.', ville: 'Bafoussam', role: 'Client', texte: 'Mon projet de construction a été suivi professionnellement. Je recommande B.Y.H à tous.', note: 5 },
];

const FAQ = [
  { q: 'Comment B.Y.H vérifie-t-il les artisans ?', r: 'Chaque artisan passe par une vérification d\'identité, de compétences et d\'antécédents avant d\'être publié sur la plateforme.' },
  { q: 'Comment sont sécurisés les paiements ?', r: 'Les paiements sont effectués via Mobile Money (Orange Money, MTN MoMo) et sécurisés par notre système de jalons progressifs.' },
  { q: 'Que se passe-t-il en cas de litige ?', r: 'B.Y.H dispose d\'une équipe d\'arbitrage dédiée qui intervient rapidement pour résoudre tout différend entre clients et artisans.' },
  { q: 'Combien coûte l\'utilisation de B.Y.H ?', r: 'L\'inscription et la publication de projets sont gratuites. B.Y.H prélève une commission de 10% uniquement sur les transactions finalisées.' },
];

export default function Home() {
  const { user } = useAuth();
  const [faqOpen, setFaqOpen] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className="bg-white overflow-hidden">

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={PHOTOS.hero} alt="Chantier BTP Cameroun" className="w-full h-full object-cover"/>
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,22,40,0.93) 0%, rgba(13,32,68,0.88) 40%, rgba(26,74,138,0.72) 100%)'}}/>
        </div>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize:'60px 60px'}}/>

        <div className={`relative z-10 max-w-7xl mx-auto px-4 py-24 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              Plateforme BTP #1 au Cameroun
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black text-white leading-tight mb-6">
              Construisez<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                votre maison
              </span><br/>
              en confiance
            </h1>

            <p className="text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
              B.Y.H connecte les propriétaires camerounais avec des artisans et entreprises BTP vérifiés. Devis gratuits, suivi en temps réel, paiement sécurisé.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {user ? (
                <Link to="/dashboard" className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 hover:scale-105">
                  Mon espace B.Y.H
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              ) : (
                <>
                  <Link to="/register" className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30 hover:scale-105">
                    Démarrer gratuitement
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link to="/artisans" className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20">
                    Voir les artisans
                  </Link>
                </>
              )}
            </div>

            {/* Badges confiance */}
            <div className="flex flex-wrap gap-3">
              {['✅ Artisans vérifiés', '🔒 Paiement sécurisé', '⭐ Avis certifiés', '📱 Suivi en temps réel'].map(b => (
                <span key={b} className="px-3 py-1.5 bg-white/10 text-white/90 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10">{b}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs">Découvrir</span>
          <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce"/>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-4xl font-black text-white mb-1">{s.num}</div>
                <div className="text-blue-200 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">Nos services</span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mt-3 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              De la recherche d'artisan à la réception des travaux, B.Y.H vous accompagne à chaque étape.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0">
                  <img src={s.photo} alt={s.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className={`absolute inset-0 bg-gradient-to-t ${s.color} opacity-85`}/>
                </div>
                <div className="relative z-10 p-8 h-72 flex flex-col justify-end">
                  <span className="text-4xl mb-4 block">{s.icon}</span>
                  <h3 className="text-2xl font-display font-black text-white mb-3">{s.titre}</h3>
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">{s.desc}</p>
                  <Link to={s.lien} className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors w-fit">
                    {s.btnLabel} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ETAPES ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">Comment ça marche</span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mt-3 mb-4">
              Simple comme bonjour
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ETAPES.map((e, i) => (
              <div key={i} className="relative">
                {i < ETAPES.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent z-0"/>
                )}
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                    {e.icon}
                  </div>
                  <span className="text-blue-600 font-black text-sm">{e.num}</span>
                  <h3 className="font-display font-bold text-lg text-gray-900 mt-1 mb-2">{e.titre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to={user ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105">
              {user ? 'Aller au Dashboard' : 'Commencer maintenant'} →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROTECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-400 font-bold text-sm uppercase tracking-widest">Sécurité & Confiance</span>
              <h2 className="text-4xl font-display font-black text-white mt-3 mb-6">
                Votre protection,<br/>notre priorité
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '🔒', titre: 'Artisans vérifiés', desc: 'Identité, diplômes et antécédents contrôlés' },
                  { icon: '💰', titre: 'Paiement sécurisé', desc: 'Votre argent est bloqué jusqu\'à validation des travaux' },
                  { icon: '⚖️', titre: 'Arbitrage B.Y.H', desc: 'Notre équipe intervient en cas de litige' },
                  { icon: '📱', titre: 'Suivi en temps réel', desc: 'Photos de jalons et notifications instantanées' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-white">{item.titre}</h4>
                      <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src={PHOTOS.chantier} alt="Chantier" className="rounded-3xl w-full h-80 object-cover shadow-2xl"/>
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-xl">
                <p className="text-2xl font-black">10%</p>
                <p className="text-xs text-blue-200">Commission seulement</p>
                <p className="text-xs text-blue-200">sur transactions réussies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEMOIGNAGES ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">Témoignages</span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 mt-3">
              Ils nous font confiance
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.note)].map((_, j) => <span key={j} className="text-amber-400">⭐</span>)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.texte}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {t.nom[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.nom}</p>
                    <p className="text-gray-400 text-xs">{t.role} • {t.ville}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl font-display font-black text-gray-900 mt-3">
              Questions fréquentes
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-gray-900">{f.q}</span>
                  <span className={`text-blue-600 text-xl transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {f.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={PHOTOS.maison} alt="Maison" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-blue-600/90"/>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6">
            Prêt à construire<br/>votre rêve ?
          </h2>
          <p className="text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de Camerounais qui font confiance à B.Y.H pour leurs projets de construction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? '/dashboard' : '/register'} className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-600 font-black text-lg rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:scale-105">
              {user ? 'Mon Dashboard' : 'Commencer gratuitement'}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/artisans" className="inline-flex items-center gap-3 px-10 py-5 border-2 border-white/40 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all">
              Voir les artisans
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-black text-xl">B.<span className="text-blue-400">Y.</span>H</p>
                  <p className="text-xs text-gray-500">Build Your Home</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                La plateforme BTP de référence au Cameroun. Connectons artisans qualifiés et propriétaires pour des projets réussis.
              </p>
              <p className="text-xs text-gray-600">🔒 L'excellence à votre service</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Plateforme</h4>
              <div className="space-y-2 text-sm">
                <Link to="/artisans" className="block hover:text-blue-400 transition-colors">Artisans</Link>
                <Link to="/entreprises" className="block hover:text-blue-400 transition-colors">Entreprises BTP</Link>
                <Link to="/projects" className="block hover:text-blue-400 transition-colors">Projets</Link>
                <Link to="/comment-ca-marche" className="block hover:text-blue-400 transition-colors">Comment ça marche</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Légal</h4>
              <div className="space-y-2 text-sm">
                <Link to="/cgu" className="block hover:text-blue-400 transition-colors">CGU</Link>
                <Link to="/confidentialite" className="block hover:text-blue-400 transition-colors">Confidentialité</Link>
                <a href="mailto:contact@byh-cm.com" className="block hover:text-blue-400 transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 B.Y.H — Build Your Home. Tous droits réservés.</p>
            <p className="text-sm">Fait avec ❤️ au Cameroun 🇨🇲</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
