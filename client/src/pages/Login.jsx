import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch(err) { setError(err.response?.data?.message || 'Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 50%, #1a4a8a 100%)'}}>
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 text-white">
        <Link to="/" className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl">B</div>
          <span className="font-display font-bold text-2xl">Batilink</span>
        </Link>
        <h1 className="text-5xl font-display font-black leading-tight mb-6">
          Bon retour parmi nous !
        </h1>
        <p className="text-blue-200 text-lg leading-relaxed mb-12">
          Connectez-vous pour accéder à votre espace et gérer vos projets, missions et contacts.
        </p>
        <div className="space-y-4">
          {[['🏠','Clients — Trouvez vos artisans'],['🔨','Techniciens — Gérez vos missions'],['🏢','Entreprises — Trouvez du personnel']].map(([i,t])=>(
            <div key={t} className="flex items-center gap-3 text-blue-100">
              <span className="text-xl">{i}</span><span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
              <span className="font-display font-bold text-xl text-gray-900">Batilink</span>
            </Link>
            <h2 className="text-2xl font-display font-bold text-gray-900">Connexion</h2>
            <p className="text-gray-500 mt-1 text-sm">Bienvenue de retour 👋</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="vous@exemple.com"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[{r:'client',i:'🏠',l:'Client'},{r:'artisan',i:'🔨',l:'Technicien'},{r:'entreprise',i:'🏢',l:'Entreprise'}].map(({r,i,l})=>(
              <Link key={r} to={`/register?role=${r}`}
                className="text-center p-3 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                <div className="text-xl mb-1">{i}</div>
                <div className="text-xs text-gray-500 font-medium">{l}</div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">Pas encore de compte ? Choisissez votre profil ci-dessus</p>
        </div>
      </div>
    </div>
  );
}
