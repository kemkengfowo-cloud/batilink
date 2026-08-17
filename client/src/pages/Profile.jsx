import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { VILLES, CATEGORIES, getAvatarUrl, getImageUrl } from '../utils/helpers';
import { useToast } from '../components/Toast';
import { BadgeList } from '../components/Badge';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('info');
  const [userForm, setUserForm] = useState({ name:'', phone:'', city:'' });
  const [artisanForm, setArtisanForm] = useState({ metier:'', description:'', ville:'', whatsapp:'', experience:'', specialites:'', disponible:true });
  const [entrepriseForm, setEntrepriseForm] = useState({ nomEntreprise:'', nomResponsable:'', description:'', ville:'', whatsapp:'', rccm:'' });
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setUserForm({ name: user.name||'', phone: user.phone||'', city: user.city||'' });
      if (user.role === 'artisan') {
        api.get('/artisans/me').then(res => {
          setProfileData(res.data);
          setArtisanForm({
            metier: res.data.metier||'', description: res.data.description||'',
            ville: res.data.ville||'', whatsapp: res.data.whatsapp||'',
            experience: res.data.experience||'',
            specialites: (res.data.specialites||[]).join(', '),
            disponible: res.data.disponible
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
            rccm: res.data.rccm||''
          });
        }).catch(() => {});
      }
    }
  }, [user]);

  const notify = (msg, isErr=false) => {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const saveUser = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.put('/users/profile', userForm);
      setUser(res.data);
      notify('Profil mis a jour !');
    } catch(err) { notify(err.response?.data?.message || 'Erreur', true); }
    finally { setLoading(false); }
  };

  const saveArtisan = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = {
        ...artisanForm,
        specialites: artisanForm.specialites.split(',').map(s=>s.trim()).filter(Boolean),
        experience: parseInt(artisanForm.experience)||0
      };
      const res = await api.put('/artisans/profile', payload);
      setProfileData(res.data);
      notify('Profil artisan mis a jour !');
    } catch(err) { notify(err.response?.data?.message || 'Erreur', true); }
    finally { setLoading(false); }
  };

  const saveEntreprise = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.put('/entreprises/profile', entrepriseForm);
      setProfileData(res.data);
      notify('Profil entreprise mis a jour !');
    } catch(err) { notify(err.response?.data?.message || 'Erreur', true); }
    finally { setLoading(false); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    setLoading(true);
    try {
      const res = await api.post('/users/avatar', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setUser(res.data.user);
      notify('Photo de profil mise a jour !');
    } catch(err) { notify('Erreur', true); }
    finally { setLoading(false); }
  };

  const uploadPhotos = async (e) => {
    const files = Array.from(e.target.files).slice(0,6);
    if (!files.length) return;
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    setLoading(true);
    try {
      const endpoint = user.role === 'artisan' ? '/artisans/photos' : '/entreprises/photos';
      const res = await api.post(endpoint, fd, { headers:{'Content-Type':'multipart/form-data'} });
      setProfileData(prev => ({...prev, photos:[...(prev?.photos||[]),...res.data.photos]}));
      notify('Photos ajoutees !');
    } catch(err) { notify('Erreur', true); }
    finally { setLoading(false); }
  };

  const TABS = [
    { id:'info', label:'Informations' },
    ...(user?.role==='artisan'?[{id:'artisan',label:'Profil artisan'},{id:'photos',label:'Realisations'}]:[]),
    ...(user?.role==='entreprise'?[{id:'entreprise',label:'Profil entreprise'},{id:'photos',label:'Photos'}]:[]),
  ];

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Mon profil</h1>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <img src={getAvatarUrl(user?.avatar, user?.name)} alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100"/>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden"/>
              </label>
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${user?.role==='client'?'bg-blue-50 text-blue-600':user?.role==='artisan'?'bg-green-50 text-green-600':'bg-purple-50 text-purple-600'}`}>
                {user?.role==='client'?'Client':user?.role==='artisan'?'Technicien':'Entreprise BTP'}
              </span>
              {profileData?.badges && Object.values(profileData.badges).some(Boolean) && (
                <div className="mt-2"><BadgeList badges={profileData.badges} size="sm"/></div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab===t.id?'bg-white text-gray-900 shadow-card':'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {success && <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">✅ {success}</div>}
        {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        {/* Infos générales */}
        {tab==='info' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <form onSubmit={saveUser} className="space-y-4">
              <div>
                <label className={labelCls}>Nom complet</label>
                <input type="text" value={userForm.name} onChange={e=>setUserForm(f=>({...f,name:e.target.value}))} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={user?.email} disabled className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}/>
              </div>
              <div>
                <label className={labelCls}>Telephone</label>
                <input type="tel" value={userForm.phone} onChange={e=>setUserForm(f=>({...f,phone:e.target.value}))} className={inputCls} placeholder="+237 6XX XXX XXX"/>
              </div>
              <div>
                <label className={labelCls}>Ville</label>
                <select value={userForm.city} onChange={e=>setUserForm(f=>({...f,city:e.target.value}))} className={inputCls}>
                  <option value="">Selectionner</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {loading?'Enregistrement...':'Enregistrer'}
              </button>
            </form>
          </div>
        )}

        {/* Profil artisan */}
        {tab==='artisan' && user?.role==='artisan' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <form onSubmit={saveArtisan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Metier *</label>
                  <select value={artisanForm.metier} onChange={e=>setArtisanForm(f=>({...f,metier:e.target.value}))} className={inputCls}>
                    <option value="">Choisir</option>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ville *</label>
                  <select value={artisanForm.ville} onChange={e=>setArtisanForm(f=>({...f,ville:e.target.value}))} className={inputCls}>
                    <option value="">Votre ville</option>
                    {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={artisanForm.description} onChange={e=>setArtisanForm(f=>({...f,description:e.target.value}))} rows={4}
                  className={`${inputCls} resize-none`} placeholder="Decrivez votre experience..."/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>WhatsApp</label>
                  <input type="tel" value={artisanForm.whatsapp} onChange={e=>setArtisanForm(f=>({...f,whatsapp:e.target.value}))} className={inputCls} placeholder="+237 6XX XXX XXX"/>
                </div>
                <div>
                  <label className={labelCls}>Annees d experience</label>
                  <input type="number" min="0" max="50" value={artisanForm.experience} onChange={e=>setArtisanForm(f=>({...f,experience:e.target.value}))} className={inputCls}/>
                </div>
              </div>
              <div>
                <label className={labelCls}>Specialites (separees par des virgules)</label>
                <input type="text" value={artisanForm.specialites} onChange={e=>setArtisanForm(f=>({...f,specialites:e.target.value}))} className={inputCls} placeholder="Carrelage, beton, dalle..."/>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" id="dispo" checked={artisanForm.disponible} onChange={e=>setArtisanForm(f=>({...f,disponible:e.target.checked}))} className="w-5 h-5 accent-blue-500"/>
                <label htmlFor="dispo" className="text-sm font-semibold text-gray-700">Je suis disponible pour de nouveaux projets</label>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {loading?'Enregistrement...':'Mettre a jour'}
              </button>
            </form>
          </div>
        )}

        {/* Profil entreprise */}
        {tab==='entreprise' && user?.role==='entreprise' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <form onSubmit={saveEntreprise} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nom de l entreprise</label>
                  <input type="text" value={entrepriseForm.nomEntreprise} onChange={e=>setEntrepriseForm(f=>({...f,nomEntreprise:e.target.value}))} className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>Nom du responsable</label>
                  <input type="text" value={entrepriseForm.nomResponsable} onChange={e=>setEntrepriseForm(f=>({...f,nomResponsable:e.target.value}))} className={inputCls}/>
                </div>
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={entrepriseForm.description} onChange={e=>setEntrepriseForm(f=>({...f,description:e.target.value}))} rows={4}
                  className={`${inputCls} resize-none`} placeholder="Presentez votre entreprise..."/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ville</label>
                  <select value={entrepriseForm.ville} onChange={e=>setEntrepriseForm(f=>({...f,ville:e.target.value}))} className={inputCls}>
                    <option value="">Votre ville</option>
                    {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>WhatsApp</label>
                  <input type="tel" value={entrepriseForm.whatsapp} onChange={e=>setEntrepriseForm(f=>({...f,whatsapp:e.target.value}))} className={inputCls} placeholder="+237 6XX XXX XXX"/>
                </div>
              </div>
              <div>
                <label className={labelCls}>Numero RCCM</label>
                <input type="text" value={entrepriseForm.rccm} onChange={e=>setEntrepriseForm(f=>({...f,rccm:e.target.value}))} className={inputCls} placeholder="RC/DLA/2024/B/1234"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {loading?'Enregistrement...':'Mettre a jour'}
              </button>
            </form>
          </div>
        )}

        {/* Photos */}
        {tab==='photos' && (user?.role==='artisan'||user?.role==='entreprise') && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-gray-900">Photos de realisations</h2>
              <span className="text-sm text-gray-400">{profileData?.photos?.length||0} photo(s)</span>
            </div>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all mb-5">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="text-sm font-medium text-gray-500">Ajouter des photos (max 6)</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG jusqu a 5MB</span>
              <input type="file" accept="image/*" multiple onChange={uploadPhotos} className="hidden" disabled={loading}/>
            </label>
            {profileData?.photos?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profileData.photos.map((p,i)=>(
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={getImageUrl(p)} alt={`Realisation ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-sm">Aucune photo pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
