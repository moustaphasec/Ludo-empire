import React from 'react';
import { Bot, Users, Globe, Settings as SettingsIcon } from 'lucide-react';

export const Home: React.FC<{ onNavigate: (screen: 'player_select' | 'online') => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#1c2331] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Background gradient/glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#1c2331] to-[#1c2331] pointer-events-none" />
      
      {/* Header */}
      <div className="absolute top-6 right-6">
        <button className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-xl flex items-center justify-center border-2 border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform">
          <SettingsIcon className="text-white" />
        </button>
      </div>

      <h1 className="text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-red-500 drop-shadow-lg tracking-tighter filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10">
        LUDO<br/>MODERNE
      </h1>

      <div className="flex flex-col gap-6 w-full max-w-sm relative z-10">
        
        {/* Computer / Local selection */}
        <button 
          onClick={() => onNavigate('player_select')}
          className="w-full bg-[#2a364b] p-6 rounded-3xl border border-slate-600 shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex flex-col items-center gap-4 hover:scale-[1.02] transition-transform group"
        >
          <div className="w-24 h-24 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">
             <Bot size={56} className="text-green-400" />
          </div>
          <div className="w-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] py-3 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] font-bold text-xl tracking-wide text-center">
            Ordinateur
          </div>
        </button>

        <button 
          onClick={() => onNavigate('player_select')}
          className="w-full bg-[#2a364b] p-6 rounded-3xl border border-slate-600 shadow-[0_8px_20px_rgba(0,0,0,0.4)] flex flex-col items-center gap-4 hover:scale-[1.02] transition-transform group"
        >
          <div className="w-24 h-24 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner">
             <Users size={56} className="text-[#E91E63]" />
          </div>
          <div className="w-full bg-gradient-to-r from-[#9C27B0] to-[#E91E63] py-3 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] font-bold text-xl tracking-wide text-center">
            Local
          </div>
        </button>

      </div>

      {/* Online Button at bottom */}
      <div className="absolute bottom-10 z-10">
        <button 
          onClick={() => onNavigate('online')}
          className="bg-gradient-to-b from-[#4CAF50] to-[#2E7D32] border-[3px] border-[#8BC34A] px-8 py-3 rounded-full flex items-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
        >
          <Globe className="text-blue-200" size={28} />
          <span className="font-black text-xl tracking-wider text-white drop-shadow-md">EN LIGNE</span>
        </button>
      </div>

    </div>
  );
};
