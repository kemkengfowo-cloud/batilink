import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

const ICONS = {
  message: '💬',
  devis: '📄',
  success: '✅',
  projet: '📋',
  info: 'ℹ️',
};

const COLORS = {
  message: 'bg-blue-600',
  devis: 'bg-green-600',
  success: 'bg-emerald-600',
  projet: 'bg-purple-600',
  info: 'bg-gray-600',
};

export default function NotificationToast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  const addNotification = (notif) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useSocket(token, addNotification);

  const handleClick = (notif) => {
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    if (notif.lien) navigate(notif.lien);
  };

  if (!user || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          onClick={() => handleClick(notif)}
          className={`${COLORS[notif.type] || COLORS.info} text-white rounded-2xl p-4 shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-in`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{ICONS[notif.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{notif.titre}</p>
              <p className="text-xs opacity-90 mt-0.5 truncate">{notif.texte}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== notif.id)); }}
              className="text-white/70 hover:text-white text-lg leading-none flex-shrink-0">
              ×
            </button>
          </div>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/60 rounded-full animate-shrink"/>
          </div>
        </div>
      ))}
    </div>
  );
}
