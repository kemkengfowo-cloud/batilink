import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { getAvatarUrl, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

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
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selected) fetchMessages(selected._id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchMessages = async (contactId) => {
    try {
      const res = await api.get(`/messages/${contactId}`);
      setMessages(res.data || []);
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      await api.post('/messages', { destinataire: selected._id, contenu: newMsg });
      setNewMsg('');
      fetchMessages(selected._id);
      fetchConversations();
    } catch {}
    finally { setSending(false); }
  };

  const getUserId = (u) => u?._id || u?.id || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm font-medium mb-6 transition-colors">
          ← Tableau de bord
        </Link>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-6">Messages</h1>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{height:'75vh'}}>
          <div className="flex h-full">

            {/* Liste conversations */}
            <div className={`${selected?'hidden md:flex':'flex'} flex-col w-full md:w-80 border-r border-gray-100 flex-shrink-0`}>
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-display font-semibold text-gray-900">Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-gray-400 text-sm">Aucune conversation</p>
                  </div>
                ) : conversations.map(c => (
                  <button key={c.contact?._id} onClick={() => setSelected(c.contact)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${selected?._id === c.contact?._id ? 'bg-blue-50' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <img src={getAvatarUrl(c.contact?.avatar, c.contact?.name)} alt={c.contact?.name}
                        className="w-11 h-11 rounded-xl object-cover"/>
                      {c.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold truncate ${c.unread>0?'text-gray-900':'text-gray-700'}`}>
                          {c.contact?.name}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(c.lastMessage?.createdAt)}</span>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${c.unread>0?'text-gray-800 font-medium':'text-gray-400'}`}>
                        {c.lastMessage?.contenu}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Zone messages */}
            <div className={`${selected?'flex':'hidden md:flex'} flex-col flex-1`}>
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-display font-bold text-gray-700 mb-2">Vos messages</h3>
                  <p className="text-gray-400">Selectionnez une conversation pour commencer</p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white">
                    <button onClick={() => setSelected(null)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-1">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <img src={getAvatarUrl(selected.avatar, selected.name)} alt={selected.name}
                      className="w-10 h-10 rounded-xl object-cover"/>
                    <div>
                      <p className="font-semibold text-gray-900">{selected.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{selected.role}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">Debut de la conversation</div>
                    ) : messages.map(m => {
                      const isMine = getUserId(m.expediteur) === getUserId(user);
                      return (
                        <div key={m._id} className={`flex ${isMine?'justify-end':'justify-start'}`}>
                          <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMine?'bg-blue-600 text-white rounded-br-sm':'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'}`}>
                            <p className="whitespace-pre-wrap">{m.contenu}</p>
                            <p className={`text-xs mt-1 ${isMine?'text-blue-200':'text-gray-400'}`}>
                              {formatDate(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef}/>
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-3">
                    <input type="text" value={newMsg} onChange={e=>setNewMsg(e.target.value)}
                      placeholder="Ecrire un message..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"/>
                    <button type="submit" disabled={sending||!newMsg.trim()}
                      className="px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0">
                      {sending ? '...' : 'Envoyer'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
