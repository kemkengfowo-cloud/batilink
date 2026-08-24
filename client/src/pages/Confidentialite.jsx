import React from 'react';

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-white">
          <h1 className="text-3xl font-display font-black">Politique de Confidentialite</h1>
          <Link to="/" className="text-blue-300 hover:text-white text-sm mb-4 inline-block">← Accueil</Link>
          <p className="text-blue-200 mt-2">Derniere mise a jour : Aout 2026</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8">
          {[
            { titre:'Donnees collectees', contenu:'Nous collectons : nom, email, telephone, ville, photos de profil et photos de realisations. Ces donnees sont necessaires au fonctionnement de la plateforme.' },
            { titre:'Utilisation des donnees', contenu:'Vos donnees sont utilisees pour : creer et gerer votre compte, faciliter la mise en relation, envoyer des notifications importantes, ameliorer la plateforme.' },
            { titre:'Conservation des donnees', contenu:'Vos donnees sont conservees tant que votre compte est actif. Apres suppression du compte, les donnees sont effacees sous 30 jours.' },
            { titre:'Vos droits', contenu:'Vous avez le droit d\'acceder, modifier et supprimer vos donnees a tout moment depuis votre profil ou en contactant contact@byh.org.' },
            { titre:'Securite', contenu:'Vos mots de passe sont cryptes. Nous utilisons HTTPS pour securiser toutes les communications. Les paiements sont securises via notre systeme d\'escrow.' },
            { titre:'Contact', contenu:'Pour toute question sur vos donnees personnelles, contactez contact@byh.org' },
          ].map(s=>(
            <div key={s.titre}>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-3">{s.titre}</h2>
              <p className="text-gray-600 leading-relaxed">{s.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
