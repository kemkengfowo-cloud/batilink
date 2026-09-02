import React from 'react';
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ToastProvider } from './components/Toast';
import NotificationToast from './components/NotificationToast';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ArtisanList from './pages/ArtisanList';
import ArtisanProfile from './pages/ArtisanProfile';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import CreateProject from './pages/CreateProject';
import MesProjets from './pages/MesProjets';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import EntrepriseList from './pages/EntrepriseList';
import EntrepriseProfile from './pages/EntrepriseProfile';
import MissionList from './pages/MissionList';
import MesDevis from './pages/MesDevis';
import MesPaiements from './pages/MesPaiements';
import MesRevenus from './pages/MesRevenus';
import ConducteurMissions from './pages/ConducteurMissions';
import ConducteurDetail from './pages/ConducteurDetail';
import MesLitiges from './pages/MesLitiges';
import DemandeConducteur from './pages/DemandeConducteur';
import MonChantier from './pages/MonChantier';
import MesContrats from './pages/MesContrats';
import MesVisites from './pages/MesVisites';
import MissionDetail from './pages/MissionDetail';
import DemanderPersonnel from './pages/DemanderPersonnel';
import MesDemandesPersonnel from './pages/MesDemandesPersonnel';
import DemandePersonnelDetail from './pages/DemandePersonnelDetail';
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
import AdminHistorique from './pages/AdminHistorique';

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
const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader/>;
  return user ? <Home/> : <ComingSoon/>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar/>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeRoute/>}/>
          <Route path="/login" element={<PublicOnly><Login/></PublicOnly>}/>
          <Route path="/forgot-password" element={<PublicOnly><ForgotPassword/></PublicOnly>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>
          <Route path="/register" element={<PublicOnly><Register/></PublicOnly>}/>

          {/* Pages publiques */}
          <Route path="/artisans" element={<PrivateRoute><ArtisanList/></PrivateRoute>}/>
          <Route path="/artisans/:id" element={<PrivateRoute><ArtisanProfile/></PrivateRoute>}/>
          <Route path="/projects" element={<PrivateRoute><ProjectList/></PrivateRoute>}/>
          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail/></PrivateRoute>}/>
          <Route path="/entreprises" element={<PrivateRoute><EntrepriseList/></PrivateRoute>}/>
          <Route path="/entreprises/:id" element={<PrivateRoute><EntrepriseProfile/></PrivateRoute>}/>
          <Route path="/missions" element={<PrivateRoute><MissionList/></PrivateRoute>}/>

          {/* Pages protégées */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
          <Route path="/messages" element={<PrivateRoute><Messages/></PrivateRoute>}/>

          {/* Client uniquement */}
          <Route path="/mes-projets" element={<PrivateRoute role={['client']}><MesProjets/></PrivateRoute>}/>
          <Route path="/create-project" element={<PrivateRoute role={['client']}><CreateProject/></PrivateRoute>}/>

          {/* Entreprise uniquement */}
          <Route path="/contrats" element={<PrivateRoute><MesContrats/></PrivateRoute>}/>
          <Route path="/missions/:id" element={<PrivateRoute><MissionDetail/></PrivateRoute>}/>
          <Route path="/visites" element={<PrivateRoute><MesVisites/></PrivateRoute>}/>
          <Route path="/visites/demander" element={<PrivateRoute role={['client']}><DemanderVisite/></PrivateRoute>}/>
          <Route path="/visites/:id" element={<PrivateRoute><VisiteDetail/></PrivateRoute>}/>
          <Route path="/contrats/creer" element={<PrivateRoute role={['entreprise','client','admin']}><CreerContrat/></PrivateRoute>}/>
          <Route path="/contrats/:id" element={<PrivateRoute><ContratDetail/></PrivateRoute>}/>
          <Route path="/litiges" element={<PrivateRoute><MesLitiges/></PrivateRoute>}/>
          <Route path="/paiements" element={<PrivateRoute><MesPaiements/></PrivateRoute>}/>
          <Route path="/revenus" element={<PrivateRoute><MesRevenus/></PrivateRoute>}/>
          <Route path="/conducteur" element={<PrivateRoute><ConducteurMissions/></PrivateRoute>}/>
          <Route path="/conducteur-travaux" element={<PrivateRoute><DemandeConducteur/></PrivateRoute>}/>
          <Route path="/conducteur-travaux/chantier/:id" element={<PrivateRoute><MonChantier/></PrivateRoute>}/>
          <Route path="/conducteur/missions/:id" element={<PrivateRoute><ConducteurDetail/></PrivateRoute>}/>
          <Route path="/devis" element={<PrivateRoute><MesDevis/></PrivateRoute>}/>
          <Route path="/devis/creer" element={<PrivateRoute role={['artisan','entreprise']}><CreerDevis/></PrivateRoute>}/>
          <Route path="/devis/:id" element={<PrivateRoute><DevisDetail/></PrivateRoute>}/>
          <Route path="/demandes-personnel" element={<PrivateRoute><MesDemandesPersonnel/></PrivateRoute>}/>
          <Route path="/demandes-personnel/new" element={<PrivateRoute role={['entreprise']}><DemanderPersonnel/></PrivateRoute>}/>
          <Route path="/demandes-personnel/:id" element={<PrivateRoute><DemandePersonnelDetail/></PrivateRoute>}/>
          <Route path="/create-mission" element={<PrivateRoute role={['entreprise']}><CreateMission/></PrivateRoute>}/>

          <Route path="/admin" element={<PrivateRoute role={['admin']}><Admin/></PrivateRoute>}/>
          <Route path="/admin/historique" element={<PrivateRoute role={['admin']}><AdminHistorique/></PrivateRoute>}/>
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
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
    <AuthProvider>
      <ToastProvider>
    <BrowserRouter>
      <NotificationToast/>
        <AppRoutes/>
      </BrowserRouter>
    </ToastProvider>
    </AuthProvider>
    </GoogleReCaptchaProvider>
  );
}

