import React, { useState } from 'react';
import api from '../utils/api';

const CATEGORIES = ['Maçonnerie','Electricité','Plomberie','Carrelage','Peinture','Menuiserie','Toiture','Autre'];

export default function PortfolioSection({ portfolio = [], isOwner = false, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titre: '', description: '', categorie: '' });
  const [avant, setAvant] = useState(null);
  const [apres, setApres] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titre) { setError('Le titre est requis'); return; }
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('titre', form.titre);
      formData.append('description', form.description);
      formData.append('categorie', form.categorie);
      if (avant) formData.append('avant', avant);
      if (apres) formData.append('apres', apres);
      const res = await api.post('/artisans/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setForm({ titre: '', description: '', categorie: '' });
      setAvant(null); setApres(null);
      if (onUpdate) onUpdate(res.data.portfolio);
    } catch(err) {
      setError(err.response?.data?.message || 'Erreur lors de l ajout');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette réalisation ?')) return;
    try {
      const res = await api.delete(`/artisans/portfolio/${id}`);
      if (onUpdate) onUpdate(res.data.portfolio);
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_URL}/uploads/${path}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-gray-900">📸 Portfolio</h3>
          <p className="text-gray-400 text-sm mt-0.5">{portfolio.length} réalisation{portfolio.length > 1 ? 's' : ''}</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            {showForm ? '✕ Fermer' : '➕ Ajouter'}
          </button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showForm && isOwner && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 space-y-4">
          <h4 className="font-bold text-gray-900">Nouvelle réalisation</h4>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
            <input type="text" value={form.titre} onChange={e => setForm(f => ({...f, titre: e.target.value}))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              placeholder="Ex: Rénovation salle de bain Bastos"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <select value={form.categorie} onChange={e => setForm(f => ({...f, categorie: e.target.value}))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="">Sélectionner...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              rows={3} placeholder="Décrivez les travaux réalisés..."/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">📷 Photo Avant</label>
              <input type="file" accept="image/*" onChange={e => setAvant(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:font-semibold"/>
              {avant && <p className="text-xs text-green-600 mt-1">✅ {avant.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">📷 Photo Après</label>
              <input type="file" accept="image/*" onChange={e => setApres(e.target.files[0])}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 file:font-semibold"/>
              {apres && <p className="text-xs text-green-600 mt-1">✅ {apres.name}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Ajout...' : 'Ajouter au portfolio'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Portfolio vide */}
      {portfolio.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">📸</div>
          <p className="font-semibold">Aucune réalisation pour le moment</p>
          {isOwner && <p className="text-sm mt-1">Ajoutez vos meilleures réalisations avec des photos avant/après !</p>}
        </div>
      )}

      {/* Grille portfolio */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolio.map((item) => (
            <div key={item._id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Photos avant/après */}
              {(item.avant || item.apres) && (
                <div className="grid grid-cols-2 gap-0.5 bg-gray-100">
                  <div className="relative">
                    {item.avant ? (
                      <img src={getImageUrl(item.avant)} alt="Avant" className="w-full h-36 object-cover cursor-pointer hover:opacity-90" onClick={() => setLightbox(getImageUrl(item.avant))}/>
                    ) : (
                      <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Pas de photo avant</div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">Avant</span>
                  </div>
                  <div className="relative">
                    {item.apres ? (
                      <img src={getImageUrl(item.apres)} alt="Après" className="w-full h-36 object-cover cursor-pointer hover:opacity-90" onClick={() => setLightbox(getImageUrl(item.apres))}/>
                    ) : (
                      <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Pas de photo après</div>
                    )}
                    <span className="absolute bottom-2 left-2 bg-green-600/80 text-white text-xs px-2 py-0.5 rounded-full">Après</span>
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{item.titre}</h4>
                    {item.categorie && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">{item.categorie}</span>}
                    {item.description && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{item.description}</p>}
                  </div>
                  {isOwner && (
                    <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 transition-colors text-sm flex-shrink-0">🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Photo" className="max-w-full max-h-full object-contain rounded-lg"/>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300">✕</button>
        </div>
      )}
    </div>
  );
}
