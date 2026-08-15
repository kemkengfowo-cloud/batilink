import React, { useState } from 'react';
import api from '../utils/api';

export default function LitigeModal({ devisId, contratId, accuseId, onClose, onSuccess }) {
  const [form, setForm] = useState({ motif:'', description:'' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MOTIFS = [
    'Travaux non conformes au devis',
    'Travaux incomplets',
    'Materiaux de mauvaise qualite',
    'Non respect des delais',
    'Abandon de chantier',
    'Comportement non professionnel',
    'Autre'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('accuseId', accuseId);
      fd.append('motif', form.motif);
      fd.append('description', form.description);
      if (devisId) fd.append('devisId', devisId);
      if (contratId) fd.append('contratId', contratId);
      files.forEach(f => fd.append('preuves', f));
      await api.post('/litiges', fd, { headers:{'Content-Type':'multipart/form-data'} });
      onSuccess?.();
      onClose();
    } catch(err) { setError(err.response?.data?.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-2xl">⚠️</div>
          <div>
            <h3 className="font-display font-bold text-gray-900">Ouvrir un litige</h3>
            <p className="text-gray-400 text-xs">L admin Batilink examinera votre reclamation</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Motif du litige *</label>
            <select required value={form.motif} onChange={e=>setForm(f=>({...f,motif:e.target.value}))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 bg-white">
              <option value="">Selectionnez un motif</option>
              {MOTIFS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description detaillee *</label>
            <textarea required value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 resize-none"
              placeholder="Decrivez precisement le probleme rencontre..."/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preuves (photos, documents)</label>
            <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50 text-sm text-gray-500">
              📎 Ajouter des preuves ({files.length} fichier{files.length>1?'s':''})
              <input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files))} className="hidden"/>
            </label>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            ⚠️ Une fois le litige ouvert, l admin Batilink examinera les preuves des deux parties et rendra une decision sous 72h maximum.
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50">
              {loading?'Envoi...':'Soumettre le litige'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
