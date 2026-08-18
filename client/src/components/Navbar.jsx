import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/helpers';
import Notifications from './Notifications';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };
  const close = () => setOpen(false);
  const isActive = (p) => pathname === p;

  const navLinks = {
    client: [
      { to:'/dashboard', label:'Tableau de bord' },
      { to:'/artisans', label:'Trouver un artisan' },
      { to:'/entreprises', label:'Entreprises BTP' },
      { to:'/visites', label:'Visites evaluation' },
      { to:'/messages', label:'Messages' },
    ],
    artisan: [
      { to:'/dashboard', label:'Tableau de bord' },
      { to:'/projects', label:'Projets' },
      { to:'/devis', label:'Mes devis' },
      { to:'/messages', label:'Messages' },
    ],
    entreprise: [
      { to:'/dashboard', label:'Tableau de bord' },
      { to:'/demandes-personnel', label:'Mes demandes' },
      { to:'/contrats', label:'Mes contrats' },
      { to:'/messages', label:'Messages' },
    ],
    admin: [
      { to:'/admin', label:'Panel Admin' },
    ],
  };

  const links = user ? (navLinks[user.role] || []) : [];

  return (
    <>
      {/* Bandeau protection */}
      <div className="bg-blue-700 text-white py-1.5 px-4 text-center text-xs font-medium hidden md:block">
        🔒 B.Y.H protege vos transactions — Utilisez toujours le systeme de devis officiel pour etre couvert en cas de litige
      </div>

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/></svg>
              </div>
              <span className="font-display font-bold text-xl text-gray-900">B.<span className="text-blue-600">Y.</span>H</span>
            </Link>







            <div className="hidden lg:flex items-center gap-1 flex-1 mx-6">
              {user ? links.map(l=>(
                <Link key={l.to} to={l.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive(l.to)?'bg-blue-50 text-blue-600':'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  {l.label}
                </Link>
              )) : (
                <>
                  <Link to="/artisans" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/artisans')?'bg-blue-50 text-blue-600':'text-gray-600 hover:bg-gray-100'}`}>Artisans</Link>
                  <Link to="/projects" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/projects')?'bg-blue-50 text-blue-600':'text-gray-600 hover:bg-gray-100'}`}>Projets</Link>
                  <Link to="/entreprises" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/entreprises')?'bg-blue-50 text-blue-600':'text-gray-600 hover:bg-gray-100'}`}>Entreprises BTP</Link>
                  <Link to="/comment-ca-marche" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/comment-ca-marche')?'bg-blue-50 text-blue-600':'text-gray-600 hover:bg-gray-100'}`}>Comment ca marche</Link>
                </>
              )}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Notifications/>
                  {user.role==='client' && (
                    <Link to="/create-project" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                      + Nouvelle demande
                    </Link>
                  )}
                  {user.role==='entreprise' && (
                    <Link to="/demandes-personnel/new" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                      + Demander
                    </Link>
                  )}
                  {user.role==='artisan' && (
                    <Link to="/devis/creer" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                      + Creer devis
                    </Link>
                  )}
                  <div className="relative">
                    <button onClick={()=>setDrop(!drop)} onBlur={()=>setTimeout(()=>setDrop(false),200)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                      <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name} className="w-8 h-8 rounded-lg object-cover"/>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                        <p className="text-xs text-gray-400 capitalize leading-none mt-0.5">{user.role}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                    </button>
                    {drop && (
                      <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Tableau de bord</Link>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Mon profil</Link>
                        <Link to="/messages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Messages</Link>
                        {user.role==='client' && <Link to="/devis" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Mes devis</Link>}
                        {(user.role==='client' || user.role==='artisan') && <Link to="/litiges" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Mes litiges</Link>}
                        {user.role==='client' && <Link to="/contrats" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Mes contrats</Link>}
                        {user.role==='artisan' && <Link to="/contrats" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={()=>setDrop(false)}>Mes contrats</Link>}
                        {user.role==='admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50" onClick={()=>setDrop(false)}>Panel Admin</Link>}
                        <hr className="my-1 border-gray-100"/>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Deconnexion</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Connexion</Link>
                  <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Inscription</Link>
                </div>
              )}
            </div>

            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={()=>setOpen(!open)}>
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>

          {open && (
            <div className="lg:hidden py-3 pb-5 border-t border-gray-100 space-y-1">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-xs text-blue-700 font-medium">
                🔒 Utilisez toujours le devis officiel B.Y.H pour etre protege
              </div>
              {user ? (
                <>
                  {links.map(l=>(
                    <Link key={l.to} to={l.to} onClick={close}
                      className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${isActive(l.to)?'bg-blue-50 text-blue-600':'text-gray-700 hover:bg-gray-100'}`}>
                      {l.label}
                    </Link>
                  ))}
                  <hr className="my-2 border-gray-100"/>
                  <Link to="/profile" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Mon profil</Link>
                  {user.role==='client' && <Link to="/devis" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Mes devis</Link>}
                  {user.role==='client' && <Link to="/contrats" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Mes contrats</Link>}
                  {user.role==='artisan' && <Link to="/contrats" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Mes contrats</Link>}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">Deconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/artisans" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Artisans</Link>
                  <Link to="/projects" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Projets</Link>
                  <Link to="/entreprises" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Entreprises BTP</Link>
                  <Link to="/comment-ca-marche" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Comment ca marche</Link>
                  <hr className="my-2 border-gray-100"/>
                  <Link to="/login" onClick={close} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100">Connexion</Link>
                  <Link to="/register" onClick={close} className="block px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold text-center">Inscription</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
