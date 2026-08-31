import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { getAvatarUrl, getWhatsAppLink, getImageUrl, formatDate, renderStars } from '../utils/helpers';
import { BadgeList } from '../components/Badge';
import AvisSection from '../components/AvisSection';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PortfolioSection from '../components/PortfolioSection';

export default function ArtisanProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgModal, setMsgModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [portfolioState, setPortfolioState] = useState([]);

  useEffect(() => {
    api.get(`/artisans/${id}`)
      .then(res => { setArtisan(res.data); setPortfolioState(res.data.portfolio || []); })
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: artisan.user._id, contenu: msg });
      setSent(true); setMsg('');
      setTimeout(() => { setMsgModal(false); setSent(false); }, 2000);
    } catch(err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  if (loading) return <Loader/>;
  if (!artisan) return <div className="text-center py-20 text-gray-500">Artisan non trouve.</div>;
  const { user: u, metier, ville, description, note, nbAvis, whatsapp, experience, specialites, photos, disponible, badges, portfolio = [] } = artisan;
  const waMsg = `Bonjour ${u?.name}, j ai vu votre profil sur B.Y.H et je souhaite vous contacter.`;
  const isOwner = user?._id === u?._id || user?.id === u?._id;
  const isClient = user?.role === 'client';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/artisans" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-8 font-medium transition-colors">
            ← Retour aux artisans
          </Link>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative flex-shrink-0">
              <img src={getAvatarUrl(u?.avatar, u?.name)} alt={u?.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"/>
              {disponible && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></span>}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-display font-black text-white">{u?.name}</h1>
              <p className="text-blue-300 font-semibold text-lg mt-1">{metier}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {note > 0 && (
                  <span className="flex items-center gap-1 text-white">
                    <span className="text-amber-400">{renderStars(note)}</span>
                    <span className="font-bold">{note.toFixed(1)}</span>
                    <span className="text-blue-300 text-sm">({nbAvis} avis)</span>
                  </span>
                )}
                <span className="text-blue-300">📍 {ville}</span>
                {experience > 0 && <span className="text-blue-300">{experience} ans exp.</span>}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${disponible?'bg-green-500/20 text-green-300 border border-green-500/30':'bg-gray-500/20 text-gray-300'}`}>
                  {disponible ? '● Disponible' : '○ Occupe'}
                </span>
              </div>
              {badges && Object.values(badges).some(Boolean) && (
                <div className="mt-3"><BadgeList badges={badges} size="sm"/></div>
              )}
              <div className="flex flex-wrap gap-3 mt-5">
                <a href="tel:+237699000000" className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors border border-gray-200">
                  📞 Service client B.Y.H
                </a>
                  <Link to="/devis/creer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl transition-colors">
                    📄 Demander un devis
                  </Link>
                )}
                {user && !isOwner && (
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
            {specialites?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Specialites</h2>
                <div className="flex flex-wrap gap-2">
                  {specialites.map(s=>(
                    <span key={s} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {photos?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-gray-900 mb-4 text-xl">Realisations ({photos.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((p,i)=>(
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={getImageUrl(p)} alt={`Realisation ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <PortfolioSection portfolio={portfolioState} isOwner={user?._id === u?._id} onUpdate={setPortfolioState}/>
            <AvisSection cibleUserId={u?._id} cibleType="artisan" cibleRefId={artisan._id} nomCible={u?.name}/>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-display font-bold text-gray-900 mb-4">Informations</h3>
              <div className="space-y-1">
                {[
                  { label:'Ville', value:ville },
                  { label:'Metier', value:metier },
                  { label:'Experience', value:experience>0?`${experience} ans`:null },
                  { label:'Note', value:`${note?.toFixed(1)||'4.0'}/5 ⭐` },
                  { label:'Membre depuis', value:formatDate(artisan.createdAt) },
                ].filter(i=>i.value).map(i=>(
                  <div key={i.label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500 text-sm">{i.label}</span>
                    <span className="font-semibold text-gray-800 text-sm">{i.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {badges && Object.values(badges).some(Boolean) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-display font-bold text-gray-900 mb-4">Badges</h3>
                <BadgeList badges={badges} size="lg"/>
              </div>
            )}
            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-2">Contacter {u?.name?.split(' ')[0]}</h3>
              <p className="text-blue-200 text-sm mb-4">Disponible pour vos projets de construction</p>
              {isClient && (
                <Link to="/devis/creer"
                  className="block w-full text-center py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors mb-2">
                  📄 Demander un devis
                </Link>
              )}
              <button onClick={() => setMsgModal(true)} className="block w-full text-center py-2.5 bg-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-colors">Envoyer un message</button>
            </div>
          </div>
        </div>
      </div>

      {msgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={()=>setMsgModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="font-display font-bold text-gray-900 mb-2">Envoyer un message</h3>
            <p className="text-gray-500 text-sm mb-4">a {u?.name}</p>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold text-green-700">Message envoye !</p>
              </div>
            ) : (
              <>
                <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Decrivez votre projet..."/>
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

