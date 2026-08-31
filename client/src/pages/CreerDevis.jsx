import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { formatBudget } from '../utils/helpers';
import Avertissement from '../components/Avertissement';

export default function CreerDevis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    clientEmail: '', projetId: '',
    titre: '', description: '',
    delaiExecution: '', validiteJours: 15,
    conditionsPaiement: 'Paiement via B.Y.H — Libere apres validation des travaux',
    materielsInclus: false
  });
  const [lignes, setLignes] = useState([
    { designation:'', quantite:1, unite:'unite', prixUnitaire:0 }
  ]);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchingClient, setSearchingClient] = useState(false);
  const [clientFound, setClientFound] = useState(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    const clientIdParam = searchParams.get('clientId');
    const projetIdParam = searchParams.get('projetId');
    const titreParam = searchParams.get('titre');
    const categorieParam = searchParams.get('categorie');
    if (clientIdParam) setClientId(clientIdParam);
    if (projetIdParam) set('projetId', projetIdParam);
    if (titreParam) set('titre', titreParam);
    if (clientIdParam) {
      api.get(`/users/profile/${clientIdParam}`).then(res => setClientFound(res.data)).catch(()=>{});
    }
  }, []);
    const editId = searchParams.get("edit");
    if (editId) {
      api.get("/devis/" + editId).then(res => {
        const d = res.data;
        set("titre", d.titre || "");
        set("description", d.description || "");
        set("delaiExecution", d.delaiExecution || "");
        set("validiteJours", d.validiteJours || 15);
        set("materielsInclus", d.materielsInclus || false);
        if (d.client) setClientId(d.client._id || d.client);
        if (d.client) setClientFound(d.client);
        if (d.lignes) setLignes(d.lignes);
      }).catch(() => {});
    }

  const searchClient = async () => {
    if (!form.clientEmail) return;
    setSearchingClient(true);
    try {
      const res = await api.get(`/users/search?email=${form.clientEmail}`);
      setClientFound(res.data);
      setClientId(res.data._id);
    } catch { setError('Client non trouve. Verifiez l email.'); setClientFound(null); }
    finally { setSearchingClient(false); }
  };

  const addLigne = () => setLignes(l=>[...l, { designation:'', quantite:1, unite:'unite', prixUnitaire:0 }]);
  const removeLigne = (i) => setLignes(l=>l.filter((_,idx)=>idx!==i));
  const setLigne = (i,k,v) => setLignes(l=>l.map((x,idx)=>idx===i?{...x,[k]:v}:x));

  const sousTotal = lignes.reduce((s,l)=>s+(l.quantite*l.prixUnitaire),0);
  const commission = Math.round(sousTotal * 0.08);
  const montantArtisan = sousTotal - commission;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (!clientId) { setError('Veuillez rechercher et selectionner un client.'); setLoading(false); return; }
      const res = await api.post('/devis', {
        clientId, projetId: form.projetId || undefined,
        titre: form.titre, description: form.description,
        lignes: lignes.map(l=>({...l, quantite:+l.quantite, prixUnitaire:+l.prixUnitaire})),
        delaiExecution: form.delaiExecution,
        validiteJours: +form.validiteJours,
        conditionsPaiement: form.conditionsPaiement,
        materielsInclus: form.materielsInclus
      });
      navigate(`/devis/${res.data._id}`);
    } catch(err) { setError(err.response?.data?.message || 'Erreur lors de la creation'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/devis" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 font-medium">← Retour</Link>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Creer un devis</h1>
        <p className="text-gray-500 mb-8">Etablissez un devis professionnel pour votre client</p>

        <Avertissement type="devis"/>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
          {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recherche client */}
            <div>
              <label className={labelCls}>Email du client *</label>
              <div className="flex gap-2">
                <input type="email" value={form.clientEmail} onChange={e=>set('clientEmail',e.target.value)}
                  className={`flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500`}
                  placeholder="client@email.com"/>
                <button type="button" onClick={searchClient} disabled={searchingClient}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 text-sm">
                  {searchingClient?'...':'Rechercher'}
                </button>
              </div>
              {clientFound && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-green-700 font-semibold text-sm">Client trouve : {clientFound.name} — {clientFound.city}</span>
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Titre du devis *</label>
              <input type="text" required value={form.titre} onChange={e=>set('titre',e.target.value)}
                className={inputCls} placeholder="Ex: Renovation salle de bain — Quartier Bastos"/>
            </div>

            <div>
              <label className={labelCls}>Description des travaux *</label>
              <textarea required value={form.description} onChange={e=>set('description',e.target.value)} rows={4}
                className={`${inputCls} resize-none`}
                placeholder="Decrivez en detail les travaux a realiser..."/>
            </div>

            {/* Lignes du devis */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`${labelCls} mb-0`}>Detail des travaux *</label>
                <button type="button" onClick={addLigne}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100">
                  + Ajouter une ligne
                </button>
              </div>
              <div className="space-y-3">
                {lignes.map((l,i)=>(
                  <div key={i} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-xl">
                    <div className="col-span-5">
                      <input type="text" placeholder="Designation" value={l.designation} onChange={e=>setLigne(i,'designation',e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" required/>
                    </div>
                    <div className="col-span-2">
                      <input type="number" placeholder="Qte" min="1" value={l.quantite} onChange={e=>setLigne(i,'quantite',e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" required/>
                    </div>
                    <div className="col-span-2">
                      <input type="text" placeholder="Unite" value={l.unite} onChange={e=>setLigne(i,'unite',e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"/>
                    </div>
                    <div className="col-span-2">
                      <input type="number" placeholder="Prix" min="0" value={l.prixUnitaire} onChange={e=>setLigne(i,'prixUnitaire',e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" required/>
                    </div>
                    <div className="col-span-1 flex items-center justify-center pt-2">
                      {lignes.length > 1 && (
                        <button type="button" onClick={()=>removeLigne(i)} className="text-red-400 hover:text-red-600 text-xl">×</button>
                      )}
                    </div>
                    <div className="col-span-12 text-right text-sm font-semibold text-blue-600">
                      = {formatBudget(l.quantite * l.prixUnitaire)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recap financier */}
              <div className="mt-4 p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Sous-total</span><span className="font-bold">{formatBudget(sousTotal)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Commission B.Y.H (8%)</span><span>{formatBudget(commission)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Vous recevrez (90%)</span><span className="text-green-600 font-bold">{formatBudget(montantArtisan)}</span></div>
                  <hr className="border-blue-200"/>
                  <div className="flex justify-between text-lg font-display font-black text-blue-700">
                    <span>Total client</span><span>{formatBudget(sousTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Delai d execution *</label>
                <input type="text" required value={form.delaiExecution} onChange={e=>set('delaiExecution',e.target.value)}
                  className={inputCls} placeholder="Ex: 2 semaines, 1 mois..."/>
              </div>
              <div>
                <label className={labelCls}>Validite du devis (jours)</label>
                <input type="number" min="7" max="90" value={form.validiteJours} onChange={e=>set('validiteJours',e.target.value)}
                  className={inputCls}/>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input type="checkbox" id="materiels" checked={form.materielsInclus} onChange={e=>set('materielsInclus',e.target.checked)}
                className="w-5 h-5 accent-blue-500 cursor-pointer"/>
              <label htmlFor="materiels" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Les materiels et fournitures sont inclus dans ce devis
              </label>
            </div>

            <button type="submit" disabled={loading||!clientId}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading?'Creation...':'Envoyer le devis au client'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
