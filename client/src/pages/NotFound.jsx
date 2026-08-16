import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}
          className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <span className="text-6xl">🏗️</span>
        </div>
        <h1 className="text-8xl font-display font-black text-gray-200 mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">Page introuvable</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Cette page n existe pas ou a ete deplacee. Retournez a l accueil pour continuer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Retour a l accueil
          </Link>
          <Link to="/artisans" className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors">
            Trouver un artisan
          </Link>
        </div>
      </div>
    </div>
  );
}
