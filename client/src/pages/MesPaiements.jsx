import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';

const STATUTS = {
  initie:     { bg: '#F8FAFC', text: '#64748B', label: '🔵 Initié' },
  en_attente: { bg: '#FFF7ED', text: '#EA580C', label: '⏳ En attente' },
  confirme:   { bg: '#F0FDF4', text: '#16A34A', label: '✅ Confirmé' },
  echoue:     { bg: '#FFF1F2', text: '#E11D48', label: '❌ Échoué' },
  rembourse:  { bg: '#EFF6FF', text: '#2563EB', label: '↩️ Remboursé' },
};

export default function MesPaiements() {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, confirme: 0 });

  useEffect(() => {
    api.get('/paiements/mes-paiements')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setPaiements(data);
        setStats({
          total: data.reduce((s, p) => s + (p.statut === 'confirme' ? p.montant : 0), 0),
          enAttente: data.filter(p => p.statut === 'en_attente').reduce((s, p) => s + p.montant, 0),
          confirme: data.filter(p => p.statut === 'confirme').length,
        });
      })
      .catch(() => setPaiements([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <Link to="/dashboard" className="text-blue-300 hover:text-white text-sm mb-4 inline-block">← Dashboard</Link>
          <h1 className="text-3xl font-display font-black text-white mb-6">💳 Mes Paiements</h1>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total payé', value: `${new Intl.NumberFormat('fr-FR').format(stats.total)} FCFA`, icon: '💰' },
              { label: 'En attente', value: `${new Intl.NumberFormat('fr-FR').format(stats.enAttente)} FCFA`, icon: '⏳' },
              { label: 'Confirmés', value: stats.confirme, icon: '✅' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-blue-300 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? <Loader/> : paiements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun paiement</h3>
            <p className="text-gray-400">Vos paiements apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paiements.map(p => {
              const statut = STATUTS[p.statut] || STATUTS.initie;
              return (
                <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900">{p.devis?.titre || 'Projet'}</p>
                      <p className="text-gray-400 text-sm">Ref: <span className="font-mono text-blue-600">{p.reference}</span></p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: statut.bg, color: statut.text}}>
                      {statut.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Montant</p>
                      <p className="font-bold text-gray-900">{new Intl.NumberFormat('fr-FR').format(p.montant)} FCFA</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Opérateur</p>
                      <p className="font-bold text-gray-900">{p.operateur === 'orange_money' ? '🟠 Orange Money' : '🟡 MTN MoMo'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Artisan</p>
                      <p className="font-bold text-gray-900">{p.artisan?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="font-bold text-gray-900">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  {p.statut === 'en_attente' && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-700 text-sm">⏳ En attente de confirmation par l'équipe B.Y.H (max 30 min)</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
