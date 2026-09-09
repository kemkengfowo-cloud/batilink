import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatDate, getAvatarUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const STATUT_CONFIG = {
  ouvert:             { label: '🔴 Ouvert',           bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
  en_attente_reponse: { label: '⏳ Attente réponse',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  en_examen:          { label: '🔍 En examen',         bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  resolu_plaignant:   { label: '✅ Résolu (plaignant)',bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  resolu_accuse:      { label: '✅ Résolu (accusé)',   bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  resolu_partage:     { label: '⚖️ Partage',           bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200'},
  classe:             { label: '📁 Classé',            bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200' },
};


export default function MesLitiges() {
  const { user } = useAuth();
  const [litiges, setLitiges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reponse, setReponse] = useState('');
  const [repondreId, setRepondreId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageId, setMessageId] = useState(null);

  useEffect(() => {
    api.get('/litiges/mes-litiges')
      .then(r => setLitiges(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const repondre = async (id) => {
    if (!reponse.trim()) return;
    try {
      await api.put(`/litiges/${id}/repondre`, { reponse });
      setReponse(''); setRepondreId(null);
      const r = await api.get('/litiges/mes-litiges');
      setLitiges(r.data || []);
    } catch(e) { alert(e.response?.data?.message || 'Erreur'); }
  };

  const envoyerMessage = async (id) => {
    if (!message.trim()) return;
    try {
      await api.post(`/litiges/${id}/message`, { contenu: message });
      setMessage(''); setMessageId(null);
      const r = await api.get('/litiges/mes-litiges');
      setLitiges(r.data || []);
    } catch(e) { alert(e.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader/></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Médiation B.Y.H</p>
          <h1 className="text-3xl font-black text-white mb-2">⚖️ Mes Litiges</h1>
          <p className="text-slate-400">{litiges.length} litige{litiges.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {litiges.length === 0 ? (
          <div className="card-premium p-16 text-center">
            <div className="text-6xl mb-4">⚖️</div>
            <h3 className="text-xl font-display font-black text-slate-700 mb-2">Aucun litige</h3>
            <p className="text-slate-400">Vos transactions se passent bien !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {litiges.map(l => {
              const config = STATUT_CONFIG[l.statut] || STATUT_CONFIG.ouvert;
              const isPlaignant = l.plaignant?._id === user?._id;
              const isAccuse = l.accuse?._id === user?._id;

              return (
                <div key={l._id} className="card-premium overflow-hidden">
                  {/* Top bar colorée */}
                  <div className={`h-1.5 ${l.statut === 'ouvert' || l.statut === 'en_attente_reponse' ? 'bg-red-400' : l.statut.includes('resolu') ? 'bg-green-400' : 'bg-blue-400'}`}/>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
                            {config.label}
                          </span>
                          {l.urgent && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">🚨 Urgent</span>}
                          {l.montantEnJeu > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              💰 {l.montantEnJeu?.toLocaleString('fr-FR')} FCFA en jeu
                            </span>
                          )}
                        </div>
                        <h3 className="font-display font-black text-slate-900 text-lg">{l.motif}</h3>
                        <p className="text-slate-500 text-sm mt-1">{formatDate(l.createdAt)}</p>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm leading-relaxed mb-4">{l.description}</p>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-4">
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-2">👤 Plaignant</p>
                        <div className="flex items-center gap-2">
                          <img src={getAvatarUrl(l.plaignant?.avatar, l.plaignant?.name)} alt="" className="w-8 h-8 rounded-lg object-cover"/>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{l.plaignant?.name}</p>
                            {isPlaignant && <span className="text-xs text-blue-600 font-bold">Vous</span>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-2">👤 Accusé</p>
                        <div className="flex items-center gap-2">
                          <img src={getAvatarUrl(l.accuse?.avatar, l.accuse?.name)} alt="" className="w-8 h-8 rounded-lg object-cover"/>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{l.accuse?.name}</p>
                            {isAccuse && <span className="text-xs text-blue-600 font-bold">Vous</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Réponse accusé */}
                    {isAccuse && l.statut === 'en_attente_reponse' && (
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl mb-4">
                        <p className="text-red-700 font-bold text-sm mb-3">⚠️ Vous avez 72h pour répondre à ce litige</p>
                        {repondreId === l._id ? (
                          <div className="space-y-3">
                            <textarea value={reponse} onChange={e => setReponse(e.target.value)}
                              className="input-premium w-full px-4 py-3 text-sm" rows={4}
                              placeholder="Votre réponse au litige..."/>
                            <div className="flex gap-2">
                              <button onClick={() => repondre(l._id)}
                                className="btn-byh-gradient px-5 py-2.5 text-white font-bold rounded-xl text-sm">
                                📤 Envoyer ma réponse
                              </button>
                              <button onClick={() => setRepondreId(null)}
                                className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setRepondreId(l._id)}
                            className="btn-byh-gradient px-5 py-2.5 text-white font-bold rounded-xl text-sm">
                            Répondre au litige →
                          </button>
                        )}
                      </div>
                    )}

                    {/* Messages */}
                    {l.messages && l.messages.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fil de discussion</p>
                        {l.messages.map((msg, i) => (
                          <div key={i} className={`p-3 rounded-xl text-sm border-l-4 ${
                            msg.role === 'admin' ? 'bg-blue-50 border-blue-400' :
                            msg.auteur?._id === user?._id ? 'bg-green-50 border-green-400' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <p className="font-bold text-xs text-slate-500 mb-1">
                              {msg.role === 'admin' ? '👑 Admin B.Y.H' : msg.role === 'plaignant' ? '👤 Plaignant' : '👤 Accusé'}
                            </p>
                            <p className="text-slate-700">{msg.contenu}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ajouter message */}
                    {['en_attente_reponse','en_examen'].includes(l.statut) && (
                      <div>
                        {messageId === l._id ? (
                          <div className="flex gap-2">
                            <input value={message} onChange={e => setMessage(e.target.value)}
                              className="input-premium flex-1 px-4 py-2.5 text-sm"
                              placeholder="Ajouter un message..."/>
                            <button onClick={() => envoyerMessage(l._id)}
                              className="btn-byh-gradient px-4 py-2.5 text-white font-bold rounded-xl text-sm">→</button>
                            <button onClick={() => setMessageId(null)}
                              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setMessageId(l._id)}
                            className="text-sm text-blue-600 font-bold hover:underline">
                            + Ajouter un message
                          </button>
                        )}
                      </div>
                    )}

                    {/* Décision */}
                    {l.decisionAdmin && (
                      <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                        <p className="text-blue-700 font-black text-sm mb-1">⚖️ Décision B.Y.H</p>
                        <p className="text-blue-600 text-sm">{l.decisionAdmin}</p>
                        {l.montantPlaignant > 0 && <p className="text-green-600 text-sm font-bold mt-1">💰 Versé au plaignant : {l.montantPlaignant?.toLocaleString('fr-FR')} FCFA</p>}
                        {l.montantAccuse > 0 && <p className="text-green-600 text-sm font-bold mt-1">💰 Versé à l'accusé : {l.montantAccuse?.toLocaleString('fr-FR')} FCFA</p>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
