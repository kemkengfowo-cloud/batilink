import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { CATEGORIES, VILLES } from '../utils/helpers';

const inputCls = 'input-premium w-full px-4 py-3.5 text-slate-900 font-medium';
const labelCls = 'block text-sm font-bold text-slate-700 mb-2';

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre: '', description: '', categorie: '', ville: '',
    budget: '', delai: '', adresse: '', demandeVisite: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/projects', { ...form, budget: parseInt(form.budget) || 0 });
      navigate('/mes-projets');
    } catch(err) { setError(err.response?.data?.message || 'Erreur lors de la création'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Espace client</p>
          <h1 className="text-3xl font-black text-white mb-2">📋 Publier un projet</h1>
          <p className="text-slate-400">Décrivez votre projet et recevez des devis d'artisans vérifiés</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Infos principales */}
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-display font-black text-slate-900 text-lg">📝 Description du projet</h2>

            <div>
              <label className={labelCls}>Titre du projet *</label>
              <input type="text" required value={form.titre} onChange={e => set('titre', e.target.value)}
                className={inputCls} placeholder="Ex: Construction maison R+1 à Yaoundé"/>
            </div>

            <div>
              <label className={labelCls}>Description détaillée *</label>
              <textarea required value={form.description} onChange={e => set('description', e.target.value)}
                className={inputCls + ' resize-none'} rows={4}
                placeholder="Décrivez en détail les travaux à réaliser, les matériaux souhaités, les contraintes..."/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Catégorie *</label>
                <select required value={form.categorie} onChange={e => set('categorie', e.target.value)}
                  className={inputCls}>
                  <option value="">Sélectionner une catégorie</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Budget estimé (FCFA)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">💰</span>
                  <input type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)}
                    className={inputCls + ' pl-10'} placeholder="Ex: 5000000"/>
                </div>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="card-premium p-6 space-y-4">
            <h2 className="font-display font-black text-slate-900 text-lg">📍 Localisation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ville *</label>
                <select required value={form.ville} onChange={e => set('ville', e.target.value)}
                  className={inputCls}>
                  <option value="">Sélectionner une ville</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Délai souhaité</label>
                <input type="text" value={form.delai} onChange={e => set('delai', e.target.value)}
                  className={inputCls} placeholder="Ex: 3 mois, avant décembre..."/>
              </div>
            </div>
            <div>
              <label className={labelCls}>Adresse précise</label>
              <AddressAutocomplete value={form.adresse} onChange={v => set('adresse', v)}
                placeholder="Ex: Quartier Bastos, Yaoundé" className={inputCls}/>
            </div>
          </div>

          {/* Visite évaluation */}
          <div className="card-premium p-6">
            <h2 className="font-display font-black text-slate-900 text-lg mb-4">🔍 Évaluation du site</h2>
            <label className="flex items-start gap-4 p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl cursor-pointer hover:border-blue-300 transition-all">
              <input type="checkbox" checked={form.demandeVisite} onChange={e => set("demandeVisite", e.target.checked)}
                className="w-5 h-5 accent-blue-600 mt-0.5 cursor-pointer flex-shrink-0"/>
              <div>
                <p className="font-bold text-slate-800">🔍 Je souhaite une visite d'évaluation avant les devis</p>
                <p className="text-slate-500 text-sm mt-1">Un technicien B.Y.H visitera votre chantier et évaluera les travaux avant que les artisans soumettent leurs devis. Cela garantit des devis plus précis et fiables.</p>
                <p className="text-blue-600 text-xs mt-2 font-semibold">✅ Recommandé pour les projets de construction ou rénovation importants</p>
              </div>
            </label>
          </div>
          {/* Info sécurité */}
          <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-blue-700 font-bold text-sm">Paiement sécurisé B.Y.H</p>
              <p className="text-blue-600 text-xs mt-1">
                Après acceptation d'un devis, le paiement est bloqué chez B.Y.H et libéré à l'artisan uniquement après validation de vos travaux.
              </p>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="btn-byh-gradient w-full py-4 text-white font-black text-lg rounded-2xl disabled:opacity-60">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                Publication en cours...
              </span>
            ) : '📋 Publier mon projet →'}
          </button>
        </form>
      </div>
    </div>
  );
}
