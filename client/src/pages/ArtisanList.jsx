import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { VILLES, CATEGORIES } from '../utils/helpers';

export default function ArtisanList() {
  const { user } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ nom:'', ville:'', metier:'' });
  const [search, setSearch] = useState({});

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...search });
      const res = await api.get(`/artisans?${params}`);
      setArtisans(res.data.artisans || []);
      setTotal(res.data.total || 0);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch({ ...filters });
  };

  const clearFilters = () => {
    setFilters({ nom:'', ville:'', metier:'' });
    setSearch({});
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ─── HERO ─── */}
      <section style={{ position: 'relative', background: '#060d1f', overflow: 'hidden', padding: '80px 32px 0' }}>
        {/* Photo fond */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.85) 0%, rgba(6,13,31,0.95) 100%)' }} />
        </div>
        {/* Accent */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #2563EB, #7C3AED)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingBottom: 60 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>{total} artisans vérifiés B.Y.H</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            Trouvez votre artisan<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>de confiance</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginBottom: 48 }}>
            Tous nos artisans sont vérifiés et notés par la communauté B.Y.H au Cameroun
          </p>

          {/* ─── BARRE DE RECHERCHE ─── */}
          <form onSubmit={handleSearch} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
              {/* Nom */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                <input
                  type="text"
                  placeholder="Nom de l'artisan..."
                  value={filters.nom}
                  onChange={e => setFilters(f => ({...f, nom: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {/* Ville */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1 }}>📍</span>
                <select
                  value={filters.ville}
                  onChange={e => setFilters(f => ({...f, ville: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {/* Métier */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1 }}>🔨</span>
                <select
                  value={filters.metier}
                  onChange={e => setFilters(f => ({...f, metier: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                  <option value="">Tous les métiers</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                Rechercher
              </button>
              {(search.nom || search.ville || search.metier) && (
                <button type="button" onClick={clearFilters} style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Effacer
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ─── GRILLE ARTISANS ─── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 32px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b', fontSize: 15 }}>Chargement des artisans...</p>
          </div>
        ) : artisans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Aucun artisan trouvé</h3>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Essayez d'autres critères de recherche</p>
            <button onClick={clearFilters} style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
              Voir tous les artisans
            </button>
          </div>
        ) : (
          <>
            {/* Résultats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>
                <span style={{ color: '#0f172a', fontWeight: 800 }}>{total}</span> artisan{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
              </p>
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {artisans.map(artisan => (
                <ArtisanCardPremium key={artisan._id} artisan={artisan} user={user} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                {page > 1 && (
                  <button onClick={() => setPage(p => p - 1)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                    ← Précédent
                  </button>
                )}
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: page === i + 1 ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : '#fff', color: page === i + 1 ? '#fff' : '#374151', boxShadow: page === i + 1 ? '0 4px 12px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {i + 1}
                  </button>
                ))}
                {page < totalPages && (
                  <button onClick={() => setPage(p => p + 1)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                    Suivant →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* ─── CTA BAS ─── */}
      {!user && (
        <section style={{ background: '#060d1f', padding: '60px 32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Vous êtes artisan ?</h3>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 28 }}>Rejoignez B.Y.H et trouvez des clients sérieux au Cameroun</p>
          <Link to="/register?role=artisan" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 800, fontSize: 16, boxShadow: '0 8px 24px rgba(37,99,235,0.3)', display: 'inline-block' }}>
            S'inscrire comme artisan →
          </Link>
        </section>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ArtisanCardPremium({ artisan, user }) {
  const note = artisan.noteMoyenne || 0;
  const stars = Math.round(note);

  return (
    <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>

      {/* Header card */}
      <div style={{ background: 'linear-gradient(135deg, #060d1f, #0f2044)', padding: '24px 24px 16px', position: 'relative' }}>
        {/* Badge vérifié */}
        {artisan.verifie && (
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700 }}>✓ Vérifié</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }}>
            {artisan.user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{artisan.user?.name || 'Artisan'}</h3>
            <p style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>{artisan.metier || 'Artisan qualifié'}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        {/* Infos */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {artisan.user?.city && (
            <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              📍 {artisan.user.city}
            </span>
          )}
          {artisan.experience && (
            <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
              ⏱ {artisan.experience} ans exp.
            </span>
          )}
        </div>

        {/* Note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ color: i <= stars ? '#f59e0b' : '#e2e8f0', fontSize: 14 }}>★</span>
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{note.toFixed(1)}</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>({artisan.nombreAvis || 0} avis)</span>
        </div>

        {/* Disponibilité */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: artisan.disponible ? '#22c55e' : '#94a3b8' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: artisan.disponible ? '#16a34a' : '#64748b' }}>
            {artisan.disponible ? 'Disponible' : 'Indisponible'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/artisans/${artisan._id}`}
            style={{ flex: 1, background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#fff', textDecoration: 'none', padding: '12px 16px', borderRadius: 12, fontWeight: 700, fontSize: 14, textAlign: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
            Voir le profil →
          </Link>
          {user && (
            <Link to={`/messages?to=${artisan.user?._id}`}
              style={{ background: '#f1f5f9', color: '#374151', textDecoration: 'none', padding: '12px 14px', borderRadius: 12, fontWeight: 700, fontSize: 14, border: '1px solid #e2e8f0' }}>
              💬
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
