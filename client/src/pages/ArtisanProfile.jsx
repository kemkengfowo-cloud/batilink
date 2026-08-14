import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import AvisSection from '../components/AvisSection';
import AvisSection from '../components/AvisSection';
import { getAvatarUrl, getWhatsAppLink, getImageUrl, formatDate, renderStars } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function ArtisanProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgModal, setMsgModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get(`/artisans/${id}`)
      .then(res => setArtisan(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: artisan.user._id, contenu: msg });
      setSent(true); setMsg('');
      setTimeout(() => { setMsgModal(false); setSent(false); }, 2000);
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  if (loading) return <Loader/>;
  if (!artisan) return <div className="text-center py-20 text-earth-500">Artisan non trouvé.</div>;

  const { user: u, metier, ville, description, note, nbAvis, whatsapp, experience, specialites, photos, disponible, verifie } = artisan;
  const waMsg = `Bonjour ${u?.name}, j'ai vu votre profil sur Batilink et je souhaite vous contacter pour un projet.`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/artisans" className="inline-flex items-center gap-2 text-earth-500 hover:text-earth-700 mb-6 font-medium transition-colors">
        ← Retour aux artisans
      </Link>

      {/* Header profil */}
      <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            <img src={getAvatarUrl(u?.avatar, u?.name)} alt={u?.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-earth-100"/>
            {disponible && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></span>}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-2xl font-display font-bold text-earth-900">{u?.name}</h1>
                <p className="text-brand-600 font-semibold text-lg mt-1">{metier}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {verifie && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">✓ Vérifié</span>}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${disponible?'bg-green-50 text-green-700':'bg-earth-100 text-earth-500'}`}>
                  {disponible ? '● Disponible' : '○ Occupé'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-earth-600">
              <span className="flex items-center gap-1">
                <span className="text-amber-400">{renderStars(note)}</span>
                <strong>{note.toFixed(1)}</strong> ({nbAvis} avis)
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-earth-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                {ville}
              </span>
              {experience > 0 && <span>{experience} an{experience>1?'s':''} d'expérience</span>}
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-3">
              {whatsapp && (
                <a href={getWhatsAppLink(whatsapp, waMsg)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Contacter sur WhatsApp
                </a>
              )}
              {user && user._id !== u?._id && (
                <button onClick={() => setMsgModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-earth-200 text-earth-700 font-semibold rounded-xl hover:border-brand-300 hover:text-brand-600 transition-colors">
                  ✉ Message interne
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {description && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-3">À propos</h2>
              <p className="text-earth-600 leading-relaxed">{description}</p>
            </div>
          )}
          {specialites?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-4">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {specialites.map(s => <span key={s} className="px-3 py-1.5 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">{s}</span>)}
              </div>
            </div>
          )}
          {photos?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display font-bold text-earth-900 mb-4">Réalisations ({photos.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-earth-100">
                    <img src={getImageUrl(p)} alt={`Réalisation ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-display font-bold text-earth-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-earth-500">Ville</span><span className="font-semibold text-earth-800">{ville}</span></div>
              <div className="flex justify-between"><span className="text-earth-500">Métier</span><span className="font-semibold text-earth-800">{metier}</span></div>
              {experience > 0 && <div className="flex justify-between"><span className="text-earth-500">Expérience</span><span className="font-semibold text-earth-800">{experience} ans</span></div>}
              <div className="flex justify-between"><span className="text-earth-500">Note</span><span className="font-semibold text-earth-800">{note.toFixed(1)}/5 ⭐</span></div>
              <div className="flex justify-between"><span className="text-earth-500">Membre depuis</span><span className="font-semibold text-earth-800">{formatDate(artisan.createdAt)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AvisSection
          cibleUserId={u?._id}
          cibleType="artisan"
          cibleRefId={artisan._id}
          nomCible={u?.name}
        />
      </div>
      {/* Modal message */}
      {msgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={()=>setMsgModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e=>e.stopPropagation()}>
            <h3 className="font-display font-bold text-earth-900 mb-2">Envoyer un message</h3>
            <p className="text-earth-500 text-sm mb-4">à {u?.name}</p>
            {sent ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold text-green-700">Message envoyé !</p>
              </div>
            ) : (
              <>
                <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={4}
                  className="w-full px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 resize-none"
                  placeholder="Décrivez votre projet..."/>
                <div className="flex gap-3 mt-4">
                  <button onClick={()=>setMsgModal(false)} className="flex-1 py-3 border-2 border-earth-200 rounded-xl font-semibold text-earth-600 hover:bg-earth-50">Annuler</button>
                  <button onClick={sendMessage} disabled={sending||!msg.trim()}
                    className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 shadow-brand">{sending?'Envoi...':'Envoyer'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
