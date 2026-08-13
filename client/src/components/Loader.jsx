import React from 'react';
export default function Loader({ text = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
      <p className="text-earth-400 text-sm">{text}</p>
    </div>
  );
}
