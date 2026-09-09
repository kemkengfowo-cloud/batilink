import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { VILLES, CATEGORIES, getAvatarUrl } from '../utils/helpers';
import { useToast } from '../components/Toast';
import { BadgeList } from '../components/Badge';

const inputCls = 'input-premium w-full px-4 py-3.5 text-slate-900 font-medium';
const labelCls = 'block text-sm font-bold text-slate-700 mb-2';

const TABS = [
  { id: 'info',    label: '👤 Infos',    roles: ['client','artisan','entreprise','conducteur'] },
  { id: 'profil',  label: '🔨 Profil',   roles: ['artisan','entreprise','conducteur'] },
  { id: 'securite',label: '🔒 Sécurité', roles: ['client','artisan','entreprise','conducteur'] },
];

const navigate = useNavigate();

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('info');
  const [userForm, setUserForm] = useState({ name:'', phone:'', city:'' });
  const [artisanForm, setArtisanForm] = useState({
    metier:'', description:'', ville:'', whatsapp:'',
    experience:'', specialites:'', disponible: true
  });
  const [entrepriseForm, setEntrepriseForm] = useState({
    nomEntreprise:'', nomResponsable:'', description:'',
    ville:'', whatsapp:'', rccm:''
  });
  const [pwForm, setPwForm] = useState({ current:'', nouveau:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const setU = (k,v) => setUserForm(f=>({...f,[k]:v}));
  const setA = (k,v) => setArtisanForm(f=>({...f,[k]:v}));
  const setE = (k,v) => setEntrepriseForm(f=>({...f,[k]:v}));

  useEffect(() => {
    if (!user) return;
    setUserForm({ name: user.name||'', phone: user.phone||'', city: user.city||'' });
    if (user.role === 'artisan') {
      api.get('/artisans/me').then(res => {
        setProfileData(res.data);
        setArtisanForm({
          metier: res.data.metier||'', description: res.data.description||'',
          ville: res.data.ville||'', whatsapp: res.data.whatsapp||'',
          experience: res.data.experience||'',
          specialites: (res.data.specialites||[]).join(', '),
          disponible: res.data.disponible !== false,
        });
      }).catch(() => {});
    }
    if (user.role === 'entreprise') {
      api.get('/entreprises/me').then(res => {
        setProfileData(res.data);
        setEntrepriseForm({
          nomEntreprise: res.data.nomEntreprise||'',
          nomResponsable: res.data.nomResponsable||'',
          description: res.data.description||'',
          ville: res.data.ville||'',
          whatsapp: res.data.whatsapp||'',
          rccm: res.data.rccm||'',
        });
      }).catch(() => {});
    }
  }, [user]);

  const saveInfo = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.put('/auth/me', userForm);
      setUser(res.data.user || res.data);
      toast.success('Informations mises à jour !');
    } catch(err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const saveProfil = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (user.role === 'artisan') {
        const data = { ...artisanForm, specialites: artisanForm.specialites.split(',').map(s=>s.trim()).filter(Boolean) };
        await api.put('/artisans/me', data);
      } else if (user.role === 'entreprise') {
        await api.put('/entreprises/me', entrepriseForm);
      }
      toast.success('Profil mis à jour !');
    } catch(err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.nouveau !== pwForm.confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (pwForm.nouveau.length < 6) { toast.error('Minimum 6 caractères'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.nouveau });
      setPwForm({ current:'', nouveau:'', confirm:'' });
      toast.success('Mot de passe modifié !');
    } catch(err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  const visibleTabs = TABS.filter(t => t.roles.includes(user?.role));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12">
          {/* Avatar + infos */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-3 border-white/20 shadow-lg"/>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"/>
            </div>
            <div>
              <div className="badge-premium mb-2">{user.role?.toUpperCase()}</div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-slate-400 text-sm">{user.email}</p>
              {user.city && <p className="text-slate-400 text-sm">📍 {user.city}</p>}
            </div>
          </div>

          {/* Badges artisan */}
          {profileData?.badges && Object.values(profileData.badges).some(Boolean) && (
            <div className="mb-6 glass rounded-2xl p-4">
              <BadgeList badges={profileData.badges}/>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {visibleTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id ? 'bg-white text-blue-700 shadow-md' : 'glass text-blue-200 hover:bg-white/20'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Onglet Infos */}
        {tab === 'info' && (
          <form onSubmit={saveInfo} className="card-premium p-6 space-y-5">
            <h2 className="font-display font-black text-slate-900 text-lg">👤 Informations personnelles</h2>
            <div>
              <label className={labelCls}>Nom complet</label>
              <input type="text" value={userForm.name} onChange={e=>setU('name',e.target.value)} className={inputCls}/>
            </div>
            <div>
              <label className={labelCls}>Téléphone</label>
              <input type="tel" value={userForm.phone} onChange={e=>setU('phone',e.target.value)} className={inputCls} placeholder="+237 6XX XXX XXX"/>
            </div>
            <div>
              <label className={labelCls}>Ville</label>
              <select value={userForm.city} onChange={e=>setU('city',e.target.value)} className={inputCls}>
                <option value="">Sélectionner une ville</option>
                {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Email (non modifiable)</p>
              <p className="text-slate-600 font-semibold">{user.email}</p>
            </div>
            <button type="submit" disabled={loading}
              className="btn-byh-gradient w-full py-4 text-white font-black rounded-2xl disabled:opacity-60">
              {loading ? 'Sauvegarde...' : '💾 Sauvegarder les informations'}
            </button>
          </form>
        )}

        {/* Onglet Profil artisan/entreprise */}
        {tab === 'profil' && (
          <form onSubmit={saveProfil} className="card-premium p-6 space-y-5">
            <h2 className="font-display font-black text-slate-900 text-lg">
              {user.role === 'artisan' ? '🔨 Profil artisan' : '🏢 Profil entreprise'}
            </h2>

            {user.role === 'artisan' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Métier / Spécialité</label>
                    <input type="text" value={artisanForm.metier} onChange={e=>setA('metier',e.target.value)} className={inputCls} placeholder="Ex: Maçon, Électricien..."/>
                  </div>
                  <div>
                    <label className={labelCls}>Ville d'activité</label>
                    <select value={artisanForm.ville} onChange={e=>setA('ville',e.target.value)} className={inputCls}>
                      <option value="">Sélectionner</option>
                      {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description / Bio</label>
                  <textarea value={artisanForm.description} onChange={e=>setA('description',e.target.value)}
                    className={inputCls + ' resize-none'} rows={4} placeholder="Décrivez vos compétences et expériences..."/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>WhatsApp</label>
                    <input type="tel" value={artisanForm.whatsapp} onChange={e=>setA('whatsapp',e.target.value)} className={inputCls} placeholder="+237 6XX XXX XXX"/>
                  </div>
                  <div>
                    <label className={labelCls}>Années d'expérience</label>
                    <input type="number" min="0" value={artisanForm.experience} onChange={e=>setA('experience',e.target.value)} className={inputCls} placeholder="Ex: 5"/>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Spécialités (séparées par virgule)</label>
                  <input type="text" value={artisanForm.specialites} onChange={e=>setA('specialites',e.target.value)} className={inputCls} placeholder="Ex: Carrelage, Faïence, Mosaïque"/>
                </div>
                <label className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-100 cursor-pointer">
                  <input type="checkbox" checked={artisanForm.disponible} onChange={e=>setA('disponible',e.target.checked)}
                    className="w-5 h-5 accent-green-600"/>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">✅ Disponible pour de nouvelles missions</p>
                    <p className="text-slate-500 text-xs">Les clients pourront vous contacter directement</p>
                  </div>
                </label>
              </>
            )}

            {user.role === 'entreprise' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nom de l'entreprise</label>
                    <input type="text" value={entrepriseForm.nomEntreprise} onChange={e=>setE('nomEntreprise',e.target.value)} className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>Nom du responsable</label>
                    <input type="text" value={entrepriseForm.nomResponsable} onChange={e=>setE('nomResponsable',e.target.value)} className={inputCls}/>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={entrepriseForm.description} onChange={e=>setE('description',e.target.value)}
                    className={inputCls + ' resize-none'} rows={4}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Ville</label>
                    <select value={entrepriseForm.ville} onChange={e=>setE('ville',e.target.value)} className={inputCls}>
                      <option value="">Sélectionner</option>
                      {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Numéro RCCM</label>
                    <input type="text" value={entrepriseForm.rccm} onChange={e=>setE('rccm',e.target.value)} className={inputCls} placeholder="Ex: RC/YAO/2024/B/..."/>
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="btn-byh-gradient w-full py-4 text-white font-black rounded-2xl disabled:opacity-60">
              {loading ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
            </button>
          </form>
        )}

        {/* Onglet Sécurité */}
        {tab === 'securite' && (
          <form onSubmit={savePassword} className="card-premium p-6 space-y-5">
            <h2 className="font-display font-black text-slate-900 text-lg">🔒 Changer le mot de passe</h2>
            <div>
              <label className={labelCls}>Mot de passe actuel</label>
              <input type="password" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))}
                className={inputCls} placeholder="Votre mot de passe actuel"/>
            </div>
            <div>
              <label className={labelCls}>Nouveau mot de passe</label>
              <input type="password" value={pwForm.nouveau} onChange={e=>setPwForm(f=>({...f,nouveau:e.target.value}))}
                className={inputCls} placeholder="Minimum 6 caractères"/>
            </div>
            <div>
              <label className={labelCls}>Confirmer le nouveau mot de passe</label>
              <input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))}
                className={inputCls} placeholder="Répétez le nouveau mot de passe"/>
            </div>
            <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl">
              <p className="text-blue-700 font-bold text-sm">🔒 Conseils de sécurité</p>
              <ul className="text-blue-600 text-xs mt-2 space-y-1">
                <li>• Minimum 8 caractères recommandés</li>
                <li>• Mélangez lettres, chiffres et symboles</li>
                <li>• Ne partagez jamais votre mot de passe</li>
              </ul>
            </div>
            <button type="submit" disabled={loading}
              className="btn-byh-gradient w-full py-4 text-white font-black rounded-2xl disabled:opacity-60">
              {loading ? 'Modification...' : '🔒 Modifier le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
