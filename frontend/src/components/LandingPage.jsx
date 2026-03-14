import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, MapIcon, TrendingUp, Cpu, Server, Layers, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#060b13] flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-7xl w-full z-10 px-6 py-12 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="flex justify-between items-center w-full mb-16 lg:mb-24">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Activity size={28} />
               </div>
               <span className="text-2xl font-black tracking-tighter text-white">Enviro<span className="text-blue-500">Pulse</span></span>
            </div>
            
            <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide text-slate-400">
               <span className="hover:text-blue-400 cursor-pointer transition-colors">Platform</span>
               <span className="hover:text-blue-400 cursor-pointer transition-colors">Digital Twin</span>
               <span className="hover:text-blue-400 cursor-pointer transition-colors">Impact API</span>
            </nav>

            <div className="flex gap-4">
              <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide bg-slate-900/50 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all shadow-lg flex items-center gap-2"
              >
                  <ShieldCheck size={16} />
                  {user ? "Admin Portal" : "Admin Shield"}
              </button>
            </div>
        </header>

        {/* Hero Content */}
        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto w-full mt-8 lg:mt-0">
            <div className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                Next-Gen Intelligence for Global Air Quality
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 mb-6 tracking-tight leading-tight">
                Predictive Environmental <br/> Intelligence Matrix
            </h1>
            
            <p className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Harnessing real-time geospatial telemetry and machine learning to compute hyper-localized urban stress indexes before they reach critical mass.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center w-full">
                <button 
                    onClick={() => navigate('/select-region')}
                    className="px-8 py-4 rounded-xl font-bold text-lg tracking-wide bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-1"
                >
                    <Globe size={20} /> Open Public Dashboard
                </button>
            </div>
        </main>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 mb-12">
            
            {/* Feature 1 */}
            <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-colors shadow-2xl group flex flex-col items-start translate-y-0 hover:-translate-y-2 duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                    <Cpu size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 tracking-wide">Predictive AI Engine</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                    Our CatBoost models process millions of telemetry nodes to forecast Environmental Stress Index spikes up to 48 hours in advance.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition-colors shadow-2xl group flex flex-col items-start translate-y-0 hover:-translate-y-2 duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 mb-6 group-hover:scale-110 transition-transform">
                    <Server size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 tracking-wide">Sub-Millisecond APIs</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                    A redundant PostgreSQL/FastAPI mesh guarantees absolute data availability for critical municipal and corporate integrations.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-colors shadow-2xl group flex flex-col items-start translate-y-0 hover:-translate-y-2 duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                    <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 tracking-wide">Geospatial Synapse</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                    A digital twin architecture that accurately isolates PM2.5 and atmospheric variations down to the localized traffic corridor level.
                </p>
            </div>

        </div>

      </div>
    </div>
  );
};

export default LandingPage;
