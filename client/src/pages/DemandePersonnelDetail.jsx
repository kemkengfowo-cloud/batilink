import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { formatBudget, formatDate } from '../utils/helpers';
import { VILLES } from '../utils/helpers';

const TYPES_PERSONNEL = ["Coffreur","Ferrailleur","Macon","Dalleur","Carreleur","Peintre","Electricien","Plombier","Menuisier","Soudeur","Conducteur d engins","Autre"];

const STATUT = {
  en_attente:     { label:"En attente admin", color:"bg-yellow-50 text-yellow-700", icon:"⏳" },
  en_negociation: { label:"En negociation", color:"bg-blue-50 text-blue-700", icon:"💬" },
  accord_trouve:  { label:"Accord trouve", color:"bg-green-50 text-green-700", icon:"✅" },
  contrat_genere: { label:"Contrat genere", color:"bg-purple-50 text-purple-700", icon:"📄" },
  en_cours:       { label:"Mission en cours", color:"bg-indigo-50 text-indigo-700", icon:"🔨" },
  termine:        { label:"Termine", color:"bg-gray-100 text-gray-600", icon:"✓" },
  annulee:        { label:"Annulee", color:"bg-red-50 text-red-700", icon:"❌" },
};

export default function DemandePersonnelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({});
  const [showContreOffre, setShowContreOffre] = useState(false);
  const [montantContreOffre, setMontantContreOffre] = useState("");
  const [messageContreOffre, setMessageContreOffre] = useState("");

  useEffect(() => {
    api.get("/demandes-personnel/" + id)
      .then(res => {
        setDemande(res.data);
        setForm({
          typePersonnel: res.data.typePersonnel || [],
          nombrePersonnes: res.data.nombrePersonnes || 1,
          ville: res.data.ville || "",
          adresseChantier: res.data.adresseChantier || "",
          dateDebut: res.data.dateDebut ? res.data.dateDebut.split("T")[0] : "",
          dateFin: res.data.dateFin ? res.data.dateFin.split("T")[0] : "",
          description: res.data.description || "",
          budgetPropose: res.data.budgetPropose || ""
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      typePersonnel: f.typePersonnel && f.typePersonnel.includes(type)
        ? f.typePersonnel.filter(t => t !== type)
        : [...(f.typePersonnel || []), type]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/demandes-personnel/" + id, {
        ...form,
        budgetPropose: parseInt(form.budgetPropose),
        nombrePersonnes: parseInt(form.nombrePersonnes)
      });
      setDemande(res.data);
      setEditing(false);
      setMessage("Demande mise a jour !");
      setTimeout(() => setMessage(""), 3000);
    } catch(err) {
      setMessage(err.response && err.response.data ? err.response.data.message : "Erreur");
    }
    setSaving(false);
  };

  const handleAnnuler = async () => {
    if (!window.confirm("Annuler cette demande ?")) return;
    try {
      await api.put("/demandes-personnel/" + id + "/annuler");
      navigate("/demandes-personnel");
    } catch(err) {
      setMessage("Erreur lors de l annulation");
    }
  };

  const handleAccepterPrix = async (montant) => {
    try {
      await api.put("/demandes-personnel/" + id + "/accepter-accord", { montant: montant, message: "Prix accepte par l entreprise" });
      const res = await api.get("/demandes-personnel/" + id);
      setDemande(res.data);
      setMessage("Prix accepte ! L admin va generer le contrat.");
    } catch(err) {
      setMessage("Erreur");
    }
  };

  const handleContreOffre = async () => {
    if (!montantContreOffre) return;
    try {
      await api.put("/demandes-personnel/" + id + "/contre-offre", { montant: parseInt(montantContreOffre), message: messageContreOffre });
      const res = await api.get("/demandes-personnel/" + id);
      setDemande(res.data);
      setShowContreOffre(false);
      setMontantContreOffre("");
      setMessage("Contre-offre envoyee a l admin !");
    } catch(err) {
      setMessage("Erreur");
    }
  };

  if (loading) return React.createElement(Loader, null);
  if (!demande) return React.createElement("div", { className: "text-center py-20 text-gray-500" }, "Demande non trouvee.");

  const isEntreprise = user && (user.role === "entreprise" || (user._id && demande.entreprise && user._id.toString() === demande.entreprise._id.toString()));
  const isAdmin = user && user.role === "admin";
  const peutModifier = isEntreprise && demande.statut === "en_attente";
  const statut = STATUT[demande.statut];
  const dernierePropositionAdmin = demande.propositions && demande.propositions.length > 0 && demande.propositions[demande.propositions.length - 1].role === "admin" ? demande.propositions[demande.propositions.length - 1] : null;
  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors";
