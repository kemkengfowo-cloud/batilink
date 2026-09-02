import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch(err) {
      setError(err.response?.data?.message || 'Erreur, veuillez réessayer.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h1>
          <p className="text-gray-500 mt-2">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-gray-500 mb-6">Si cet email existe dans notre système, vous recevrez un lien dans quelques minutes.</p>
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">← Retour à la connexion</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse email</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="votre@email.com"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">← Retour à la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
