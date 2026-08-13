import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VILLES } from '../utils/helpers';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'client', phone:'', city:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Erreur d\'inscription'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="font-display font-bold text-2xl">Bati<span className="text-brand-500">link</span></span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-earth-900">Créer un compte</h1>
          <p className="text-earth-500 mt-2">Rejoignez Batilink gratuitement</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['client','artisan'].map(r => (
              <button key={r} type="button" onClick={() => set('role', r)}
                className={`py-4 rounded-xl border-2 font-semibold transition-all ${form.role===r?'border-brand-500 bg-brand-50 text-brand-700':'border-earth-200 text-earth-600 hover:border-earth-300'}`}>
                <div className="text-2xl mb-1">{r==='client'?'🏠':'🔨'}</div>
                <div className="text-sm capitalize">{r==='client'?'Je suis client':'Je suis artisan'}</div>
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Nom complet</label>
              <input type="text" required value={form.name} onChange={e=>set('name',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="Jean Mbarga"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="vous@exemple.com"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Téléphone</label>
              <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="+237 6XX XXX XXX"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Ville</label>
              <select value={form.city} onChange={e=>set('city',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors bg-white">
                <option value="">Sélectionner une ville</option>
                {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Mot de passe</label>
              <input type="password" required value={form.password} onChange={e=>set('password',e.target.value)}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="Minimum 6 caractères"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-brand transition-colors disabled:opacity-50 text-lg">
              {loading ? 'Création...' : `Créer mon compte ${form.role === 'artisan' ? 'artisan' : 'client'}`}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-earth-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
