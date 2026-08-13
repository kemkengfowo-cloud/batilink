import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === 'artisan' ? '/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally { setLoading(false); }
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
          <h1 className="text-2xl font-display font-bold text-earth-900">Connexion</h1>
          <p className="text-earth-500 mt-2">Bienvenue de retour 👋</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="vous@exemple.com"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Mot de passe</label>
              <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="••••••••"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-brand transition-colors disabled:opacity-50 text-lg">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-earth-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
