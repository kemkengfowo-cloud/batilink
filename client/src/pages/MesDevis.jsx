import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';

const STATUT = {
  envoye:   { label:'En attente', color:'bg-yellow-50 text-yellow-700 border-yellow-200' },
  accepte:  { label:'Accepte', color:'bg-blue-50 text-blue-700 border-blue-200' },
  refuse:   { label:'Refuse', color:'bg-red-50 text-red-700 border-red-200' },
  expire:   { label:'Expire', color:'bg-gray-100 text-gray-500 border-gray-200' },
  termine:  { label:'Termine', color:'bg-green-50 text-green-700 border-green-200' },
};

export default function MesDevis() {
  const { user } = useAuth();
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    api.get('/devis/mes-devis')
      .then(res => setDevis(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'tous' ? devis : devis.filter(d => d.statut === filter);
  const devisEnAttente = devis.filter(d=>d.statut==="envoye");
  const [compareMode, setCompareMode] = useState(false);

  if (loading) return <Loader/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-4 transition-colors">← Tableau de bord</Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">Mes devis</h1>
              <p className="text-gray-500 mt-1">{devis.length} devis au total</p>
            </div>
            {(user?.role === 'artisan' || user?.role === 'entreprise') && (
              <Link to="/devis/creer" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                + Creer un devis
              </Link>
            )}
          </div>
        </div>
      </div>

        {user?.role === "client" && devisEnAttente.length > 1 && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-gray-900">Vous avez {devisEnAttente.length} devis en attente de reponse</p>
                <p className="text-amber-700 text-sm mt-0.5">Comparez-les avant d accepter</p>
              </div>
              <button onClick={()=>setCompareMode(!compareMode)}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600">
                {compareMode ? "Vue normale" : "Comparer les devis"}
              </button>
            </div>
            {compareMode && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devisEnAttente.map(d=>(
                  <div key={d._id} className="bg-white rounded-xl border-2 border-amber-200 p-4">
                    <p className="font-bold text-gray-900 text-sm mb-1">{d.artisan?.name || "Artisan"}</p>
                    <p className="text-2xl font-black text-blue-600">{(d.total||0).toLocaleString("fr-FR")} FCFA</p>
                    <p className="text-gray-500 text-xs mt-1">Delai: {d.delaiExecution || "Non precise"}</p>
                    <p className="text-gray-500 text-xs">Valide {d.validiteJours || 15} jours</p>
                    <Link to={"/devis/"+d._id} className="mt-3 block text-center py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Voir et repondre</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['tous','envoye','accepte','refuse','termine'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${filter===f?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              {f==='tous'?'Tous':STATUT[f]?.label}
              <span className="ml-2 text-xs opacity-70">
                {f==='tous'?devis.length:devis.filter(d=>d.statut===f).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucun devis</h3>
            <p className="text-gray-400 mb-6">
              {user?.role === 'client'
                ? 'Vos devis recus apparaitront ici'
                : 'Creez votre premier devis pour un client'}
            </p>
            {(user?.role === 'artisan' || user?.role === 'entreprise') && (
              <Link to="/devis/creer" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                Creer un devis
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(d=>(
              <Link key={d._id} to={`/devis/${d._id}`}
                className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-400">{d.numeroDevis}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUT[d.statut]?.color}`}>
                        {STATUT[d.statut]?.label}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-gray-900 text-lg">{d.titre}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                      {user?.role === 'client' ? (
                        <span>De : {d.artisan?.name}</span>
                      ) : (
                        <span>Pour : {d.client?.name}</span>
                      )}
                      {d.projet && <span>• Projet : {d.projet?.titre}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-black text-blue-600">{formatBudget(d.total)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(d.createdAt)}</p>
                    {d.statut === 'termine' && (
                      <p className="text-xs text-green-600 font-semibold mt-1">
                        Artisan: {formatBudget(d.montantArtisan)}
                      </p>
                    )}
                  </div>
                </div>
                {d.statut === 'envoye' && user?.role === 'client' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-amber-600 font-medium">⏳ En attente de votre reponse</p>
                  </div>
                )}
                {d.statut === 'accepte' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-blue-600 font-medium">🔨 Travaux en cours — Validez quand c'est termine</p>
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
