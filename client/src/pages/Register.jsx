import React, { useState } from 'react';
import AddressAutocomplete from "../components/AddressAutocomplete";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VILLES, CATEGORIES } from '../utils/helpers';

const LOTS = ['Gros oeuvre','Finition','Geotechnique','Architecture'];
const TYPE_PERSONNEL = ['Coffreur','Manoeuvre','Ferrailleur','Dalleur','Macon','Electricien','Plombier','Peintre','Carreleur','Menuisier','Soudeur','Autres'];
const PAYS_MONDE = ['France','Belgique','Suisse','Canada','Etats-Unis','Allemagne','Italie','Espagne','Royaume-Uni','Portugal','Gabon','Congo','Cote d Ivoire','Senegal','Autre'];

export default function Register() {
  const { register } = useAuth();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = params.get('role') || 'client';
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otpMethod, setOtpMethod] = useState("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', email:'', password:'', phone:'', city:'',
    estDiaspora: false, paysDiaspora:'',
    metier:'', whatsapp:'', experience:'',
    nomEntreprise:'', nomResponsable:'', rccm:'',
    lotsTravauxPropose:[], typePersonnel:[]
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const toggleArr = (k,v) => setForm(f=>({...f,[k]:f[k].includes(v)?f[k].filter(x=>x!==v):[...f[k],v]}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      if (!executeRecaptcha) { setError("reCAPTCHA non disponible."); setLoading(false); return; }
      const token = await executeRecaptcha("register");
      await register({...form, role, recaptchaToken: token});
      navigate("/dashboard");
    } catch(err) { setError(err.response?.data?.message || "Erreur d inscription"); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-800";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen flex">
      {/* Cote gauche photo */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between relative overflow-hidden">
        <img src="https://images.pexels.com/photos/1474993/pexels-photo-1474993.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="Construction" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(13,32,68,0.75) 100%)'}}></div>
        <div className="relative z-10 p-12">
          <Link to="/" className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" fill="white"/></svg></div><span className="font-display font-bold text-2xl text-white">B.Y.H</span></Link>
        </div>
        <div className="relative z-10 p-12">
          <h1 className="text-4xl font-display font-black text-white leading-tight mb-4">Rejoignez le reseau BTP <span className="text-blue-400">#1 au Cameroun</span></h1>
          <p className="text-blue-200">Inscription 100% gratuite</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">B</div>
              <span className="font-display font-bold text-xl text-gray-900">B.Y.H</span>
            </Link>
            <h2 className="text-2xl font-display font-bold text-gray-900">Creer un compte</h2>
            <p className="text-gray-500 mt-1 text-sm">Choisissez votre profil</p>
          </div>

          {/* Role */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {[{r:"client",icon:"🏠",label:"Client"},{r:"artisan",icon:"🔨",label:"Technicien"},{r:"entreprise",icon:"🏢",label:"Entreprise"},{r:"conducteur",icon:"CT",label:"Conducteur"}].map(({r,icon,label})=>(
              <button key={r} type="button" onClick={()=>setRole(r)}
                className={`py-4 rounded-xl border-2 font-semibold transition-all text-center ${role===r?'border-blue-500 bg-blue-50 text-blue-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-xs">{label}</div>
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom */}
            {role === 'entreprise' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nom de l entreprise *</label>
                  <input type="text" required value={form.nomEntreprise} onChange={e=>set('nomEntreprise',e.target.value)} className={inputCls} placeholder="SOBTP Sarl"/>
                </div>
                <div>
                  <label className={labelCls}>Nom du responsable *</label>
                  <input type="text" required value={form.nomResponsable} onChange={e=>set('nomResponsable',e.target.value)} className={inputCls} placeholder="Jean Mbarga"/>
                </div>
              </div>
            ) : (
              <div>
                <label className={labelCls}>Nom complet *</label>
                <input type="text" required value={form.name} onChange={e=>set('name',e.target.value)} className={inputCls} placeholder="Jean Mbarga"/>
              </div>
            )}


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} className={inputCls} placeholder="vous@email.com"/>
              </div>
              <div>
                <label className={labelCls}>Telephone *</label>
                <input type="tel" required value={form.phone} onChange={e=>set('phone',e.target.value)} className={inputCls} placeholder="+237 6XX XXX XXX"/>
              </div>
            </div>

            <div>
              <label className={labelCls}>Ville / Adresse *</label>
              <AddressAutocomplete value={form.city} onChange={v=>set("city",v)} placeholder="Ex: Bastos, Yaoundé" className={inputCls}/>
            </div>

            {/* Case diaspora — clients uniquement */}
            {role === 'client' && (
              <div>
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.estDiaspora?'border-blue-500 bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={form.estDiaspora} onChange={e=>set('estDiaspora',e.target.checked)} className="w-5 h-5 accent-blue-500"/>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">🌍 Je suis hors du Cameroun (Diaspora)</p>
                    <p className="text-gray-400 text-xs mt-0.5">J ai un chantier au Cameroun mais je vis a l etranger</p>
                  </div>
                </label>
                {form.estDiaspora && (
                  <div className="mt-3">
                    <label className={labelCls}>Mon pays de residence</label>
                    <select value={form.paysDiaspora} onChange={e=>set('paysDiaspora',e.target.value)} className={inputCls}>
                      <option value="">Selectionnez votre pays</option>
                      {PAYS_MONDE.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Champs artisan */}
            {role === 'artisan' && (<>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Specialite *</label>
                  <select required value={form.metier} onChange={e=>set('metier',e.target.value)} className={inputCls}>
                    <option value="">Votre metier</option>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Experience (ans)</label>
                  <input type="number" min="0" max="50" value={form.experience} onChange={e=>set('experience',e.target.value)} className={inputCls} placeholder="5"/>
                </div>
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)} className={inputCls} placeholder="+237 6XX XXX XXX"/>
              </div>
            </>)}

            {/* Champs entreprise */}
            {role === 'entreprise' && (<>
              <div>
                <label className={labelCls}>Numero RCCM</label>
                <input type="text" value={form.rccm} onChange={e=>set('rccm',e.target.value)} className={inputCls} placeholder="RC/DLA/2024/B/1234"/>
              </div>
              <div>
                <label className={labelCls}>Lots de travaux proposes</label>
                <div className="grid grid-cols-2 gap-2">
                  {LOTS.map(l=>(
                    <label key={l} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.lotsTravauxPropose.includes(l)?'border-blue-500 bg-blue-50':'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={form.lotsTravauxPropose.includes(l)} onChange={()=>toggleArr('lotsTravauxPropose',l)} className="accent-blue-500"/>
                      <span className="text-xs font-medium text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>)}

            <div>
              <label className={labelCls}>Mot de passe *</label>
              <input type="password" required minLength={6} value={form.password} onChange={e=>set('password',e.target.value)} className={inputCls} placeholder="Minimum 6 caracteres"/>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg shadow-blue-600/20">
              {loading?'Creation...': `Creer mon compte ${role==='client'?'client':role==='artisan'?'technicien':'entreprise'}`}
            </button>
          {/* ETAPE 2 - Choix methode OTP */}
          {step === 2 && (
            <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verifiez votre identite</h3>
              <p className="text-sm text-gray-600 mb-4">Choisissez comment recevoir votre code de verification :</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button type="button" onClick={()=>setOtpMethod("email")} className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${otpMethod==="email"?"border-blue-500 bg-blue-600 text-white":"border-gray-200 text-gray-600 hover:border-blue-300"}`}>📧 Par Email</button>
                <button type="button" onClick={()=>setOtpMethod("sms")} className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all ${otpMethod==="sms"?"border-blue-500 bg-blue-600 text-white":"border-gray-200 text-gray-600 hover:border-blue-300"}`}>📱 Par SMS</button>
              </div>
              <p className="text-xs text-gray-500 mb-4">Code envoye a : {otpMethod==="email"?form.email:form.phone}</p>
              <button type="button" onClick={sendOTP} disabled={otpLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">{otpLoading?"Envoi...":"Envoyer le code"}</button>
              <button type="button" onClick={()=>setStep(1)} className="w-full py-2 mt-2 text-gray-500 text-sm hover:text-gray-700">Retour</button>
            </div>
          )}
          {/* ETAPE 3 - Saisie code OTP */}
          {step === 3 && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Entrez votre code</h3>
              <p className="text-sm text-gray-600 mb-4">Code envoye par {otpMethod==="email"?"email":"SMS"} a {otpMethod==="email"?form.email:form.phone}</p>
              <input type="text" maxLength={6} value={otpCode} onChange={e=>setOtpCode(e.target.value)} placeholder="000000" className="w-full text-center text-3xl font-bold tracking-widest px-4 py-4 border-2 border-green-300 rounded-xl focus:outline-none focus:border-blue-500 mb-4" />
              <button type="button" onClick={verifyOTP} disabled={loading||otpCode.length!==6} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50">{loading?"Verification...":"Verifier et creer mon compte"}</button>
              <button type="button" onClick={()=>setStep(2)} className="w-full py-2 mt-2 text-gray-500 text-sm hover:text-gray-700">Changer de methode</button>
              <button type="button" onClick={sendOTP} disabled={otpLoading} className="w-full py-2 text-blue-600 text-sm hover:text-blue-700">{otpLoading?"Envoi...":"Renvoyer le code"}</button>
            </div>
          )}
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Deja un compte ?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


