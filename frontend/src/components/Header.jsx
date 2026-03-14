import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleProfileClick = () => {
    if (user?.role === 'admin') {
      logout();
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Brand name removed per user request */}
      </div>

      <div className="flex items-center gap-4">
        {/* System Live Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 transition-colors">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 tracking-wide uppercase transition-colors">System Live</span>
        </div>

        {/* Profile Avatar */}
        <button 
          onClick={handleProfileClick}
          className="group relative flex items-center"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-[#0f172a] outline outline-2 outline-blue-500/30 ml-2 transition-all group-hover:scale-110">
            {user?.role === 'admin' ? 'A' : 'U'}
          </div>
          
          {/* Action Label on Hover */}
          <div className="absolute top-10 right-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-slate-200 dark:border-slate-700 pointer-events-none z-50 shadow-lg">
             {user?.role === 'admin' ? 'Logout' : 'Back to Home'}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
