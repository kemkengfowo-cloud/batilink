import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ROLES = [
  { id: 'client',    label: 'Je suis Client',    icon: '🏠' },
  { id: 'artisan',   label: 'Je suis Artisan',   icon: '🔨' },
  { id: 'entreprise',label: 'Je suis Entreprise',icon: '🏢' },
];

const ETAPES = {
  client: [
    { num:'01', titre:'Publiez votre projet', desc:'Décrivez vos travaux, budget et ville. Gratuit en moins de 5 minutes.' },
    { num:'02', titre:'Recevez des devis', desc:'Des artisans qualifiés vous contactent. Comparez prix, délais et avis clients.' },
    { num:'03', titre:'Signez le contrat', desc:'Choisissez votre artisan et signez un contrat officiel B.Y.H qui protège les deux parties.' },
    { num:'04', titre:'Suivez les travaux', desc:'Votre artisan publie des photos à chaque jalon. Validez chaque étape avant de payer.' },
    { num:'05', titre:'Validez & Payez', desc:'Validez les travaux, effectuez le paiement sécurisé et laissez un avis.' },
  ],
  artisan: [
    { num:'01', titre:'Créez votre profil', desc:'Métier, spécialités, ville et portfolio avant/après de vos réalisations.' },
    { num:'02', titre:'Parcourez les projets', desc:'Consultez les projets publiés dans votre ville et domaine d\'expertise.' },
    { num:'03', titre:'Envoyez un devis', desc:'Proposez votre meilleur devis avec délais et conditions.' },
    { num:'04', titre:'Réalisez les travaux', desc:'Publiez des photos à chaque jalon pour rassurer le client.' },
    { num:'05', titre:'Recevez le paiement', desc:'Une fois validé, recevez 92% sur votre Mobile Money. B.Y.H prélève 8%.' },
  ],
  entreprise: [
    { num:'01', titre:'Créez votre profil', desc:'Lots de travaux, RCCM, références et équipe disponible.' },
    { num:'02', titre:'Demandez du personnel', desc:'Besoin de techniciens ? Soumettez une demande avec dates et budget.' },
    { num:'03', titre:'Négociez avec B.Y.H', desc:'Notre équipe vous propose des techniciens qualifiés adaptés à vos besoins.' },
    { num:'04', titre:'Signez le contrat', desc:'Un contrat de location de personnel protège votre entreprise et les techniciens.' },
    { num:'05', titre:'Gérez vos chantiers', desc:'Suivez projets et contrats, évaluez le personnel pour bâtir votre réputation.' },
  ],
};

const GARANTIES = [
  { icon:'🔒', titre:'Artisans vérifiés', desc:'Chaque artisan est contrôlé par notre équipe avant publication sur la plateforme.' },
  { icon:'💰', titre:'Paiement sécurisé', desc:'Le client verse l\'argent AVANT les travaux. Les fonds sont bloqués chez B.Y.H et libérés à l\'artisan uniquement après validation.' },
  { icon:'⚖️', titre:'Arbitrage B.Y.H', desc:'En cas de litige, notre équipe intervient pour trouver une solution équitable.' },
  { icon:'⭐', titre:'Avis vérifiés', desc:'Tous les avis proviennent de clients ayant réellement travaillé avec l\'artisan.' },
  { icon:'📱', titre:'Suivi temps réel', desc:'Notifications instantanées à chaque étape de votre projet.' },
  { icon:'🇨🇲', titre:'Made in Cameroun', desc:'Une plateforme pensée pour le marché camerounais et ses spécificités.' },
];

const S = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };

export default function CommentCaMarche() {
  const [activeRole, setActiveRole] = useState('client');
  const etapes = ETAPES[activeRole];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', ...S }}>

      {/* HERO */}
      <section style={{ position: 'relative', background: '#060d1f', overflow: 'hidden', padding: '100px 32px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.9), rgba(6,13,31,0.98))' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #2563EB, #7C3AED)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Retour à l'accueil</Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 24, marginLeft: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Simple, rapide et sécurisé</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Comment fonctionne<br/>
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>B.Y.H ?</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>La plateforme la plus simple et sécurisée pour vos projets BTP au Cameroun</p>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 32px' }}>

        {/* SÉLECTEUR RÔLE */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 32, letterSpacing: '-0.02em' }}>Choisissez votre profil</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 600, margin: '0 auto' }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setActiveRole(r.id)}
                style={{ padding: '20px 12px', borderRadius: 16, border: `2px solid ${activeRole === r.id ? '#2563EB' : '#e2e8f0'}`, background: activeRole === r.id ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s', transform: activeRole === r.id ? 'scale(1.05)' : 'scale(1)', boxShadow: activeRole === r.id ? '0 8px 24px rgba(37,99,235,0.15)' : 'none' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{r.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: activeRole === r.id ? '#1d4ed8' : '#475569' }}>{r.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ÉTAPES */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 40, letterSpacing: '-0.02em' }}>
            {activeRole === 'client' && '🏠 En tant que client'}
            {activeRole === 'artisan' && '🔨 En tant qu\'artisan'}
            {activeRole === 'entreprise' && '🏢 En tant qu\'entreprise'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {etapes.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{e.num}</div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{e.titre}</h3>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GARANTIES */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 12, letterSpacing: '-0.02em' }}>Nos garanties</h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 48, fontSize: 16 }}>Votre protection est notre priorité absolue</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {GARANTIES.map((g, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{g.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{g.titre}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TARIFS */}
        <div style={{ background: 'linear-gradient(135deg, #060d1f, #0f2044)', borderRadius: 28, padding: '60px 40px', textAlign: 'center', marginBottom: 80, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.1), transparent)' }} />
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>Tarification simple</h2>
          <p style={{ color: '#475569', marginBottom: 48, fontSize: 16 }}>Pas de frais cachés, pas d'abonnement</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            {[
              { label:'Inscription', prix:'Gratuit', desc:'Pour clients et artisans' },
              { label:'Publication projet', prix:'Gratuit', desc:'Publiez autant de projets' },
              { label:'Commission B.Y.H', prix:'8%', desc:'Seulement sur transactions' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '28px 20px' }}>
                <p style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.label}</p>
                <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8 }}>{t.prix}</p>
                <p style={{ color: '#475569', fontSize: 12 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.02em' }}>Prêt à commencer ?</h2>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 40 }}>Rejoignez les premiers Camerounais qui font confiance à B.Y.H</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 800, fontSize: 16, boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
              S'inscrire gratuitement →
            </Link>
            <Link to="/artisans" style={{ background: '#fff', color: '#0f172a', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 700, fontSize: 16, border: '2px solid #e2e8f0' }}>
              Voir les artisans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
