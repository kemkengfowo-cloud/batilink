import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';

const STATUT = {
  en_attente:         { label:'En attente', color:'bg-yellow-50 text-yellow-700 border-yellow-200', icon:'⏳' },
  evaluateur_assigne: { label:'Technicien assigne', color:'bg-blue-50 text-blue-700 border-blue-200', icon:'👷' },
  visite_effectuee:   { label:'Visite effectuee', color:'bg-indigo-50 text-indigo-700 border-indigo-200', icon:'✓' },
  rapport_soumis:     { label:'Rapport disponible', color:'bg-green-50 text-green-700 border-green-200', icon:'📋' },
  devis_genere:       { label:'Devis genere', color:'bg-purple-50 text-purple-700 border-purple-200', icon:'📄' },
  annulee:            { label:'Annulee', color:'bg-red-50 text-red-700 border-red-200', icon:'❌' },
};

export default function MesVisites() {
  const { user } = useAuth();
  const [visites, setVisites] = useState([]);
  const [visitesDisponibles, setVisitesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mes');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/visites/mes-visites');
        setVisites(res.data || []);
        if (user?.role === 'artisan' || user?.role === 'entreprise') {
          const res2 = await api.get('/visites/disponibles');
          setVisitesDisponibles(res2.data || []);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (loading) return <Loader/>;

  const isPrestataire = user?.role === 'artisan' || user?.role === 'entreprise';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Visites d evaluation</h1>
              <p className="text-gray-500 mt-1">Evaluation professionnelle de vos chantiers</p>
            </div>
            {user?.role === 'client' && (
              <Link to="/visites/demander"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                + Demander une visite
              </Link>
            )}
          </div>

          {isPrestataire && (
            <div className="flex gap-1 mt-6 border-b border-gray-200">
              {[
                {id:'mes', label:`Mes visites (${visites.length})`},
                {id:'disponibles', label:`Visites disponibles (${visitesDisponibles.length})`},
              ].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)}
                  className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${activeTab===t.id?'border-blue-500 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Mes visites */}
        {activeTab === 'mes' && (
          visites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune visite</h3>
              {user?.role === 'client' && (
                <>
                  <p className="text-gray-400 mb-6">Demandez une evaluation professionnelle de votre chantier</p>
                  <Link to="/visites/demander" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                    Demander une visite
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {visites.map(v=>(
                <Link key={v._id} to={`/visites/${v._id}`}
                  className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUT[v.statut]?.color}`}>
                          {STATUT[v.statut]?.icon} {STATUT[v.statut]?.label}
                        </span>
                        {v.typeProbleme && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{v.typeProbleme}</span>}
                      </div>
                      <h3 className="font-display font-bold text-gray-900">{v.description?.substring(0,80)}...</h3>
                      <p className="text-gray-500 text-sm mt-1">📍 {v.adresse}, {v.ville}</p>
                      {v.dateVisite && <p className="text-gray-400 text-xs mt-0.5">📅 {formatDate(v.dateVisite)}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-display font-black text-blue-600">{formatBudget(v.fraisVisite)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(v.createdAt)}</p>
                      {v.rapport?.estimationCout > 0 && (
                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Estimation: {formatBudget(v.rapport.estimationCout)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Visites disponibles pour artisans */}
        {activeTab === 'disponibles' && isPrestataire && (
          visitesDisponibles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-6xl mb-4">📍</div>
              <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucune visite disponible</h3>
              <p className="text-gray-400">Les nouvelles demandes de visite dans votre ville apparaitront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visitesDisponibles.map(v=>(
                <Link key={v._id} to={`/visites/${v._id}`}
                  className="block bg-white rounded-2xl border-2 border-green-200 hover:shadow-md transition-all p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                          Disponible
                        </span>
                        {v.typeProbleme && <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{v.typeProbleme}</span>}
                      </div>
                      <h3 className="font-display font-bold text-gray-900">{v.description?.substring(0,80)}...</h3>
                      <p className="text-gray-500 text-sm mt-1">📍 {v.adresse}, {v.ville}</p>
                      {v.dateVisite && <p className="text-gray-400 text-xs mt-0.5">📅 Visite souhaitee le {formatDate(v.dateVisite)}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-display font-black text-green-600">{formatBudget(v.fraisVisite)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">a gagner</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(v.createdAt)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
