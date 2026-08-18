import React from 'react';

export default function CGU() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-white">
          <h1 className="text-3xl font-display font-black">Conditions Generales d'Utilisation</h1>
          <p className="text-blue-200 mt-2">Derniere mise a jour : Aout 2026</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 prose prose-gray max-w-none">
          {[
            { titre:'1. Presentation de BYHOME', contenu:'BYHOME est une plateforme de mise en relation entre clients, artisans et entreprises du batiment au Cameroun. BYHOME est accessible sur www.byhome.org.' },
            { titre:'2. Acceptation des conditions', contenu:'En utilisant BYHOME, vous acceptez les presentes conditions generales d\'utilisation. Si vous n\'acceptez pas ces conditions, vous ne pouvez pas utiliser la plateforme.' },
            { titre:'3. Inscription et compte', contenu:'Pour utiliser certaines fonctionnalites, vous devez creer un compte. Vous etes responsable de la confidentialite de vos identifiants. BYHOME se reserve le droit de supprimer tout compte en violation des presentes conditions.' },
            { titre:'4. Transactions et paiements', contenu:'BYHOME prend une commission de 10% sur chaque transaction realisee via la plateforme. Tout paiement effectue en dehors de la plateforme annule toute protection et garantie BYHOME. Les paiements sont securises et l\'argent est bloque jusqu\'a validation des travaux par le client.' },
            { titre:'5. Responsabilite des prestataires', contenu:'Les artisans et entreprises sont seuls responsables de la qualite de leurs prestations. BYHOME agit uniquement comme intermediaire et ne peut etre tenu responsable des dommages causes par les prestataires.' },
            { titre:'6. Systeme de litige', contenu:'En cas de litige entre un client et un prestataire, BYHOME peut intervenir comme mediateur. La decision de l\'administrateur BYHOME est definitive. Le delai de traitement est de 72h maximum.' },
            { titre:'7. Propriete intellectuelle', contenu:'Tout le contenu de la plateforme BYHOME (logo, design, code) est protege par le droit d\'auteur. Il est interdit de reproduire ou utiliser ce contenu sans autorisation.' },
            { titre:'8. Protection des donnees', contenu:'BYHOME collecte uniquement les donnees necessaires au fonctionnement du service. Vos donnees ne sont pas vendues a des tiers. Vous pouvez demander la suppression de votre compte et de vos donnees a tout moment.' },
            { titre:'9. Modifications', contenu:'BYHOME se reserve le droit de modifier les presentes conditions a tout moment. Les utilisateurs seront informes par message dans l\'application.' },
            { titre:'10. Contact', contenu:'Pour toute question concernant ces conditions, contactez-nous a contact@byhome.org' },
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
