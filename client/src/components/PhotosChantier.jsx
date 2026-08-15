import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getAvatarUrl, getImageUrl, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function PhotosChantier({ devisId, contratId }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ description:'', etape:'' });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const id = devisId || contratId;
    if (!id) return;
    api.get(`/photos-chantier/${id}`)
      .then(res => setPhotos(res.data || []))
      .finally(() => setLoading(false));
  }, [devisId, contratId]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0,10);
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('photos', f));
      fd.append('description', form.description);
      fd.append('etape', form.etape);
      if (devisId) fd.append('devisId', devisId);
      if (contratId) fd.append('contratId', contratId);
      const res = await api.post('/photos-chantier', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setPhotos(prev => [res.data, ...prev]);
      setFiles([]); setPreviews([]); setForm({description:'',etape:''});
      setShowForm(false);
      setSuccess('Photos envoyees !');
      setTimeout(() => setSuccess(''), 3000);
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setUploading(false); }
  };

  const ETAPES = ['Preparation chantier','Fondations','Gros oeuvre','Second oeuvre','Finitions','Livraison'];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">Suivi photos du chantier</h2>
          <p className="text-gray-400 text-sm mt-0.5">{photos.reduce((s,p)=>s+p.photos.length,0)} photos envoyees</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
          + Ajouter photos
        </button>
      </div>

      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">✅ {success}</div>}

      {showForm && (
        <form onSubmit={handleUpload} className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl space-y-4">
          <h3 className="font-bold text-gray-900">Envoyer des photos</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Etape du chantier</label>
            <select value={form.etape} onChange={e=>setForm(f=>({...f,etape:e.target.value}))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="">Selectionner une etape</option>
              {ETAPES.map(e=><option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Decrivez l avancement des travaux..."/>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-all">
            <svg className="w-8 h-8 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span className="text-sm text-blue-500 font-medium">Cliquer pour ajouter des photos (max 10)</span>
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden"/>
          </label>
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {previews.map((p,i)=><img key={i} src={p} alt="" className="aspect-square rounded-lg object-cover"/>)}
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={uploading||!files.length}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
              {uploading?'Envoi...':'Envoyer les photos'}
            </button>
            <button type="button" onClick={()=>setShowForm(false)}
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📸</div>
          <p className="text-gray-500 font-semibold">Aucune photo de chantier</p>
          <p className="text-gray-400 text-sm mt-1">L artisan peut envoyer des photos de progression</p>
        </div>
      ) : (
        <div className="space-y-6">
          {photos.map(entry=>(
            <div key={entry._id} className="border border-gray-100 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-gray-50">
                <img src={getAvatarUrl(entry.envoyePar?.avatar, entry.envoyePar?.name)} alt="" className="w-9 h-9 rounded-lg object-cover"/>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{entry.envoyePar?.name}</p>
                  <div className="flex items-center gap-2">
                    {entry.etape && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">{entry.etape}</span>}
                    <span className="text-gray-400 text-xs">{formatDate(entry.createdAt)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{entry.photos.length} photo{entry.photos.length>1?'s':''}</span>
              </div>
              {entry.description && <p className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">{entry.description}</p>}
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {entry.photos.map((p,i)=>(
                  <a key={i} href={getImageUrl(p)} target="_blank" rel="noopener noreferrer">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity">
                      <img src={getImageUrl(p)} alt={`Photo ${i+1}`} className="w-full h-full object-cover"/>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
