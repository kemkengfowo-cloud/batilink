import React from 'react';
import { formatBudget, formatDate } from '../utils/helpers';

export default function FacturePDF({ devis }) {
  const handlePrint = () => {
    const content = document.getElementById('facture-content').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Facture ${devis.numeroDevis}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #111; padding: 40px; font-size: 13px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #2563EB; }
          .logo { font-size: 28px; font-weight: 900; color: #2563EB; }
          .logo span { color: #111; }
          .badge { background: #2563EB; color: white; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: bold; }
          .title { font-size: 22px; font-weight: bold; margin-bottom: 5px; }
          .numero { color: #666; font-size: 12px; font-family: monospace; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .partie { background: #f8faff; border: 1px solid #dbeafe; border-radius: 10px; padding: 16px; }
          .partie-label { font-size: 10px; font-weight: bold; color: #2563EB; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .partie-nom { font-size: 16px; font-weight: bold; margin-bottom: 3px; }
          .partie-info { color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #1e3a5f; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
          th:last-child, td:last-child { text-align: right; }
          td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
          tr:nth-child(even) { background: #f8faff; }
          .totaux { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .totaux-box { width: 280px; }
          .total-ligne { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
          .total-final { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 900; color: #2563EB; border-top: 2px solid #2563EB; margin-top: 5px; }
          .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 12px; }
          .footer { text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; }
          .statut { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; }
          .statut-termine { background: #dcfce7; color: #166534; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div>
      <button onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-xl font-semibold text-sm hover:bg-gray-900 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
        </svg>
        Telecharger la facture PDF
      </button>

      {/* Contenu caché utilisé pour l'impression */}
      <div id="facture-content" style={{display:'none'}}>
        <div className="header">
          <div>
            <div className="logo">BY<span>HOME</span></div>
            <div style={{color:'#666', fontSize:'11px', marginTop:'4px'}}>La plateforme BTP du Cameroun</div>
            <div style={{color:'#666', fontSize:'11px'}}>contact@byhome.org • www.byhome.org</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="title">FACTURE</div>
            <div className="numero">{devis.numeroDevis}</div>
            <div style={{marginTop:'8px'}}><span className={`statut ${devis.statut==='termine'?'statut-termine':''}`}>{devis.statut==='termine'?'PAYEE':'EN COURS'}</span></div>
            <div style={{color:'#666', fontSize:'11px', marginTop:'8px'}}>Date : {formatDate(devis.createdAt)}</div>
            {devis.dateAcceptation && <div style={{color:'#666', fontSize:'11px'}}>Acceptee le : {formatDate(devis.dateAcceptation)}</div>}
          </div>
        </div>

        <div className="parties">
          <div className="partie">
            <div className="partie-label">Prestataire</div>
            <div className="partie-nom">{devis.artisan?.name}</div>
            <div className="partie-info">{devis.artisan?.city}</div>
            <div className="partie-info">{devis.artisan?.phone}</div>
            <div className="partie-info">{devis.artisan?.email}</div>
          </div>
          <div className="partie">
            <div className="partie-label">Client</div>
            <div className="partie-nom">{devis.client?.name}</div>
            <div className="partie-info">{devis.client?.city}</div>
            <div className="partie-info">{devis.client?.phone}</div>
            <div className="partie-info">{devis.client?.email}</div>
          </div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'16px', fontWeight:'bold', marginBottom:'5px'}}>{devis.titre}</div>
          <div style={{color:'#666', fontSize:'12px'}}>{devis.description}</div>
          <div style={{display:'flex', gap:'20px', marginTop:'10px', fontSize:'12px', color:'#666'}}>
            <span>Delai : {devis.delaiExecution}</span>
            <span>Materiels : {devis.materielsInclus?'Inclus':'Non inclus'}</span>
            <span>Conditions : {devis.conditionsPaiement}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Designation</th>
              <th style={{textAlign:'center'}}>Quantite</th>
              <th style={{textAlign:'center'}}>Unite</th>
              <th style={{textAlign:'right'}}>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {devis.lignes?.map((l,i)=>(
              <tr key={i}>
                <td>{l.designation}</td>
                <td style={{textAlign:'center'}}>{l.quantite}</td>
                <td style={{textAlign:'center'}}>{l.unite}</td>
                <td style={{textAlign:'right'}}>{formatBudget(l.prixUnitaire)}</td>
                <td>{formatBudget(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totaux">
          <div className="totaux-box">
            <div className="total-ligne"><span>Sous-total</span><span>{formatBudget(devis.sousTotal)}</span></div>
            <div className="total-ligne" style={{color:'#666'}}><span>Commission BYHOME (10%)</span><span>{formatBudget(devis.montantCommission)}</span></div>
            <div className="total-ligne" style={{color:'#16a34a', fontWeight:'bold'}}><span>Artisan recoit (90%)</span><span>{formatBudget(devis.montantArtisan)}</span></div>
            <div className="total-final"><span>TOTAL CLIENT</span><span>{formatBudget(devis.total)}</span></div>
          </div>
        </div>

        <div className="info-box">
          <strong>Conditions de paiement :</strong> {devis.conditionsPaiement}<br/>
          <strong>Protection :</strong> Tout paiement effectue en dehors de la plateforme BYHOME annule toute garantie et protection.
        </div>

        <div className="footer">
          <strong>BYHOME</strong> — La plateforme BTP de reference au Cameroun<br/>
          www.byhome.org • contact@byhome.org<br/>
          Ce document est genere automatiquement par BYHOME et constitue une facture officielle.
        </div>
      </div>
    </div>
  );
}
