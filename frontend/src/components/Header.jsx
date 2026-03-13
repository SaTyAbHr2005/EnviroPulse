import React from 'react';
import { Menu, Sun, Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0f172a] flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <span className="text-xl font-bold tracking-tight text-white">EnviroPulse</span>
      </div>

      <div className="flex items-center gap-4">
        {/* System Live Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-900/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-500 tracking-wide uppercase">System Live</span>
        </div>

        {/* Theme Toggle */}
        <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800">
          <Sun size={18} />
        </button>

        {/* Profile Avatar */}
        <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-[#0f172a] outline outline-2 outline-blue-500/30 ml-2">
          A
        </button>
      </div>
    </header>
  );
};

export default Header;
