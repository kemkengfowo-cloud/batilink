import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { VILLES } from '../utils/helpers';

const TYPE_PERSONNEL = ['Coffreur','Manœuvre','Ferrailleur','Dalleur','Maçon','Électricien','Plombier','Peintre','Carreleur','Menuisier','Soudeur','Autres'];
const TARIFS = { 'Coffreur':90000,'Manœuvre':45000,'Ferrailleur':85000,'Dalleur':75000,'Maçon':70000,'Électricien':80000,'Plombier':80000,'Peintre':60000,'Carreleur':70000,'Menuisier':75000,'Soudeur':85000,'Autres':50000 };
const DUREES = ['1 semaine','2 semaines','1 mois','2 mois','3 mois','6 mois','Indéterminée'];

export default function CreateMission() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre:'', description:'', typePersonnel:[], typeBesoin:'individuel',
    nombrePersonnes:1, duree:'1 semaine', remuneration:'', localisation:'', dateDebut:''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const togglePersonnel = (t) => {
    const arr = form.typePersonnel.includes(t) ? form.typePersonnel.filter(x=>x!==t) : [...form.typePersonnel,t];
    const tarif = arr.length > 0 ? (TARIFS[arr[0]] || 50000) : '';
    setForm(f=>({...f, typePersonnel:arr, remuneration: tarif }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/missions', form);
      navigate(`/missions/${res.data._id}`);
    } catch(err) { setError(err.response?.data?.message || 'Erreur lors de la publication'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";
  const totalEstime = (form.remuneration || 0) * (form.typeBesoin === 'equipe' ? form.nombrePersonnes : 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium transition-colors">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Nouvelle demande de location</h1>
        <p className="text-gray-500 mb-8">Votre besoin est diffusé aux techniciens disponibles : vous choisissez ensuite parmi ceux qui acceptent.</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className={labelCls}>Profil recherché *</label>
              <div className="flex flex-wrap gap-2">
                {TYPE_PERSONNEL.map(t=>(
                  <button key={t} type="button" onClick={()=>togglePersonnel(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${form.typePersonnel.includes(t)?'border-blue-500 bg-blue-500 text-white':'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Type de besoin *</label>
              <div className="grid grid-cols-2 gap-3">
                {['individuel','equipe'].map(t=>(
                  <button key={t} type="button" onClick={()=>set('typeBesoin',t)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all capitalize ${form.typeBesoin===t?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {t==='individuel'?'👤 Individuel':'👥 Équipe'}
                  </button>
                ))}
              </div>
            </div>

            {form.typeBesoin === 'equipe' && (
              <div>
                <label className={labelCls}>Nombre de personnes</label>
                <input type="number" min="2" max="50" value={form.nombrePersonnes} onChange={e=>set('nombrePersonnes',parseInt(e.target.value))} className={inputCls}/>
              </div>
            )}

            <div>
              <label className={labelCls}>Titre de la mission *</label>
              <input type="text" required value={form.titre} onChange={e=>set('titre',e.target.value)} className={inputCls} placeholder="Ex: Coffreur pour chantier résidentiel Bastos"/>
            </div>

            <div>
              <label className={labelCls}>Description du poste *</label>
              <textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Décrivez les tâches, les conditions de travail, les exigences techniques..."/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Durée du contrat *</label>
                <select required value={form.duree} onChange={e=>set('duree',e.target.value)} className={inputCls}>
                  {DUREES.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Adresse du chantier *</label>
                <select required value={form.localisation} onChange={e=>set('localisation',e.target.value)} className={inputCls}>
                  <option value="">Ville du chantier</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Date de début souhaitée</label>
              <input type="date" value={form.dateDebut} onChange={e=>set('dateDebut',e.target.value)} className={inputCls}/>
            </div>

            {/* Tarif estimé */}
            {form.remuneration > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                <p className="text-sm text-blue-600 font-semibold mb-1">Tarif Batilink pour ce profil</p>
                <p className="text-3xl font-display font-black text-blue-700">{new Intl.NumberFormat('fr-FR').format(form.remuneration)} FCFA <span className="text-lg font-normal text-blue-400">/ semaine</span></p>
                {form.typeBesoin === 'equipe' && form.nombrePersonnes > 1 && (
                  <p className="text-sm text-blue-500 mt-1">Total estimé pour {form.nombrePersonnes} personnes : <strong>{new Intl.NumberFormat('fr-FR').format(totalEstime)} FCFA</strong></p>
                )}
                <p className="text-xs text-blue-400 mt-2">* Tarif indicatif, négociable avec le technicien</p>
              </div>
            )}

            <button type="submit" disabled={loading || form.typePersonnel.length === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading ? 'Publication...' : '🚀 Publier la demande de location'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
