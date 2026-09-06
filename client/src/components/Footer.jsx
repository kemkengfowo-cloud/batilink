import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-byh-gradient mt-auto">
      {/* Cercles décoratifs */}
      <div className="relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="md:col-span-1 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-purple flex items-center justify-center text-xl shadow-blue">🏠</div>
                <div>
                  <div className="text-xl font-black text-white tracking-wider">B.Y.H</div>
                  <div className="text-xs text-blue-300 font-semibold">Build Your Home</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                La première marketplace BTP certifiée du Cameroun. Artisans vérifiés, paiements sécurisés.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg">🇨🇲</span>
                <span className="text-slate-400 text-xs font-semibold">Fièrement Made in Cameroun</span>
              </div>
              <a href="mailto:contact@byh-cm.com"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-semibold transition-colors">
                📧 contact@byh-cm.com
              </a>
            </div>

            {/* Plateforme */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Plateforme</h4>
              <ul className="space-y-3">
                {[
                  { to: '/artisans',    label: 'Artisans & Techniciens' },
                  { to: '/entreprises', label: 'Entreprises BTP' },
                  { to: '/projects',    label: 'Projets clients' },
                  { to: '/comment-ca-marche', label: 'Comment ça marche' },
                ].map((l, i) => (
                  <li key={i}>
                    <Link to={l.to} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informations */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Informations</h4>
              <ul className="space-y-3">
                {[
                  { to: '/register?role=client',    label: 'Je suis client' },
                  { to: '/register?role=artisan',   label: 'Je suis technicien' },
                  { to: '/register?role=entreprise',label: 'Je suis une entreprise' },
                  { to: '/cgu',                     label: 'Conditions d\'utilisation' },
                  { to: '/confidentialite',         label: 'Confidentialité' },
                ].map((l, i) => (
                  <li key={i}>
                    <Link to={l.to} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Paiements & Sécurité */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Paiements sécurisés</h4>
              <div className="space-y-3">
                {[
                  { icon: '🟠', label: 'Orange Money' },
                  { icon: '🟡', label: 'MTN MoMo' },
                  { icon: '🔒', label: 'Paiement escrow B.Y.H' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-2.5">
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-white text-sm font-semibold">{p.label}</span>
                  </div>
                ))}
              </div>
              <div className="glass rounded-xl p-4 mt-4">
                <p className="text-blue-200 text-xs font-bold mb-1">🔒 Garantie B.Y.H</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Fonds libérés uniquement après validation de vos travaux.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © 2026 B.Y.H — Tous droits réservés
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Ne payez jamais en dehors de B.Y.H</span>
              <span className="text-green-400 text-xs font-bold">🔒 Sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
