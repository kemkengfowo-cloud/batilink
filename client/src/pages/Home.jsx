import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STATS = [
  { num: '20+',  label: 'Artisans vérifiés' },
  { num: '8%',   label: 'Commission seulement' },
  { num: '2',    label: 'Villes couvertes' },
  { num: '100%', label: 'Paiements sécurisés' },
];

const SERVICES = [
  {
    titre: 'Artisans Qualifiés',
    desc: 'Maçons, électriciens, plombiers — vérifiés et notés.',
    lien: '/artisans',
    btnLabel: 'Trouver un artisan',
    photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    accent: '#1D4ED8',
  },
  {
    titre: 'Entreprises BTP',
    desc: 'Sociétés de construction pour vos grands projets.',
    lien: '/entreprises',
    btnLabel: 'Voir les entreprises',
    photo: 'https://images.unsplash.com/photo-1590644365607-5f72e8a3e2b1?w=600&q=80',
    accent: '#5B21B6',
  },
  {
    titre: 'Conducteur de Travaux',
    desc: 'Un professionnel pour superviser votre chantier.',
    lien: '/conducteur-travaux',
    btnLabel: 'Demander un conducteur',
    photo: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    accent: '#065F46',
  },
];

const STEPS = [
  { num: '01', titre: 'Publiez votre projet', desc: 'Décrivez vos travaux, budget et localisation en quelques clics.' },
  { num: '02', titre: 'Recevez des devis', desc: 'Les artisans qualifiés vous contactent avec leurs offres détaillées.' },
  { num: '03', titre: 'Choisissez et contractez', desc: 'Signez un contrat digital sécurisé directement sur B.Y.H.' },
  { num: '04', titre: 'Payez en sécurité', desc: 'Paiement Orange Money ou MTN MoMo — libéré après validation.' },
];

const TEMOIGNAGES = [
  { nom: 'Marie K.', ville: 'Yaoundé', role: 'Cliente', txt: 'J\'ai trouvé un excellent maçon en 24h. Le paiement sécurisé m\'a vraiment rassurée.', note: 5 },
  { nom: 'Jean P.', ville: 'Douala', role: 'Artisan électricien', txt: 'B.Y.H m\'a permis de trouver des clients sérieux. Les paiements arrivent sur mon MTN MoMo.', note: 5 },
  { nom: 'Sophie M.', ville: 'Paris → Yaoundé', role: 'Diaspora', txt: 'Je construis ma maison à Yaoundé depuis Paris. B.Y.H gère tout avec professionnalisme.', note: 5 },
];

export default function Home() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(s => (s + 1) % STEPS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ─── HERO ─── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: '#060d1f' }}>
        {/* Photo plein écran */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&q=85"
            alt="Chantier construction"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,13,31,0.95) 0%, rgba(15,30,70,0.85) 50%, rgba(6,13,31,0.7) 100%)' }} />
        </div>

        {/* Accent bleu vertical */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #2563EB, #7C3AED)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '120px 32px 80px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 64, alignItems: 'center' }}>

            {/* Texte gauche */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>🇨🇲 PLATEFORME BTP — CAMEROUN</span>
              </div>

              <h1 style={{ fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.02em' }}>
                Construisez<br />
                <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en confiance</span><br />
                au Cameroun
              </h1>

              <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
                B.Y.H connecte propriétaires et artisans vérifiés avec paiements sécurisés via Orange Money et MTN MoMo.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
                <Link to={user ? '/dashboard' : '/register?role=client'}
                  style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', padding: '16px 32px', borderRadius: 14, fontWeight: 800, fontSize: 16, boxShadow: '0 8px 32px rgba(37,99,235,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {user ? 'Mon espace' : 'Publier un projet'} →
                </Link>
                <Link to="/artisans"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', textDecoration: 'none', padding: '16px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Voir les artisans
                </Link>
              </div>

              {/* Trust */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['🔒 Paiement escrow', '✅ Artisans vérifiés', '📱 Orange & MTN'].map((b, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '4px 12px', color: '#cbd5e1', fontSize: 12, fontWeight: 600 }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Stats droite */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#fff', marginBottom: 6 }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
              {/* Lancement */}
              <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚀</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Lancement — Septembre 2026</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>Yaoundé + Douala en priorité</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
          <span style={{ color: '#475569', fontSize: 12, letterSpacing: '0.1em' }}>DÉCOUVRIR</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #2563EB, transparent)' }} />
        </div>
      </section>

      {/* ─── BANNIÈRE BETA ─── */}
      <div style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)', padding: '12px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>🚀 BÊTA TEST</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Vous êtes parmi les premiers — votre avis compte !</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>💬 Bouton feedback en bas à droite</span>
        </div>
      </div>

      {/* ─── SERVICES ─── */}
      <section style={{ background: '#f8fafc', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: '#2563EB', fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>NOS SERVICES</span>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#0f172a', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>Le bon expert pour chaque projet</h2>
            <p style={{ color: '#64748b', fontSize: 18, maxWidth: 540, margin: '0 auto' }}>Trouvez le prestataire BTP idéal pour votre projet au Cameroun</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {SERVICES.map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'; }}>
                {/* Photo */}
                <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                  <img src={s.photo} alt={s.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.6), transparent)' }} />
                </div>
                {/* Contenu */}
                <div style={{ padding: '28px 28px 32px' }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{s.titre}</h3>
                  <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{s.desc}</p>
                  <Link to={s.lien} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: s.accent, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                    {s.btnLabel} <span style={{ fontSize: 18 }}>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section style={{ background: '#060d1f', padding: '100px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: '#3b82f6', fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>PROCESSUS</span>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#fff', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>Comment ça marche ?</h2>
            <p style={{ color: '#475569', fontSize: 18 }}>Trouvez votre artisan en 4 étapes simples</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: activeStep === i ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${activeStep === i ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 20, padding: 32, transition: 'all 0.4s', transform: activeStep === i ? 'translateY(-4px)' : 'none', cursor: 'default' }}
                onClick={() => setActiveStep(i)}>
                <div style={{ fontSize: 48, fontWeight: 900, color: activeStep === i ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.06)', marginBottom: 16, lineHeight: 1 }}>{s.num}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{s.titre}</h3>
                <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PAIEMENT SÉCURISÉ ─── */}
      <section style={{ background: '#fff', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 64, alignItems: 'center' }}>
          {/* Photo */}
          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=85"
              alt="Paiement sécurisé"
              style={{ width: '100%', borderRadius: 24, objectFit: 'cover', height: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }}
            />
            {/* Badge flottant */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔒</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Paiement protégé</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Escrow B.Y.H</div>
              </div>
            </div>
          </div>

          {/* Texte */}
          <div>
            <span style={{ color: '#2563EB', fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>SÉCURITÉ</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0f172a', margin: '12px 0 20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Votre argent est protégé<br />
              <span style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>jusqu'à validation</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Le paiement est bloqué chez B.Y.H et libéré à l'artisan uniquement après votre validation des travaux. Zéro risque d'arnaque.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '📱', text: 'Paiement via Orange Money ou MTN MoMo', color: '#f97316' },
                { icon: '🔒', text: 'Fonds bloqués jusqu\'à validation des travaux', color: '#2563EB' },
                { icon: '⚖️', text: 'Arbitrage B.Y.H en cas de litige', color: '#7C3AED' },
                { icon: '💰', text: 'Commission de seulement 8%', color: '#16a34a' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─── */}
      <section style={{ background: '#f1f5f9', padding: '100px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: '#2563EB', fontSize: 12, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>TÉMOIGNAGES</span>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, color: '#0f172a', margin: '12px 0 16px', letterSpacing: '-0.02em' }}>Ils nous font confiance</h2>
            <p style={{ color: '#64748b', fontSize: 18 }}>Les premiers utilisateurs B.Y.H au Cameroun</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {TEMOIGNAGES.map((t, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {[...Array(t.note)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.txt}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                    {t.nom[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{t.nom}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.role} — {t.ville}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 32px', background: '#060d1f' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,13,31,0.95), rgba(37,99,235,0.3))' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Prêt à construire<br />votre projet ?
          </h2>
          <p style={{ color: '#64748b', fontSize: 18, marginBottom: 48, lineHeight: 1.6 }}>
            Rejoignez B.Y.H et trouvez votre artisan de confiance au Cameroun dès aujourd'hui.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <Link to="/register?role=client"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', padding: '18px 40px', borderRadius: 14, fontWeight: 800, fontSize: 17, boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}>
              Publier mon projet →
            </Link>
            <Link to="/register?role=artisan"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', textDecoration: 'none', padding: '18px 40px', borderRadius: 14, fontWeight: 700, fontSize: 17, border: '1px solid rgba(255,255,255,0.15)' }}>
              Je suis artisan
            </Link>
          </div>
          <p style={{ color: '#334155', fontSize: 14 }}>🔒 Inscription gratuite — Aucune carte bancaire requise</p>
        </div>
      </section>

    </div>
  );
}
