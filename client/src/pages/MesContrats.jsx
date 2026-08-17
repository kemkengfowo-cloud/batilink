import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';

const STATUT = {
  en_attente_signatures: { label:'En attente signatures', color:'bg-yellow-50 text-yellow-700 border-yellow-200', icon:'✍️' },
  signe:    { label:'Signe', color:'bg-blue-50 text-blue-700 border-blue-200', icon:'📝' },
  en_cours: { label:'En cours', color:'bg-green-50 text-green-700 border-green-200', icon:'🔨' },
  termine:  { label:'Termine', color:'bg-gray-100 text-gray-600 border-gray-200', icon:'✅' },
  resilie:  { label:'Resilie', color:'bg-red-50 text-red-700 border-red-200', icon:'❌' },
};

export default function MesContrats() {
  const { user } = useAuth();
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    api.get('/contrats/mes-contrats')
      .then(res => setContrats(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'tous' ? contrats : contrats.filter(c => c.statut === filter);

  if (loading) return <Loader/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-4 transition-colors">← Tableau de bord</Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Mes contrats</h1>
              <p className="text-gray-500 mt-1">{contrats.length} contrat{contrats.length>1?'s':''} au total</p>
            </div>
            {(user?.role === 'entreprise' || user?.role === 'client') && (
              <Link to="/contrats/creer" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                + Nouveau contrat
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-6">
          {['tous','en_attente_signatures','signe','en_cours','termine'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${filter===f?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {f==='tous'?'Tous':STATUT[f]?.icon+' '+STATUT[f]?.label}
              <span className="ml-2 text-xs opacity-70">{f==='tous'?contrats.length:contrats.filter(c=>c.statut===f).length}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucun contrat</h3>
            <p className="text-gray-400 mb-6">Vos contrats de mission apparaitront ici</p>
            {(user?.role==='entreprise'||user?.role==='client') && (
              <Link to="/contrats/creer" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                Creer un contrat
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(c=>(
              <Link key={c._id} to={`/contrats/${c._id}`}
                className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-400">{c.numeroContrat}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUT[c.statut]?.color}`}>
                        {STATUT[c.statut]?.icon} {STATUT[c.statut]?.label}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-lg">{c.typePersonnel}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                      {user?.role==='artisan' ? (
                        <span>Employeur : {c.employeur?.name}</span>
                      ) : (
                        <span>Technicien : {c.technicien?.name}</span>
                      )}
                      <span>•</span>
                      <span>Du {formatDate(c.dateDebut)} au {formatDate(c.dateFin)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-black text-blue-600">{formatBudget(c.remunerationTotal)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
                {c.statut==='en_attente_signatures' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm">
                    <span className={c.signatureEmployeur?.signe?'text-green-600 font-semibold':'text-amber-600'}>
                      {c.signatureEmployeur?.signe?'✓ Employeur signe':'⏳ Employeur non signe'}
                    </span>
                    <span className={c.signatureTechnicien?.signe?'text-green-600 font-semibold':'text-amber-600'}>
                      {c.signatureTechnicien?.signe?'✓ Technicien signe':'⏳ Technicien non signe'}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
