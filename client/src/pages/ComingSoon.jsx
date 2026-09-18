import React from 'react';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Photo fond */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1600&q=85" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,13,31,0.97) 0%, rgba(15,30,70,0.92) 50%, rgba(6,13,31,0.95) 100%)' }} />
      </div>

      {/* Accent bleu */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #2563EB, #7C3AED)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 520, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}>🏠</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>B.Y.H</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Build Your Home 🇨🇲</div>
          </div>
        </div>

        {/* Badge beta */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 100, padding: '8px 20px', marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ color: '#fcd34d', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>BÊTA TEST — Accès anticipé</span>
        </div>

        {/* Titre */}
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
          Bienvenue sur<br />
          <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>B.Y.H</span>
        </h1>

        <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
          La première marketplace BTP certifiée du Cameroun.
        </p>
        <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, marginBottom: 48 }}>
          Vous faites partie des premiers testeurs — votre avis nous aidera à améliorer la plateforme avant le lancement officiel.
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 48 }}>
          {['✅ Artisans vérifiés', '🔒 Paiements sécurisés', '📱 Orange & MTN MoMo', '🇨🇲 Made in Cameroun'].map((b, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 14px', color: '#cbd5e1', fontSize: 12, fontWeight: 600 }}>{b}</span>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
          <Link to="/register" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', padding: '18px', borderRadius: 14, textAlign: 'center', fontWeight: 800, fontSize: 16, boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}>
            Créer mon compte →
          </Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', textDecoration: 'none', padding: '16px', borderRadius: 14, textAlign: 'center', fontWeight: 600, fontSize: 15, border: '1px solid rgba(255,255,255,0.1)' }}>
            J'ai déjà un compte
          </Link>
        </div>

        {/* Liens rapides */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
          {[['🔨 Artisans', '/artisans'], ['🏢 Entreprises', '/entreprises'], ['❓ Comment ça marche', '/comment-ca-marche']].map(([label, lien]) => (
            <Link key={lien} to={lien} style={{ color: '#475569', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>

        <p style={{ color: '#1e293b', fontSize: 12, marginTop: 40 }}>
          © 2026 B.Y.H — Ne payez jamais en dehors de B.Y.H 🔒
        </p>
      </div>
    </div>
  );
}
