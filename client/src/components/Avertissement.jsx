import React, { useState } from 'react';

export default function Avertissement({ type = 'default' }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const messages = {
    default: {
      titre: '⚠️ Important — Protégez-vous',
      texte: 'Tout échange financier ou accord passé en dehors de la plateforme Batilink (WhatsApp, appel, espèces) ne bénéficie d\'aucune protection ni garantie de notre part. En cas de litige, Batilink ne pourra pas intervenir.',
      couleur: 'bg-amber-50 border-amber-300 text-amber-800'
    },
    devis: {
      titre: '🔒 Paiement sécurisé Batilink',
      texte: 'Pour votre sécurité, effectuez votre paiement uniquement via Batilink. L\'argent est bloqué et libéré à l\'artisan uniquement après votre validation des travaux. Tout paiement direct à l\'artisan annule votre garantie.',
      couleur: 'bg-blue-50 border-blue-300 text-blue-800'
    },
    message: {
      titre: '⚠️ Rappel important',
      texte: 'Batilink vous recommande de passer par le système de devis officiel pour tout accord financier. Les transactions hors plateforme ne sont pas protégées.',
      couleur: 'bg-amber-50 border-amber-300 text-amber-800'
    },
    profil: {
      titre: '🛡️ Votre protection avec Batilink',
      texte: 'Utilisez le bouton "Demander un devis" pour bénéficier de la protection Batilink. Tout accord passé directement par WhatsApp ou en dehors de l\'application n\'est pas couvert en cas de litige.',
      couleur: 'bg-blue-50 border-blue-300 text-blue-800'
    }
  };

  const m = messages[type] || messages.default;

  return (
    <div className={`border-2 rounded-2xl p-4 ${m.couleur} relative`}>
      <button onClick={() => setVisible(false)}
        className="absolute top-3 right-3 opacity-50 hover:opacity-100 transition-opacity text-lg">✕</button>
      <p className="font-bold text-sm mb-1">{m.titre}</p>
      <p className="text-sm leading-relaxed pr-6">{m.texte}</p>
    </div>
  );
}

export function BandeauProtection() {
  return (
    <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-medium">
      🔒 Batilink protège vos transactions — Utilisez toujours le système de devis officiel pour être couvert en cas de litige
    </div>
  );
}
