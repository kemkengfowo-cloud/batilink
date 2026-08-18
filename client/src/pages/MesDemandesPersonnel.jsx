import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';

const STATUT = {
  en_attente:       { label:'En attente admin', color:'bg-yellow-50 text-yellow-700 border-yellow-200', icon:'⏳' },
  en_negociation:   { label:'En negociation', color:'bg-blue-50 text-blue-700 border-blue-200', icon:'💬' },
  accord_trouve:    { label:'Accord trouve', color:'bg-green-50 text-green-700 border-green-200', icon:'✅' },
  contrat_genere:   { label:'Contrat genere', color:'bg-purple-50 text-purple-700 border-purple-200', icon:'📄' },
  en_cours:         { label:'Mission en cours', color:'bg-indigo-50 text-indigo-700 border-indigo-200', icon:'🔨' },
  termine:          { label:'Termine', color:'bg-gray-100 text-gray-600 border-gray-200', icon:'✓' },
  annulee:          { label:'Annulee', color:'bg-red-50 text-red-700 border-red-200', icon:'❌' },
};

export default function MesDemandesPersonnel() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/demandes-personnel/mes-demandes')
      .then(res => setDemandes(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                {user?.role === 'admin' ? 'Toutes les demandes de personnel' : 'Mes demandes de personnel'}
              </h1>
              <p className="text-gray-500 mt-1">Gestion du personnel BTP via BYHOME</p>
            </div>
            {user?.role === 'entreprise' && (
              <Link to="/demandes-personnel/new"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                + Demander du personnel
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {demandes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">👷</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune demande</h3>
            {user?.role === 'entreprise' && (
              <>
                <p className="text-gray-400 mb-6">Soumettez votre premiere demande de personnel</p>
                <Link to="/demandes-personnel/new" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                  Demander du personnel
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.map(d => (
              <Link key={d._id} to={`/demandes-personnel/${d._id}`}
                className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUT[d.statut]?.color}`}>
                        {STATUT[d.statut]?.icon} {STATUT[d.statut]?.label}
                      </span>
                      {d.typePersonnel?.map(t => (
                        <span key={t} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{t}</span>
                      ))}
                    </div>
                    <h3 className="font-display font-bold text-gray-900">
                      {d.nombrePersonnes} {d.typePersonnel?.join(', ')} — {d.ville}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      📅 {formatDate(d.dateDebut)} → {formatDate(d.dateFin)}
                    </p>
                    {user?.role === 'admin' && (
                      <p className="text-gray-400 text-xs mt-1">Entreprise: {d.entreprise?.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-black text-blue-600">{formatBudget(d.budgetFinal || d.budgetPropose)}</p>
                    {d.budgetFinal && d.budgetFinal !== d.budgetPropose && (
                      <p className="text-xs text-green-600 font-semibold">Prix negocie</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(d.createdAt)}</p>
                    {d.artisansProoses?.length > 0 && (
                      <p className="text-xs text-blue-600 font-semibold mt-1">
                        {d.artisansProoses.length} technicien(s) propose(s)
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
