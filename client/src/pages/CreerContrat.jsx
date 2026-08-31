import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { formatBudget, VILLES } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

const TYPE_PERSONNEL = ['Coffreur','Manoeuvre','Ferrailleur','Dalleur','Macon','Electricien','Plombier','Peintre','Carreleur','Menuisier','Soudeur','Autres'];
const TARIFS = { 'Coffreur':90000,'Manoeuvre':45000,'Ferrailleur':85000,'Dalleur':75000,'Macon':70000,'Electricien':80000,'Plombier':80000,'Peintre':60000,'Carreleur':70000,'Menuisier':75000,'Soudeur':85000,'Autres':50000 };

export default function CreerContrat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    technicienEmail: '',
    missionId: searchParams.get('missionId') || '',
    typePersonnel: '',
    nombrePersonnes: 1,
    dateDebut: '',
    dateFin: '',
    adresseChantier: '',
    horaires: '7h00 - 17h00',
    equipementsFournis: false,
    remunerationTotal: '',
    obligations: ''
  });
  const [technicien, setTechnicien] = useState(null);
  const [searchingTech, setSearchingTech] = useState(false);
  useEffect(() => {
    const demandeId = searchParams.get("demandeId");
    if (demandeId) {
      api.get(`/demandes-personnel/${demandeId}`).then(res => {
        const d = res.data;
        set("typePersonnel", d.typePersonnel?.[0] || "");
        set("nombrePersonnes", d.nombrePersonnes || 1);
        set("dateDebut", d.dateDebut?.split("T")[0] || "");
        set("dateFin", d.dateFin?.split("T")[0] || "");
        set("adresseChantier", d.adresseChantier || "");
        set("remunerationTotal", d.budgetFinal || d.budgetPropose || "");
      }).catch(() => {});
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const searchTechnicien = async () => {
    if (!form.technicienEmail) return;
    setSearchingTech(true);
    try {
      const res = await api.get(`/users/search?email=${form.technicienEmail}`);
      if (res.data.role !== 'artisan')
        return setError('Cet utilisateur n est pas un technicien.');
      setTechnicien(res.data);
      setError('');
    } catch { setError('Technicien non trouve. Verifiez l email.'); setTechnicien(null); }
    finally { setSearchingTech(false); }
  };

  const selectTypePersonnel = (type) => {
    set('typePersonnel', type);
    set('remunerationTotal', TARIFS[type] || 50000);
  };

  const commission = Math.round((form.remunerationTotal||0) * 0.08);
  const montantTechnicien = (form.remunerationTotal||0) - commission;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (!technicien) { setError('Veuillez rechercher un technicien.'); setLoading(false); return; }
      const res = await api.post('/contrats', {
        ...form,
        technicienId: technicien._id,
        remunerationTotal: +form.remunerationTotal,
        nombrePersonnes: +form.nombrePersonnes
      });
      navigate(`/contrats/${res.data._id}`);
    } catch(err) { setError(err.response?.data?.message || 'Erreur lors de la creation'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/contrats" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium">← Retour</Link>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Nouveau contrat de mission</h1>
        <p className="text-gray-500 mb-8">Etablissez un contrat officiel avec votre technicien</p>

        <Avertissement type="devis"/>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6 space-y-6">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Recherche technicien */}
            <div>
              <label className={labelCls}>Email du technicien *</label>
              <div className="flex gap-2">
                <input type="email" value={form.technicienEmail} onChange={e=>set('technicienEmail',e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="technicien@email.com"/>
                <button type="button" onClick={searchTechnicien} disabled={searchingTech}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {searchingTech?'...':'Rechercher'}
                </button>
              </div>
              {technicien && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="text-green-700 font-semibold text-sm">{technicien.name}</p>
                    <p className="text-green-600 text-xs">{technicien.city} — Technicien verifie</p>
                  </div>
                </div>
              )}
            </div>

            {/* Type de personnel */}
            <div>
              <label className={labelCls}>Type de personnel *</label>
              <div className="flex flex-wrap gap-2">
                {TYPE_PERSONNEL.map(t=>(
                  <button key={t} type="button" onClick={()=>selectTypePersonnel(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${form.typePersonnel===t?'border-blue-500 bg-blue-500 text-white':'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nombre de personnes</label>
                <input type="number" min="1" max="50" value={form.nombrePersonnes} onChange={e=>set('nombrePersonnes',e.target.value)} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>Adresse du chantier *</label>
                <select required value={form.adresseChantier} onChange={e=>set('adresseChantier',e.target.value)} className={inputCls}>
                  <option value="">Ville du chantier</option>
                  {VILLES.map(v=><option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date de debut *</label>
                <input type="date" required value={form.dateDebut} onChange={e=>set('dateDebut',e.target.value)} className={inputCls}/>
              </div>
              <div>
                <label className={labelCls}>Date de fin *</label>
                <input type="date" required value={form.dateFin} onChange={e=>set('dateFin',e.target.value)} className={inputCls}/>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Horaires de travail</label>
                <input type="text" value={form.horaires} onChange={e=>set('horaires',e.target.value)} className={inputCls} placeholder="7h00 - 17h00"/>
              </div>
              <div>
                <label className={labelCls}>Remuneration totale (FCFA) *</label>
                <input type="number" required min="0" value={form.remunerationTotal} onChange={e=>set('remunerationTotal',e.target.value)} className={inputCls}/>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input type="checkbox" id="equipements" checked={form.equipementsFournis} onChange={e=>set('equipementsFournis',e.target.checked)} className="w-5 h-5 accent-blue-500 cursor-pointer"/>
              <label htmlFor="equipements" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Les equipements de protection et outils sont fournis par l employeur
              </label>
            </div>

            <div>
              <label className={labelCls}>Obligations et conditions specifiques</label>
              <textarea value={form.obligations} onChange={e=>set('obligations',e.target.value)} rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Ex: Port obligatoire du casque, respect des horaires, rapport quotidien..."/>
            </div>

            {/* Recap financier */}
            {form.remunerationTotal > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                <p className="text-sm font-bold text-blue-700 mb-3">Recap financier</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Remuneration totale</span><span className="font-bold">{formatBudget(+form.remunerationTotal)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Commission B.Y.H (8%)</span><span>{formatBudget(commission)}</span></div>
                  <div className="flex justify-between text-green-600 font-bold"><span>Technicien recevra (92%)</span><span>{formatBudget(montantTechnicien)}</span></div>
                </div>
              </div>
            )}

            {/* Clause protection */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
              <p className="font-bold mb-2">⚠️ Clause de protection B.Y.H</p>
              <p>Tout accord ou paiement effectue en dehors de la plateforme B.Y.H annule automatiquement toute protection et garantie. B.Y.H ne pourra pas intervenir en cas de litige pour des transactions hors plateforme.</p>
            </div>

            <button type="submit" disabled={loading||!technicien||!form.typePersonnel}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading?'Creation...':'Generer le contrat et envoyer pour signature'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
