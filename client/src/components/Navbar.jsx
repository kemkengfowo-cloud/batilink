import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const navLinks = user?.role === 'conducteur' ? [
    { to: '/conducteur-travaux', label: 'Mes Chantiers', icon: '🏗️' },
    { to: '/messages',            label: 'Messages',       icon: '💬' },
  ] : user?.role === 'artisan' ? [
    { to: '/projects',            label: 'Projets',        icon: '📋' },
    { to: '/artisans',            label: 'Artisans',       icon: '🔨' },
    { to: '/messages',            label: 'Messages',       icon: '💬' },
  ] : [
    { to: '/artisans',          label: 'Artisans',          icon: '🔨' },
    { to: '/entreprises',       label: 'Entreprises BTP',   icon: '🏢' },
    { to: '/projects',          label: 'Projets',           icon: '📋' },
    { to: '/comment-ca-marche', label: 'Comment ça marche', icon: '❓' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* Barre de sécurité */}
      <div className="bg-byh-gradient text-center py-2 px-4">
        <p className="text-blue-200 text-xs font-semibold">
          🔒 B.Y.H — Plateforme BTP certifiée au Cameroun —
          <span className="text-white font-bold"> Ne payez jamais en dehors de B.Y.H</span>
        </p>
      </div>

      {/* Navbar principale */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100' : 'bg-white border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-blue-purple flex items-center justify-center text-lg shadow-blue group-hover:scale-105 transition-transform">
                🏠
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-wider">B.Y.H</span>
                <span className="hidden sm:block text-[10px] text-blue-500 font-semibold -mt-0.5">Build Your Home 🇨🇲</span>
              </div>
            </Link>

            {/* Links desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}>
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-all">
                    <div className="w-6 h-6 rounded-full bg-blue-purple flex items-center justify-center text-white text-xs font-black">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    {user.name?.split(' ')[0]}
                  </Link>
                  <button onClick={logout}
                    className="hidden sm:block px-4 py-2 text-slate-500 hover:text-red-600 font-semibold text-sm transition-colors">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="hidden sm:block px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">
                    Connexion
                  </Link>
                  <Link to="/register"
                    className="btn-byh-gradient px-5 py-2.5 text-white font-bold text-sm rounded-xl">
                    S'inscrire →
                  </Link>
                </>
              )}

              {/* Burger */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors">
                <div className="space-y-1.5">
                  <span className={`block w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}/>
                  <span className={`block w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? 'opacity-0' : ''}`}/>
                  <span className={`block w-5 h-0.5 bg-slate-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}/>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white animate-slide-up">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}>
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                      👤 Mon espace
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-semibold text-sm hover:bg-red-50">
                      ⬅️ Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50">
                      🔑 Connexion
                    </Link>
                    <Link to="/register" className="flex items-center justify-center gap-2 btn-byh-gradient px-4 py-3 rounded-xl text-white font-bold text-sm">
                      🚀 Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
