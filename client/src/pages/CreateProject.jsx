import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { CATEGORIES, VILLES } from '../utils/helpers';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ titre:'', description:'', budget:'', localisation:'', categorie:'' });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k,v]) => data.append(k, v));
      photos.forEach(p => data.append('photos', p));
      const res = await api.post('/projects', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/projects/${res.data._id}`);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la publication'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-earth-500 hover:text-earth-700 mb-6 font-medium transition-colors">← Retour</Link>
      <h1 className="text-3xl font-display font-bold text-earth-900 mb-2">Publier un projet</h1>
      <p className="text-earth-500 mb-8">Décrivez votre projet pour recevoir des offres d'artisans</p>

      <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
        {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">Titre du projet *</label>
            <input type="text" required value={form.titre} onChange={e=>set('titre',e.target.value)}
              className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
              placeholder="Ex: Rénovation salle de bain Bastos"/>
          </div>

          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">Catégorie *</label>
            <select required value={form.categorie} onChange={e=>set('categorie',e.target.value)}
              className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
              <option value="">Sélectionner une catégorie</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">Description *</label>
            <textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={5}
              className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 resize-none transition-colors"
              placeholder="Décrivez les travaux à réaliser en détail : dimensions, matériaux souhaités, contraintes..."/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Budget (FCFA) *</label>
              <input type="number" required min="0" value={form.budget} onChange={e=>set('budget',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="150000"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Localisation *</label>
              <select required value={form.localisation} onChange={e=>set('localisation',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
                <option value="">Votre ville</option>
                {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-earth-700 mb-1.5">Photos du projet (optionnel, max 4)</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-earth-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all">
              <svg className="w-8 h-8 text-earth-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span className="text-sm text-earth-400">Cliquez pour ajouter des photos</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden"/>
            </label>
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previews.map((p,i) => <img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover"/>)}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-brand transition-colors disabled:opacity-50 text-lg">
            {loading ? 'Publication en cours...' : '🚀 Publier le projet'}
          </button>
        </form>
      </div>
    </div>
  );
}
