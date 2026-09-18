import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch(err) { setError(err.response?.data?.message || 'Email ou mot de passe incorrect'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ─── PANNEAU GAUCHE PHOTO ─── */}
      <div style={{ display: 'none', width: '50%', position: 'relative', overflow: 'hidden' }} className="lg-block">
        <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=85" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(6,13,31,0.9) 0%, rgba(37,99,235,0.6) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏠</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em' }}>B.Y.H</div>
              <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600 }}>Build Your Home</div>
            </div>
          </div>
          <div>
            <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1.3, marginBottom: 24, letterSpacing: '-0.02em' }}>
              "La confiance est le<br/>ciment de toute<br/>construction durable."
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '✅', text: 'Artisans vérifiés par B.Y.H' },
                { icon: '🔒', text: 'Paiements sécurisés escrow' },
                { icon: '📱', text: 'Orange Money & MTN MoMo' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ color: '#cbd5e1', fontSize: 14, fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── PANNEAU DROIT FORMULAIRE ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', letterSpacing: '-0.02em' }}>B.Y.H</div>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>Build Your Home 🇨🇲</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Bon retour !</h1>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>Connectez-vous à votre espace B.Y.H</p>

          {/* Erreur */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Adresse email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📧</span>
                <input type="email" required placeholder="votre@email.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 15, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Mot de passe</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>Mot de passe oublié ?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 50, paddingTop: 14, paddingBottom: 14, background: '#fff', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 15, color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={loading}
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: 13 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <Link to="/register" style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#0f172a', textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15, border: '1.5px solid #e2e8f0' }}>
            Créer un compte gratuitement
          </Link>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 24 }}>
            🔒 Connexion sécurisée — B.Y.H plateforme BTP certifiée Cameroun
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-block { display: block !important; } }
      `}</style>
    </div>
  );
}
