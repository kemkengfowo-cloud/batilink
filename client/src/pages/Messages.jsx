import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { getAvatarUrl, formatDate } from '../utils/helpers';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(res => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/messages/${selected.contact._id}`)
      .then(res => setMessages(res.data));
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      const res = await api.post('/messages', { destinataire: selected.contact._id, contenu: newMsg });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
      setConversations(prev => prev.map(c =>
        c.contact._id === selected.contact._id ? {...c, lastMessage: res.data} : c
      ));
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSending(false); }
  };

  if (loading) return <Loader/>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-4 transition-colors">← Tableau de bord</Link>
      <h1 className="text-3xl font-display font-bold text-earth-900 mb-6">Messages</h1>
      <div className="bg-white rounded-2xl shadow-card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Liste conversations */}
          <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-earth-100`}>
            <div className="p-4 border-b border-earth-100">
              <h2 className="font-display font-semibold text-earth-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-earth-500 text-sm">Aucune conversation</p>
                  <p className="text-earth-400 text-xs mt-1">Contactez un artisan ou un client pour commencer</p>
                </div>
              ) : conversations.map((conv, i) => (
                <button key={i} onClick={() => setSelected(conv)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-earth-50 transition-colors border-b border-earth-50 ${selected?.contact._id===conv.contact._id?'bg-brand-50':''}`}>
                  <div className="relative flex-shrink-0">
                    <img src={getAvatarUrl(conv.contact.avatar, conv.contact.name)} alt={conv.contact.name} className="w-11 h-11 rounded-xl object-cover"/>
                    {conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{conv.unread}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-earth-900 text-sm truncate">{conv.contact.name}</p>
                    <p className="text-xs text-earth-400 truncate mt-0.5">{conv.lastMessage?.contenu}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          {selected ? (
            <div className="flex-1 flex flex-col">
              {/* Header chat */}
              <div className="flex items-center gap-3 p-4 border-b border-earth-100 bg-earth-50">
                <button className="md:hidden p-1.5 rounded-lg hover:bg-earth-200 transition-colors" onClick={() => setSelected(null)}>
                  <svg className="w-5 h-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                </button>
                <img src={getAvatarUrl(selected.contact.avatar, selected.contact.name)} alt={selected.contact.name} className="w-9 h-9 rounded-xl object-cover"/>
                <div>
                  <p className="font-semibold text-earth-900 text-sm">{selected.contact.name}</p>
                  <p className="text-xs text-earth-400 capitalize">{selected.contact.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-earth-400">
                    <p className="text-sm">Démarrez la conversation</p>
                  </div>
                ) : messages.map((msg, i) => {
                  const isMe = msg.expediteur._id === user._id || msg.expediteur._id === user.id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs md:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-earth-100 text-earth-800 rounded-bl-sm'}`}>
                        {msg.projet && <p className={`text-xs mb-1 ${isMe?'text-brand-200':'text-earth-400'}`}>Re: {msg.projet.titre}</p>}
                        <p className="leading-relaxed">{msg.contenu}</p>
                        <p className={`text-xs mt-1 ${isMe?'text-brand-200':'text-earth-400'}`}>{formatDate(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-earth-100 flex gap-2">
                <input type="text" value={newMsg} onChange={e=>setNewMsg(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-earth-200 rounded-xl focus:outline-none focus:border-brand-400 transition-colors text-sm"
                  placeholder="Écrire un message..."/>
                <button type="submit" disabled={sending || !newMsg.trim()}
                  className="px-5 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 disabled:opacity-50 shadow-brand transition-colors">
                  {sending ? '...' : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="font-display font-bold text-earth-700 text-xl">Sélectionnez une conversation</h3>
                <p className="text-earth-400 mt-2 text-sm">Cliquez sur une conversation pour l'ouvrir</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
