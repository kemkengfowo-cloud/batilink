import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';

export default function MesRevenus() {
  const [data, setData] = useState({ paiements: [], stats: { total: 0, enAttente: 0, nbTransactions: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/paiements/mes-revenus')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { paiements, stats } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 relative overflow-hidden" style={{background:'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/dashboard" className="text-green-300 hover:text-white text-sm mb-4 inline-block">← Dashboard</Link>
          <h1 className="text-3xl font-display font-black text-white mb-6">💰 Mes Revenus</h1>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total reçu', value: `${new Intl.NumberFormat('fr-FR').format(stats.total)} FCFA`, icon: '💰', color: 'text-green-300' },
              { label: 'En attente', value: `${new Intl.NumberFormat('fr-FR').format(stats.enAttente)} FCFA`, icon: '⏳', color: 'text-yellow-300' },
              { label: 'Transactions', value: stats.nbTransactions, icon: '📊', color: 'text-blue-300' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-green-300 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? <Loader/> : paiements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun revenu</h3>
            <p className="text-gray-400 mb-6">Vos revenus apparaîtront ici après validation des travaux</p>
            <Link to="/projects" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
              Voir les projets →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {paiements.map(p => (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{p.devis?.titre || 'Projet'}</p>
                    <p className="text-gray-400 text-sm">Client : {p.client?.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.statut === 'confirme' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {p.statut === 'confirme' ? '✅ Reçu' : '⏳ En attente'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Montant reçu</p>
                    <p className="font-black text-green-600 text-lg">{new Intl.NumberFormat('fr-FR').format(p.montantArtisan)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Montant total</p>
                    <p className="font-bold text-gray-900">{new Intl.NumberFormat('fr-FR').format(p.montant)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="font-bold text-gray-900">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                {p.jalon && (
                  <div className="mt-3 px-3 py-2 bg-blue-50 rounded-xl">
                    <p className="text-blue-700 text-xs font-semibold">Jalon : {p.jalon.titre}</p>
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
