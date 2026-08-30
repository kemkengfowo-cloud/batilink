import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const LAUNCH_DATE = new Date('2026-09-15T00:00:00');

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({});
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = LAUNCH_DATE - now;
      if (diff <= 0) { setTimeLeft({ days:0, hours:0, minutes:0, seconds:0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/waitlist', { email });
      setSubmitted(true);
    } catch(err) {
      setSubmitted(true);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ width: '80px', height: '80px', background: '#2563EB', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(37,99,235,0.4)' }}>🏠</div>
        <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff', letterSpacing: '-1px' }}>
          B.<span style={{ color: '#60A5FA' }}>Y.</span>H
        </div>
        <div style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>Build Your Home</div>
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '100px', padding: '8px 20px', marginBottom: '24px' }}>
          <span style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
          <span style={{ color: '#60A5FA', fontSize: '14px', fontWeight: '600' }}>Lancement imminent — 🇨🇲 Cameroun</span>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#fff', lineHeight: '1.1', marginBottom: '16px' }}>
          La plateforme BTP<br/><span style={{ color: '#60A5FA' }}>#1 au Cameroun</span><br/>arrive bientôt
        </h1>
        <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: '1.6' }}>
          B.Y.H connecte les propriétaires camerounais avec des artisans et entreprises BTP vérifiés. Devis gratuits, paiement sécurisé, suivi en temps réel.
        </p>
      </div>

      {/* Compte à rebours */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { value: timeLeft.days, label: 'Jours' },
          { value: timeLeft.hours, label: 'Heures' },
          { value: timeLeft.minutes, label: 'Minutes' },
          { value: timeLeft.seconds, label: 'Secondes' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 28px', textAlign: 'center', minWidth: '90px' }}>
            <div style={{ fontSize: '40px', fontWeight: '900', color: '#fff', lineHeight: '1' }}>{String(item.value || 0).padStart(2, '0')}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '48px' }}>
        {submitted ? (
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <p style={{ color: '#34D399', fontWeight: '700', fontSize: '16px' }}>Parfait ! Vous serez notifié au lancement.</p>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Nous vous enverrons un email le jour J.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#94A3B8', textAlign: 'center', marginBottom: '16px', fontSize: '15px' }}>
              Soyez parmi les premiers à accéder à B.Y.H
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: '#fff', fontSize: '15px', outline: 'none' }}
              />
              <button type="submit" disabled={loading} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 24px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {loading ? '...' : 'Me notifier'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px', maxWidth: '700px' }}>
        {[
          { icon: '✓', text: 'Artisans vérifiés' },
          { icon: '🔒', text: 'Paiement sécurisé' },
          { icon: '📱', text: 'Suivi temps réel' },
          { icon: '⭐', text: 'Avis certifiés' },
          { icon: '🇨🇲', text: 'Made in Cameroun' },
          { icon: '💰', text: 'Devis gratuits' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', padding: '8px 16px' }}>
            <span style={{ fontSize: '16px' }}>{f.icon}</span>
            <span style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '600' }}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Lien connexion */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '8px' }}>Vous avez déjà un compte ?</p>
        <a href="/login" style={{ color: '#60A5FA', fontWeight: '700', fontSize: '15px', textDecoration: 'none' }}>
          Se connecter →
        </a>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <p style={{ color: '#334155', fontSize: '13px' }}>© 2026 B.Y.H — Proudly Made in 🇨🇲 Cameroun</p>
        <p style={{ color: '#334155', fontSize: '12px', marginTop: '4px' }}>contact@byh-cm.com</p>
      </div>
    </div>
  );
}
