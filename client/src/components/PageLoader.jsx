import React from 'react';

export default function PageLoader({ text = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
      <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  );
}
