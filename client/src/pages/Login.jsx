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
    } catch(err) { setError(err.response?.data?.message || 'Email ou mot de passe incorrect'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Cote gauche — Photo */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Chantier BTP"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(13,32,68,0.75) 100%)'}}></div>
        <div className="relative z-10 p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl">B</div>
            <span className="font-display font-bold text-2xl text-white">Batilink</span>
          </Link>
        </div>
        <div className="relative z-10 p-12">
          <h1 className="text-4xl font-display font-black text-white leading-tight mb-6">
            Le reseau BTP<br/><span className="text-blue-400">#1 au Cameroun</span>
          </h1>
          <div className="space-y-3">
            {['500+ artisans verifies','Paiement 100% securise','Devis et contrats officiels','Clients locaux et diaspora'].map(t=>(
              <div key={t} className="flex items-center gap-3 text-blue-200 text-sm">
                <span className="text-green-400 font-bold">✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cote droit — Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
            <span className="font-display font-bold text-xl text-gray-900">Batilink</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-500 text-sm mb-8">Acces a votre espace Batilink</p>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" required value={form.email}
                  onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="vous@email.com"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
                <input type="password" required value={form.password}
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Votre mot de passe"/>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20 mt-2">
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 text-center">
              🔒 Vos donnees sont securisees et protegees par Batilink
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">
                S inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
