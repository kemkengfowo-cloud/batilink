import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/helpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };
  const cl = (path) => `block px-4 py-2 rounded-lg font-medium transition-colors ${pathname===path?'bg-brand-50 text-brand-600':'text-earth-700 hover:bg-earth-100'}`;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-earth-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-brand">
            <span className="text-white font-bold text-sm font-display">B</span>
          </div>
          <span className="font-display font-bold text-xl">Bati<span className="text-brand-500">link</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/artisans" className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname==='/artisans'?'bg-brand-50 text-brand-600':'text-earth-700 hover:bg-earth-100'}`}>Artisans</Link>
          <Link to="/projects" className={`px-4 py-2 rounded-lg font-medium transition-colors ${pathname==='/projects'?'bg-brand-50 text-brand-600':'text-earth-700 hover:bg-earth-100'}`}>Projets</Link>
          {user ? (
            <>
              {user.role==='client' && <Link to="/create-project" className="ml-2 px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 shadow-brand transition-colors">+ Publier</Link>}
              <div className="relative ml-1">
                <button onClick={()=>setDrop(!drop)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-earth-100 transition-colors">
                  <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-sm font-semibold text-earth-800">{user.name.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-earth-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {drop && <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-card-hover border border-earth-100 py-1 z-50" onMouseLeave={()=>setDrop(false)}>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-earth-700 hover:bg-earth-50" onClick={()=>setDrop(false)}>Tableau de bord</Link>
                  <Link to="/messages" className="block px-4 py-2 text-sm text-earth-700 hover:bg-earth-50" onClick={()=>setDrop(false)}>Messages</Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-earth-700 hover:bg-earth-50" onClick={()=>setDrop(false)}>Mon profil</Link>
                  <hr className="my-1 border-earth-100"/>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Déconnexion</button>
                </div>}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="px-4 py-2 text-earth-700 hover:bg-earth-100 rounded-lg font-medium transition-colors">Connexion</Link>
              <Link to="/register" className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 shadow-brand transition-colors">Inscription</Link>
            </div>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-earth-100" onClick={()=>setOpen(!open)}>
          <svg className="w-6 h-6 text-earth-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && <div className="md:hidden px-4 pt-2 pb-4 border-t border-earth-100 space-y-1">
        <Link to="/artisans" className={cl('/artisans')} onClick={()=>setOpen(false)}>Artisans</Link>
        <Link to="/projects" className={cl('/projects')} onClick={()=>setOpen(false)}>Projets</Link>
        {user ? <>
          <Link to="/dashboard" className={cl('/dashboard')} onClick={()=>setOpen(false)}>Mon espace</Link>
          <Link to="/messages" className={cl('/messages')} onClick={()=>setOpen(false)}>Messages</Link>
          <Link to="/profile" className={cl('/profile')} onClick={()=>setOpen(false)}>Profil</Link>
          {user.role==='client' && <Link to="/create-project" className="block px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold text-center" onClick={()=>setOpen(false)}>+ Publier un projet</Link>}
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 font-medium rounded-lg hover:bg-red-50">Déconnexion</button>
        </> : <>
          <Link to="/login" className={cl('/login')} onClick={()=>setOpen(false)}>Connexion</Link>
          <Link to="/register" className="block px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold text-center" onClick={()=>setOpen(false)}>Créer un compte</Link>
        </>}
      </div>}
    </nav>
  );
}
