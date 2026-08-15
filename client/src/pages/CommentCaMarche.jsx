import React from 'react';
import { Link } from 'react-router-dom';

export default function CommentCaMarche() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4">Comment fonctionne Batilink ?</h1>
          <p className="text-blue-200 text-xl">La plateforme la plus simple et securisee pour vos projets BTP au Cameroun</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl">🏠</div>
            <h2 className="text-3xl font-display font-bold text-gray-900">Pour les clients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {num:'01',titre:'Publiez votre projet',desc:'Decrivez vos travaux, votre budget et votre localisation. C est gratuit et rapide.',icon:'📋'},
              {num:'02',titre:'Recevez des devis',desc:'Les artisans qualifies vous envoient des devis detailles via la plateforme.',icon:'📄'},
              {num:'03',titre:'Choisissez et payez',desc:'Acceptez le meilleur devis. L argent est securise jusqu a la fin des travaux.',icon:'💳'},
              {num:'04',titre:'Validez et notez',desc:'Une fois les travaux termines, validez et liberez le paiement. Laissez un avis.',icon:'✅'},
            ].map(s=>(
              <div key={s.num} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{s.num}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{s.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl">🔨</div>
            <h2 className="text-3xl font-display font-bold text-gray-900">Pour les techniciens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {num:'01',titre:'Creez votre profil',desc:'Ajoutez votre specialite, vos photos de realisations et votre WhatsApp.',icon:'👤'},
              {num:'02',titre:'Repondez aux projets',desc:'Parcourez les projets et envoyez des devis detailles aux clients.',icon:'📤'},
              {num:'03',titre:'Realisez les travaux',desc:'Envoyez des photos de progression par etapes pour rassurer le client.',icon:'📸'},
              {num:'04',titre:'Recevez votre paiement',desc:'Apres validation, recevez 90% du montant sur votre Mobile Money.',icon:'💰'},
            ].map(s=>(
              <div key={s.num} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{s.num}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{s.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">🏢</div>
            <h2 className="text-3xl font-display font-bold text-gray-900">Pour les entreprises BTP</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {num:'01',titre:'Inscrivez votre entreprise',desc:'Ajoutez vos lots de travaux, votre RCCM et vos photos.',icon:'📝'},
              {num:'02',titre:'Trouvez du personnel',desc:'Publiez vos besoins en main d oeuvre — Coffreur, Ferrailleur, Macon...',icon:'👷'},
              {num:'03',titre:'Signez un contrat',desc:'Generez un contrat de mission signe electroniquement par les deux parties.',icon:'✍️'},
              {num:'04',titre:'Gerez vos chantiers',desc:'Suivez vos missions et payez via Batilink en toute securite.',icon:'🏗️'},
            ].map(s=>(
              <div key={s.num} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{s.num}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-display font-bold text-gray-900 mb-2">{s.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 text-center">🔒 Votre protection avec Batilink</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {icon:'💳',titre:'Paiement securise',desc:'L argent est bloque et libere uniquement apres validation des travaux.'},
              {icon:'⚠️',titre:'Systeme de litige',desc:'En cas de probleme, l admin arbitre et decide sous 72h.'},
              {icon:'⏰',titre:'Delai de contestation',desc:'48h apres validation pour contester si les travaux ne sont pas conformes.'},
            ].map(p=>(
              <div key={p.titre} className="text-center p-5 bg-blue-50 rounded-2xl">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{p.titre}</h3>
                <p className="text-gray-500 text-sm">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
            ⚠️ <strong>Important :</strong> Tout echange financier hors de la plateforme annule automatiquement toute protection.
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Questions frequentes</h2>
          <div className="space-y-4">
            {[
              {q:'Combien coute Batilink ?',r:'L inscription est 100% gratuite. Batilink prend 10% de commission sur les transactions.'},
              {q:'Comment sont verifies les artisans ?',r:'L equipe Batilink verifie manuellement les profils. Les artisans verifies recoivent un badge bleu.'},
              {q:'Je suis en France, puis-je utiliser Batilink ?',r:'Oui ! Cochez la case "Je suis hors du Cameroun" lors de votre inscription.'},
              {q:'Que se passe-t-il si je ne suis pas satisfait ?',r:'Vous avez 48h apres validation pour contester. L admin Batilink arbitre sous 72h.'},
              {q:'Comment recevoir mon paiement ?',r:'Apres validation, vous recevez 90% sur votre Orange Money ou MTN MoMo dans les 24-48h.'},
            ].map((faq,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-2">❓ {faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.r}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{background:'linear-gradient(135deg, #0a1628 0%, #1a4a8a 100%)'}} className="rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-display font-black mb-4">Pret a commencer ?</h2>
          <p className="text-blue-200 mb-8">Rejoignez des centaines de clients et artisans qui font confiance a Batilink</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=client" className="px-8 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl">Je suis client</Link>
            <Link to="/register?role=artisan" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20">Je suis technicien</Link>
            <Link to="/register?role=entreprise" className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20">Je suis une entreprise</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
