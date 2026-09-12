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
      {/* Panneau gauche — dégradé bleu premium */}
      <div className="hidden lg:flex lg:w-1/2 bg-byh-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-500/10"/>
        <div className="absolute top-1/2 right-[-40px] w-[200px] h-[200px] rounded-full bg-blue-400/5"/>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-purple flex items-center justify-center text-2xl shadow-blue">🏠</div>
            <div>
              <div className="text-2xl font-black text-white tracking-widest">B.Y.H</div>
              <div className="text-xs text-blue-300 font-semibold">Build Your Home</div>
            </div>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Construisez<br/>
              <span className="text-byh-gradient bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">en confiance</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              La première marketplace BTP certifiée du Cameroun. Artisans vérifiés, paiements sécurisés via escrow.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: '🔒', title: 'Paiement escrow sécurisé', sub: 'Orange Money & MTN MoMo via MeSomb' },
              { icon: '⭐', title: 'Artisans vérifiés B.Y.H', sub: 'Profils vérifiés et notés par les clients' },
              { icon: '🏗️', title: 'Suivi de chantier en temps réel', sub: 'Jalons photo, contrats, litiges gérés' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm">{f.title}</div>
                  <div className="text-slate-400 text-xs mt-1">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer gauche */}
        <div className="relative z-10">
          <div className="text-slate-500 text-xs">🇨🇲 Fièrement Made in Cameroun — © 2026 B.Y.H</div>
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-2xl bg-blue-purple flex items-center justify-center text-xl shadow-blue">🏠</div>
            <div>
              <div className="text-xl font-black text-slate-900 tracking-widest">B.Y.H</div>
              <div className="text-xs text-blue-500 font-semibold">Build Your Home 🇨🇲</div>
            </div>
          </div>

          {/* Header form */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Bon retour ! 👋</h2>
            <p className="text-slate-500">Connectez-vous à votre espace B.Y.H</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Adresse email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📧</span>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  className="input-premium w-full pl-11 pr-4 py-3.5 text-slate-900 font-medium"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  className="input-premium w-full pl-11 pr-12 py-3.5 text-slate-900 font-medium"
                  placeholder="Votre mot de passe"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-byh-gradient w-full py-4 text-white font-black text-lg rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Connexion...
                </span>
              ) : 'Se connecter →'}
            </button>

            {/* Séparateur */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"/>
              <span className="text-slate-400 text-sm font-semibold">ou</span>
              <div className="flex-1 h-px bg-slate-200"/>
            </div>

            {/* Register link */}
            <Link to="/register"
              className="block w-full py-4 text-center font-bold text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors">
              Créer un compte gratuitement
            </Link>
          </form>

          {/* Security note */}
          <div className="mt-8 p-4 bg-slate-100 rounded-2xl text-center">
            <p className="text-slate-400 text-xs">🔒 Connexion sécurisée — B.Y.H plateforme BTP certifiée Cameroun</p>
          </div>
        </div>
      </div>
    </div>
  );
}
