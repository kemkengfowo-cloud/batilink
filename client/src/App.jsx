import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ArtisanList from './pages/ArtisanList';
import ArtisanProfile from './pages/ArtisanProfile';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import EntrepriseList from './pages/EntrepriseList';
import EntrepriseProfile from './pages/EntrepriseProfile';
import MissionList from './pages/MissionList';
import CreateMission from './pages/CreateMission';
import Loader from './components/Loader';
import Admin from './pages/Admin';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader/>;
  if (!user) return <Navigate to="/login" replace/>;
  if (role && !role.includes(user.role)) return <Navigate to="/dashboard" replace/>;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader/>;
  if (user) return <Navigate to="/dashboard" replace/>;
  return children;
};

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-gray-50">
      <div className="text-8xl mb-6">🏗️</div>
      <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">Page introuvable</h1>
      <p className="text-gray-500 mb-8">Cette page n'existe pas ou a été déplacée.</p>
      <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">Retour à l'accueil</a>
    </div>
  );
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar/>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<PublicOnly><Login/></PublicOnly>}/>
          <Route path="/register" element={<PublicOnly><Register/></PublicOnly>}/>

          {/* Pages publiques */}
          <Route path="/artisans" element={<ArtisanList/>}/>
          <Route path="/artisans/:id" element={<ArtisanProfile/>}/>
          <Route path="/projects" element={<ProjectList/>}/>
          <Route path="/projects/:id" element={<ProjectDetail/>}/>
          <Route path="/entreprises" element={<EntrepriseList/>}/>
          <Route path="/entreprises/:id" element={<EntrepriseProfile/>}/>
          <Route path="/missions" element={<MissionList/>}/>

          {/* Pages protégées */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
          <Route path="/messages" element={<PrivateRoute><Messages/></PrivateRoute>}/>

          {/* Client uniquement */}
          <Route path="/create-project" element={<PrivateRoute role={['client']}><CreateProject/></PrivateRoute>}/>

          {/* Entreprise uniquement */}
          <Route path="/create-mission" element={<PrivateRoute role={['entreprise']}><CreateMission/></PrivateRoute>}/>

          <Route path="/admin" element={<PrivateRoute role={['admin']}><Admin/></PrivateRoute>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </AuthProvider>
  );
}
