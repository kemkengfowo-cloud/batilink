import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PROVERBES = [
  { texte: "Seul on va plus vite, ensemble on va plus loin.", origine: "Proverbe africain" },
  { texte: "La maison que tu bâtis avec soin sera ton abri pour toujours.", origine: "Proverbe camerounais" },
  { texte: "Un bon artisan ne blâme pas ses outils.", origine: "Proverbe africain" },
  { texte: "La pierre qu'on n'a pas posée ne peut pas soutenir le mur.", origine: "Proverbe bamiléké" },
  { texte: "Ce que l'on construit ensemble résiste aux tempêtes.", origine: "Proverbe africain" },
  { texte: "L'union fait la force, la confiance fait l'édifice.", origine: "Sagesse B.Y.H 🇨🇲" },
  { texte: "Un chantier bien commencé est à moitié terminé.", origine: "Proverbe africain" },
  { texte: "La confiance est le ciment de toute construction durable.", origine: "Sagesse B.Y.H 🇨🇲" },
];

const STATS = [
  { num: '20+',  label: 'Artisans vérifiés',     icon: '🔨' },
  { num: '100%', label: 'Paiements sécurisés',    icon: '🔒' },
  { num: '8%',   label: 'Commission seulement',   icon: '💰' },
  { num: '2',    label: 'Villes couvertes',        icon: '📍' },
];

const SERVICES = [
  { icon: '🔨', titre: 'Artisans Qualifiés',    desc: 'Maçons, électriciens, plombiers — tous vérifiés et notés par B.Y.H.',          lien: '/artisans',   btnLabel: 'Trouver un artisan',    color: 'from-blue-600 to-blue-800',    bg: '#EFF6FF', accent: '#1D4ED8' },
  { icon: '🏢', titre: 'Entreprises BTP',       desc: 'Sociétés de construction pour vos grands projets et travaux d\'envergure.',     lien: '/entreprises',btnLabel: 'Voir les entreprises',   color: 'from-violet-600 to-violet-800',bg: '#F5F3FF', accent: '#5B21B6' },
  { icon: '🏗️', titre: 'Conducteur de Travaux', desc: 'Un professionnel pour superviser votre chantier et garantir la qualité.',       lien: '/conducteur-travaux',btnLabel: 'Demander un conducteur', color: 'from-emerald-600 to-emerald-800',bg: '#ECFDF5', accent: '#065F46' },
];

const STEPS = [
  { num: '01', icon: '📋', titre: 'Publiez votre projet',     desc: 'Décrivez vos travaux, budget et localisation en quelques clics.' },
  { num: '02', icon: '📄', titre: 'Recevez des devis',         desc: 'Les artisans qualifiés vous contactent avec leurs offres détaillées.' },
  { num: '03', icon: '✅', titre: 'Choisissez et contractez',  desc: 'Signez un contrat digital sécurisé directement sur B.Y.H.' },
  { num: '04', icon: '💳', titre: 'Payez en toute sécurité',   desc: 'Paiement Orange Money ou MTN MoMo — libéré après validation des travaux.' },
];

const TEMOIGNAGES = [
  { nom: 'Marie K.', ville: 'Yaoundé', role: 'Cliente', txt: 'J\'ai trouvé un excellent maçon en 24h. Le système de paiement sécurisé m\'a vraiment rassurée.', note: 5 },
  { nom: 'Jean P.', ville: 'Douala', role: 'Artisan électricien', txt: 'B.Y.H m\'a permis de trouver des clients sérieux. Les paiements arrivent directement sur mon MTN MoMo.', note: 5 },
  { nom: 'Sophie M.', ville: 'Diaspora (France)', role: 'Cliente diaspora', txt: 'Je construis ma maison à Yaoundé depuis Paris. B.Y.H gère tout avec professionnalisme.', note: 5 },
];

function BetaBannerProverbes() {
  const [idx, setIdx] = React.useState(0);
  const [fade, setFade] = React.useState(true);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % PROVERBES.length); setFade(true); }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const p = PROVERBES[idx];
  return (
    <div className="relative overflow-hidden">
      {/* Bannière beta */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <span className="text-white text-sm font-black">🚀 BETA TEST B.Y.H</span>
          <span className="text-amber-100 text-sm">Vous êtes parmi les premiers testeurs — votre avis compte !</span>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">💬 Utilisez le bouton feedback en bas à droite</span>
        </div>
      </div>
      {/* Proverbes */}
      <div className="bg-byh-gradient py-6 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <div style={{ opacity: fade ? 1 : 0, transition: "opacity 0.4s ease" }}>
            <p className="text-white text-lg font-bold italic mb-2">&ldquo;{p.texte}&rdquo;</p>
            <p className="text-blue-300 text-sm font-semibold">— {p.origine}</p>
          </div>
          {/* Points de navigation */}
          <div className="flex justify-center gap-2 mt-4">
            {PROVERBES.map((_, i) => (
              <button key={i} onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 400); }}
                className={`w-2 h-2 rounded-full transition-all ${ i === idx ? "bg-white w-6" : "bg-white/30 hover:bg-white/50" }`}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO — Dégradé bleu premium */}
      <section className="relative bg-byh-gradient overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-80px] left-[-60px] w-[350px] h-[350px] rounded-full bg-indigo-500/10"/>
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-blue-400/5"/>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Texte hero */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2">
                <span className="text-sm">🇨🇲</span>
                <span className="text-blue-200 text-sm font-semibold">Plateforme BTP certifiée au Cameroun</span>
              </div>

              <div>
                <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
                  Construisez<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
                    en confiance
                  </span><br/>
                  au Cameroun
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed">
                  B.Y.H connecte clients et artisans vérifiés avec paiements sécurisés via Orange Money et MTN MoMo.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link to={user ? '/dashboard' : '/register?role=client'}
                  className="btn-byh-gradient px-8 py-4 text-white font-black text-lg rounded-2xl">
                  {user ? 'Mon espace →' : 'Publier un projet →'}
                </Link>
                <Link to="/artisans"
                  className="glass px-8 py-4 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all border border-white/20">
                  Voir les artisans
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {['🔒 Paiement sécurisé', '✅ Artisans vérifiés', '📱 Orange & MTN MoMo'].map((b, i) => (
                  <span key={i} className="glass px-3 py-1.5 rounded-full text-blue-200 text-sm font-semibold">{b}</span>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="glass rounded-3xl p-8 space-y-6">
              <h3 className="text-white font-black text-xl">B.Y.H en chiffres</h3>
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-2xl p-5 text-center">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="text-3xl font-black text-white mb-1">{s.num}</div>
                    <div className="text-blue-300 text-xs font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <div className="text-white font-bold text-sm">Lancement — Septembre 2026</div>
                  <div className="text-blue-300 text-xs">Yaoundé + Douala en priorité</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNIÈRE BETA + PROVERBES */}
      <BetaBannerProverbes />

      {/* SERVICES */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Nos services</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Trouvez le prestataire BTP idéal pour votre projet au Cameroun</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <div key={i} className="card-premium p-6 group">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                style={{backgroundColor: s.bg}}>
                {s.icon}
              </div>
              <h3 className="font-display font-black text-xl text-slate-900 mb-3">{s.titre}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{s.desc}</p>
              <Link to={s.lien}
                className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                style={{backgroundColor: s.bg, color: s.accent}}>
                {s.btnLabel} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 bg-byh-gradient">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Comment ça marche ?</h2>
            <p className="text-slate-400 text-lg">Trouvez votre artisan en 4 étapes simples</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className={`glass rounded-2xl p-6 transition-all ${activeStep === i ? 'bg-white/15 scale-105' : ''}`}>
                <div className="text-5xl font-black text-blue-500/30 mb-3">{s.num}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-display font-black text-white text-lg mb-2">{s.titre}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SÉCURITÉ PAIEMENT */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="card-premium p-10 lg:p-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
                🔒 Système d'escrow sécurisé
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                Votre argent est protégé<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  jusqu'à validation
                </span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Le paiement est bloqué chez B.Y.H et libéré à l'artisan uniquement après votre validation des travaux. Zéro risque d'arnaque.
              </p>
              <div className="space-y-3">
                {[
                  '✅ Paiement via Orange Money ou MTN MoMo',
                  '✅ Fonds bloqués jusqu\'à validation des travaux',
                  '✅ Remboursement automatique en cas de litige',
                  '✅ Commission B.Y.H de seulement 8%',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-blue-600 font-bold text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { step: '1', label: 'Client paie via Orange/MTN', icon: '📱', color: 'bg-orange-50 border-orange-200' },
                { step: '2', label: 'Fonds bloqués chez B.Y.H', icon: '🔒', color: 'bg-blue-50 border-blue-200' },
                { step: '3', label: 'Artisan réalise les travaux', icon: '🔨', color: 'bg-slate-50 border-slate-200' },
                { step: '4', label: 'Client valide → Artisan payé', icon: '✅', color: 'bg-green-50 border-green-200' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${item.color}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">{item.step}</div>
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-bold text-slate-800 text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Ils nous font confiance</h2>
            <p className="text-slate-500 text-lg">Les premiers utilisateurs B.Y.H au Cameroun</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t, i) => (
              <div key={i} className="card-premium p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.note)].map((_, j) => <span key={j} className="text-yellow-400">⭐</span>)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">"{t.txt}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-purple flex items-center justify-center text-white font-black text-sm">
                    {t.nom[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{t.nom}</div>
                    <div className="text-slate-400 text-xs">{t.role} — {t.ville}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Prêt à construire<br/>votre projet ? 🚀
          </h2>
          <p className="text-slate-400 text-xl mb-10">
            Rejoignez B.Y.H et trouvez votre artisan de confiance au Cameroun dès aujourd'hui.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register?role=client"
              className="btn-byh-gradient px-10 py-5 text-white font-black text-xl rounded-2xl">
              Publier mon projet →
            </Link>
            <Link to="/register?role=artisan"
              className="glass px-10 py-5 text-white font-bold text-xl rounded-2xl hover:bg-white/20 transition-all border border-white/20">
              Je suis artisan
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-8">
            🔒 Inscription gratuite — Aucune carte bancaire requise
          </p>
        </div>
      </section>

    </div>
  );
}
 
