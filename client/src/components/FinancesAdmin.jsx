import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function FinancesAdmin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats-financieres')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  const exportCSV = async (url, filename) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api${url}`, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };
  }, []);

  const exportPaiements = () => exportCSV("/admin/export/paiements", "byh-paiements.csv");
  const exportUtilisateurs = () => exportCSV("/admin/export/users", "byh-utilisateurs.csv");
  const exportHistorique = () => exportCSV("/admin/export/historique", "byh-historique.csv");
  const _old = () => {
    window.open(`${process.env.REACT_APP_API_URL}/api/admin/export/paiements`, '_blank');
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">💰 Tableau financier B.Y.H</h2>
        <button onClick={exportPaiements}
          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
          📥 Export CSV Paiements
        </button>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Chiffre d\'affaires total', value: (stats?.total?.chiffreAffaires||0).toLocaleString('fr-FR') + ' FCFA', icon: '💵', color: 'text-blue-600' },
          { label: 'Commission B.Y.H totale', value: (stats?.total?.commission||0).toLocaleString('fr-FR') + ' FCFA', icon: '🏦', color: 'text-green-600' },
          { label: 'Transactions confirmées', value: stats?.total?.transactions || 0, icon: '✅', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tableau par mois */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">📅 Revenus par mois</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Mois</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Transactions</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Chiffre d'affaires</th>
                <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase">Commission B.Y.H</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats?.statsParMois?.length > 0 ? stats.statsParMois.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900 capitalize">{m.mois}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{m.transactions}</td>
                  <td className="px-5 py-3 text-right font-bold text-blue-600">{m.chiffreAffaires.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-5 py-3 text-right font-bold text-green-600">{m.commission.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-gray-400">Aucune transaction confirmée pour le moment</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={exportUtilisateurs}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
          👥 Export Utilisateurs CSV
        </button>
        <button onClick={exportHistorique}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">
          📜 Export Historique CSV
        </button>
        <button onClick={exportPaiements}
          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700">
          💳 Export Paiements CSV
        </button>
      </div>
    </div>
  );
}
