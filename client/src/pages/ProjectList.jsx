import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CATEGORIES, VILLES } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function ProjectList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ categorie:'', localisation:'', budgetMin:'', budgetMax:'' });
  const [applied, setApplied] = useState({});
  const [metierArtisan, setMetierArtisan] = useState('');

  useEffect(() => {
    if (user?.role === 'artisan') {
      api.get('/artisans/me').then(res => setMetierArtisan(res.data.metier || '')).catch(()=>{});
    }
  }, [user]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 10,
        ...Object.fromEntries(Object.entries(applied).filter(([,v]) => v)),
        ...(user?.role === 'artisan' && metierArtisan && !applied.categorie ? { categorie: metierArtisan } : {})
      });
      const res = await api.get(`/projects?${params}`);
      setProjects(res.data.projects || res.data || []);
      setTotal(res.data.total || res.data.length || 0);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  }, [page, applied, metierArtisan, user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setApplied({...filters}); };
  const clearFilters = () => { setFilters({ categorie:'', localisation:'', budgetMin:'', budgetMax:'' }); setApplied({}); setPage(1); };
  const totalPages = Math.ceil(total / 10);

  const formatBudget = (n) => n ? new Intl.NumberFormat('fr-FR').format(n) + ' FCFA' : null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* HERO */}
      <section style={{ position: 'relative', background: '#060d1f', overflow: 'hidden', padding: '80px 32px 0' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,13,31,0.85), rgba(6,13,31,0.95))' }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, #22c55e, #2563EB)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#86efac', fontSize: 13, fontWeight: 600 }}>{total} projets disponibles</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
            {user?.role === 'artisan' ? 'Projets qui vous correspondent' : 'Projets de construction'}<br />
            <span style={{ background: 'linear-gradient(90deg, #86efac, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>au Cameroun</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginBottom: 48 }}>
            {user?.role === 'artisan' ? 'Trouvez des chantiers correspondant à votre métier' : 'Des projets BTP publiés par des clients sérieux'}
          </p>

          {/* Recherche */}
          <form onSubmit={handleSearch} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1 }}>🔨</span>
                <select value={filters.categorie} onChange={e => setFilters(f => ({...f, categorie: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                  <option value="">Toutes catégories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, zIndex: 1 }}>📍</span>
                <select value={filters.localisation} onChange={e => setFilters(f => ({...f, localisation: e.target.value}))}
                  style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', appearance: 'none', boxSizing: 'border-box' }}>
                  <option value="">Toutes les villes</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <input type="number" placeholder="Budget min (FCFA)" value={filters.budgetMin} onChange={e => setFilters(f => ({...f, budgetMin: e.target.value}))}
                style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
              <input type="number" placeholder="Budget max (FCFA)" value={filters.budgetMax} onChange={e => setFilters(f => ({...f, budgetMax: e.target.value}))}
                style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14, background: 'rgba(255,255,255,0.9)', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 500, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #16a34a, #2563EB)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Rechercher</button>
              {Object.values(applied).some(v => v) && (
                <button type="button" onClick={clearFilters} style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Effacer</button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* LISTE */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b' }}>Chargement des projets...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Aucun projet trouvé</h3>
            <button onClick={clearFilters} style={{ background: 'linear-gradient(135deg, #16a34a, #2563EB)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Voir tous les projets</button>
          </div>
        ) : (
          <>
            <p style={{ color: '#64748b', fontSize: 15, fontWeight: 500, marginBottom: 32 }}>
              <span style={{ color: '#0f172a', fontWeight: 800 }}>{total}</span> projet{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {projects.map(p => (
                <div key={p._id} style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', display: 'flex', gap: 20, alignItems: 'flex-start', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}>
                  {/* Icône */}
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #16a34a, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏗️</div>
                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>{p.titre}</h3>
                      <span style={{ background: p.statut === 'ouvert' ? '#dcfce7' : '#f1f5f9', color: p.statut === 'ouvert' ? '#16a34a' : '#64748b', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                        {p.statut === 'ouvert' ? '🟢 Ouvert' : p.statut}
                      </span>
                    </div>
                    {p.description && <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                      {p.localisation && <span style={{ fontSize: 13, color: '#64748b' }}>📍 {p.localisation}</span>}
                      {p.categorie && <span style={{ fontSize: 13, color: '#64748b' }}>🔨 {p.categorie}</span>}
                      {(p.budgetMin || p.budgetMax) && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>💰 {formatBudget(p.budgetMin)}{p.budgetMax ? ` – ${formatBudget(p.budgetMax)}` : '+'}</span>}
                    </div>
                    <Link to={`/projects/${p._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #16a34a, #2563EB)', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                      Voir le projet →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
                {page > 1 && <button onClick={() => setPage(p => p - 1)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>← Précédent</button>}
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{ width: 40, height: 40, borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: page === i + 1 ? 'linear-gradient(135deg, #16a34a, #2563EB)' : '#fff', color: page === i + 1 ? '#fff' : '#374151', boxShadow: page === i + 1 ? '0 4px 12px rgba(22,163,74,0.3)' : '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {i + 1}
                  </button>
                ))}
                {page < totalPages && <button onClick={() => setPage(p => p + 1)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Suivant →</button>}
              </div>
            )}
          </>
        )}
      </section>

      {user?.role === 'client' && (
        <section style={{ background: '#060d1f', padding: '60px 32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12 }}>Vous avez un projet ?</h3>
          <p style={{ color: '#64748b', fontSize: 16, marginBottom: 28 }}>Publiez votre projet et recevez des devis d'artisans vérifiés</p>
          <Link to="/create-project" style={{ background: 'linear-gradient(135deg, #16a34a, #2563EB)', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, fontWeight: 800, fontSize: 16, display: 'inline-block' }}>
            Publier un projet →
          </Link>
        </section>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
