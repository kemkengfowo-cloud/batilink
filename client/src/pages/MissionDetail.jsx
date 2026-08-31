import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate, getAvatarUrl } from '../utils/helpers';

export default function MissionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/missions/${id}`)
      .then(res => setMission(res.data))
      .catch(() => navigate('/missions'))
      .finally(() => setLoading(false));
  }, [id]);

  const postuler = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSending(true);
    try {
      await api.post('/messages', {
        destinataire: mission.entreprise?._id || mission.client?._id,
        contenu: `Bonjour, je souhaite postuler pour votre mission "${mission.titre}".\n\n${motivation}`
      });
      setSuccess('Votre candidature a ete envoyee ! L employeur vous contactera bientot.');
      setShowForm(false);
      setMotivation('');
    } catch(err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l envoi');
    } finally { setSending(false); }
  };

  if (loading) return <Loader/>;
  if (!mission) return null;

  const isOwner = user?._id === mission.entreprise?._id || user?.id === mission.entreprise?._id ||
                  user?._id === mission.client?._id || user?.id === mission.client?._id;
  const peutPostuler = user && !isOwner && (user.role === 'artisan');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/missions" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 font-medium">
            ← Retour aux missions
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {(mission.typePersonnel||[]).map(t=>(
                  <span key={t} className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 text-blue-200 rounded-full text-xs font-bold">{t}</span>
                ))}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${mission.statut==='ouverte'?'bg-green-500/20 text-green-300 border border-green-500/30':'bg-gray-500/20 text-gray-300'}`}>
                  {mission.statut==='ouverte'?'Mission ouverte':mission.statut}
                </span>
              </div>
              <h1 className="text-3xl font-display font-black text-white mb-2">{mission.titre}</h1>
              <div className="flex items-center gap-4 text-blue-300 text-sm flex-wrap">
                <span>📍 {mission.localisation || mission.ville}</span>
                <span>📅 {formatDate(mission.dateDebut)} → {formatDate(mission.dateFin)}</span>
                <span>👷 {mission.nombrePersonnes || 1} personne{(mission.nombrePersonnes||1)>1?'s':''}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-display font-black text-white">{formatBudget(mission.remuneration)}</p>
              <p className="text-blue-300 text-sm mt-1">par {mission.periodePaiement || 'semaine'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-2xl font-semibold">
            ✅ {success}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-gray-900 mb-3 text-xl">Description de la mission</h2>
              <p className="text-gray-600 leading-relaxed">{mission.description}</p>
            </div>

            {/* Competences */}
            {mission.competencesRequises?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Competences requises</h2>
                <div className="flex flex-wrap gap-2">
                  {mission.competencesRequises.map(c=>(
                    <span key={c} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Conditions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Conditions de la mission</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {label:'Type de personnel', value:(mission.typePersonnel||[]).join(', ')},
                  {label:'Nombre de personnes', value:`${mission.nombrePersonnes||1} personne${(mission.nombrePersonnes||1)>1?'s':''}`},
                  {label:'Date de debut', value:formatDate(mission.dateDebut)},
                  {label:'Date de fin', value:formatDate(mission.dateFin)},
                  {label:'Localisation', value:mission.localisation||mission.ville},
                  {label:'Remuneration', value:formatBudget(mission.remuneration)},
                  {label:'Periode de paiement', value:mission.periodePaiement||'Par semaine'},
                  {label:'Equipements fournis', value:mission.equipementsFournis?'Oui':'Non'},
                ].filter(i=>i.value).map(i=>(
                  <div key={i.label} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{i.label}</p>
                    <p className="font-semibold text-gray-900 text-sm">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire postuler */}
            {peutPostuler && mission.statut === 'ouverte' && (
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-2 text-xl">Postuler a cette mission</h2>
                <p className="text-gray-500 text-sm mb-4">Envoyez votre candidature directement a l employeur.</p>
                {!showForm ? (
                  <button onClick={()=>setShowForm(true)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-lg shadow-lg shadow-blue-600/20">
                    Postuler a cette mission
                  </button>
                ) : (
                  <form onSubmit={postuler} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message de motivation *</label>
                      <textarea required value={motivation} onChange={e=>setMotivation(e.target.value)} rows={5}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="Presentez-vous et expliquez pourquoi vous etes le meilleur candidat pour cette mission..."/>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                      Votre message sera envoye directement a l employeur via la messagerie B.Y.H.
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={sending||!motivation.trim()}
                        className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                        {sending?'Envoi...':'Envoyer ma candidature'}
                      </button>
                      <button type="button" onClick={()=>setShowForm(false)}
                        className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold">
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {!user && mission.statut === 'ouverte' && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                <p className="text-blue-700 font-semibold mb-3">Connectez-vous pour postuler a cette mission</p>
                <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                  Se connecter
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Employeur */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display font-bold text-gray-900 mb-4">Publie par</h3>
              <div className="flex items-center gap-3">
                <img src={getAvatarUrl(mission.entreprise?.avatar||mission.client?.avatar,
                  mission.entreprise?.name||mission.client?.name)}
                  alt="" className="w-12 h-12 rounded-xl object-cover"/>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{mission.entreprise?.name||mission.client?.name}</p>
                  <p className="text-gray-400 text-xs capitalize">{mission.entreprise?'Entreprise BTP':'Client'}</p>
                  <p className="text-gray-400 text-xs">{mission.entreprise?.city||mission.client?.city}</p>
                </div>
              </div>
            </div>

            {/* Recap financier */}
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-3">Remuneration</h3>
              <p className="text-3xl font-display font-black">{formatBudget(mission.remuneration)}</p>
              <p className="text-blue-200 text-sm mt-1">par {mission.periodePaiement||'semaine'}</p>
              <div className="mt-4 pt-4 border-t border-blue-500 space-y-1 text-sm text-blue-200">
                <div className="flex justify-between">
                  <span>Commission B.Y.H</span>
                  <span>8%</span>
                </div>
                <div className="flex justify-between text-white font-bold">
                  <span>Vous recevrez</span>
                  <span>{formatBudget(Math.round(mission.remuneration * 0.9))}</span>
                </div>
              </div>
            </div>

            {/* Partager */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display font-bold text-gray-900 mb-3">Partager cette mission</h3>
              <a href={`https://wa.me/?text=Mission%20disponible%20sur%20B.Y.H%20:%20${encodeURIComponent(mission.titre)}%20-%20www.byh.org/missions/${mission._id}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm justify-center hover:bg-green-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Partager sur WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
