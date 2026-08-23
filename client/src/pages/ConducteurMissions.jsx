import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const METEO_ICONS = {
  ensoleille: '☀️',
  nuageux: '⛅',
  pluvieux: '🌧️',
  orageux: '⛈️',
};

const STATUT_COLORS = {
  ouverte:    { bg: '#EFF6FF', text: '#2563EB', label: '🟢 Ouverte' },
  en_cours:   { bg: '#F0FDF4', text: '#16A34A', label: '🔨 En cours' },
  terminee:   { bg: '#F8FAFC', text: '#64748B', label: '✅ Terminée' },
  annulee:    { bg: '#FFF1F2', text: '#E11D48', label: '❌ Annulée' },
};

export default function ConducteurMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('disponibles');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ titre:'', description:'', localisation:'', dateDebut:'', dateFin:'', budgetJournalier:'', typeChantier:'construction' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = tab === 'mes-missions' ? '/conducteur/mes-missions' : '/conducteur/missions';
    api.get(url)
      .then(res => setMissions(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMissions([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/conducteur/missions', form);
      setShowCreate(false);
      setForm({ titre:'', description:'', localisation:'', dateDebut:'', dateFin:'', budgetJournalier:'', typeChantier:'construction' });
      setTab('mes-missions');
    } catch(err) {
      alert(err.response?.data?.message || 'Erreur lors de la création');
    } finally { setCreating(false); }
  };

  const handlePostuler = async (missionId) => {
    const message = prompt('Votre message de candidature :');
    if (!message) return;
    const tarif = prompt('Votre tarif journalier (FCFA) :');
    try {
      await api.post(`/conducteur/missions/${missionId}/postuler`, { message, tarif: parseInt(tarif) });
      alert('Candidature envoyée avec succès !');
    } catch(err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                Suivi de chantier à distance
              </div>
              <h1 className="text-4xl font-display font-black mb-2">🏗️ Conducteurs de Travaux</h1>
              <p className="text-blue-200">Suivez vos chantiers en temps réel depuis n'importe où</p>
            </div>
            {user?.role === 'client' && (
              <button onClick={() => setShowCreate(true)}
                className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg hover:scale-105">
                ➕ Publier une mission
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id:'disponibles', label:'🔍 Missions disponibles' },
            { id:'mes-missions', label: user?.role === 'client' ? '📋 Mes missions' : '🔨 Mes chantiers' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${tab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Liste missions */}
        {loading ? <Loader/> : missions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune mission</h3>
            <p className="text-gray-400 mb-6">
              {tab === 'disponibles' ? 'Aucune mission ouverte pour le moment' : 'Vous n\'avez pas encore de mission'}
            </p>
            {user?.role === 'client' && (
              <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                Publier une mission →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map(m => {
              const statut = STATUT_COLORS[m.statut] || STATUT_COLORS.ouverte;
              return (
                <div key={m._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-display font-bold text-gray-900">{m.titre}</h3>
                      <p className="text-gray-500 text-sm mt-1">📍 {m.localisation}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0" style={{background: statut.bg, color: statut.text}}>
                      {statut.label}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{m.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Client</p>
                      <p className="font-semibold text-gray-900">{m.client?.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{m.typeChantier}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Budget/jour</p>
                      <p className="font-semibold text-gray-900">
                        {m.budgetJournalier ? `${new Intl.NumberFormat('fr-FR').format(m.budgetJournalier)} FCFA` : 'À négocier'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-400 text-xs">Avancement</p>
                      <p className="font-semibold text-gray-900">{m.avancementGlobal || 0}%</p>
                    </div>
                  </div>

                  {/* Barre avancement */}
                  {m.statut === 'en_cours' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Avancement global</span>
                        <span>{m.avancementGlobal || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 rounded-full h-2 transition-all" style={{width:`${m.avancementGlobal || 0}%`}}/>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <Link to={`/conducteur/missions/${m._id}`}
                      className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm text-center hover:bg-blue-700 transition-colors">
                      Voir les détails →
                    </Link>
                    {tab === 'disponibles' && user?.role !== 'client' && m.statut === 'ouverte' && (
                      <button onClick={() => handlePostuler(m._id)}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                        Postuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal créer mission */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">🏗️ Nouvelle mission conducteur</h2>
                <button onClick={() => setShowCreate(false)} className="text-white/70 hover:text-white text-2xl">×</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Titre de la mission *</label>
                <input type="text" required value={form.titre} onChange={e => setForm(f=>({...f,titre:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Suivi construction villa R+1 Yaoundé"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                <textarea required value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none" rows={3}
                  placeholder="Décrivez les travaux à suivre, vos attentes..."/>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Localisation *</label>
                <input type="text" required value={form.localisation} onChange={e => setForm(f=>({...f,localisation:e.target.value}))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Bastos, Yaoundé"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date début</label>
                  <input type="date" value={form.dateDebut} onChange={e => setForm(f=>({...f,dateDebut:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date fin prévue</label>
                  <input type="date" value={form.dateFin} onChange={e => setForm(f=>({...f,dateFin:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Budget journalier (FCFA)</label>
                  <input type="number" value={form.budgetJournalier} onChange={e => setForm(f=>({...f,budgetJournalier:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Ex: 15000"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type de chantier</label>
                  <select value={form.typeChantier} onChange={e => setForm(f=>({...f,typeChantier:e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
                    <option value="construction">Construction</option>
                    <option value="renovation">Rénovation</option>
                    <option value="amenagement">Aménagement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={creating}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg">
                {creating ? '⏳ Publication...' : '🚀 Publier la mission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
