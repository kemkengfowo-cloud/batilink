import React, { useState } from 'react';
import AddressAutocomplete from "../components/AddressAutocomplete";

import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'client',    icon: '👤', label: 'Client',     sub: 'Je cherche des artisans',    color: '#EFF6FF', border: '#BFDBFE', accent: '#1D4ED8' },
  { id: 'artisan',   icon: '🔨', label: 'Artisan',    sub: 'Je propose mes services',    color: '#F0FDF4', border: '#BBF7D0', accent: '#166534' },
  { id: 'entreprise',icon: '🏢', label: 'Entreprise', sub: 'Société de construction',    color: '#F5F3FF', border: '#DDD6FE', accent: '#5B21B6' },
  { id: 'conducteur',icon: '🏗️', label: 'Conducteur', sub: 'Conducteur de travaux',      color: '#ECFDF5', border: '#A7F3D0', accent: '#065F46' },
];

const PAYS_MONDE = [
  { nom:'France',       code:'+33',  flag:'🇫🇷' },
  { nom:'Belgique',     code:'+32',  flag:'🇧🇪' },
  { nom:'Suisse',       code:'+41',  flag:'🇨🇭' },
  { nom:'Canada',       code:'+1',   flag:'🇨🇦' },
  { nom:'États-Unis',   code:'+1',   flag:'🇺🇸' },
  { nom:'Allemagne',    code:'+49',  flag:'🇩🇪' },
  { nom:'Italie',       code:'+39',  flag:'🇮🇹' },
  { nom:'Espagne',      code:'+34',  flag:'🇪🇸' },
  { nom:'Royaume-Uni',  code:'+44',  flag:'🇬🇧' },
  { nom:'Portugal',     code:'+351', flag:'🇵🇹' },
  { nom:'Gabon',        code:'+241', flag:'🇬🇦' },
  { nom:'Congo',        code:'+242', flag:'🇨🇬' },
  { nom:'Côte d Ivoire',code:'+225', flag:'🇨🇮' },
  { nom:'Sénégal',      code:'+221', flag:'🇸🇳' },
  { nom:'Maroc',        code:'+212', flag:'🇲🇦' },
  { nom:'Autre',        code:'',     flag:'🌍' },
];

const inputCls = 'input-premium w-full px-4 py-3.5 text-slate-900 font-medium';
const labelCls = 'block text-sm font-bold text-slate-700 mb-2';

export default function Register() {
  const { register } = useAuth();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') || 'client');
  const [form, setForm] = useState({
    name:'', email:'', password:'', phone:'', city:'',
    metier:'', whatsapp:'', experience:'',
    nomEntreprise:'', nomResponsable:'',
    estDiaspora: false, paysDiaspora: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));
  const paysSelectionne = PAYS_MONDE.find(p => p.nom === form.paysDiaspora);
  const indicatif = form.estDiaspora && paysSelectionne && paysSelectionne.code ? paysSelectionne.code : "+237";
  const isEntreprise = role === 'entreprise';
  const isArtisan = role === 'artisan';

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      
      
      await register({...form, role});
      navigate('/dashboard');
    } catch(err) { setError(err.response?.data?.message || 'Erreur d\'inscription'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche dégradé */}
      <div className="hidden lg:flex lg:w-5/12 bg-byh-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-500/10"/>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-purple flex items-center justify-center text-2xl shadow-blue">🏠</div>
          <div>
            <div className="text-2xl font-black text-white tracking-widest">B.Y.H</div>
            <div className="text-xs text-blue-300 font-semibold">Build Your Home 🇨🇲</div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-black text-white leading-tight">
            Rejoignez la<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              plateforme BTP
            </span><br/>
            du Cameroun
          </h1>
          <p className="text-slate-400 leading-relaxed">
            Artisans, entreprises, conducteurs de travaux et clients — tous réunis sur B.Y.H pour construire mieux, ensemble.
          </p>
          <div className="space-y-3">
            {[
              { icon: '✅', text: 'Inscription 100% gratuite' },
              { icon: '🔒', text: 'Paiements sécurisés via Mobile Money' },
              { icon: '⭐', text: 'Profil vérifié par B.Y.H' },
              { icon: '📱', text: 'Application mobile disponible' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{f.icon}</span>
                <span className="text-slate-300 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-xs">
          🇨🇲 Fièrement Made in Cameroun — © 2026 B.Y.H
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="w-full lg:w-7/12 bg-slate-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-2xl bg-blue-purple flex items-center justify-center text-xl shadow-blue">🏠</div>
            <div className="text-xl font-black text-slate-900 tracking-widest">B.Y.H</div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Créer votre compte 🚀</h2>
            <p className="text-slate-500">Rejoignez des milliers d'utilisateurs B.Y.H au Cameroun</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Choix du rôle */}
            <div>
              <p className={labelCls}>Je suis...</p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className="p-4 rounded-2xl border-2 text-left transition-all relative"
                    style={{
                      backgroundColor: r.color,
                      borderColor: role === r.id ? r.accent : r.border,
                      boxShadow: role === r.id ? `0 0 0 3px ${r.accent}20` : 'none',
                    }}>
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="font-bold text-slate-900 text-sm">{r.label}</div>
                    <div className="text-xs mt-1" style={{color: r.accent}}>{r.sub}</div>
                    {role === r.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black"
                        style={{backgroundColor: r.accent}}>✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Infos principales */}
            <div className="card-premium p-6 space-y-4">
              <h3 className="font-display font-bold text-slate-900">📋 Informations personnelles</h3>


              {/* Diaspora EN PREMIER */}
              {role === 'client' && (
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-100 cursor-pointer hover:border-blue-300 transition-colors">
                  <input type="checkbox" checked={form.estDiaspora} onChange={e=>set('estDiaspora',e.target.checked)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"/>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">🌍 Je suis de la diaspora</div>
                    <div className="text-slate-500 text-xs">Je vis à l'étranger et je veux construire au Cameroun</div>
                  </div>
                </label>
              )}

              {form.estDiaspora && role === 'client' && (
                <div>
                  <label className={labelCls}>Pays de résidence</label>
                  <select value={form.paysDiaspora} onChange={e=>set('paysDiaspora',e.target.value)} className={inputCls}>
                    <option value="">Sélectionner votre pays</option>
                    {PAYS_MONDE.map(p => <option key={p.nom} value={p.nom}>{p.flag} {p.nom} ({p.code})</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{isEntreprise ? 'Nom du responsable *' : 'Nom complet *'}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">👤</span>
                    <input type="text" required value={form.name} onChange={e=>set('name',e.target.value)}
                      className={inputCls + ' pl-10'} placeholder="Ex: Christ Jefferson"/>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2">📧</span>
                    <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)}
                      className={inputCls + ' pl-10'} placeholder="votre@email.com"/>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Téléphone *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg z-10">{indicatif}</span>
                    <input type="tel" required value={form.phone} onChange={e=>set("phone",e.target.value)}
                      className={inputCls + " pl-20"} placeholder="6XX XXX XXX"/>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Ville / Adresse *</label>
                  <AddressAutocomplete value={form.city} onChange={v=>set('city',v)}
                    placeholder="Ex: Bastos, Yaoundé" className={inputCls}/>
                </div>
              </div>

              {/* Artisan */}
              {isArtisan && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className={labelCls}>Métier / Spécialité *</label>
                    <input type="text" value={form.metier} onChange={e=>set('metier',e.target.value)}
                      className={inputCls} placeholder="Ex: Maçon, Électricien..."/>
                  </div>
                  <div>
                    <label className={labelCls}>WhatsApp</label>
                    <input type="tel" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}
                      className={inputCls} placeholder="+237 6XX XXX XXX"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Années d'expérience</label>
                    <input type="number" min="0" max="50" value={form.experience} onChange={e=>set('experience',e.target.value)}
                      className={inputCls} placeholder="Ex: 5"/>
                  </div>
                </div>
              )}

              {/* Entreprise */}
              {isEntreprise && (
                <div className="pt-2 border-t border-slate-100">
                  <label className={labelCls}>Nom de l'entreprise *</label>
                  <input type="text" value={form.nomEntreprise} onChange={e=>set('nomEntreprise',e.target.value)}
                    className={inputCls} placeholder="Ex: BTP Cameroun SARL"/>
                </div>
              )}
            </div>

            {/* Mot de passe */}
            <div className="card-premium p-6">
              <h3 className="font-display font-bold text-slate-900 mb-4">🔒 Sécurité</h3>
              <div>
                <label className={labelCls}>Mot de passe * (6 caractères minimum)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">🔒</span>
                  <input type="password" required minLength={6} value={form.password} onChange={e=>set('password',e.target.value)}
                    className={inputCls + ' pl-10'} placeholder="Choisissez un mot de passe fort"/>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-byh-gradient w-full py-4 text-white font-black text-lg rounded-2xl disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Création du compte...
                </span>
              ) : 'Créer mon compte gratuitement →'}
            </button>

            <p className="text-center text-slate-500 text-sm">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Se connecter</Link>
            </p>

            <div className="text-center p-4 bg-slate-100 rounded-2xl">
              <p className="text-slate-400 text-xs">🔒 Inscription sécurisée — Données protégées par B.Y.H</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
