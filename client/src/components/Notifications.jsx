import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const nonLues = notifs.filter(n => !n.lu).length;

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/messages/conversations');
      const msgs = res.data || [];
      setNotifs(msgs.map(c => ({
        id: c.contact._id,
        nom: c.contact.name,
        message: c.lastMessage?.contenu || '',
        lu: c.unread === 0,
        date: c.lastMessage?.createdAt,
        unread: c.unread
      })));
    } catch {}
  };

  const marquerLu = async () => {
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-display font-bold text-gray-900">Notifications</h3>
            {nonLues > 0 && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-bold">{nonLues} non lue{nonLues>1?'s':''}</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-400 text-sm">Aucune notification</p>
              </div>
            ) : notifs.map(n => (
              <Link key={n.id} to="/messages" onClick={marquerLu}
                className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.lu?'bg-blue-50/50':''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.unread > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{n.nom}</p>
                    <p className="text-gray-500 text-xs truncate mt-0.5">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(n.date)}</p>
                  </div>
                  {n.unread > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{n.unread}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <Link to="/messages" onClick={marquerLu}
            className="block text-center py-3 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors border-t border-gray-100">
            Voir tous les messages →
          </Link>
        </div>
      )}
    </div>
  );
}
