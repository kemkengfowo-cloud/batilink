import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { VILLES, CATEGORIES, getAvatarUrl, getImageUrl } from '../utils/helpers';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [userForm, setUserForm] = useState({ name:'', phone:'', city:'' });
  const [artisanForm, setArtisanForm] = useState({ metier:'', description:'', ville:'', whatsapp:'', experience:'', specialites:'', disponible:true });
  const [loading, setLoading] = useState(false);
  const [artisanLoading, setArtisanLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [artisanData, setArtisanData] = useState(null);

  useEffect(() => {
    if (user) setUserForm({ name: user.name||'', phone: user.phone||'', city: user.city||'' });
    if (user?.role === 'artisan') {
      api.get('/artisans/me')
        .then(res => {
          setArtisanData(res.data);
          const a = res.data;
          setArtisanForm({
            metier: a.metier||'', description: a.description||'', ville: a.ville||'',
            whatsapp: a.whatsapp||'', experience: a.experience||'',
            specialites: (a.specialites||[]).join(', '), disponible: a.disponible
          });
        })
        .catch(() => {})
        .finally(() => setArtisanLoading(false));
    } else setArtisanLoading(false);
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
      notify('Profil mis à jour !');
    } catch (err) { notify(err.response?.data?.message || 'Erreur', true); }
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
      setArtisanData(res.data);
      notify('Profil artisan mis à jour !');
    } catch (err) { notify(err.response?.data?.message || 'Erreur', true); }
    finally { setLoading(false); }
  };

  const uploadPhotos = async (e) => {
    const files = Array.from(e.target.files).slice(0,6);
    if (!files.length) return;
    const fd = new FormData();
    files.forEach(f => fd.append('photos', f));
    setLoading(true);
    try {
      const res = await api.post('/artisans/photos', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setArtisanData(prev => ({...prev, photos:[...(prev?.photos||[]),...res.data.photos]}));
      notify('Photos ajoutées !');
    } catch (err) { notify(err.response?.data?.message || 'Erreur', true); }
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
      notify('Photo de profil mise à jour !');
    } catch (err) { notify(err.response?.data?.message || 'Erreur', true); }
    finally { setLoading(false); }
  };

  const TABS = [{ id:'info', label:'Informations' }, ...(user?.role==='artisan'?[{ id:'artisan', label:'Profil artisan' },{ id:'photos', label:'Réalisations' }]:[])];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-earth-900 mb-8">Mon profil</h1>

      {success && <div className="mb-5 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">✅ {success}</div>}
      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Avatar */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <img src={getAvatarUrl(user?.avatar, user?.name)} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-earth-100"/>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-600 transition-colors shadow">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden"/>
            </label>
          </div>
          <div>
            <p className="font-display font-bold text-earth-900 text-lg">{user?.name}</p>
            <p className="text-earth-500 text-sm">{user?.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-earth-100 p-1 rounded-xl mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab===t.id?'bg-white text-earth-900 shadow-card':'text-earth-500 hover:text-earth-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Infos générales */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={saveUser} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Nom complet</label>
              <input type="text" value={userForm.name} onChange={e=>setUserForm(f=>({...f,name:e.target.value}))}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Email</label>
              <input type="email" value={user?.email} disabled className="w-full px-4 py-3 border-2 border-earth-100 rounded-xl bg-earth-50 text-earth-400 cursor-not-allowed"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Téléphone</label>
              <input type="tel" value={userForm.phone} onChange={e=>setUserForm(f=>({...f,phone:e.target.value}))}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="+237 6XX XXX XXX"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Ville</label>
              <select value={userForm.city} onChange={e=>setUserForm(f=>({...f,city:e.target.value}))}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
                <option value="">Sélectionner</option>
                {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-brand transition-colors disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      {/* Profil artisan */}
      {tab === 'artisan' && user?.role === 'artisan' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <form onSubmit={saveArtisan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-1.5">Métier *</label>
                <select value={artisanForm.metier} onChange={e=>setArtisanForm(f=>({...f,metier:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
                  <option value="">Choisir un métier</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-1.5">Ville *</label>
                <select value={artisanForm.ville} onChange={e=>setArtisanForm(f=>({...f,ville:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 bg-white">
                  <option value="">Votre ville</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Description</label>
              <textarea value={artisanForm.description} onChange={e=>setArtisanForm(f=>({...f,description:e.target.value}))} rows={4}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 resize-none transition-colors"
                placeholder="Décrivez votre expérience, vos compétences, votre zone d'intervention..."/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-1.5">WhatsApp</label>
                <input type="tel" value={artisanForm.whatsapp} onChange={e=>setArtisanForm(f=>({...f,whatsapp:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                  placeholder="+237 6XX XXX XXX"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-earth-700 mb-1.5">Années d'expérience</label>
                <input type="number" min="0" max="50" value={artisanForm.experience} onChange={e=>setArtisanForm(f=>({...f,experience:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                  placeholder="5"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-earth-700 mb-1.5">Spécialités (séparées par des virgules)</label>
              <input type="text" value={artisanForm.specialites} onChange={e=>setArtisanForm(f=>({...f,specialites:e.target.value}))}
                className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors"
                placeholder="Carrelage, pose de faïence, béton ciré"/>
            </div>
            <div className="flex items-center gap-3 p-4 bg-earth-50 rounded-xl">
              <input type="checkbox" id="dispo" checked={artisanForm.disponible} onChange={e=>setArtisanForm(f=>({...f,disponible:e.target.checked}))}
                className="w-5 h-5 accent-brand-500 cursor-pointer"/>
              <label htmlFor="dispo" className="text-sm font-semibold text-earth-700 cursor-pointer">Je suis disponible pour de nouveaux projets</label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-brand transition-colors disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Mettre à jour le profil artisan'}
            </button>
          </form>
        </div>
      )}

      {/* Photos réalisations */}
      {tab === 'photos' && user?.role === 'artisan' && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-earth-900">Photos de réalisations</h2>
            <span className="text-sm text-earth-400">{artisanData?.photos?.length||0} photo(s)</span>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-earth-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all mb-5">
            <svg className="w-10 h-10 text-earth-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span className="text-sm font-medium text-earth-500">Ajouter des photos (max 6)</span>
            <span className="text-xs text-earth-400 mt-1">JPG, PNG, WEBP jusqu'à 5MB</span>
            <input type="file" accept="image/*" multiple onChange={uploadPhotos} className="hidden" disabled={loading}/>
          </label>
          {artisanData?.photos?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {artisanData.photos.map((p, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-earth-100">
                  <img src={getImageUrl(p)} alt={`Réalisation ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-earth-400">
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-sm">Aucune photo de réalisation pour le moment</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
