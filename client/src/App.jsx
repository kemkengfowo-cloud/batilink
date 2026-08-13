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
import Loader from './components/Loader';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader/>;
  if (!user) return <Navigate to="/login" replace/>;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace/>;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader/>;
  if (user) return <Navigate to="/dashboard" replace/>;
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<PublicOnly><Login/></PublicOnly>}/>
          <Route path="/register" element={<PublicOnly><Register/></PublicOnly>}/>
          <Route path="/artisans" element={<ArtisanList/>}/>
          <Route path="/artisans/:id" element={<ArtisanProfile/>}/>
          <Route path="/projects" element={<ProjectList/>}/>
          <Route path="/projects/:id" element={<ProjectDetail/>}/>
          <Route path="/create-project" element={<PrivateRoute role="client"><CreateProject/></PrivateRoute>}/>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
          <Route path="/messages" element={<PrivateRoute><Messages/></PrivateRoute>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-8xl mb-6">🏗️</div>
      <h1 className="text-4xl font-display font-bold text-earth-900 mb-3">Page introuvable</h1>
      <p className="text-earth-500 mb-8">Cette page n'existe pas ou a été déplacée.</p>
      <a href="/" className="px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-brand transition-colors">Retour à l'accueil</a>
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
