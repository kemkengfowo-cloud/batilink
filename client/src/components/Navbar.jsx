import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setOpen(false); setDrop(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/artisans', label: 'Artisans' },
    { to: '/entreprises', label: 'Entreprises BTP' },
    { to: '/projects', label: 'Projets' },
    { to: '/comment-ca-marche', label: 'Comment ça marche' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="relative z-50">
      {/* Bandeau info */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white py-1.5 px-4 text-center text-xs font-medium hidden md:block">
        🔒 B.Y.H — Plateforme BTP certifiée au Cameroun — Ne payez jamais en dehors de B.Y.H
      </div>

      {/* Navbar principale */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white border-b border-gray-100 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display font-bold text-xl text-gray-900">B.<span className="text-blue-600">Y.</span>H</span>
                <span className="text-xs text-gray-400 font-medium tracking-wide">Build Your Home</span>
              </div>
            </Link>

            {/* Links desktop */}
            <div className="hidden lg:flex items-center gap-1 flex-1 mx-8">
              {links.map(l => (
                <Link key={l.to} to={l.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive(l.to)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Actions desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button onClick={() => setDrop(!drop)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400 leading-tight capitalize">{user.role}</p>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${drop ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {drop && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.matricule && <p className="text-xs text-blue-600 font-semibold mt-0.5">#{user.matricule}</p>}
                      </div>
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        🏠 Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        👤 Mon profil
                      </Link>
                      <Link to="/messages" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        💬 Messages
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50">
                          ⚙️ Administration
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          ⬅️ Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
                    Connexion
                  </Link>
                  <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105">
                    S'inscrire gratuitement
                  </Link>
                </>
              )}
            </div>

            {/* Menu mobile */}
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-5 flex flex-col gap-1.5">
                <span className={`block h-0.5 bg-gray-600 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`}/>
                <span className={`block h-0.5 bg-gray-600 transition-all ${open ? 'opacity-0' : ''}`}/>
                <span className={`block h-0.5 bg-gray-600 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`}/>
              </div>
            </button>
          </div>
        </div>

        {/* Menu mobile ouvert */}
        {open && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-1">
              {links.map(l => (
                <Link key={l.to} to={l.to}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(l.to) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold">
                      🏠 Mon Dashboard
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50">
                      ⬅️ Se déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-3 text-center border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold">
                      Connexion
                    </Link>
                    <Link to="/register" className="block px-4 py-3 text-center bg-blue-600 text-white rounded-xl text-sm font-bold">
                      S'inscrire gratuitement
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
