import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl, formatDate, renderStars } from '../utils/helpers';

export default function AvisSection({ cibleUserId, cibleType, cibleRefId, nomCible }) {
  const { user } = useAuth();
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ note: 5, commentaire: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/avis/${cibleUserId}`)
      .then(res => setAvis(res.data || []))
      .finally(() => setLoading(false));
  }, [cibleUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSending(true);
    try {
      const res = await api.post('/avis', {
        cibleUserId,
        cibleType,
        cibleRefId,
        note: form.note,
        commentaire: form.commentaire
      });
      setAvis(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ note: 5, commentaire: '' });
      setSuccess('Votre avis a ete publie !');
      setTimeout(() => setSuccess(''), 3000);
    } catch(err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication');
    } finally { setSending(false); }
  };

  const moyenne = avis.length > 0
    ? (avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1)
    : null;

  const peutNoter = user && user._id !== cibleUserId &&
    user.role !== cibleType &&
    !avis.find(a => a?.auteur?._id === (user?._id || user?.id));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-gray-900 text-xl">
            Avis & Notations
          </h2>
          {moyenne && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-400 text-lg">{renderStars(parseFloat(moyenne))}</span>
              <span className="font-bold text-gray-900">{moyenne}</span>
              <span className="text-gray-400 text-sm">({avis.length} avis)</span>
            </div>
          )}
        </div>
        {peutNoter && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Laisser un avis
          </button>
        )}
      </div>

      {/* Messages */}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">✅ {success}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl">
          <h3 className="font-bold text-gray-900 mb-4">Votre avis sur {nomCible}</h3>

          {/* Étoiles */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Note *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({...f, note: n}))}
                  className={`text-3xl transition-all hover:scale-110 ${n <= form.note ? 'text-amber-400' : 'text-gray-300'}`}>
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-600 self-center">
                {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][form.note]}
              </span>
            </div>
          </div>

          {/* Commentaire */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Commentaire * (minimum 10 caractères)</label>
            <textarea value={form.commentaire} onChange={e => setForm(f => ({...f, commentaire: e.target.value}))}
              rows={4} required minLength={10}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none bg-white"
              placeholder="Décrivez votre expérience avec ce prestataire..."/>
            <p className="text-xs text-gray-400 mt-1">{form.commentaire.length}/10 caractères minimum</p>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={sending || form.commentaire.length < 10}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {sending ? 'Publication...' : 'Publier mon avis'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Chargement des avis...</div>
      ) : avis.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">⭐</div>
          <p className="font-semibold text-gray-600">Aucun avis pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">Soyez le premier à laisser un avis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {avis.map(a => (
            <div key={a._id} className="p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={getAvatarUrl(a.auteur?.avatar, a.auteur?.name)} alt={a.auteur?.name}
                    className="w-10 h-10 rounded-xl object-cover"/>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{a.auteur?.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-sm">{renderStars(a.note)}</span>
                      <span className="text-xs text-gray-400">{formatDate(a.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  a.auteur?.role==='client'?'bg-blue-50 text-blue-600':
                  a.auteur?.role==='artisan'?'bg-green-50 text-green-600':
                  'bg-purple-50 text-purple-600'}`}>
                  {a.auteur?.role}
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{a.commentaire}</p>
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <p className="text-blue-700 text-sm font-medium">
            <a href="/login" className="underline font-bold">Connectez-vous</a> pour laisser un avis
          </p>
        </div>
      )}
    </div>
  );
}
