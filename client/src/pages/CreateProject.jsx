import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { CATEGORIES, VILLES } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

export default function CreateProject() {
  const navigate = useNavigate();
  const [besoinEvaluation, setBesoinEvaluation] = useState(null);
  const [form, setForm] = useState({
    titre: '', description: '', budget: '', localisation: '', categorie: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/projects', form);
      navigate(`/projects/${res.data._id}`);
    } catch(err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  // Étape 0 — Choix du type de besoin
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
            {/* Option A - Je sais ce que je veux */}
            <button onClick={() => setBesoinEvaluation(false)}
              className="text-left p-7 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:bg-blue-100 transition-colors">
                📋
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Je sais ce que je veux</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Je connais exactement les travaux a realiser. Je publie mon projet et recois des devis des artisans.
              </p>
              <div className="mt-5 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                Publier un projet →
              </div>
            </button>

            {/* Option B - J'ai besoin d'une évaluation */}
            <button onClick={() => navigate('/visites/demander')}
              className="text-left p-7 bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:bg-green-100 transition-colors">
                🔍
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">J'ai besoin d'une evaluation</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Je ne sais pas exactement quels travaux sont necessaires. Un technicien vient evaluer et chiffrer sur place.
              </p>
              <div className="mt-5 flex items-center gap-2 text-green-600 font-semibold text-sm">
                Demander une visite →
              </div>
            </button>
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 text-center">
            ⚠️ Tous les paiements sont securises via Batilink. Ne payez jamais directement.
          </div>
        </div>
      </div>
    );
  }

  // Étape 1 — Formulaire projet
  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => setBesoinEvaluation(null)}
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 font-medium">
            ← Retour
          </button>
          <h1 className="text-3xl font-display font-black text-white mb-2">Publier un projet</h1>
          <p className="text-blue-200">Les artisans disponibles recevront une notification</p>
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
                className={inputCls} placeholder="Ex: Renovation salle de bain, Installation electrique..."/>
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
                <label className={labelCls}>Localisation *</label>
                <select required value={form.localisation} onChange={e=>set('localisation',e.target.value)} className={inputCls}>
                  <option value="">Selectionner</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description detaillee *</label>
              <textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={5}
                className={`${inputCls} resize-none`}
                placeholder="Decrivez precisement les travaux a realiser, les materiaux souhaites, les contraintes particulieres..."/>
            </div>

            <div>
              <label className={labelCls}>Budget estime (FCFA)</label>
              <input type="number" min="0" value={form.budget} onChange={e=>set('budget',e.target.value)}
                className={inputCls} placeholder="Laissez vide si vous ne savez pas"/>
              <p className="text-gray-400 text-xs mt-1">Le budget est indicatif. Les artisans feront leurs propres devis.</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              <strong>✅ Apres publication :</strong> Tous les artisans disponibles dans votre ville seront notifies automatiquement.
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
