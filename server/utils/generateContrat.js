const PDFDocument = require('pdfkit');

const generateContratConducteur = (demande, conducteur) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const dateJour = new Date().toLocaleDateString('fr-FR');
    const dateDebut = demande.dateDebut ? new Date(demande.dateDebut).toLocaleDateString('fr-FR') : '-';
    const dateFin = demande.dateFin ? new Date(demande.dateFin).toLocaleDateString('fr-FR') : 'A definir';
    const tarifjour = demande.tarifjourFinal || 0;
    const nomConducteur = conducteur ? conducteur.name : 'Non assigne';
    const emailConducteur = conducteur ? conducteur.email : '-';
    const telConducteur = conducteur ? (conducteur.phone || 'Non renseigne') : '-';
    const matriculeConducteur = conducteur ? (conducteur.matricule || 'Non renseigne') : '-';

    // En-tete
    doc.rect(0, 0, 612, 80).fill('#0F172A');
    doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('B.Y.H', 50, 20);
    doc.fontSize(10).font('Helvetica').text('Build Your Home - Plateforme BTP Cameroun', 50, 48);
    doc.fontSize(10).text('www.byh-cm.com | contact@byh-cm.com', 50, 62);

    doc.fillColor('#0F172A').moveDown(4);

    doc.fontSize(18).font('Helvetica-Bold').text('CONTRAT DE MISSION', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#64748B').text('Conducteur de Travaux', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#0F172A').fontSize(10).text('Reference: BYH-CT-' + demande._id.toString().slice(-6).toUpperCase(), { align: 'center' });
    doc.fontSize(10).text('Date: ' + dateJour, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(1);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('1. PARTIES AU CONTRAT');
    doc.moveDown(0.5);

    let y = doc.y;
    doc.rect(50, y, 512, 70).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#2563EB').fontSize(10).font('Helvetica-Bold').text('PARTIE A - B.Y.H (Mandataire)', 60, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text('Plateforme BTP Cameroun', 60, y + 26);
    doc.text('Email: contact@byh-cm.com | Site: www.byh-cm.com', 60, y + 40);
    doc.text('Cameroun', 60, y + 54);
    doc.moveDown(5);

    y = doc.y;
    doc.rect(50, y, 512, 80).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#16A34A').fontSize(10).font('Helvetica-Bold').text('PARTIE B - CONDUCTEUR DE TRAVAUX', 60, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text('Nom: ' + nomConducteur, 60, y + 26);
    doc.text('Email: ' + emailConducteur, 60, y + 40);
    doc.text('Telephone: ' + telConducteur, 60, y + 54);
    doc.text('Matricule: ' + matriculeConducteur, 60, y + 68);
    doc.moveDown(6);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('2. OBJET DE LA MISSION');
    doc.moveDown(0.5);

    y = doc.y;
    doc.rect(50, y, 512, 110).fill('#F0FDF4').stroke('#86EFAC');
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Titre du chantier:', 60, y + 10);
    doc.font('Helvetica').text(demande.titreChantier, 200, y + 10);
    doc.font('Helvetica-Bold').text('Type:', 60, y + 26);
    doc.font('Helvetica').text(demande.typeChantier || '-', 200, y + 26);
    doc.font('Helvetica-Bold').text('Localisation:', 60, y + 42);
    doc.font('Helvetica').text(demande.localisation + ' - ' + demande.ville, 200, y + 42);
    doc.font('Helvetica-Bold').text('Date debut:', 60, y + 58);
    doc.font('Helvetica').text(dateDebut, 200, y + 58);
    doc.font('Helvetica-Bold').text('Date fin:', 60, y + 74);
    doc.font('Helvetica').text(dateFin, 200, y + 74);
    doc.font('Helvetica-Bold').text('Superficie:', 60, y + 90);
    doc.font('Helvetica').text(demande.superficie || 'Non definie', 200, y + 90);
    doc.moveDown(9);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('3. REMUNERATION');
    doc.moveDown(0.5);

    y = doc.y;
    doc.rect(50, y, 512, 60).fill('#EFF6FF').stroke('#BFDBFE');
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Tarif journalier:', 60, y + 10);
    doc.fillColor('#2563EB').fontSize(12).font('Helvetica-Bold').text(new Intl.NumberFormat('fr-FR').format(tarifjour) + ' FCFA / jour', 200, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Paiement via:', 60, y + 30);
    doc.font('Helvetica').text('Escrow B.Y.H - Mobile Money (Orange Money / MTN MoMo)', 200, y + 30);
    doc.font('Helvetica-Bold').text('Commission B.Y.H:', 60, y + 46);
    doc.font('Helvetica').text('10% du montant total', 200, y + 46);
    doc.moveDown(5);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('4. OBLIGATIONS DU CONDUCTEUR');
    doc.moveDown(0.5);
    const obligations = [
      'Se rendre sur le chantier selon le calendrier convenu',
      'Soumettre un rapport quotidien via la plateforme B.Y.H avec photos',
      'Signaler tout probleme dans les 24h',
      'Respecter les normes de securite en vigueur au Cameroun',
      'Ne pas divulguer les informations confidentielles du client',
      'Utiliser exclusivement la plateforme B.Y.H pour les communications',
    ];
    obligations.forEach((o, i) => {
      doc.fontSize(9).font('Helvetica').fillColor('#374151').text((i + 1) + '. ' + o);
    });

    doc.moveDown(2);
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('5. SIGNATURES');
    doc.moveDown(1);

    y = doc.y;
    doc.rect(50, y, 220, 80).stroke('#E2E8F0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text('Pour B.Y.H:', 60, y + 10);
    doc.font('Helvetica').text('Lu et approuve', 60, y + 25);
    doc.text('Date: ' + dateJour, 60, y + 40);
    doc.fontSize(8).fillColor('#64748B').text('Signature electronique B.Y.H', 60, y + 60);

    doc.rect(342, y, 220, 80).stroke('#E2E8F0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text('Conducteur: ' + nomConducteur, 352, y + 10);
    doc.font('Helvetica').text('Lu et approuve', 352, y + 25);
    doc.text('Date: _______________', 352, y + 40);
    doc.text('Signature: _______________', 352, y + 55);

    doc.moveDown(6);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor('#64748B').font('Helvetica').text('B.Y.H - www.byh-cm.com | Ref: ' + demande._id, { align: 'center' });

    doc.end();
  });
};

const generateContratClient = (demande, client, conducteur) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const dateJour = new Date().toLocaleDateString('fr-FR');
    const dateDebut = demande.dateDebut ? new Date(demande.dateDebut).toLocaleDateString('fr-FR') : '-';
    const dateFin = demande.dateFin ? new Date(demande.dateFin).toLocaleDateString('fr-FR') : 'A definir';
    const tarifjour = demande.tarifjourFinal || 0;
    const nomClient = client ? client.name : '-';
    const emailClient = client ? client.email : '-';
    const telClient = client ? (client.phone || 'Non renseigne') : '-';
    const nomConducteur = conducteur ? conducteur.name : 'A confirmer';

    doc.rect(0, 0, 612, 80).fill('#0F172A');
    doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('B.Y.H', 50, 20);
    doc.fontSize(10).font('Helvetica').text('Build Your Home - Plateforme BTP Cameroun', 50, 48);
    doc.fontSize(10).text('www.byh-cm.com | contact@byh-cm.com', 50, 62);

    doc.fillColor('#0F172A').moveDown(4);
    doc.fontSize(18).font('Helvetica-Bold').text('CONTRAT DE SUIVI DE CHANTIER', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#64748B').text('Entre le Client et B.Y.H', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#0F172A').fontSize(10).text('Reference: BYH-CLI-' + demande._id.toString().slice(-6).toUpperCase(), { align: 'center' });
    doc.fontSize(10).text('Date: ' + dateJour, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(1);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('1. PARTIES AU CONTRAT');
    doc.moveDown(0.5);

    let y = doc.y;
    doc.rect(50, y, 512, 70).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#2563EB').fontSize(10).font('Helvetica-Bold').text('PARTIE A - CLIENT', 60, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text('Nom: ' + nomClient, 60, y + 26);
    doc.text('Email: ' + emailClient, 60, y + 40);
    doc.text('Telephone: ' + telClient, 60, y + 54);
    doc.moveDown(5);

    y = doc.y;
    doc.rect(50, y, 512, 70).fill('#F8FAFC').stroke('#E2E8F0');
    doc.fillColor('#16A34A').fontSize(10).font('Helvetica-Bold').text('PARTIE B - B.Y.H (Prestataire)', 60, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica').text('Plateforme BTP Cameroun', 60, y + 26);
    doc.text('Conducteur assigne: ' + nomConducteur, 60, y + 40);
    doc.text('Contact: contact@byh-cm.com', 60, y + 54);
    doc.moveDown(5);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('2. OBJET DU CONTRAT');
    doc.moveDown(0.5);

    y = doc.y;
    doc.rect(50, y, 512, 100).fill('#F0FDF4').stroke('#86EFAC');
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Chantier:', 60, y + 10);
    doc.font('Helvetica').text(demande.titreChantier, 200, y + 10);
    doc.font('Helvetica-Bold').text('Type:', 60, y + 26);
    doc.font('Helvetica').text(demande.typeChantier || '-', 200, y + 26);
    doc.font('Helvetica-Bold').text('Localisation:', 60, y + 42);
    doc.font('Helvetica').text(demande.localisation + ' - ' + demande.ville, 200, y + 42);
    doc.font('Helvetica-Bold').text('Periode:', 60, y + 58);
    doc.font('Helvetica').text('Du ' + dateDebut + ' au ' + dateFin, 200, y + 58);
    doc.font('Helvetica-Bold').text('Description:', 60, y + 74);
    doc.font('Helvetica').text((demande.description || '-').substring(0, 80), 200, y + 74);
    doc.moveDown(8);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('3. TARIFS ET PAIEMENT');
    doc.moveDown(0.5);

    y = doc.y;
    doc.rect(50, y, 512, 60).fill('#EFF6FF').stroke('#BFDBFE');
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Tarif journalier:', 60, y + 10);
    doc.fillColor('#2563EB').fontSize(12).font('Helvetica-Bold').text(new Intl.NumberFormat('fr-FR').format(tarifjour) + ' FCFA / jour', 200, y + 10);
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text('Paiement:', 60, y + 30);
    doc.font('Helvetica').text('Via escrow B.Y.H - Mobile Money securise', 200, y + 30);
    doc.font('Helvetica-Bold').text('Rapports:', 60, y + 46);
    doc.font('Helvetica').text('Quotidiens avec photos sur plateforme B.Y.H', 200, y + 46);
    doc.moveDown(5);

    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('4. ENGAGEMENTS B.Y.H');
    doc.moveDown(0.5);
    const engagements = [
      'Assigner un conducteur qualifie et verifie',
      'Fournir des rapports quotidiens avec photos du chantier',
      'Signaler tout probleme dans les 24h',
      'Garantir la confidentialite des informations du client',
      'Assurer le suivi jusqu a la completion de la mission',
    ];
    engagements.forEach((e, i) => {
      doc.fontSize(9).font('Helvetica').fillColor('#374151').text((i + 1) + '. ' + e);
    });

    doc.moveDown(2);
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0F172A').text('5. SIGNATURES');
    doc.moveDown(1);

    y = doc.y;
    doc.rect(50, y, 220, 80).stroke('#E2E8F0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text('Client: ' + nomClient, 60, y + 10);
    doc.font('Helvetica').text('Lu et approuve', 60, y + 25);
    doc.text('Date: _______________', 60, y + 40);
    doc.text('Signature: _______________', 60, y + 55);

    doc.rect(342, y, 220, 80).stroke('#E2E8F0');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151').text('Pour B.Y.H:', 352, y + 10);
    doc.font('Helvetica').text('Lu et approuve', 352, y + 25);
    doc.text('Date: ' + dateJour, 352, y + 40);
    doc.fontSize(8).fillColor('#64748B').text('Signature electronique B.Y.H', 352, y + 60);

    doc.moveDown(6);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#E2E8F0').stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor('#64748B').font('Helvetica').text('B.Y.H - www.byh-cm.com | Ref: ' + demande._id, { align: 'center' });

    doc.end();
  });
};

module.exports = { generateContratConducteur, generateContratClient };
