import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/></svg></div>
              <span className="font-display font-bold text-xl">B.Y.H</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed max-w-xs">La plateforme de reference pour trouver des artisans et entreprises BTP fiables au Cameroun.</p>
            <p className="text-blue-300 text-sm mt-4">🇨🇲 Fierement Made in Cameroun</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Plateforme</h4>
            <ul className="space-y-2.5 text-sm text-blue-200">
              <li><Link to="/artisans" className="hover:text-white transition-colors">Artisans & Techniciens</Link></li>
              <li><Link to="/entreprises" className="hover:text-white transition-colors">Entreprises BTP</Link></li>
              <li><Link to="/projects" className="hover:text-white transition-colors">Projets clients</Link></li>
              <li><Link to="/comment-ca-marche" className="hover:text-white transition-colors">Comment ca marche</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Informations</h4>
            <ul className="space-y-2.5 text-sm text-blue-200">
              <li><Link to="/register?role=client" className="hover:text-white transition-colors">Je suis client</Link></li>
              <li><Link to="/register?role=artisan" className="hover:text-white transition-colors">Je suis technicien</Link></li>
              <li><Link to="/register?role=entreprise" className="hover:text-white transition-colors">Je suis une entreprise</Link></li>
              <li><Link to="/cgu" className="hover:text-white transition-colors">Conditions d utilisation</Link></li>
              <li><Link to="/confidentialite" className="hover:text-white transition-colors">Confidentialite</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-900 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-blue-300">
          <p>© {new Date().getFullYear()} B.Y.H. Tous droits reserves.</p>
          <p>contact@byh-cm.com</p>
        </div>
      </div>
    </footer>
  );
}

