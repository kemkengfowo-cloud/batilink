import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function CreateAgent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'agent' });
      alert('✅ Agent créé avec succès !');
      navigate('/admin');
    } catch(err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="relative max-w-xl mx-auto px-4 py-12">
          <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Administration</p>
          <h1 className="text-3xl font-black text-white mb-2">🛡️ Créer un Agent B.Y.H</h1>
          <p className="text-slate-400">L'agent pourra valider les profils, confirmer les paiements et gérer les litiges.</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-premium p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nom complet *</label>
            <input type="text" required value={form.name} onChange={e=>set('name',e.target.value)}
              className="input-premium w-full px-4 py-3.5" placeholder="Ex: Marie Dupont"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
            <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)}
              className="input-premium w-full px-4 py-3.5" placeholder="agent@byh-cm.com"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
            <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
              className="input-premium w-full px-4 py-3.5" placeholder="+237 6XX XXX XXX"/>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe * (6 min)</label>
            <input type="password" required minLength={6} value={form.password} onChange={e=>set('password',e.target.value)}
              className="input-premium w-full px-4 py-3.5" placeholder="Minimum 6 caractères"/>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl">
            <p className="text-blue-700 font-bold text-sm">🛡️ Permissions de l'agent</p>
            <ul className="text-blue-600 text-xs mt-2 space-y-1">
              <li>✅ Valider les profils artisans et entreprises</li>
              <li>✅ Confirmer les paiements</li>
              <li>✅ Gérer les litiges</li>
              <li>✅ Confirmer les visites</li>
              <li>❌ Pas d'accès aux finances globales</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="btn-byh-gradient flex-1 py-4 text-white font-black rounded-2xl disabled:opacity-60">
              {loading ? 'Création...' : '🛡️ Créer le compte agent'}
            </button>
            <button type="button" onClick={()=>navigate('/admin')}
              className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
