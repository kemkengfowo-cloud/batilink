import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const CATEGORIES = [
  { key: 'design',        label: '🎨 Design' },
  { key: 'fonctionnalite',label: '⚙️ Fonctionnalité' },
  { key: 'bug',           label: '🐛 Bug' },
  { key: 'suggestion',    label: '💡 Suggestion' },
  { key: 'autre',         label: '📝 Autre' },
];

export default function FeedbackWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(0);
  const [categorie, setCategorie] = useState('autre');
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note || !commentaire.trim()) return;
    setLoading(true);
    try {
      await api.post('/feedback', {
        note, categorie, commentaire,
        source: 'web',
        page: location.pathname,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        setNote(0);
        setCommentaire('');
        setCategorie('autre');
      }, 2500);
    } catch(err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Panel feedback */}
      {open && (
        <div className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-byh-gradient p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black text-base">💬 Votre avis compte !</p>
                <p className="text-blue-200 text-xs mt-0.5">Aidez-nous à améliorer B.Y.H</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-sm">
                ✕
              </button>
            </div>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-black text-slate-900 text-lg">Merci !</p>
              <p className="text-slate-500 text-sm mt-1">Votre retour nous aide à améliorer B.Y.H</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Étoiles */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Note globale *</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button"
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setNote(i)}
                      className="text-3xl transition-transform hover:scale-110">
                      <span className={(i <= (hover || note)) ? 'text-amber-400' : 'text-slate-200'}>
                        ★
                      </span>
                    </button>
                  ))}
                  {note > 0 && (
                    <span className="ml-2 text-sm text-slate-500 self-center">
                      {['', 'Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent !'][note]}
                    </span>
                  )}
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.key} type="button"
                      onClick={() => setCategorie(c.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        categorie === c.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Commentaire *</p>
                <textarea
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-blue-400 text-slate-800"
                  rows={3}
                  placeholder="Partagez votre expérience, signalez un bug, proposez une amélioration..."
                />
              </div>

              <button type="submit" disabled={!note || !commentaire.trim() || loading}
                title={!note ? "Choisissez une note" : !commentaire.trim() ? "Écrivez un commentaire" : ""}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition-all">
                {loading ? '⏳ Envoi...' : '📤 Envoyer mon retour'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-2xl transition-all hover:scale-110 ${
          open ? 'bg-slate-700 rotate-0' : 'bg-byh-gradient'
        }`}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}
