const sgMail = require('@sendgrid/mail');

const sendEmail = async ({ to, subject, html }) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from: { email: process.env.EMAIL_USER, name: 'B.Y.H - Build Your Home' },
      subject,
      html
    });
    console.log(`✅ Email envoyé à ${to}: ${subject}`);
  } catch(err) {
    console.error(`❌ Erreur email à ${to}:`, err.message);
  }
};

const LOGO = `<div style="background:#0F172A;padding:24px;text-align:center;border-radius:12px 12px 0 0">
  <h1 style="color:#fff;font-size:24px;margin:0;font-family:Arial">B.<span style="color:#60A5FA">Y.</span>H</h1>
  <p style="color:#94A3B8;margin:4px 0 0;font-size:13px">Build Your Home</p>
</div>`;

const FOOTER = `<div style="border-top:1px solid #E2E8F0;margin-top:24px;padding-top:16px;text-align:center">
  <p style="color:#94A3B8;font-size:12px">B.Y.H — www.byh-cm.com — contact@byh-cm.com</p>
  <p style="color:#CBD5E1;font-size:11px">Ne payez jamais en dehors de B.Y.H</p>
</div>`;

const wrap = (content) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#F8FAFC;border-radius:12px;overflow:hidden">
  ${LOGO}
  <div style="padding:32px;background:#F8FAFC">
    ${content}
    ${FOOTER}
  </div>
</div>`;

const btn = (text, url) => `
<a href="${url}" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:10px;font-weight:bold;text-decoration:none;margin:16px 0">${text}</a>`;

// 1. Email de bienvenue
const sendBienvenue = async (user) => {
  const roleLabel = user.role === 'client' ? 'Client' : user.role === 'artisan' ? 'Artisan' : 'Entreprise BTP';
  await sendEmail({
    to: user.email,
    subject: 'Bienvenue sur B.Y.H - Build Your Home !',
    html: wrap(`
      <h2 style="color:#0F172A">Bienvenue ${user.name} ! 🎉</h2>
      <p style="color:#64748B">Votre compte <strong>${roleLabel}</strong> a été créé avec succès sur B.Y.H.</p>
      <p style="color:#64748B">Votre matricule : <strong style="color:#2563EB">${user.matricule || 'En cours de génération'}</strong></p>
      <p style="color:#64748B">Vous pouvez maintenant :</p>
      <ul style="color:#64748B">
        ${user.role === 'client' ? '<li>Publier vos projets de construction</li><li>Contacter des artisans vérifiés</li><li>Suivre vos travaux en temps réel</li>' : ''}
        ${user.role === 'artisan' ? '<li>Compléter votre profil professionnel</li><li>Parcourir les projets disponibles</li><li>Envoyer des devis aux clients</li>' : ''}
        ${user.role === 'entreprise' ? '<li>Compléter votre profil entreprise</li><li>Demander du personnel qualifié</li><li>Gérer vos contrats</li>' : ''}
      </ul>
      ${btn('Accéder à mon espace →', 'https://www.byh-cm.com/dashboard')}
      <p style="color:#94A3B8;font-size:13px">🔒 Ne partagez jamais votre mot de passe avec quiconque.</p>
    `)
  });
};

// 2. Nouveau devis reçu (pour le client)
const sendNouveauDevis = async ({ clientEmail, clientName, artisanName, projetTitre, montant, devisId }) => {
  await sendEmail({
    to: clientEmail,
    subject: `Nouveau devis reçu pour votre projet "${projetTitre}"`,
    html: wrap(`
      <h2 style="color:#0F172A">Vous avez reçu un nouveau devis 📄</h2>
      <p style="color:#64748B">Bonjour <strong>${clientName}</strong>,</p>
      <p style="color:#64748B">L'artisan <strong>${artisanName}</strong> a envoyé un devis pour votre projet <strong>"${projetTitre}"</strong>.</p>
      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0">
        <p style="color:#1E40AF;font-size:20px;font-weight:bold;margin:0">Montant : ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA</p>
      </div>
      <p style="color:#64748B">Consultez le devis complet et répondez à l'artisan depuis votre espace B.Y.H.</p>
      ${btn('Voir le devis →', `https://www.byh-cm.com/devis/${devisId}`)}
    `)
  });
};

// 3. Devis accepté (pour l'artisan)
const sendDevisAccepte = async ({ artisanEmail, artisanName, clientName, projetTitre, montant }) => {
  await sendEmail({
    to: artisanEmail,
    subject: `Votre devis a été accepté ! "${projetTitre}"`,
    html: wrap(`
      <h2 style="color:#0F172A">Félicitations ! Votre devis a été accepté ✅</h2>
      <p style="color:#64748B">Bonjour <strong>${artisanName}</strong>,</p>
      <p style="color:#64748B">Le client <strong>${clientName}</strong> a accepté votre devis pour le projet <strong>"${projetTitre}"</strong>.</p>
      <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:16px;margin:16px 0">
        <p style="color:#15803D;font-size:20px;font-weight:bold;margin:0">Montant : ${new Intl.NumberFormat('fr-FR').format(montant)} FCFA</p>
        <p style="color:#16A34A;font-size:13px;margin:4px 0 0">Vous recevrez 90% soit ${new Intl.NumberFormat('fr-FR').format(montant * 0.9)} FCFA</p>
      </div>
      <p style="color:#64748B">Commencez les travaux et publiez des photos à chaque étape.</p>
      ${btn('Voir mes missions →', 'https://www.byh-cm.com/dashboard')}
    `)
  });
};

// 4. Jalon validé (pour l'artisan)
const sendJalonValide = async ({ artisanEmail, artisanName, jalonTitre, montantJalon }) => {
  await sendEmail({
    to: artisanEmail,
    subject: `Jalon validé : "${jalonTitre}"`,
    html: wrap(`
      <h2 style="color:#0F172A">Un jalon a été validé ! 🎉</h2>
      <p style="color:#64748B">Bonjour <strong>${artisanName}</strong>,</p>
      <p style="color:#64748B">Le client a validé le jalon <strong>"${jalonTitre}"</strong>.</p>
      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:16px;margin:16px 0">
        <p style="color:#1E40AF;font-size:18px;font-weight:bold;margin:0">Paiement : ${new Intl.NumberFormat('fr-FR').format(montantJalon)} FCFA</p>
        <p style="color:#3B82F6;font-size:13px;margin:4px 0 0">Sera versé sur votre Mobile Money sous 24-48h</p>
      </div>
      ${btn('Voir mes jalons →', 'https://www.byh-cm.com/dashboard')}
    `)
  });
};

// 5. Nouveau message reçu
const sendNouveauMessage = async ({ destinataireEmail, destinataireName, expediteurName, extrait }) => {
  await sendEmail({
    to: destinataireEmail,
    subject: `Nouveau message de ${expediteurName}`,
    html: wrap(`
      <h2 style="color:#0F172A">Vous avez un nouveau message 💬</h2>
      <p style="color:#64748B">Bonjour <strong>${destinataireName}</strong>,</p>
      <p style="color:#64748B"><strong>${expediteurName}</strong> vous a envoyé un message sur B.Y.H :</p>
      <div style="background:#F8FAFC;border-left:4px solid #2563EB;padding:16px;margin:16px 0;border-radius:0 8px 8px 0">
        <p style="color:#374151;font-style:italic;margin:0">"${extrait}"</p>
      </div>
      ${btn('Répondre →', 'https://www.byh-cm.com/messages')}
    `)
  });
};

module.exports = { sendBienvenue, sendNouveauDevis, sendDevisAccepte, sendJalonValide, sendNouveauMessage };
