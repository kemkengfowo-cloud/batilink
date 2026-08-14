import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { getAvatarUrl, getWhatsAppLink, getImageUrl, formatDate, renderStars } from '../utils/helpers';
import { BadgeList } from '../components/Badge';
import AvisSection from '../components/AvisSection';
import { useAuth } from '../context/AuthContext';

export default function EntrepriseProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgModal, setMsgModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get(`/entreprises/${id}`)
      .then(res => setEntreprise(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: entreprise.user._id, contenu: msg });
      setSent(true); setMsg('');
      setTimeout(() => { setMsgModal(false); setSent(false); }, 2000);
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  if (loading) return <Loader/>;
  if (!entreprise) return <div className="text-center py-20 text-gray-500">Entreprise non trouvée.</div>;

  const { user: u, nomEntreprise, nomResponsable, description, note, nbAvis, whatsapp,
          lotsTravauxPropose, typePersonnel, photos, disponible, verifie, badges, rccm } = entreprise;
  const waMsg = `Bonjour ${nomEntreprise}, j'ai vu votre profil sur Batilink et je souhaite vous contacter.`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/entreprises" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-8 font-medium transition-colors">
            ← Retour aux entreprises
          </Link>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-display font-black text-3xl flex-shrink-0 shadow-lg">
              {nomEntreprise?.[0] || 'E'}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-display font-black text-white">{nomEntreprise}</h1>
                  <p className="text-blue-300 mt-1">Responsable : {nomResponsable}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {note > 0 && (
                      <span className="flex items-center gap-1 text-white">
                        <span className="text-amber-400">{renderStars(note)}</span>
                        <span className="font-bold">{note.toFixed(1)}</span>
                        <span className="text-blue-300 text-sm">({nbAvis} avis)</span>
                      </span>
                    )}
                    <span className="text-blue-300">📍 {entreprise.ville}</span>
                    {verifie && <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/50 text-blue-200 rounded-full text-xs font-bold">✓ Certifiée</span>}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${disponible?'bg-green-500/20 text-green-300 border border-green-500/30':'bg-gray-500/20 text-gray-300'}`}>
                      {disponible?'● Disponible':'○ Occupée'}
                    </span>
                  </div>
                  {badges && Object.values(badges).some(Boolean) && (
                    <div className="mt-3">
                      <BadgeList badges={badges} size="sm"/>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-5">
                {whatsapp && (
                  <a href={getWhatsAppLink(whatsapp, waMsg)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                )}
                {user && user._id !== u?._id && (
                  <button onClick={() => setMsgModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-colors">
                    ✉ Message
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {description && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-3 text-xl">A propos</h2>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}

            {lotsTravauxPropose?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Lots de travaux</h2>
                <div className="flex flex-wrap gap-2">
                  {lotsTravauxPropose.map(l=>(
                    <span key={l} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {typePersonnel?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Personnel disponible a la location</h2>
                <div className="flex flex-wrap gap-2">
                  {typePersonnel.map(t=>(
                    <span key={t} className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-100">👷 {t}</span>
                  ))}
                </div>
              </div>
            )}

            {photos?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Realisations ({photos.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={getImageUrl(p)} alt={`Realisation ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AvisSection
              cibleUserId={u?._id}
              cibleType="entreprise"
              cibleRefId={entreprise._id}
              nomCible={nomEntreprise}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display font-bold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Ville</span>
                  <span className="font-semibold text-gray-800">{entreprise.ville}</span>
                </div>
                {rccm && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">RCCM</span>
                    <span className="font-semibold text-gray-800 text-xs">{rccm}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500">Note</span>
                  <span className="font-semibold text-gray-800">{note?.toFixed(1)||'4.0'}/5 ⭐</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Membre depuis</span>
                  <span className="font-semibold text-gray-800">{formatDate(entreprise.createdAt)}</span>
                </div>
              </div>
            </div>

            {badges && Object.values(badges).some(Boolean) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-display font-bold text-gray-900 mb-4">Badges</h3>
                <BadgeList badges={badges} size="lg"/>
              </div>
            )}

            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-2">Besoin de personnel ?</h3>
              <p className="text-blue-200 text-sm mb-4">Contactez cette entreprise pour louer du personnel qualifie</p>
              {whatsapp ? (
                <a href={getWhatsAppLink(whatsapp, waMsg)} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                  Contacter sur WhatsApp
                </a>
              ) : (
                <button onClick={() => setMsgModal(true)}
                  className="block w-full text-center py-2.5 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-colors">
                  Envoyer un message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal message */}
      {msgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={()=>setMsgModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="font-display font-bold text-gray-900 mb-2">Envoyer un message</h3>
            <p className="text-gray-500 text-sm mb-4">a {nomEntreprise}</p>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold text-green-700">Message envoye !</p>
              </div>
            ) : (
              <>
                <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Decrivez votre besoin..."/>
                <div className="flex gap-3 mt-4">
                  <button onClick={()=>setMsgModal(false)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">Annuler</button>
                  <button onClick={sendMessage} disabled={sending||!msg.trim()}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {sending?'Envoi...':'Envoyer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
