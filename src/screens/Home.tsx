import React from 'react';
import { Bot, Users, Globe, Settings as SettingsIcon } from 'lucide-react';

export const Home: React.FC<{ onNavigate: (screen: 'player_select' | 'online') => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-[100dvh] bg-[#1c2331] flex flex-col items-center justify-between p-6 text-white font-sans relative overflow-hidden">
      {/* Background gradient/glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#1c2331] to-[#1c2331] pointer-events-none" />
      
      {/* Top Section: Header & Settings */}
      <div className="w-full flex justify-end relative z-10 shrink-0">
        <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all">
          <SettingsIcon className="text-white" />
        </button>
      </div>

      {/* Middle Section: Title & Main Buttons */}
      <div className="flex flex-col items-center w-full flex-1 justify-center relative z-10 shrink-0 mt-4 mb-8">
        <h1 className="text-5xl sm:text-7xl font-black mb-12 sm:mb-16 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 drop-shadow-lg tracking-tighter filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] text-center leading-tight">
          LUDO<br/>MODERNE
        </h1>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          {/* Computer selection */}
          <button 
            onClick={() => onNavigate('player_select')}
            className="w-full bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-95 hover:bg-white/10 transition-all group"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#4CAF50]/20 to-[#2E7D32]/20 rounded-2xl border border-[#4CAF50]/30 flex items-center justify-center group-hover:from-[#4CAF50]/30 group-hover:to-[#2E7D32]/30 transition-all shadow-[0_0_20px_rgba(76,175,80,0.2)]">
               <Bot size={56} className="text-[#8BC34A] drop-shadow-md group-hover:scale-110 transition-transform" />
            </div>
            <div className="w-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] py-3 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] font-bold text-xl tracking-wide text-center uppercase">
              Ordinateur
            </div>
          </button>

          {/* Local selection */}
          <button 
            onClick={() => onNavigate('player_select')}
            className="w-full bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col items-center gap-4 hover:scale-[1.02] active:scale-95 hover:bg-white/10 transition-all group"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#E91E63]/20 to-[#9C27B0]/20 rounded-2xl border border-[#E91E63]/30 flex items-center justify-center group-hover:from-[#E91E63]/30 group-hover:to-[#9C27B0]/30 transition-all shadow-[0_0_20px_rgba(233,30,99,0.2)]">
               <Users size={56} className="text-[#F48FB1] drop-shadow-md group-hover:scale-110 transition-transform" />
            </div>
            <div className="w-full bg-gradient-to-r from-[#9C27B0] to-[#E91E63] py-3 rounded-xl shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] font-bold text-xl tracking-wide text-center uppercase">
              Mode Local
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Section: Online Button */}
      <div className="w-full max-w-sm relative z-10 shrink-0 mb-4">
        <button 
          onClick={() => onNavigate('online')}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/50 py-4 rounded-2xl flex justify-center items-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Globe className="text-blue-200" size={28} />
          <span className="font-black text-xl tracking-widest text-white drop-shadow-md">EN LIGNE</span>
        </button>
      </div>

    </div>
  );
};
