import React from 'react';
import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-300 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-display font-bold text-xl text-white">Batilink</span>
            </div>
            <p className="text-sm text-earth-400">La plateforme de référence pour trouver des artisans fiables au Cameroun.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/artisans" className="hover:text-brand-400 transition-colors">Artisans</Link></li>
              <li><Link to="/projects" className="hover:text-brand-400 transition-colors">Projets</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Créer un compte</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <p className="text-sm text-earth-400">Cameroun 🇨🇲</p>
            <p className="text-sm text-earth-400 mt-1">contact@batilink.cm</p>
          </div>
        </div>
        <div className="border-t border-earth-700 mt-8 pt-8 text-center text-sm text-earth-500">
          © {new Date().getFullYear()} Batilink. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
