import React from 'react';
import { Link } from 'react-router-dom';

export default function ComingSoon() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:'system-ui, sans-serif' }}>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:'40px' }}>
        <div style={{ width:'80px', height:'80px', background:'#2563EB', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(37,99,235,0.4)' }}>🏠</div>
        <div style={{ fontSize:'36px', fontWeight:'900', color:'#fff', letterSpacing:'-1px' }}>B.<span style={{ color:'#60A5FA' }}>Y.</span>H</div>
        <div style={{ fontSize:'14px', color:'#94A3B8', marginTop:'4px' }}>Build Your Home 🇨🇲</div>
      </div>

      {/* Badge beta */}
      <div style={{ background:'rgba(234,179,8,0.15)', border:'1px solid rgba(234,179,8,0.4)', borderRadius:'50px', padding:'8px 20px', marginBottom:'32px' }}>
        <span style={{ color:'#FCD34D', fontSize:'13px', fontWeight:'700', letterSpacing:'1px' }}>🚀 BÊTA TEST — Accès anticipé</span>
      </div>

      {/* Message principal */}
      <div style={{ textAlign:'center', maxWidth:'480px', marginBottom:'48px' }}>
        <h1 style={{ fontSize:'40px', fontWeight:'900', color:'#fff', lineHeight:'1.1', marginBottom:'16px' }}>
          Bienvenue sur<br/>
          <span style={{ color:'#60A5FA' }}>B.Y.H</span>
        </h1>
        <p style={{ color:'#94A3B8', fontSize:'16px', lineHeight:'1.6', marginBottom:'8px' }}>
          La première marketplace BTP certifiée du Cameroun.
        </p>
        <p style={{ color:'#64748B', fontSize:'14px', lineHeight:'1.6' }}>
          Vous faites partie des premiers testeurs — votre avis nous aidera à améliorer la plateforme avant le lancement officiel.
        </p>
      </div>

      {/* Badges */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', justifyContent:'center', marginBottom:'48px' }}>
        {['✅ Artisans vérifiés', '🔒 Paiements sécurisés', '📱 Orange & MTN MoMo', '🇨🇲 Made in Cameroun'].map((b, i) => (
          <span key={i} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'50px', padding:'6px 14px', color:'#CBD5E1', fontSize:'12px', fontWeight:'600' }}>{b}</span>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display:'flex', flexDirection:'column', gap:'12px', width:'100%', maxWidth:'320px' }}>
        <Link to="/register" style={{ background:'#2563EB', color:'#fff', textDecoration:'none', padding:'16px', borderRadius:'14px', textAlign:'center', fontWeight:'800', fontSize:'16px', boxShadow:'0 4px 20px rgba(37,99,235,0.4)' }}>
          Créer mon compte →
        </Link>
        <Link to="/login" style={{ background:'rgba(255,255,255,0.08)', color:'#CBD5E1', textDecoration:'none', padding:'14px', borderRadius:'14px', textAlign:'center', fontWeight:'600', fontSize:'15px', border:'1px solid rgba(255,255,255,0.12)' }}>
          J'ai déjà un compte
        </Link>
      </div>

      {/* Footer */}
      <p style={{ color:'#475569', fontSize:'12px', marginTop:'48px', textAlign:'center' }}>
        © 2026 B.Y.H — Ne payez jamais en dehors de B.Y.H 🔒
      </p>
    </div>
  );
}
