import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getAvatarUrl, formatBudget } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ projects:[], missions:[], artisan:null, entreprise:null, devis:[], contrats:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') { navigate('/admin'); return; }

    if (user.role === 'client') {
      Promise.allSettled([api.get('/projects/my'), api.get('/devis/mes-devis'), api.get('/visites/mes-visites'), api.get('/jalons/en-attente')])
        .then(([p, d, v, j]) => setData({
          projects: p.status==='fulfilled' ? (p.value.data||[]) : [],
          devis: d.status==='fulfilled' ? (d.value.data||[]) : [],
          missions:[], artisan:null, entreprise:null, contrats:[], visites: v.status==='fulfilled' ? (v.value.data||[]) : [], jalonsEnAttente: j.status==="fulfilled" ? (j.value.data||[]) : []
        }))
        .finally(() => setLoading(false));
    } else if (user.role === 'artisan') {
      Promise.allSettled([api.get('/artisans/me'), api.get('/devis/mes-devis'), api.get('/visites/disponibles'), api.get('/jalons?role=artisan&statut=valide')])
        .then(([a, d, vd, jv]) => setData({
          artisan: a.status==='fulfilled' ? a.value.data : null,
          devis: d.status==='fulfilled' ? (d.value.data||[]) : [],
          projects:[], missions:[], entreprise:null, contrats:[], visitesDisponibles: vd.status==='fulfilled' ? (vd.value.data||[]) : [], jalonsValides: jv.status==='fulfilled' ? (jv.value.data||[]) : []
        }))
        .finally(() => setLoading(false));
    } else if (user.role === 'entreprise') {
      Promise.allSettled([api.get('/entreprises/me'), api.get('/demandes-personnel/mes-demandes'), api.get('/contrats/mes-contrats')])
        .then(([e, m, c]) => setData({
          entreprise: e.status==='fulfilled' ? e.value.data : null,
          missions: m.status==='fulfilled' ? (m.value.data||[]) : [],
          contrats: c.status==='fulfilled' ? (c.value.data||[]) : [],
          projects:[], artisan:null, devis:[]
        }))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user || loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{background:'linear-gradient(135deg, #0a1628 0%, #0d2044 100%)'}} className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <img src={getAvatarUrl(user.avatar, user.name)} alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20"/>
            <div>
              <h1 className="text-2xl font-display font-black text-white">
                Bonjour, {user.name.split(' ')[0]} 👋
              </h1>
              <p className="text-blue-300 text-sm mt-0.5 capitalize">{user.role} · {user.city}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {user.role === 'client' && <ClientDashboard projects={data.projects} devis={data.devis} user={user} visites={data.visites||[]} jalonsEnAttente={data.jalonsEnAttente||[]}/> }
        {user.role === 'artisan' && <ArtisanDashboard artisan={data.artisan} devis={data.devis} user={user} visitesDisponibles={data.visitesDisponibles||[]}/>}
        {user.role === 'entreprise' && <EntrepriseDashboard entreprise={data.entreprise} missions={data.missions} demandes={data.missions} contrats={data.contrats}/>}
      </div>
    </div>
  );
}

function ClientDashboard({ projects, devis, user, visites, jalonsEnAttente }) {
  const p = projects || [];
  const d = devis || [];
  const devisEnAttente = d.filter(x=>x.statut==='envoye').length;
  const devisAcceptes = d.filter(x=>x.statut==='accepte').length;
  const v = visites || [];
  const visitesEnAttente = v.filter(x=>x.statut==='en_attente').length;
  const visitesRapport = v.filter(x=>x.statut==='rapport_soumis').length;
  const jea = jalonsEnAttente || [];
  const nbJalons = jea.length;

      {/* Guide onboarding nouveau client */}
      {p.length === 0 && d.length === 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h3 className="font-display font-bold text-xl mb-4">Bienvenue sur BYHOME ! 👋</h3>
          <div className="space-y-3">
            {[
              { num:"1", text:"Publiez votre projet de construction ou renovation", done: p.length > 0 },
              { num:"2", text:"Recevez des devis d artisans verifies", done: d.length > 0 },
              { num:"3", text:"Choisissez le meilleur artisan et suivez les travaux", done: false },
            ].map(s=>(
              <div key={s.num} className={"flex items-center gap-3 " + (s.done?"opacity-60":"")}>
                <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 " + (s.done?"bg-green-400":"bg-white/20")}>
                  {s.done ? "✓" : s.num}
                </div>
                <p className="text-blue-100 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
          <Link to="/create-project" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50">
            Commencer maintenant →
          </Link>
        </div>
      )}
  return (
    <div className="space-y-6">
      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/create-project"
          className="flex items-center gap-4 p-5 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
          <div>
            <p className="font-bold text-lg">Publier un projet</p>
            <p className="text-blue-200 text-sm">Trouvez un artisan rapidement</p>
          </div>
        </Link>
        <Link to="/visites/demander"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔍</div>
          <div>
            <p className="font-bold text-lg text-gray-900">Visite evaluation</p>
            <p className="text-gray-400 text-sm">Un technicien evalue votre chantier</p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Projets', value:p.length, icon:'📋', color:'text-blue-600' },
          { label:'Devis recus', value:d.length, icon:'📄', color:'text-green-600' },
          { label:'En attente', value:devisEnAttente, icon:'⏳', color:'text-amber-600' },
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {devisEnAttente > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-bold text-gray-900">{devisEnAttente} devis en attente de reponse</p>
                <p className="text-gray-500 text-sm">Repondez avant expiration</p>
              </div>
            </div>
            <Link to="/devis" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600">Voir →</Link>
          </div>
        </div>
      )}

      {devisAcceptes > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔨</span>
              <div>
                <p className="font-bold text-gray-900">{devisAcceptes} chantier{devisAcceptes>1?'s':''} en cours</p>
                <p className="text-gray-500 text-sm">Suivez l avancement de vos travaux</p>
              </div>
            </div>
            <Link to="/devis" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700">Suivre →</Link>
          </div>
        </div>
      )}

      {visitesRapport > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-bold text-gray-900">{visitesRapport} rapport{visitesRapport>1?'s':''} de visite disponible{visitesRapport>1?'s':''}</p>
                <p className="text-gray-500 text-sm">Un technicien a evalue votre chantier</p>
              </div>
            </div>
            <Link to="/visites" className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700">Voir →</Link>
          </div>
        </div>
      )}
      {nbJalons > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔨</span>
              <div>
                <p className="font-bold text-gray-900">{nbJalons} jalon{nbJalons>1?"s":""} en attente de validation</p>
                <p className="text-gray-500 text-sm">Un artisan a soumis des photos pour validation</p>
              </div>
            </div>
            <Link to="/devis" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700">Valider →</Link>
          </div>
        </div>
      )}
      {/* Liens rapides */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-display font-bold text-gray-900 mb-4">Acces rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to:'/artisans', icon:'🔨', label:'Trouver un artisan' },
            { to:'/entreprises', icon:'🏢', label:'Entreprises BTP' },
            { to:'/devis', icon:'📄', label:'Mes devis' },
            { to:'/contrats', icon:'✍️', label:'Mes contrats' },
          ].map(l=>(
            <Link key={l.to} to={l.to}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
              <span className="text-xl">{l.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilProgression({ artisan, user }) {
  const etapes = [
    { label:'Photo de profil', done: !!user?.avatar },
    { label:'Description', done: !!artisan?.description },
    { label:'WhatsApp', done: !!artisan?.whatsapp },
    { label:'Specialites', done: (artisan?.specialites||[]).length > 0 },
    { label:'Photos realisations', done: (artisan?.photos||[]).length > 0 },
  ];
  const score = etapes.filter(e=>e.done).length;
  const pct = Math.round((score / etapes.length) * 100);

  if (pct === 100) return null;

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Completez votre profil</h3>
        <span className={`text-lg font-black ${pct>=60?'text-green-600':pct>=40?'text-amber-500':'text-red-500'}`}>{pct}%</span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div className={`h-full rounded-full transition-all duration-500 ${pct>=60?'bg-green-500':pct>=40?'bg-amber-500':'bg-red-400'}`}
          style={{width:`${pct}%`}}></div>
      </div>

      <div className="space-y-2 mb-4">
        {etapes.map(e=>(
          <div key={e.label} className="flex items-center gap-2 text-sm">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${e.done?'bg-green-100 text-green-600':'bg-gray-100 text-gray-400'}`}>
              {e.done?'✓':'○'}
            </span>
            <span className={e.done?'text-gray-400 line-through':'text-gray-700 font-medium'}>{e.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mb-4">
        💡 Un profil complet recoit <strong>3x plus de demandes</strong> qu un profil incomplet.
      </div>

      <Link to="/profile"
        className="block w-full text-center py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm">
        Completer mon profil →
      </Link>
    </div>
  );
}

function ArtisanDashboard({ artisan, devis, user, visitesDisponibles }) {
  const d = devis || [];
  const devisEnvoyes = d.filter(x=>x.statut==='envoye').length;
  const devisAcceptes = d.filter(x=>x.statut==='accepte').length;
  const devisTermines = d.filter(x=>x.statut==='termine').length;
  const gainTotal = d.filter(x=>x.statut==='termine').reduce((s,x)=>s+(x.montantArtisan||0),0);
  const gainCeMois = d.filter(x=>x.statut==="termine" && new Date(x.updatedAt).getMonth()===new Date().getMonth()).reduce((s,x)=>s+(x.montantArtisan||0),0);
  const profilVide = !artisan;

  return (
    <div className="space-y-6">

      {/* Barre de progression profil */}
      <ProfilProgression artisan={artisan} user={user}/>

      {profilVide && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <h3 className="font-display font-bold text-xl mb-4">Bienvenue sur BYHOME ! 👋</h3>
          <p className="text-green-100 text-sm mb-4">Completez votre profil pour recevoir des demandes des clients</p>
          <div className="space-y-3">
            {[
              { num:"1", text:"Completez votre profil avec photo et description" },
              { num:"2", text:"Ajoutez votre numero WhatsApp" },
              { num:"3", text:"Ajoutez vos specialites et photos de realisations" },
              { num:"4", text:"Parcourez les projets et envoyez des devis" },
            ].map(s=>(
              <div key={s.num} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs flex-shrink-0">{s.num}</div>
                <p className="text-green-100 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
          <Link to="/profile" className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 rounded-xl font-bold text-sm hover:bg-green-50">
            Completer mon profil →
          </Link>
        </div>
      )}
      {/* Message si aucun devis */}
      {d.length === 0 && !profilVide && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-bold text-gray-900 mb-2">Commencez a recevoir des demandes</h3>
          <p className="text-gray-500 text-sm mb-4">Parcourez les projets disponibles et envoyez vos premiers devis</p>
          <Link to="/projects" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm">
            Voir les projets →
          </Link>
        </div>
      )}

      {/* Statut disponibilite */}
      {artisan && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${artisan.disponible?'bg-green-400 animate-pulse':'bg-gray-300'}`}></div>
              <div>
                <p className="font-bold text-gray-900">{artisan.metier}</p>
                <p className="text-gray-400 text-sm">{artisan.ville} · {artisan.disponible?'Disponible pour des missions':'Non disponible'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={async()=>{ try{ await api.put("/artisans/profile",{disponible:!artisan.disponible}); window.location.reload(); }catch{} }} className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 transition-colors ${artisan.disponible?"border-green-200 text-green-600 hover:bg-green-50 bg-green-50":"border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {artisan.disponible?"● Disponible":"○ Indisponible"}
              </button>
              <Link to="/profile" className="px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50">Modifier</Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {d.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:'Devis envoyes', value:devisEnvoyes, icon:'📤', color:'text-blue-600' },
            { label:'En cours', value:devisAcceptes, icon:'🔨', color:'text-green-600' },
            { label:'Termines', value:devisTermines, icon:'✅', color:'text-purple-600' },
            { label:'Gains totaux', value:gainTotal>0?formatBudget(gainTotal):'--', icon:'💰', color:'text-amber-600' },
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
      {gainTotal > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <h3 className="font-bold text-white/80 text-sm mb-3">Tableau financier</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-blue-200 text-xs mb-1">Gains ce mois</p>
              <p className="text-2xl font-display font-black">{gainCeMois > 0 ? formatBudget(gainCeMois) : "--"}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">Gains totaux</p>
              <p className="text-2xl font-display font-black">{formatBudget(gainTotal)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">Missions terminees</p>
              <p className="text-xl font-bold">{devisTermines}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">Commission BYHOME</p>
              <p className="text-xl font-bold">{formatBudget(Math.round(gainTotal * 0.111))}</p>
            </div>
          </div>
        </div>
      )}
      )}
      {visitesDisponibles && visitesDisponibles.length > 0 && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-bold text-gray-900">{visitesDisponibles.length} visite{visitesDisponibles.length>1?"s":""} disponible{visitesDisponibles.length>1?"s":""} dans votre ville</p>
                <p className="text-gray-500 text-sm">Acceptez une visite et gagnez des frais d evaluation</p>
              </div>
            </div>
            <Link to="/visites" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700">Voir →</Link>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/projects"
          className="flex items-center gap-4 p-5 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
          <div>
            <p className="font-bold text-lg">Voir les projets</p>
            <p className="text-blue-200 text-sm">Trouvez des chantiers</p>
          </div>
        </Link>
        <Link to="/devis/creer"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📄</div>
          <div>
            <p className="font-bold text-lg text-gray-900">Creer un devis</p>
            <p className="text-gray-400 text-sm">Proposez vos services</p>
          </div>
        </Link>
      </div>

      {/* Alerte travaux en cours */}
      {devisAcceptes > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔨</span>
              <div>
                <p className="font-bold text-gray-900">{devisAcceptes} chantier{devisAcceptes>1?'s':''} en cours</p>
                <p className="text-gray-500 text-sm">Soumettez vos photos d avancement</p>
              </div>
            </div>
            <Link to="/devis" className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600">Voir →</Link>
          </div>
        </div>
      )}
      {/* Liens rapides */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-display font-bold text-gray-900 mb-4">Acces rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to:'/devis', icon:'📄', label:'Mes devis' },
            { to:'/contrats', icon:'✍️', label:'Mes contrats' },
            { to:'/messages', icon:'💬', label:'Messages' },
            { to:'/profile', icon:'👤', label:'Mon profil' },
          ].map(l=>(
            <Link key={l.to} to={l.to}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
              <span className="text-xl">{l.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function EntrepriseDashboard({ entreprise, missions, contrats, demandes }) {
  const m = missions || [];
  const c = contrats || [];
  const d = demandes || [];
  const demandesEnAttente = d.filter(x=>['en_attente','en_negociation'].includes(x.statut)).length;
  const contratsEnCours = c.filter(x=>x.statut==='en_cours').length;
  const contratsEnAttente = c.filter(x=>x.statut==='en_attente_signatures').length;

  return (
    <div className="space-y-6">
      {/* Statut entreprise */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-bold text-gray-900 text-lg">{entreprise?.nomEntreprise || 'Completez votre profil'}</p>
            <p className="text-gray-400 text-sm">{entreprise?.ville} · Entreprise BTP</p>
          </div>
          <Link to="/profile" className="px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50">
            Modifier profil
          </Link>
        </div>
      </div>

      {/* Message si aucune activite */}
      {m.length === 0 && c.length === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">👷</div>
          <h3 className="font-bold text-gray-900 mb-2">Commencez a louer du personnel</h3>
          <p className="text-gray-500 text-sm mb-4">Publiez votre premiere mission ou creez un contrat officiel</p>
          <Link to="/demandes-personnel/new" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm">
            Publier une mission →
          </Link>
        </div>
      )}

      {/* Stats */}
      {(m.length > 0 || c.length > 0) && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Demandes en attente', value:demandesEnAttente, icon:'👷', color:'text-blue-600' },
            { label:'Contrats en cours', value:contratsEnCours, icon:'✍️', color:'text-green-600' },
            { label:'En attente signature', value:contratsEnAttente, icon:'⏳', color:'text-amber-600' },
          ].map(s=>(
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Alertes */}
      {contratsEnAttente > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <p className="font-bold text-gray-900">{contratsEnAttente} contrat{contratsEnAttente>1?'s':''} en attente de signature</p>
                <p className="text-gray-500 text-sm">Les deux parties doivent signer</p>
              </div>
            </div>
            <Link to="/contrats" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600">Voir →</Link>
          </div>
        </div>
      )}

      {contratsEnCours > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔨</span>
              <div>
                <p className="font-bold text-gray-900">{contratsEnCours} mission{contratsEnCours>1?'s':''} en cours</p>
                <p className="text-gray-500 text-sm">Validez a la fin pour liberer le paiement</p>
              </div>
            </div>
            <Link to="/contrats" className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600">Voir →</Link>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/demandes-personnel/new"
          className="flex items-center gap-4 p-5 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">👷</div>
          <div>
            <p className="font-bold text-lg">Demander du personnel</p>
            <p className="text-blue-200 text-sm">Admin selectionne les meilleurs techniciens</p>
          </div>
        </Link>
        <Link to="/contrats"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">✍️</div>
          <div>
            <p className="font-bold text-lg text-gray-900">Mes contrats</p>
            <p className="text-gray-400 text-sm">Voir et gerer vos contrats</p>
          </div>
        </Link>
      </div>
      {/* Liens rapides */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-display font-bold text-gray-900 mb-4">Acces rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to:'/artisans', icon:'🔨', label:'Trouver un artisan' },
            { to:'/contrats', icon:'✍️', label:'Mes contrats' },
            { to:'/messages', icon:'💬', label:'Messages' },
            { to:'/profile', icon:'👤', label:'Mon profil' },
          ].map(l=>(
            <Link key={l.to} to={l.to}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
              <span className="text-xl">{l.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}



