import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatTimestamp } from '../utils/helpers';
import { demanderPermission, envoyerNotification, NOTIF_TYPES } from '../utils/notifications';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [permissionDemandee, setPermissionDemandee] = useState(false);
  const ref = useRef(null);
  const prevCountRef = useRef(0);
  const prevDevisRef = useRef([]);

  const nonLues = notifs.filter(n => n.unread > 0).length;

  useEffect(() => {
    // Demander permission notifications au chargement
    if (!permissionDemandee) {
      demanderPermission();
      setPermissionDemandee(true);
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Poll toutes les 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const msgs = res.data || [];

      // Vérifier nouveaux messages et envoyer notifications push
      const totalUnread = msgs.reduce((s, c) => s + (c.unread || 0), 0);
      if (totalUnread > prevCountRef.current && prevCountRef.current !== 0) {
        const nouvelles = msgs.filter(c => c.unread > 0);
        nouvelles.forEach(c => {
          envoyerNotification(
            NOTIF_TYPES.MESSAGE_RECU.titre,
            `${c.contact?.name}: ${c.lastMessage?.contenu?.substring(0, 80)}...`,
            { tag: `message-${c.contact?._id}`, url: '/messages' }
          );
        });
      }
      prevCountRef.current = totalUnread;

      setNotifs(msgs.map(c => ({
        id: c.contact?._id,
        nom: c.contact?.name,
        message: c.lastMessage?.contenu || '',
        lu: c.unread === 0,
        date: c.lastMessage?.createdAt,
        unread: c.unread || 0
      })));
    } catch {}
  };

  // Surveiller les devis en temps réel
  useEffect(() => {
    const checkDevis = async () => {
      try {
        const res = await api.get('/devis/mes-devis');
        const devis = res.data || [];
        
        // Vérifier changements de statut
        devis.forEach(d => {
          const prev = prevDevisRef.current.find(p => p._id === d._id);
          if (prev && prev.statut !== d.statut) {
            if (d.statut === 'accepte') {
              envoyerNotification(
                NOTIF_TYPES.DEVIS_ACCEPTE.titre,
                `Votre devis "${d.titre}" a ete accepte ! Budget: ${d.total?.toLocaleString('fr-FR')} FCFA`,
                { important: true, url: `/devis/${d._id}` }
              );
            } else if (d.statut === 'refuse') {
              envoyerNotification(
                NOTIF_TYPES.DEVIS_REFUSE.titre,
                `Votre devis "${d.titre}" a ete refuse.`,
                { url: `/devis/${d._id}` }
              );
            } else if (d.statut === 'termine') {
              envoyerNotification(
                NOTIF_TYPES.JALON_VALIDE.titre,
                `Les travaux "${d.titre}" ont ete valides ! Paiement de ${d.montantArtisan?.toLocaleString('fr-FR')} FCFA libere.`,
                { important: true, url: `/devis/${d._id}` }
              );
            }
          }
        });
        prevDevisRef.current = devis;
      } catch {}
    };

    checkDevis();
    const interval = setInterval(checkDevis, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-display font-bold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {nonLues > 0 && (
                <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                  {nonLues} non lue{nonLues>1?'s':''}
                </span>
              )}
              {Notification.permission !== 'granted' && (
                <button onClick={() => demanderPermission()}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                  Activer notifications
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-400 text-sm">Aucune notification</p>
              </div>
            ) : notifs.map(n => (
              <Link key={n.id} to="/messages" onClick={() => setOpen(false)}
                className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${n.unread > 0 ? 'bg-blue-50/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.unread > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{n.nom}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatTimestamp(n.date)}</p>
                  </div>
                  {n.unread > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {n.unread}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link to="/messages" onClick={() => setOpen(false)}
            className="block text-center py-3 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors border-t border-gray-100">
            Voir tous les messages →
          </Link>
        </div>
      )}
    </div>
  );
}
