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
import MesDevis from './pages/MesDevis';
import MesContrats from './pages/MesContrats';
import MesVisites from './pages/MesVisites';
import MissionDetail from './pages/MissionDetail';
import NotFound from './pages/NotFound';
import VisiteDetail from './pages/VisiteDetail';
import DemanderVisite from './pages/DemanderVisite';
import CreerContrat from './pages/CreerContrat';
import ContratDetail from './pages/ContratDetail';
import DevisDetail from './pages/DevisDetail';
import CreerDevis from './pages/CreerDevis';
import CreateMission from './pages/CreateMission';
import Loader from './components/Loader';
import CommentCaMarche from './pages/CommentCaMarche';
import CGU from './pages/CGU';
import Confidentialite from './pages/Confidentialite';
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
          <Route path="/contrats" element={<PrivateRoute><MesContrats/></PrivateRoute>}/>
          <Route path="/missions/:id" element={<MissionDetail/>}/>
          <Route path="/visites" element={<PrivateRoute><MesVisites/></PrivateRoute>}/>
          <Route path="/visites/demander" element={<PrivateRoute role={['client']}><DemanderVisite/></PrivateRoute>}/>
          <Route path="/visites/:id" element={<PrivateRoute><VisiteDetail/></PrivateRoute>}/>
          <Route path="/contrats/creer" element={<PrivateRoute role={['entreprise','client']}><CreerContrat/></PrivateRoute>}/>
          <Route path="/contrats/:id" element={<PrivateRoute><ContratDetail/></PrivateRoute>}/>
          <Route path="/devis" element={<PrivateRoute><MesDevis/></PrivateRoute>}/>
          <Route path="/devis/creer" element={<PrivateRoute role={['artisan','entreprise']}><CreerDevis/></PrivateRoute>}/>
          <Route path="/devis/:id" element={<PrivateRoute><DevisDetail/></PrivateRoute>}/>
          <Route path="/create-mission" element={<PrivateRoute role={['entreprise']}><CreateMission/></PrivateRoute>}/>

          <Route path="/admin" element={<PrivateRoute role={['admin']}><Admin/></PrivateRoute>}/>
          <Route path="/comment-ca-marche" element={<CommentCaMarche/>}/>
          <Route path="/cgu" element={<CGU/>}/>
          <Route path="/confidentialite" element={<Confidentialite/>}/>
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
