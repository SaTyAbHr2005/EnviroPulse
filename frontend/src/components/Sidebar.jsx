import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Map as MapIcon, PlayCircle, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <MapIcon size={18} />, label: 'Map View', path: '/' },
    { icon: <ShieldAlert size={18} />, label: 'Admin Portal', path: '/admin' },
  ];

  return (
    <div className="w-64 h-screen bg-[#0f1524] border-r border-slate-800 flex flex-col font-sans fixed left-0 top-0">
      <div className="flex flex-col flex-1 h-full">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 shrink-0">
          <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AirInsight</span>
        </div>

        {/* NAVIGATION */}
        <div className="py-6 px-4 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#192b4d] text-blue-400 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <div className={isActive ? "text-blue-400" : "text-slate-500"}>{item.icon}</div>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* CRITICAL REGIONS WIDGET */}
        <div className="p-4 mt-auto">
          <div className="bg-[#1a172a] rounded-xl border border-rose-900/30 overflow-hidden">
            <div className="px-3 py-2 border-b border-rose-900/30 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Critical Regions</span>
            </div>
            <div className="p-3 bg-slate-900/50">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-bold text-slate-200">Chandrapur</span>
                <span className="text-rose-500 font-black text-sm">359</span>
              </div>
              <div className="text-[10px] text-slate-500 mb-2">Source: <span className="text-slate-400">Mixed Sources</span></div>
              <div className="text-[10px] text-slate-400 bg-rose-950/30 p-2 rounded border border-rose-900/20">
                Stay indoors, keep windows closed
              </div>
            </div>
          </div>
          <div className="text-center text-[#475569] text-[10px] mt-4 font-mono">v1.0.0 Production</div>
        </div>
      </div>
    </div>
  );
};

// Simple Alert icon used directly mapping to the image
const AlertTriangle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
)

export default Sidebar;
