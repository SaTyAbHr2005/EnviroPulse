import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Map as MapIcon, PlayCircle, ShieldAlert, Activity, Server, Cpu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStressColor } from '../utils/metricColors';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const publicMenuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Activity size={18} />, label: 'Prediction', path: '/prediction' },
    { icon: <TrendingUp size={18} />, label: 'Trends', path: '/trends' },
    { icon: <MapIcon size={18} />, label: 'Map View', path: '/map' },
  ];

  const adminMenuItems = [
    { icon: <Cpu size={18} />, label: 'Control Panel', path: '/admin/control-panel' },
    { icon: <Server size={18} />, label: 'Live Telemetry', path: '/admin/simulator' },
  ];

  const menuItems = user?.role === 'admin' ? [...publicMenuItems, ...adminMenuItems] : publicMenuItems;
  return (
    <div className="w-64 h-screen bg-white dark:bg-[#0f1524] border-r border-slate-200 dark:border-slate-800 flex flex-col font-sans fixed left-0 top-0 transition-colors duration-300">
      <div className="flex flex-col flex-1 h-full">
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-colors">
          <div className="w-6 h-6 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">EnviroPulse</span>
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
                    ? 'bg-blue-50 dark:bg-[#192b4d] text-blue-600 dark:text-blue-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}>{item.icon}</div>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* CRITICAL REGIONS WIDGET */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-50 dark:bg-[#1a172a] rounded-xl border border-rose-200 dark:border-rose-900/30 overflow-hidden transition-colors">
            <div className="px-3 py-2 border-b border-rose-200 dark:border-rose-900/30 flex items-center gap-2 bg-rose-50/50 dark:bg-transparent transition-colors">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-500 tracking-wider">Critical Regions</span>
            </div>
            <div className="p-3 bg-white/50 dark:bg-slate-900/50 transition-colors">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors">Solapur</span>
                <span className="font-black text-sm" style={{ color: getStressColor(87) }}>87</span>
              </div>
              <div className="text-[10px] text-slate-500 mb-2 transition-colors">Source: <span className="text-slate-600 dark:text-slate-400">Mixed Sources</span></div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded border border-rose-200 dark:border-rose-900/20 transition-colors">
                Stay indoors, keep windows closed
              </div>
            </div>
          </div>
          <div className="text-center text-[#475569] text-[10px] mt-4 font-mono mb-6">v1.0.0 Production</div>
          
          {user?.role === 'admin' && (
             <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-lg"
             >
                 <LogOut size={14} /> Return to Public Site
             </button>
          )}
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
