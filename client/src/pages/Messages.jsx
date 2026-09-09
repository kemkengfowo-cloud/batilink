import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { getAvatarUrl, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';


export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(r => setConversations(r.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/messages/${selected.contact._id}`)
      .then(r => setMessages(r.data || []))
      .catch(e => console.error(e));
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;
    setSending(true);
    try {
      const res = await api.post('/messages', {
        destinataire: selected.contact._id,
        contenu: text.trim()
      });
      setMessages(m => [...m, res.data]);
      setText('');
    } catch(e) { console.error(e); }
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader/></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full bg-blue-500/10"/>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Messagerie</p>
          <h1 className="text-3xl font-black text-white mb-1">💬 Messages</h1>
          <p className="text-slate-400">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

          {/* Liste conversations */}
          <div className="card-premium overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-display font-black text-slate-900 text-sm">Conversations</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-slate-400 text-sm">Aucune conversation</p>
                </div>
              ) : conversations.map((conv, i) => (
                <button key={i} onClick={() => setSelected(conv)}
                  className={`w-full text-left p-4 border-b border-slate-50 hover:bg-slate-50 transition-all ${selected?.contact._id === conv.contact._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <img src={getAvatarUrl(conv.contact?.avatar, conv.contact?.name)}
                        alt="" className="w-10 h-10 rounded-xl object-cover"/>
                      {conv.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{conv.contact?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{conv.contact?.role}</p>
                      {conv.lastMessage && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage.contenu}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Zone messages */}
          <div className="lg:col-span-2 card-premium overflow-hidden flex flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="font-display font-black text-slate-700 mb-2">Sélectionnez une conversation</h3>
                  <p className="text-slate-400 text-sm">Choisissez un contact dans la liste</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header contact */}
                <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                  <img src={getAvatarUrl(selected.contact?.avatar, selected.contact?.name)}
                    alt="" className="w-10 h-10 rounded-xl object-cover"/>
                  <div>
                    <p className="font-black text-slate-900">{selected.contact?.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{selected.contact?.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => {
                    const isMine = m.expediteur?._id === user?._id || m.expediteur === user?._id;
                    return (
                      <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-blue-purple text-white rounded-br-md'
                            : 'bg-slate-100 text-slate-800 rounded-bl-md'
                        }`}>
                          <p className="leading-relaxed">{m.contenu}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                            {formatDate(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef}/>
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-3">
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="input-premium flex-1 px-4 py-3 text-sm"
                  />
                  <button type="submit" disabled={sending || !text.trim()}
                    className="btn-byh-gradient px-5 py-3 text-white font-bold rounded-xl disabled:opacity-50 text-sm">
                    {sending ? '...' : '→'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
