import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TRAVAUX = [
  {
    categorie: "🏗️ Gros œuvre",
    items: [
      { nom: "Construction villa R+0 (100m²)", min: 15000000, max: 25000000, unite: "projet" },
      { nom: "Construction villa R+1 (150m²)", min: 25000000, max: 45000000, unite: "projet" },
      { nom: "Fondations (100m²)", min: 2000000, max: 5000000, unite: "projet" },
      { nom: "Maçonnerie (m²)", min: 25000, max: 45000, unite: "m²" },
      { nom: "Dalle béton (m²)", min: 35000, max: 60000, unite: "m²" },
    ]
  },
  {
    categorie: "⚡ Électricité",
    items: [
      { nom: "Installation électrique complète (villa)", min: 1500000, max: 3000000, unite: "projet" },
      { nom: "Tableau électrique", min: 150000, max: 400000, unite: "unité" },
      { nom: "Prise de courant (unité)", min: 15000, max: 35000, unite: "unité" },
      { nom: "Point lumineux (unité)", min: 20000, max: 45000, unite: "unité" },
    ]
  },
  {
    categorie: "🚿 Plomberie",
    items: [
      { nom: "Plomberie complète (villa)", min: 1200000, max: 2500000, unite: "projet" },
      { nom: "Installation douche/baignoire", min: 150000, max: 400000, unite: "unité" },
      { nom: "Installation WC", min: 100000, max: 250000, unite: "unité" },
      { nom: "Tuyauterie (mètre linéaire)", min: 8000, max: 20000, unite: "ml" },
    ]
  },
  {
    categorie: "🎨 Finitions",
    items: [
      { nom: "Peinture intérieure (m²)", min: 3000, max: 8000, unite: "m²" },
      { nom: "Peinture extérieure (m²)", min: 5000, max: 12000, unite: "m²" },
      { nom: "Carrelage sol (m²)", min: 15000, max: 40000, unite: "m²" },
      { nom: "Faïence murale (m²)", min: 18000, max: 45000, unite: "m²" },
      { nom: "Enduit/Crépi (m²)", min: 8000, max: 18000, unite: "m²" },
    ]
  },
  {
    categorie: "🚪 Menuiserie",
    items: [
      { nom: "Porte intérieure bois", min: 80000, max: 200000, unite: "unité" },
      { nom: "Porte blindée/entrée", min: 250000, max: 600000, unite: "unité" },
      { nom: "Fenêtre aluminium", min: 120000, max: 300000, unite: "unité" },
      { nom: "Portail métallique", min: 300000, max: 800000, unite: "unité" },
    ]
  },
  {
    categorie: "🏠 Toiture",
    items: [
      { nom: "Toiture tôle simple (m²)", min: 15000, max: 30000, unite: "m²" },
      { nom: "Toiture tuile (m²)", min: 35000, max: 70000, unite: "m²" },
      { nom: "Charpente bois (m²)", min: 20000, max: 45000, unite: "m²" },
    ]
  },
  {
    categorie: "🏊 Aménagement",
    items: [
      { nom: "Clôture (mètre linéaire)", min: 35000, max: 80000, unite: "ml" },
      { nom: "Parking béton (m²)", min: 25000, max: 50000, unite: "m²" },
      { nom: "Fosse septique", min: 400000, max: 900000, unite: "unité" },
      { nom: "Château d'eau 5000L", min: 600000, max: 1200000, unite: "unité" },
    ]
  },
];

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n));


export default function Calculateur() {
  const [selections, setSelections] = useState({});
  const [ville, setVille] = useState('Yaoundé');
  const [step, setStep] = useState('calcul');

  const COEF_VILLE = { 'Yaoundé': 1.0, 'Douala': 1.05, 'Bafoussam': 0.9, 'Garoua': 0.85, 'Bertoua': 0.85 };
  const coef = COEF_VILLE[ville] || 1.0;

  const updateQty = (itemNom, qty) => {
    setSelections(s => ({
      ...s,
      [itemNom]: qty <= 0 ? undefined : { ...s[itemNom], qty: parseFloat(qty) || 0 }
    }));
  };

  const totalMin = Object.entries(selections).reduce((acc, [nom, val]) => {
    if (!val) return acc;
    const item = TRAVAUX.flatMap(c => c.items).find(i => i.nom === nom);
    return acc + (item ? item.min * val.qty * coef : 0);
  }, 0);

  const totalMax = Object.entries(selections).reduce((acc, [nom, val]) => {
    if (!val) return acc;
    const item = TRAVAUX.flatMap(c => c.items).find(i => i.nom === nom);
    return acc + (item ? item.max * val.qty * coef : 0);
  }, 0);

  const nbItems = Object.values(selections).filter(v => v && v.qty > 0).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-byh-gradient relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-blue-500/10"/>
        <div className="absolute bottom-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-indigo-500/10"/>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p className="text-blue-300 text-sm font-semibold mb-1 uppercase tracking-wider">Outil gratuit</p>
          <h1 className="text-3xl font-black text-white mb-2">🧮 Calculateur de budget BTP</h1>
          <p className="text-slate-400 max-w-xl">
            Estimez le coût de vos travaux au Cameroun en quelques clics. 
            Tarifs basés sur les prix du marché 2026.
          </p>
          {/* Ville */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="text-slate-300 text-sm font-semibold">📍 Ville :</span>
            {Object.keys(COEF_VILLE).map(v => (
              <button key={v} onClick={() => setVille(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  ville === v ? 'bg-white text-blue-700 shadow-md' : 'glass text-blue-200 hover:bg-white/20'
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Avertissement */}
        <div className="card-premium p-4 mb-6 border-l-4 border-amber-400 bg-amber-50">
          <p className="text-amber-800 text-sm">
            ⚠️ Ces tarifs sont <strong>indicatifs</strong> et basés sur les prix moyens du marché camerounais 2026. 
            Pour un devis précis, publiez votre projet sur B.Y.H et recevez des offres d'artisans vérifiés.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste travaux */}
          <div className="lg:col-span-2 space-y-5">
            {TRAVAUX.map(cat => (
              <div key={cat.categorie} className="card-premium p-5">
                <h3 className="font-display font-black text-slate-900 text-lg mb-4">{cat.categorie}</h3>
                <div className="space-y-3">
                  {cat.items.map(item => {
                    const sel = selections[item.nom];
                    const qty = sel?.qty || 0;
                    return (
                      <div key={item.nom} className={`p-3 rounded-xl border-2 transition-all ${
                        qty > 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 text-sm">{item.nom}</p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {fmt(item.min * coef)} — {fmt(item.max * coef)} FCFA / {item.unite}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(item.nom, Math.max(0, qty - 1))}
                              className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300">−</button>
                            <input type="number" min="0" value={qty || ''}
                              onChange={e => updateQty(item.nom, e.target.value)}
                              placeholder="0"
                              className="w-16 text-center px-2 py-1.5 border-2 border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400"/>
                            <button onClick={() => updateQty(item.nom, qty + 1)}
                              className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700">+</button>
                            <span className="text-xs text-slate-400 w-8">{item.unite}</span>
                          </div>
                        </div>
                        {qty > 0 && (
                          <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between text-xs">
                            <span className="text-blue-600 font-semibold">Minimum : {fmt(item.min * qty * coef)} FCFA</span>
                            <span className="text-blue-800 font-bold">Maximum : {fmt(item.max * qty * coef)} FCFA</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Récap sticky */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 sticky top-6">
              <h3 className="font-display font-black text-slate-900 text-lg mb-4">📊 Votre estimation</h3>

              {nbItems === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🧮</div>
                  <p className="text-slate-400 text-sm">Sélectionnez des travaux pour voir l'estimation</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-xs text-green-600 font-semibold mb-1">Budget minimum</p>
                      <p className="text-2xl font-black text-green-700">{fmt(totalMin)}</p>
                      <p className="text-xs text-green-500">FCFA</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Budget maximum</p>
                      <p className="text-2xl font-black text-blue-700">{fmt(totalMax)}</p>
                      <p className="text-xs text-blue-500">FCFA</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Budget moyen estimé</p>
                      <p className="text-2xl font-black text-slate-700">{fmt((totalMin + totalMax) / 2)}</p>
                      <p className="text-xs text-slate-400">FCFA</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mb-4">
                    📍 {ville} · {nbItems} poste{nbItems > 1 ? 's' : ''} sélectionné{nbItems > 1 ? 's' : ''}
                  </div>

                  <div className="space-y-2">
                    <Link to="/create-project"
                      className="btn-byh-gradient block text-center py-3.5 text-white font-black rounded-2xl text-sm">
                      📋 Publier mon projet →
                    </Link>
                    <Link to="/artisans"
                      className="block text-center py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-200">
                      🔨 Trouver un artisan
                    </Link>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-700 font-semibold">🔒 Paiement sécurisé B.Y.H</p>
                    <p className="text-xs text-blue-600 mt-1">Votre argent est bloqué et libéré uniquement après validation des travaux.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
