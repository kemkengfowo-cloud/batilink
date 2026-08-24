import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ROLES = [
  { id: 'client', label: 'Je suis Client', icon: '🏠', color: 'blue' },
  { id: 'artisan', label: 'Je suis Artisan', icon: '🔨', color: 'green' },
  { id: 'entreprise', label: 'Je suis Entreprise', icon: '🏢', color: 'purple' },
];

const ETAPES = {
  client: [
    { num:'01', icon:'📋', titre:'Publiez votre projet', desc:'Décrivez vos travaux, votre budget et votre ville. La publication est gratuite et prend moins de 5 minutes.' },
    { num:'02', icon:'📄', titre:'Recevez des devis', desc:'Des artisans qualifiés vous contactent avec leurs offres détaillées. Comparez les prix, délais et avis clients.' },
    { num:'03', icon:'✍️', titre:'Signez le contrat', desc:'Choisissez l\'artisan et signez un contrat officiel B.Y.H qui protège les deux parties.' },
    { num:'04', icon:'📸', titre:'Suivez les travaux', desc:'Votre artisan publie des photos à chaque jalon. Validez chaque étape avant de payer.' },
    { num:'05', icon:'⭐', titre:'Évaluez & Payez', desc:'Validez les travaux, effectuez le paiement sécurisé et laissez un avis pour aider la communauté.' },
  ],
  artisan: [
    { num:'01', icon:'👤', titre:'Créez votre profil', desc:'Renseignez votre métier, vos spécialités, votre ville et vos photos de réalisations (portfolio avant/après).' },
    { num:'02', icon:'🔍', titre:'Parcourez les projets', desc:'Consultez les projets publiés par les clients dans votre ville et votre domaine d\'expertise.' },
    { num:'03', icon:'📄', titre:'Envoyez un devis', desc:'Proposez votre meilleur devis avec délais et conditions. Plus votre profil est complet, plus vous décrochez de missions.' },
    { num:'04', icon:'🏗️', titre:'Réalisez les travaux', desc:'Publiez des photos à chaque jalon pour rassurer le client et valider l\'avancement des travaux.' },
    { num:'05', icon:'💰', titre:'Recevez le paiement', desc:'Une fois les travaux validés, recevez 90% du montant sur votre Mobile Money. B.Y.H prélève 10% de commission.' },
  ],
  entreprise: [
    { num:'01', icon:'🏢', titre:'Créez votre profil entreprise', desc:'Renseignez vos lots de travaux, votre RCCM, vos références et votre équipe disponible.' },
    { num:'02', icon:'👷', titre:'Demandez du personnel', desc:'Besoin de maçons, électriciens ou autres techniciens ? Soumettez une demande avec vos dates et budget.' },
    { num:'03', icon:'💬', titre:'Négociez avec l\'admin', desc:'L\'équipe B.Y.H vous propose des techniciens qualifiés et négocie les conditions avec vous.' },
    { num:'04', icon:'✍️', titre:'Signez le contrat', desc:'Un contrat de location de personnel est établi pour protéger votre entreprise et les techniciens.' },
    { num:'05', icon:'📊', titre:'Gérez vos chantiers', desc:'Suivez vos projets, gérez vos contrats et évaluez le personnel pour construire votre réputation.' },
  ],
};

const GARANTIES = [
  { icon:'🔒', titre:'Artisans vérifiés', desc:'Chaque artisan est vérifié par notre équipe avant d\'être publié sur la plateforme.' },
  { icon:'💰', titre:'Paiement sécurisé', desc:'Votre argent est bloqué en séquestre jusqu\'à la validation de chaque jalon.' },
  { icon:'⚖️', titre:'Arbitrage B.Y.H', desc:'En cas de litige, notre équipe intervient pour trouver une solution équitable.' },
  { icon:'⭐', titre:'Avis vérifiés', desc:'Tous les avis proviennent de clients ayant réellement travaillé avec l\'artisan.' },
  { icon:'📱', titre:'Suivi temps réel', desc:'Notifications instantanées à chaque étape de votre projet.' },
  { icon:'🇨🇲', titre:'Made in Cameroun', desc:'Une plateforme pensée pour le marché camerounais et ses spécificités.' },
];

export default function CommentCaMarche() {
  const [activeRole, setActiveRole] = useState('client');
  const etapes = ETAPES[activeRole];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="py-20 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Link to="/" className="text-blue-300 hover:text-white text-sm mb-4 inline-block">← Accueil</Link>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            Simple, rapide et sécurisé
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black mb-4">
            Comment fonctionne<br/><span className="text-blue-400">B.Y.H</span> ?
          </h1>
          <p className="text-blue-200 text-xl max-w-2xl mx-auto">
            La plateforme la plus simple et sécurisée pour vos projets BTP au Cameroun
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* Sélecteur de rôle */}
        <div>
          <h2 className="text-3xl font-display font-black text-gray-900 text-center mb-8">
            Choisissez votre profil
          </h2>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setActiveRole(r.id)}
                className={`p-5 rounded-2xl border-2 font-semibold transition-all text-center ${
                  activeRole === r.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                }`}>
                <div className="text-3xl mb-2">{r.icon}</div>
                <div className="text-sm">{r.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Étapes */}
        <div>
          <h2 className="text-3xl font-display font-black text-gray-900 text-center mb-12">
            {activeRole === 'client' && '🏠 En tant que client'}
            {activeRole === 'artisan' && '🔨 En tant qu\'artisan'}
            {activeRole === 'entreprise' && '🏢 En tant qu\'entreprise'}
          </h2>
          <div className="space-y-4">
            {etapes.map((e, i) => (
              <div key={i} className="flex gap-6 bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-2xl">
                    {e.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-blue-600 font-black text-sm">{e.num}</span>
                    <h3 className="font-display font-bold text-lg text-gray-900">{e.titre}</h3>
                  </div>
                  <p className="text-gray-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garanties */}
        <div>
          <h2 className="text-3xl font-display font-black text-gray-900 text-center mb-4">
            Nos garanties
          </h2>
          <p className="text-gray-500 text-center mb-12">Votre protection est notre priorité absolue</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GARANTIES.map((g, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{g.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{g.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tarifs */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-display font-black mb-4">Tarification simple</h2>
          <p className="text-blue-200 mb-8">Pas de frais cachés, pas d'abonnement</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label:'Inscription', prix:'Gratuit', desc:'Pour clients et artisans' },
              { label:'Publication projet', prix:'Gratuit', desc:'Publiez autant de projets' },
              { label:'Commission B.Y.H', prix:'10%', desc:'Seulement sur transactions' },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5">
                <p className="text-blue-200 text-sm font-medium mb-1">{t.label}</p>
                <p className="text-3xl font-black text-white mb-1">{t.prix}</p>
                <p className="text-blue-300 text-xs">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-display font-black text-gray-900 mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-gray-500 mb-8">Rejoignez des milliers de Camerounais qui font confiance à B.Y.H</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:scale-105">
              S'inscrire gratuitement →
            </Link>
            <Link to="/artisans" className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-blue-300 transition-all">
              Voir les artisans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
