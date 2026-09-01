import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#0F172A', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ textAlign:'center', maxWidth:'480px' }}>
        <div style={{ fontSize:'80px', marginBottom:'16px' }}>🏗️</div>
        <h1 style={{ fontSize:'120px', fontWeight:'900', color:'#2563EB', margin:'0', lineHeight:'1' }}>404</h1>
        <h2 style={{ fontSize:'24px', fontWeight:'700', color:'#fff', margin:'16px 0 8px' }}>Page introuvable</h2>
        <p style={{ fontSize:'15px', color:'#64748B', marginBottom:'32px', lineHeight:'1.6' }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
          Revenez à l'accueil pour continuer.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/" style={{ backgroundColor:'#2563EB', color:'#fff', padding:'14px 28px', borderRadius:'12px', fontWeight:'700', textDecoration:'none', fontSize:'15px' }}>
            🏠 Retour à l'accueil
          </Link>
          <Link to="/artisans" style={{ backgroundColor:'rgba(37,99,235,0.1)', color:'#60A5FA', padding:'14px 28px', borderRadius:'12px', fontWeight:'700', textDecoration:'none', fontSize:'15px', border:'1px solid rgba(96,165,250,0.3)' }}>
            🔨 Voir les artisans
          </Link>
        </div>
        <p style={{ marginTop:'40px', fontSize:'13px', color:'#1E293B' }}>
          🇨🇲 B.Y.H — Build Your Home · www.byh-cm.com
        </p>
      </div>
    </div>
  );
}
