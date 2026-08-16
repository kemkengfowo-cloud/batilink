import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { VILLES } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

const TYPES_PROBLEMES = [
  'Fuite d eau / Plomberie',
  'Probleme electrique',
  'Fissures / Maconnerie',
  'Toiture / Etancheite',
  'Carrelage / Revetement',
  'Peinture / Finitions',
  'Menuiserie / Portes / Fenetres',
  'Climatisation',
  'Je ne sais pas exactement',
  'Autre'
];

export default function DemanderVisite() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    adresse: '',
    ville: '',
    description: '',
    typeProbleme: '',
    dateVisite: '',
    fraisVisite: 5000
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/visites', form);
      navigate(`/visites/${res.data._id}`);
    } catch(err) { setError(err.response?.data?.message || 'Erreur lors de la demande'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 font-medium">
            ← Retour
          </Link>
          <h1 className="text-3xl font-display font-black text-white mb-2">Demander une visite d evaluation</h1>
          <p className="text-blue-200">Un technicien se deplace sur votre chantier pour evaluer et chiffrer vos travaux</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Info frais */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">🔍</div>
            <div>
              <h3 className="font-display font-bold text-gray-900 mb-2">Comment ca fonctionne ?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">1.</span> Vous decrivez votre probleme et choisissez une date</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">2.</span> Un technicien disponible dans votre ville accepte la visite</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">3.</span> Le technicien se deplace, evalue et prend des photos</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">4.</span> Vous recevez un rapport detaille avec estimation du cout</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">5.</span> Si vous acceptez le devis, les frais de visite sont deduits</li>
              </ul>
            </div>
          </div>
        </div>

        <Avertissement type="devis"/>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className={labelCls}>Description du probleme *</label>
              <textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Decrivez votre probleme en detail. Ex: J ai une fuite d eau dans la salle de bain depuis 3 jours, le plafond commence a se deteriorer..."/>
            </div>

            <div>
              <label className={labelCls}>Type de probleme</label>
              <div className="flex flex-wrap gap-2">
                {TYPES_PROBLEMES.map(t=>(
                  <button key={t} type="button" onClick={()=>set('typeProbleme',t)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${form.typeProbleme===t?'border-blue-500 bg-blue-500 text-white':'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ville du chantier *</label>
                <select required value={form.ville} onChange={e=>set('ville',e.target.value)} className={inputCls}>
                  <option value="">Selectionner la ville</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Date souhaitee pour la visite</label>
                <input type="date" value={form.dateVisite} onChange={e=>set('dateVisite',e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls}/>
              </div>
            </div>

            <div>
              <label className={labelCls}>Adresse exacte du chantier *</label>
              <input type="text" required value={form.adresse} onChange={e=>set('adresse',e.target.value)}
                className={inputCls} placeholder="Quartier, rue, numero..."/>
            </div>

            {/* Frais de visite */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Frais de visite</h3>
                <span className="text-2xl font-display font-black text-blue-600">
                  {new Intl.NumberFormat('fr-FR').format(form.fraisVisite)} FCFA
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {v:5000, label:'Standard — Visite simple (recommande)'},
                  {v:10000, label:'Urgent — Visite dans les 24h'},
                  {v:15000, label:'Premium — Visite le jour meme'},
                ].map(o=>(
                  <label key={o.v} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.fraisVisite===o.v?'border-blue-500 bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" checked={form.fraisVisite===o.v} onChange={()=>set('fraisVisite',o.v)} className="accent-blue-500"/>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{o.label}</p>
                    </div>
                    <span className="ml-auto font-bold text-blue-600">{new Intl.NumberFormat('fr-FR').format(o.v)} FCFA</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-amber-700 mt-3">
                ✅ Ces frais sont deduits du devis final si vous acceptez les travaux.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading ? 'Envoi...' : 'Demander la visite d evaluation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
