import React from 'react';
import { formatDate } from '../utils/helpers';

export default function FacturePDF({ devis }) {
  const handlePrint = () => {
    const content = document.getElementById('facture-content').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Facture B.Y.H - ${devis.numeroDevis}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1E293B; background: #fff; }
        .page { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #2563EB; }
        .logo-section { display: flex; align-items: center; gap: 16px; }
        .logo-box { width: 60px; height: 60px; background: #2563EB; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .logo-box svg { width: 30px; height: 30px; }
        .logo-text h1 { font-size: 28px; font-weight: 900; color: #0F172A; letter-spacing: 2px; }
        .logo-text h1 span { color: #2563EB; }
        .logo-text p { font-size: 11px; color: #64748B; margin-top: 2px; letter-spacing: 1px; }
        .doc-info { text-align: right; }
        .doc-info .doc-type { font-size: 22px; font-weight: 900; color: #2563EB; text-transform: uppercase; letter-spacing: 2px; }
        .doc-info .doc-num { font-size: 14px; color: #64748B; margin-top: 4px; }
        .doc-info .doc-date { font-size: 12px; color: #94A3B8; margin-top: 2px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 6px; }
        .status-accepte { background: #F0FDF4; color: #16A34A; border: 1px solid #86EFAC; }
        .status-termine { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .partie-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; }
        .partie-label { font-size: 10px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .partie-name { font-size: 16px; font-weight: 800; color: #0F172A; }
        .partie-info { font-size: 12px; color: #64748B; margin-top: 4px; line-height: 1.6; }
        .projet-section { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px; margin-bottom: 32px; }
        .projet-label { font-size: 10px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .projet-titre { font-size: 16px; font-weight: 800; color: #0F172A; }
        .projet-details { display: flex; gap: 24px; margin-top: 8px; font-size: 12px; color: #64748B; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #0F172A; }
        thead th { padding: 12px 16px; color: #fff; font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
        thead th:last-child { text-align: right; }
        tbody tr { border-bottom: 1px solid #F1F5F9; }
        tbody tr:nth-child(even) { background: #F8FAFC; }
        tbody td { padding: 12px 16px; font-size: 13px; color: #374151; }
        tbody td:last-child { text-align: right; font-weight: 600; }
        .totaux { display: flex; justify-content: flex-end; margin-bottom: 32px; }
        .totaux-card { width: 300px; }
        .totaux-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #64748B; }
        .totaux-row.total { padding: 12px 0; border-top: 2px solid #2563EB; border-bottom: none; margin-top: 4px; }
        .totaux-row.total span:first-child { font-size: 15px; font-weight: 800; color: #0F172A; }
        .totaux-row.total span:last-child { font-size: 20px; font-weight: 900; color: #2563EB; }
        .conditions { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 32px; }
        .conditions h4 { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .conditions p { font-size: 12px; color: #64748B; line-height: 1.6; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .signature-box { border: 1px dashed #CBD5E1; border-radius: 12px; padding: 20px; text-align: center; }
        .signature-label { font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 40px; }
        .signature-name { font-size: 12px; color: #374151; border-top: 1px solid #CBD5E1; padding-top: 8px; }
        .footer { text-align: center; padding-top: 24px; border-top: 2px solid #E2E8F0; }
        .footer-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px; }
        .footer-logo-box { width: 28px; height: 28px; background: #2563EB; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .footer-text { font-size: 11px; color: #94A3B8; line-height: 1.6; }
        .footer-text strong { color: #64748B; }
        .watermark { color: #10B981; font-size: 11px; font-weight: 700; margin-top: 8px; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { padding: 20px; }
        }
      </style>
    </head><body><div class="page">${content}</div></body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  };

  const montantHT = devis.sousTotal || devis.total;
  const tva = 0;
  const total = devis.total || devis.montantTotal;
  const commission = Math.round(total * 0.10);
  const montantArtisan = total - commission;

  const factureHTML = (
    <>
      {/* Header */}
      <div className="header">
        <div className="logo-section">
          <div className="logo-box">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/>
            </svg>
          </div>
          <div className="logo-text">
            <h1>B.<span>Y.</span>H</h1>
            <p>BUILD YOUR HOME</p>
            <p style={{marginTop:'4px', color:'#94A3B8'}}>contact@byh-cm.com — www.byh-cm.com</p>
          </div>
        </div>
        <div className="doc-info">
          <div className="doc-type">{devis.statut === 'termine' ? 'Facture' : 'Devis'}</div>
          <div className="doc-num">N° {devis.numeroDevis}</div>
          <div className="doc-date">Émis le {formatDate(devis.createdAt)}</div>
          {devis.dateAcceptation && <div className="doc-date">Accepté le {formatDate(devis.dateAcceptation)}</div>}
          <div className={`status-badge ${devis.statut === 'termine' ? 'status-termine' : 'status-accepte'}`}>
            {devis.statut === 'termine' ? '✓ Travaux terminés' : devis.statut === 'accepte' ? '✓ Accepté' : devis.statut}
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="parties">
        <div className="partie-card">
          <div className="partie-label">Client</div>
          <div className="partie-name">{devis.client?.name}</div>
          <div className="partie-info">
            {devis.client?.email && <div>📧 {devis.client.email}</div>}
            {devis.client?.phone && <div>📱 {devis.client.phone}</div>}
            {devis.client?.city && <div>📍 {devis.client.city}, Cameroun</div>}
            {devis.client?.matricule && <div style={{marginTop:'6px', color:'#2563EB', fontWeight:'700'}}>#{devis.client.matricule}</div>}
          </div>
        </div>
        <div className="partie-card">
          <div className="partie-label">Prestataire</div>
          <div className="partie-name">{devis.artisan?.name}</div>
          <div className="partie-info">
            {devis.artisan?.email && <div>📧 {devis.artisan.email}</div>}
            {devis.artisan?.phone && <div>📱 {devis.artisan.phone}</div>}
            {devis.artisan?.city && <div>📍 {devis.artisan.city}, Cameroun</div>}
            {devis.artisan?.matricule && <div style={{marginTop:'6px', color:'#2563EB', fontWeight:'700'}}>#{devis.artisan.matricule}</div>}
          </div>
        </div>
      </div>

      {/* Projet */}
      <div className="projet-section">
        <div className="projet-label">Projet concerné</div>
        <div className="projet-titre">{devis.titre || devis.projet?.titre}</div>
        <div className="projet-details">
          {devis.projet?.localisation && <span>📍 {devis.projet.localisation}</span>}
          {devis.delaiExecution && <span>⏱️ Délai : {devis.delaiExecution} jours</span>}
          {devis.validiteJours && devis.statut === 'envoye' && <span>📅 Validité : {devis.validiteJours} jours</span>}
        </div>
        {devis.description && <div style={{marginTop:'8px', fontSize:'12px', color:'#64748B'}}>{devis.description}</div>}
      </div>

      {/* Lignes */}
      {devis.lignes?.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Unité</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {devis.lignes.map((l, i) => (
              <tr key={i}>
                <td>{l.description}</td>
                <td>{l.unite || '-'}</td>
                <td>{l.quantite}</td>
                <td>{new Intl.NumberFormat('fr-FR').format(l.prixUnitaire)} FCFA</td>
                <td>{new Intl.NumberFormat('fr-FR').format(l.total)} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Totaux */}
      <div className="totaux">
        <div className="totaux-card">
          <div className="totaux-row">
            <span>Sous-total HT</span>
            <span>{new Intl.NumberFormat('fr-FR').format(montantHT)} FCFA</span>
          </div>
          <div className="totaux-row">
            <span>TVA (0%)</span>
            <span>0 FCFA</span>
          </div>
          <div className="totaux-row">
            <span>Commission B.Y.H (10%)</span>
            <span>{new Intl.NumberFormat('fr-FR').format(commission)} FCFA</span>
          </div>
          <div className="totaux-row total">
            <span>TOTAL TTC</span>
            <span>{new Intl.NumberFormat('fr-FR').format(total)} FCFA</span>
          </div>
          <div style={{textAlign:'right', fontSize:'11px', color:'#16A34A', marginTop:'4px'}}>
            Prestataire recevra : {new Intl.NumberFormat('fr-FR').format(montantArtisan)} FCFA
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="conditions">
        <h4>Conditions de paiement</h4>
        <p>{devis.conditionsPaiement || 'Paiement sécurisé via la plateforme B.Y.H (Orange Money / MTN MoMo). Les fonds sont bloqués en séquestre jusqu\'à validation des travaux par le client.'}</p>
        {devis.materielsInclus && <p style={{marginTop:'8px'}}><strong>Matériaux inclus :</strong> {devis.materielsInclus}</p>}
      </div>

      {/* Signatures */}
      <div className="signatures">
        <div className="signature-box">
          <div className="signature-label">Signature du client</div>
          <div className="signature-name">{devis.client?.name}</div>
        </div>
        <div className="signature-box">
          <div className="signature-label">Signature du prestataire</div>
          <div className="signature-name">{devis.artisan?.name}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-logo">
          <div className="footer-logo-box">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/>
            </svg>
          </div>
          <span style={{fontWeight:'900', fontSize:'16px', color:'#0F172A'}}>B.<span style={{color:'#2563EB'}}>Y.</span>H</span>
        </div>
        <div className="footer-text">
          <strong>B.Y.H — Build Your Home</strong> | Plateforme BTP Cameroun<br/>
          contact@byh-cm.com | www.byh-cm.com | Yaoundé, Cameroun
        </div>
        <div className="watermark">
          ✓ Document généré automatiquement par B.Y.H — {new Date().toLocaleDateString('fr-FR')}
        </div>
      </div>
    </>
  );

  return (
    <>
      <button onClick={handlePrint}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-lg shadow-blue-600/20">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        {devis.statut === 'termine' ? 'Télécharger la facture PDF' : 'Télécharger le devis PDF'}
      </button>

      <div id="facture-content" style={{display:'none'}}>
        {factureHTML}
      </div>
    </>
  );
}
