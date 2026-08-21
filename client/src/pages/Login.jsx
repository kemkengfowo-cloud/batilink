import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        <img src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Construction" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,22,40,0.90) 0%, rgba(13,32,68,0.80) 100%)'}}/>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>

        {/* Logo */}
        <div className="relative z-10 p-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-white">B.<span className="text-blue-400">Y.</span>H</p>
              <p className="text-xs text-blue-300">Build Your Home</p>
            </div>
          </Link>
        </div>

        {/* Citation */}
        <div className="relative z-10 p-12">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <p className="text-white text-lg font-medium leading-relaxed mb-4">
              "B.Y.H m'a permis de trouver un excellent maçon en 24h. Le suivi par jalons m'a vraiment rassuré."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">M</div>
              <div>
                <p className="text-white font-semibold text-sm">Marie K.</p>
                <p className="text-blue-300 text-xs">Cliente — Yaoundé</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1 mt-6">
            {['✅ Artisans vérifiés','🔒 Paiement sécurisé','⭐ Avis certifiés'].map(b=>(
              <span key={b} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-medium border border-white/10">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Cote droit — Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-gray-900">B.<span className="text-blue-600">Y.</span>H</p>
              <p className="text-xs text-gray-400">Build Your Home</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-black text-gray-900 mb-2">Bon retour ! 👋</h1>
            <p className="text-gray-500">Connectez-vous à votre espace B.Y.H</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse email</label>
              <input
                type="email" required
                value={form.email}
                onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 bg-white"
                placeholder="vous@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900 bg-white pr-12"
                  placeholder="Votre mot de passe"
                />
                <button type="button" onClick={()=>setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter →'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700">S'inscrire gratuitement</Link>
          </p>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-center text-blue-700 text-xs font-semibold">
              🔒 Vos données sont protégées — Ne partagez jamais votre mot de passe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
