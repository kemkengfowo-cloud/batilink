import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { CATEGORIES, VILLES } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

export default function CreateProject() {
  const navigate = useNavigate();
  const [besoinEvaluation, setBesoinEvaluation] = useState(null);
  const [form, setForm] = useState({ titre:'', description:'', budget:'', localisation:'', categorie:'' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [artisansNotifies, setArtisansNotifies] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { setError('Maximum 5 photos'); return; }
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/projects', form);
      setArtisansNotifies(res.data.artisansNotifies || 0);
      setTimeout(() => navigate('/mes-projets'), 3000);
    } catch(err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication');
    }
    setLoading(false);
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  if (artisansNotifies !== null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center shadow-xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-display font-black text-gray-900 mb-3">Projet publie !</h2>
          <p className="text-gray-500 mb-2">
            <strong className="text-blue-600">{artisansNotifies} artisan{artisansNotifies > 1 ? 's' : ''}</strong> {artisansNotifies > 1 ? 'ont ete notifies' : 'a ete notifie'} de votre projet.
          </p>
          <p className="text-gray-400 text-sm mb-6">Redirection dans 3 secondes...</p>
          <Link to="/mes-projets" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
            Voir mes projets →
          </Link>
        </div>
      </div>
    );
  }

  if (besoinEvaluation === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-8">
            ← Tableau de bord
          </Link>
          <h1 className="text-3xl font-display font-black text-gray-900 mb-3">Nouvelle demande de travaux</h1>
          <p className="text-gray-500 mb-10">Comment voulez-vous proceder ?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setBesoinEvaluation(false)}
              className="text-left p-7 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:bg-blue-100">📋</div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Je sais ce que je veux</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Je connais les travaux. Je publie et recois des devis d artisans.</p>
              <div className="mt-5 text-blue-600 font-semibold text-sm">Publier un projet →</div>
            </button>
            <button onClick={() => navigate('/visites/demander')}
              className="text-left p-7 bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:bg-green-100">🔍</div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">J'ai besoin d'une evaluation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Un technicien se deplace pour evaluer et chiffrer sur place.</p>
              <div className="mt-5 text-green-600 font-semibold text-sm">Demander une visite →</div>
            </button>
          </div>
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 text-center">
            Ne payez jamais en dehors de Batilink. Tous les paiements sont securises.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => setBesoinEvaluation(null)} className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 font-medium">
            ← Retour
          </button>
          <h1 className="text-3xl font-display font-black text-white mb-2">Publier un projet</h1>
          <p className="text-blue-200">Les artisans disponibles seront notifies automatiquement</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Avertissement type="devis"/>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Titre du projet *</label>
              <input type="text" required value={form.titre} onChange={e=>set('titre',e.target.value)}
                className={inputCls} placeholder="Ex: Renovation salle de bain..."/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Categorie *</label>
                <select required value={form.categorie} onChange={e=>set('categorie',e.target.value)} className={inputCls}>
                  <option value="">Selectionner</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Ville *</label>
                <select required value={form.localisation} onChange={e=>set('localisation',e.target.value)} className={inputCls}>
                  <option value="">Selectionner</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Description detaillee *</label>
              <textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={5}
                className={inputCls + ' resize-none'}
                placeholder="Decrivez precisement les travaux, materiaux, contraintes..."/>
            </div>
            <div>
              <label className={labelCls}>Budget estime (FCFA) *</label>
              <input type="number" required min="5000" value={form.budget} onChange={e=>set('budget',e.target.value)}
                className={inputCls} placeholder="Ex: 500000"/>
              <p className="text-gray-400 text-xs mt-1">Budget indicatif. Les artisans proposeront leurs prix.</p>
            </div>
            <div>
              <label className={labelCls}>Photos du chantier (optionnel — max 5)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" id="photos-input"/>
                <label htmlFor="photos-input" className="cursor-pointer block">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-gray-500 text-sm">Cliquez pour ajouter des photos</p>
                  <p className="text-gray-400 text-xs mt-1">JPG, PNG — max 5 photos</p>
                </label>
                {photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {photos.map((p,i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              Apres publication, tous les artisans disponibles dans votre ville seront notifies.
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading ? 'Publication...' : 'Publier le projet'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
