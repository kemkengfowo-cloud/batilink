import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl, getImageUrl, getWhatsAppLink } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`).then(res => setProject(res.data)).finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: project.client._id, contenu: msg, projet: project._id });
      setSent(true); setMsg('');
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  const deleteProject = async () => {
    if (!window.confirm('Supprimer ce projet ?')) return;
    try { await api.delete(`/projects/${id}`); navigate('/dashboard'); }
    catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  if (loading) return <Loader/>;
  if (!project) return <div className="text-center py-20 text-earth-500">Projet non trouvé.</div>;

  const { titre, description, budget, localisation, categorie, statut, client, photos, createdAt, vues } = project;
  const isOwner = user?._id === client?._id;
  const waMsg = `Bonjour, j'ai vu votre projet "${titre}" sur Batilink et je souhaite vous faire une offre.`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/projects" className="inline-flex items-center gap-2 text-earth-500 hover:text-earth-700 mb-6 font-medium transition-colors">← Retour aux projets</Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-sm font-semibold">{categorie}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statut==='ouvert'?'bg-green-50 text-green-700':'bg-earth-100 text-earth-500'}`}>
                {statut==='ouvert'?'● Ouvert':'○ '+statut}
              </span>
              {vues>0 && <span className="text-xs text-earth-400 ml-auto">{vues} vue{vues>1?'s':''}</span>}
            </div>
            <h1 className="text-2xl font-display font-bold text-earth-900">{titre}</h1>
            <p className="mt-4 text-earth-600 leading-relaxed whitespace-pre-wrap">{description}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-earth-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                {localisation}
              </div>
              <div className="flex items-center gap-1.5 text-earth-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {formatDate(createdAt)}
              </div>
            </div>
          </div>

          {photos?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-4">Photos du projet</h2>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((p,i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-earth-100">
                    <img src={getImageUrl(p)} alt={`Photo ${i+1}`} className="w-full h-full object-cover"/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacter (artisan seulement) */}
          {user?.role === 'artisan' && statut === 'ouvert' && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-4">Faire une offre</h2>
              {sent ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-semibold text-green-700">Message envoyé au client !</p>
                </div>
              ) : (
                <>
                  <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4}
                    className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 resize-none"
                    placeholder="Décrivez votre offre, votre disponibilité et votre tarif..."/>
                  <div className="flex gap-3 mt-3">
                    <button onClick={sendMessage} disabled={sending||!msg.trim()}
                      className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 shadow-brand">
                      {sending?'Envoi...':'Envoyer mon offre'}
                    </button>
                    {client?.phone && (
                      <a href={getWhatsAppLink(client.phone, waMsg)} target="_blank" rel="noopener noreferrer"
                        className="px-5 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-sm flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WA
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <p className="text-3xl font-display font-bold text-brand-600">{formatBudget(budget)}</p>
            <p className="text-earth-500 text-sm mt-1">Budget estimé</p>
          </div>
          {client && (
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-semibold text-earth-900 mb-3 text-sm">Client</h3>
              <div className="flex items-center gap-3">
                <img src={getAvatarUrl(client.avatar, client.name)} alt={client.name} className="w-10 h-10 rounded-xl object-cover"/>
                <div>
                  <p className="font-semibold text-earth-900 text-sm">{client.name}</p>
                  {client.city && <p className="text-earth-400 text-xs">{client.city}</p>}
                </div>
              </div>
            </div>
          )}
          {isOwner && (
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-2">
              <h3 className="font-semibold text-earth-900 text-sm mb-3">Gérer le projet</h3>
              <Link to={`/projects/${id}/edit`} className="block w-full text-center py-2.5 border-2 border-earth-200 text-earth-700 rounded-xl font-semibold text-sm hover:border-brand-300 transition-colors">Modifier</Link>
              <button onClick={deleteProject} className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors">Supprimer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
