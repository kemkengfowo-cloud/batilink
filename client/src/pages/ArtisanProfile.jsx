import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getWhatsAppLink, formatDate } from '../utils/helpers';
import AvisSection from '../components/AvisSection';
import { useAuth } from '../context/AuthContext';
import PortfolioSection from '../components/PortfolioSection';

const S = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" };

export default function ArtisanProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgModal, setMsgModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [portfolioState, setPortfolioState] = useState([]);

  useEffect(() => {
    api.get(`/artisans/${id}`)
      .then(res => { setArtisan(res.data); setPortfolioState(res.data.portfolio || []); })
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: artisan.user._id, contenu: msg });
      setSent(true); setMsg('');
      setTimeout(() => { setMsgModal(false); setSent(false); }, 2000);
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!artisan) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🔍</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Artisan non trouvé</h2>
      <Link to="/artisans" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>← Retour aux artisans</Link>
    </div>
  );

  const note = artisan.noteMoyenne || 0;
  const stars = Math.round(note);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', ...S }}>

      {/* HERO */}
      <section style={{ position: 'relative', background: '#060d1f', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.9), rgba(6,13,31,0.98))' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #2563EB, #7C3AED)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '40px 32px 60px' }}>
          <Link to="/artisans" style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Retour aux artisans</Link>

          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 96, height: 96, borderRadius: 24, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 900, color: '#fff', flexShrink: 0, border: '3px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' }}>
              {artisan.user?.name?.[0]?.toUpperCase() || '?'}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{artisan.user?.name}</h1>
                {artisan.verifie && (
                  <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100 }}>✓ Vérifié B.Y.H</span>
                )}
              </div>
              <p style={{ color: '#60a5fa', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{artisan.metier}</p>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
                {artisan.user?.city && <span style={{ color: '#64748b', fontSize: 14 }}>📍 {artisan.user.city}</span>}
                {artisan.experience && <span style={{ color: '#64748b', fontSize: 14 }}>⏱ {artisan.experience} ans d'expérience</span>}
                <span style={{ color: artisan.disponible ? '#22c55e' : '#94a3b8', fontSize: 14, fontWeight: 600 }}>
                  {artisan.disponible ? '● Disponible' : '● Indisponible'}
                </span>
              </div>

              {/* Note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} style={{ color: i <= stars ? '#f59e0b' : '#334155', fontSize: 18 }}>★</span>
                  ))}
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{note.toFixed(1)}</span>
                <span style={{ color: '#475569', fontSize: 14 }}>({artisan.nombreAvis || 0} avis)</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 180 }}>
              {user ? (
                <button onClick={() => setMsgModal(true)}
                  style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                  ✉ Envoyer un message
                </button>
              ) : (
                <Link to="/login" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', borderRadius: 14, padding: '14px 24px', fontWeight: 800, fontSize: 15, textAlign: 'center', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                  Se connecter pour contacter
                </Link>
              )}
              {artisan.user?.phone && (
                <a href={getWhatsAppLink(artisan.user.phone, `Bonjour, je vous contacte via B.Y.H...`)} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#25d366', color: '#fff', textDecoration: 'none', borderRadius: 14, padding: '14px 24px', fontWeight: 800, fontSize: 15, textAlign: 'center' }}>
                  📱 WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Bio */}
            {artisan.bio && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>À propos</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{artisan.bio}</p>
              </div>
            )}

            {/* Infos détaillées */}
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Informations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Ville', val: artisan.user?.city },
                  { label: 'Note', val: `${note.toFixed(1)}/5 ⭐` },
                  { label: 'Membre depuis', val: formatDate(artisan.createdAt) },
                ].filter(i => i.val).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Besoin de personnel ? */}
            {user?.role === 'entreprise' && (
              <div style={{ background: 'linear-gradient(135deg, #060d1f, #0f2044)', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Besoin de personnel ?</h3>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Contactez cet artisan pour louer du personnel qualifié</p>
                <button onClick={() => setMsgModal(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Envoyer un message
                </button>
              </div>
            )}
          </div>

          {/* Portfolio + Avis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {portfolioState.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Portfolio</h3>
                <PortfolioSection artisanId={id} portfolio={portfolioState} onUpdate={setPortfolioState} canEdit={user?._id === artisan?.user?._id} />
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Avis & Notations</h3>
              <AvisSection cibleId={id} cibleType="artisan" />
            </div>
          </div>
        </div>
      </section>

      {/* MODAL MESSAGE */}
      {msgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Message envoyé !</h3>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Message à {artisan.user?.name}</h3>
                  <button onClick={() => setMsgModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} placeholder="Décrivez votre projet..."
                  style={{ width: '100%', padding: 16, borderRadius: 14, border: '1.5px solid #e2e8f0', fontSize: 15, color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={() => setMsgModal(false)} style={{ flex: 1, background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Annuler</button>
                  <button onClick={sendMessage} disabled={sending || !msg.trim()}
                    style={{ flex: 2, background: sending ? '#94a3b8' : 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800, cursor: sending ? 'not-allowed' : 'pointer', fontSize: 15 }}>
                    {sending ? 'Envoi...' : 'Envoyer →'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
