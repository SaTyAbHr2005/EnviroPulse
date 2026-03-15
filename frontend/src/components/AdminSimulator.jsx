import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Square, RotateCcw, Activity, Terminal, Server } from 'lucide-react';
import { getNoiseColor } from '../utils/metricColors';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminSimulator = () => {
  const [SystemStatus, setSystemStatus] = useState('Idle');
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchState = async () => {
    try {
      const [statusRes, telemRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/simulator/status`),
        axios.get(`${BACKEND_URL}/simulator/telemetry`)
      ]);
      setSystemStatus(statusRes.data.state);
      setTelemetry(telemRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching simulator state:", err);
      // Let the axios interceptor from AuthContext handle 401s, this just catches network drops
      setSystemStatus('Offline');
      if(err.response?.status === 401 || err.response?.status === 403) {
          setError("Unauthorized: Admin Access Required");
      }
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/simulator/start`);
      fetchState();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/simulator/stop`);
      fetchState();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleReset = async () => {
    if(!window.confirm("WARNING: This will permanently delete all telemetry reading history. Continue?")) return;
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/simulator/reset`);
      fetchState();
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getStatusColor = () => {
    if (SystemStatus === 'Running') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (SystemStatus === 'Stopped' || SystemStatus === 'Idle') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  if (error) {
     return (
        <div className="flex w-full min-h-screen items-center justify-center font-sans text-rose-500">
           {error}
        </div>
     );
  }

  return (
    <div className="flex w-full min-h-screen font-sans max-w-[1200px] mx-auto text-slate-200">
      <div className="flex-1 pr-6 flex flex-col pl-4 md:pl-8 py-6">
        
        {/* Header & Master Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg">
          <div>
             <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight flex items-center gap-3">
               <Server className="text-blue-500" /> Digital Twin Simulator
             </h1>
             <p className="text-sm text-slate-400 font-medium tracking-wide mt-1">Live Telemetry Generation Engine [Admin Protected]</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 border rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-inner ${getStatusColor()}`}>
               <span className={`w-2 h-2 rounded-full ${SystemStatus === 'Running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
               SYSTEM {SystemStatus.toUpperCase()}
            </div>
            
            <button onClick={handleStart} disabled={SystemStatus === 'Running' || loading}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
              <Play size={16} /> Start 
            </button>

            <button onClick={handleStop} disabled={SystemStatus !== 'Running' || loading}
              className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 rounded-lg text-amber-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
              <Square size={16} /> Stop
            </button>

            <button onClick={handleReset} disabled={loading}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 rounded-lg text-rose-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-2">
              <RotateCcw size={16} /> Clear DB
            </button>
          </div>
        </div>

        {/* Telemetry Stream */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden shadow-lg h-[600px]">
           <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#1e293b]/50">
             <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                 <Terminal size={16} className="text-blue-400" /> Secure Telemetry Stream
             </h3>
             <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">Polling (5s)</span>
           </div>
           
           <div className="overflow-auto flex-1 p-0">
             <table className="w-full text-left text-sm text-slate-300">
               <thead className="text-xs uppercase bg-[#1e293b]/80 text-slate-400 sticky top-0 shadow-sm z-10 hidden sm:table-header-group">
                 <tr>
                   <th className="px-4 py-3 font-semibold">Time</th>
                   <th className="px-4 py-3 font-semibold">Node Identity</th>
                   <th className="px-4 py-3 font-semibold">Region Core</th>
                   <th className="px-4 py-3 font-semibold text-right">PM2.5 Sensor</th>
                   <th className="px-4 py-3 font-semibold text-right">Traffic Flow</th>
                   <th className="px-4 py-3 font-semibold text-right">Decibel Level</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {telemetry.length === 0 ? (
                   <tr>
                     <td colSpan="6" className="px-4 py-10 text-center text-slate-500 font-medium tracking-widest">AWAITING SIMULATION INITIALIZATION.</td>
                   </tr>
                 ) : (
                   telemetry.map((r) => (
                     <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                       <td className="px-4 py-3 whitespace-nowrap text-blue-400 font-mono text-xs">{new Date(r.timestamp).toLocaleTimeString()}</td>
                       <td className="px-4 py-3 font-bold text-white"><span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{r.node}</span></td>
                       <td className="px-4 py-3 whitespace-nowrap text-slate-400 uppercase text-xs font-bold tracking-wider">{r.region}</td>
                       <td className="px-4 py-3 text-right font-mono text-emerald-400">{r.pm25.toFixed(1)}</td>
                       <td className="px-4 py-3 text-right font-mono text-amber-400">{r.traffic.toFixed(0)}</td>
                       <td className="px-4 py-3 text-right font-mono animate-pulse" style={{ color: getNoiseColor(r.noise) }}>{r.noise.toFixed(0)}</td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSimulator;
