import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { VILLES } from '../utils/helpers';

export default function EntrepriseList() {
  const { user } = useAuth();
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ nom:'', ville:'' });
  const [search, setSearch] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(search);
    api.get(`/entreprises?${params}`)
      .then(r => setEntreprises(r.data?.entreprises || r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [search]);

  const handleSearch = (e) => { e.preventDefault(); setSearch({...filters}); };
  const clearFilters = () => { setFilters({ nom:'', ville:'' }); setSearch({}); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* HERO */}
      <section style={{ position: 'relative', background: '#060d1f', overflow: 'hidden', padding: '80px 32px 0' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1590644365607-5f72e8a3e2b1?w=1400&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.85), rgba(6,13,31,0.95))' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #7C3AED, #2563EB)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#c4b5fd', fontSize: 13, fontWeight: 600 }}>{entreprises.length} entreprises BTP vérifiées</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Trouvez votre entreprise<br />
            <span style={{ background: 'linear-gradient(90deg, #c4b5fd, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BTP de confiance</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginBottom: 48 }}>Des sociétés de construction vérifiées pour vos grands projets au Cameroun</p>

          {/* Recherche */}
          <form onSubmit={handleSearch} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                <input type="text" placeholder="Nom de l'entreprise..." value={filters.nom} onChange={e => setFilters(f => ({...f, nom: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1 }}>📍</span>
                <select value={filters.ville} onChange={e => setFilters(f => ({...f, ville: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Rechercher</button>
              {(search.nom || search.ville) && (
                <button type="button" onClick={clearFilters} style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Effacer</button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* GRILLE */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Chargement...</p>
          </div>
        ) : entreprises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Aucune entreprise trouvée</h3>
            <button onClick={clearFilters} style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Voir toutes les entreprises</button>
          </div>
        ) : (
          <>
            <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500, marginBottom: 32 }}>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{entreprises.length}</span> entreprise{entreprises.length > 1 ? 's' : ''} disponible{entreprises.length > 1 ? 's' : ''}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {entreprises.map(e => (
                <div key={e._id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-4px)'; ev.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                  {/* Header */}
                  <div style={{ background: 'linear-gradient(135deg, #0d1544, #1e1b4b)', padding: '24px 24px 16px', position: 'relative' }}>
                    {e.verifie && (
                      <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '4px 10px' }}>
                        <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700 }}>✓ Vérifié</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        {(e.nomEntreprise || e.user?.name || 'E')[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{e.nomEntreprise || e.user?.name}</h3>
                        <p style={{ color: '#a78bfa', fontSize: 13, fontWeight: 600 }}>Entreprise BTP</p>
                      </div>
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: 20 }}>
                    {e.user?.city && <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>📍 {e.user.city}</p>}
                    {e.description && <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.description}</p>}
                    {e.lots && e.lots.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {e.lots.slice(0, 3).map((l, i) => (
                          <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100 }}>{l}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Link to={`/entreprises/${e._id}`} style={{ flex: 1, background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: '#fff', textDecoration: 'none', padding: '12px 16px', borderRadius: 12, fontWeight: 700, fontSize: 14, textAlign: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}>
                        Voir le profil →
                      </Link>
                      {user && (
                        <Link to={`/messages?to=${e.user?._id}`} style={{ background: '#f1f5f9', color: '#374151', textDecoration: 'none', padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: '1px solid #e2e8f0' }}>💬</Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {!user && (
        <section style={{ background: '#060d1f', padding: '60px 32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Vous êtes une entreprise BTP ?</h3>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 28 }}>Rejoignez B.Y.H et trouvez des projets sérieux au Cameroun</p>
          <Link to="/register?role=entreprise" style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 800, fontSize: 16, display: 'inline-block' }}>
            S'inscrire comme entreprise →
          </Link>
        </section>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
