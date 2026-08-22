import React from 'react';
import { Link } from 'react-router-dom';

export default function CGU() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="py-16 relative overflow-hidden" style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}}>
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'30px 30px'}}/>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-display font-black mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-blue-200">Dernière mise à jour : Août 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 space-y-10">

          {/* Intro */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <p className="text-blue-800 text-sm leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme B.Y.H (Build Your Home), accessible sur <strong>www.byh-cm.com</strong> et ses applications mobiles. En vous inscrivant, vous acceptez sans réserve ces conditions.
            </p>
          </div>

          {/* Article 1 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              Présentation de B.Y.H
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>B.Y.H (Build Your Home) est une plateforme numérique camerounaise de mise en relation entre :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Les clients</strong> : personnes physiques ou morales ayant des besoins en travaux de construction, rénovation ou aménagement.</li>
                <li><strong>Les artisans/techniciens</strong> : professionnels qualifiés du secteur BTP (bâtiment et travaux publics).</li>
                <li><strong>Les entreprises BTP</strong> : sociétés spécialisées dans les travaux de construction et génie civil.</li>
              </ul>
              <p>B.Y.H agit comme intermédiaire et ne saurait être tenu responsable des prestations réalisées par les artisans et entreprises référencés.</p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              Inscription et Compte Utilisateur
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>Pour accéder aux services de B.Y.H, vous devez créer un compte en fournissant des informations exactes et complètes. Vous vous engagez à :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Fournir des informations véridiques lors de l'inscription.</li>
                <li>Maintenir la confidentialité de vos identifiants de connexion.</li>
                <li>Notifier immédiatement B.Y.H de toute utilisation non autorisée de votre compte.</li>
                <li>Ne pas céder ou partager votre compte avec des tiers.</li>
              </ul>
              <p>Un matricule unique (BYH-CLI-XXXX, BYH-ART-XXXX ou BYH-ENT-XXXX) vous est attribué lors de l'inscription.</p>
              <p>B.Y.H se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</p>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              Services Proposés
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>B.Y.H propose les services suivants :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Publication de projets</strong> : les clients peuvent publier leurs besoins en travaux.</li>
                <li><strong>Envoi de devis</strong> : les artisans peuvent proposer leurs offres aux clients.</li>
                <li><strong>Suivi de chantier</strong> : jalons photos pour documenter l'avancement des travaux.</li>
                <li><strong>Paiement sécurisé</strong> : système d'escrow via Mobile Money (Orange Money, MTN MoMo).</li>
                <li><strong>Système d'arbitrage</strong> : résolution des litiges par l'équipe B.Y.H.</li>
                <li><strong>Location de personnel</strong> : les entreprises BTP peuvent demander du personnel qualifié.</li>
              </ul>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              Tarification et Commission
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>L'utilisation de B.Y.H est gratuite pour l'inscription et la publication de projets.</p>
              <p>B.Y.H prélève une <strong>commission de 10%</strong> sur chaque transaction finalisée entre un client et un artisan/entreprise.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>L'artisan reçoit 90% du montant convenu.</li>
                <li>B.Y.H conserve 10% à titre de commission.</li>
                <li>Aucun frais caché n'est appliqué.</li>
              </ul>
              <p>Les paiements transitent par le compte B.Y.H avant distribution. B.Y.H s'engage à distribuer les fonds dans un délai maximum de 48 heures après validation des travaux.</p>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
              Obligations des Utilisateurs
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p><strong>Les clients s'engagent à :</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Décrire fidèlement leurs besoins dans les projets publiés.</li>
                <li>Payer les artisans via la plateforme B.Y.H uniquement.</li>
                <li>Valider ou contester les jalons dans un délai de 48 heures.</li>
                <li>Ne pas effectuer de paiements directs hors plateforme.</li>
              </ul>
              <p className="mt-3"><strong>Les artisans s'engagent à :</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Fournir des informations exactes sur leurs compétences et expériences.</li>
                <li>Réaliser les travaux conformément aux devis signés.</li>
                <li>Publier des photos à chaque étape (jalons) des travaux.</li>
                <li>Ne pas solliciter de paiements directs hors plateforme.</li>
              </ul>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
              Litiges et Arbitrage
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>En cas de litige entre un client et un artisan, B.Y.H propose un service d'arbitrage :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Le litige doit être soumis via la plateforme dans un délai de 7 jours après la contestation.</li>
                <li>L'équipe B.Y.H examine les preuves fournies par les deux parties.</li>
                <li>Une décision est rendue dans un délai de 5 jours ouvrables.</li>
                <li>En cas de remboursement, les fonds sont restitués sous 5 jours ouvrables.</li>
              </ul>
              <p>La décision de B.Y.H est définitive et les deux parties s'engagent à l'accepter.</p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
              Responsabilité
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>B.Y.H agit comme intermédiaire et ne saurait être tenu responsable :</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>De la qualité des travaux réalisés par les artisans.</li>
                <li>Des dommages causés lors des travaux.</li>
                <li>Des informations inexactes fournies par les utilisateurs.</li>
                <li>Des interruptions temporaires de service pour maintenance.</li>
              </ul>
              <p>B.Y.H s'engage à vérifier l'identité des artisans inscrits mais ne garantit pas exhaustivement leurs qualifications.</p>
            </div>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
              Propriété Intellectuelle
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>La plateforme B.Y.H, son logo, son nom, ses contenus et ses fonctionnalités sont la propriété exclusive de B.Y.H.</p>
              <p>Toute reproduction, modification ou utilisation commerciale sans autorisation écrite préalable est strictement interdite.</p>
            </div>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">9</span>
              Modification des CGU
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>B.Y.H se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront notifiés par email en cas de modification substantielle.</p>
              <p>La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles CGU.</p>
            </div>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-2xl font-display font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">10</span>
              Droit Applicable
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-3 ml-11">
              <p>Les présentes CGU sont régies par le droit camerounais. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents de Yaoundé, Cameroun.</p>
            </div>
          </section>

          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">Contact</h3>
            <p className="text-gray-600 text-sm">Pour toute question relative aux présentes CGU, contactez-nous à :</p>
            <p className="text-blue-600 font-semibold mt-1">contact@byh-cm.com</p>
            <p className="text-gray-500 text-sm mt-1">B.Y.H — Build Your Home — Yaoundé, Cameroun</p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <Link to="/confidentialite" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Politique de confidentialité →</Link>
            <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
