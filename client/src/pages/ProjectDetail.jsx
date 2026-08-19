import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: project.client._id, contenu: msg, projet: project._id });
      setSent(true); setMsg('');
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  const deleteProject = async () => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try { await api.delete(`/projects/${id}`); navigate('/dashboard'); }
    catch(err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <Loader/>;
  if (!project) return <div className="text-center py-20 text-gray-500">Projet non trouve.</div>;

  const { titre, description, budget, localisation, categorie, statut, client, photos, createdAt, vues } = project;
  const isOwner = user?._id === client?._id || user?.id === client?._id;
  const isArtisan = user?.role === 'artisan' || user?.role === 'entreprise';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/projects" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 font-medium">
            ← Retour aux projets
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 text-blue-200 rounded-full text-sm font-bold">{categorie}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${statut==='ouvert'?'bg-green-500/20 text-green-300 border border-green-500/30':'bg-gray-500/20 text-gray-300'}`}>
                  {statut==='ouvert'?'● Ouvert':'○ '+statut}
                </span>
                {vues > 0 && <span className="text-blue-300 text-xs">{vues} vue{vues>1?'s':''}</span>}
              </div>
              <h1 className="text-3xl font-display font-black text-white">{titre}</h1>
              <div className="flex items-center gap-4 text-blue-300 text-sm mt-2 flex-wrap">
                <span>📍 {localisation}</span>
                <span>📅 {formatDate(createdAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-display font-black text-white">{formatBudget(budget)}</p>
              <p className="text-blue-300 text-sm mt-1">Budget estimé</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Description du projet</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>

            {/* Photos */}
            {photos?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Photos du projet</h2>
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((p,i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                      <img src={getImageUrl(p)} alt={`Photo ${i+1}`} className="w-full h-full object-cover"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions artisan */}
            {isArtisan && statut === 'ouvert' && !isOwner && (
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-2 text-xl">Repondre a ce projet</h2>
                <p className="text-gray-500 text-sm mb-5">Choisissez comment vous souhaitez repondre au client.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  {/* Bouton devis officiel */}
                  <Link
                    to={`/devis/creer?clientId=${client?._id}&projetId=${id}&titre=${encodeURIComponent(titre)}&categorie=${encodeURIComponent(categorie)}`}
                    className="flex flex-col items-center gap-3 p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-center">
                    <span className="text-3xl">📄</span>
                    <div>
                      <p className="font-bold text-lg">Envoyer un devis officiel</p>
                      <p className="text-blue-200 text-xs mt-1">Devis detaille avec jalons et paiement securise</p>
                    </div>
                  </Link>

                  {/* Bouton message */}
                  <div className="flex flex-col items-center gap-3 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-colors text-center">
                    <span className="text-3xl">💬</span>
                    <div>
                      <p className="font-bold text-lg text-gray-900">Envoyer un message</p>
                      <p className="text-gray-400 text-xs mt-1">Pour poser des questions avant de faire un devis</p>
                    </div>
                  </div>
                </div>

                {/* Zone message */}
                {sent ? (
                  <div className="text-center py-4 bg-green-50 rounded-xl">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-semibold text-green-700">Message envoye au client !</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                      placeholder="Posez vos questions au client avant de faire un devis..."/>
                    <button onClick={sendMessage} disabled={sending||!msg.trim()}
                      className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 disabled:opacity-50">
                      {sending?'Envoi...':'Envoyer le message'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions propriétaire */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="font-display font-bold text-gray-900">Gerer ce projet</h3>
                <div className="flex gap-3">
                  <button onClick={deleteProject}
                    className="flex-1 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50">
                    Supprimer le projet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-3xl font-display font-black text-blue-600">{formatBudget(budget)}</p>
              <p className="text-gray-500 text-sm mt-1">Budget estime</p>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Categorie</span>
                  <span className="font-semibold text-gray-800">{categorie}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Localisation</span>
                  <span className="font-semibold text-gray-800">{localisation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Publie le</span>
                  <span className="font-semibold text-gray-800">{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>

            {client && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Client</h3>
                <div className="flex items-center gap-3">
                  <img src={getAvatarUrl(client.avatar, client.name)} alt={client.name}
                    className="w-12 h-12 rounded-xl object-cover"/>
                  <div>
                    <p className="font-bold text-gray-900">{client.name}</p>
                    {client.city && <p className="text-gray-400 text-sm">{client.city}</p>}
                  </div>
                </div>
              </div>
            )}

            {isArtisan && statut === 'ouvert' && !isOwner && (
              <Link
                to={`/devis/creer?clientId=${client?._id}&projetId=${id}&titre=${encodeURIComponent(titre)}&categorie=${encodeURIComponent(categorie)}`}
                className="block w-full text-center py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                📄 Envoyer un devis officiel
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
