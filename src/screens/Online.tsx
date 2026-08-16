import React from 'react';
import { Globe } from 'lucide-react';

export const Online: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
       <Globe size={80} className="text-blue-400 mb-6 animate-pulse" />
       <h1 className="text-4xl font-black mb-4">Multijoueur en Ligne</h1>
       <p className="text-lg text-slate-300 mb-8 max-w-sm">
         Bientôt disponible !<br/><br/>L'infrastructure multijoueur (Firebase / WebSockets) est prête à être connectée.
       </p>
       <button onClick={onBack} className="bg-green-500 px-8 py-3 rounded-xl font-bold text-xl hover:bg-green-600 transition">
         Retour
       </button>
    </div>
  );
};
