import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatDate, getAvatarUrl } from '../utils/helpers';

const STATUT = {
  ouvert:           { label:'Ouvert', color:'bg-red-50 text-red-700 border-red-200', icon:'🔴' },
  en_examen:        { label:'En examen', color:'bg-amber-50 text-amber-700 border-amber-200', icon:'🔍' },
  resolu_plaignant: { label:'Resolu en votre faveur', color:'bg-green-50 text-green-700 border-green-200', icon:'✅' },
  resolu_accuse:    { label:'Resolu en faveur adverse', color:'bg-blue-50 text-blue-700 border-blue-200', icon:'⚖️' },
  classe:           { label:'Classe sans suite', color:'bg-gray-100 text-gray-500 border-gray-200', icon:'📁' },
};

export default function MesLitiges() {
  const { user } = useAuth();
  const [litiges, setLitiges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/litiges/mes-litiges')
      .then(res => setLitiges(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader/>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-4">
            ← Tableau de bord
          </Link>
          <h1 className="text-3xl font-display font-bold text-gray-900">Mes litiges</h1>
          <p className="text-gray-500 mt-1">{litiges.length} litige{litiges.length>1?'s':''} au total</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {litiges.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Aucun litige</h3>
            <p className="text-gray-400">Vous n avez ouvert aucun litige pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {litiges.map(l => (
              <div key={l._id} className={`bg-white rounded-2xl border-2 p-5 ${l.statut==='ouvert'?'border-red-200':l.statut==='en_examen'?'border-amber-200':'border-gray-100'}`}>
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUT[l.statut]?.color}`}>
                        {STATUT[l.statut]?.icon} {STATUT[l.statut]?.label}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900">{l.motif}</p>
                    {l.description && <p className="text-gray-500 text-sm mt-1">{l.description}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(l.createdAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-xl mb-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Plaignant</p>
                    <div className="flex items-center gap-2">
                      <img src={getAvatarUrl(l.plaignant?.avatar, l.plaignant?.name)} alt="" className="w-7 h-7 rounded-lg"/>
                      <p className="text-sm font-semibold text-gray-900">{l.plaignant?.name}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Accuse</p>
                    <div className="flex items-center gap-2">
                      <img src={getAvatarUrl(l.accuse?.avatar, l.accuse?.name)} alt="" className="w-7 h-7 rounded-lg"/>
                      <p className="text-sm font-semibold text-gray-900">{l.accuse?.name}</p>
                    </div>
                  </div>
                </div>

                {l.decisionAdmin && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                    <strong>Decision admin :</strong> {l.decisionAdmin}
                  </div>
                )}

                {l.statut === 'ouvert' && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                    ⏳ Votre litige est en cours d examen. L admin BYHOME vous contactera sous 72h.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
