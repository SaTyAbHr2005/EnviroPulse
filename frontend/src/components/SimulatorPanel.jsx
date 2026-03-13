import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  Terminal, 
  Cpu, 
  Power, 
  PowerOff, 
  Trash2,
  AlertTriangle,
  Server
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

const SimulatorPanel = () => {
  const [SystemStatus, setSystemStatus] = useState('Idle'); // Running, Stopped, Idle
  const [telemetry, setTelemetry] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Poll for status and telemetry
  const fetchState = async () => {
    try {
      const [statusRes, telemRes, sensorRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/simulator/status`),
        axios.get(`${BACKEND_URL}/simulator/telemetry`),
        axios.get(`${BACKEND_URL}/sensors/`)
      ]);
      setSystemStatus(statusRes.data.state);
      setTelemetry(telemRes.data);
      setSensors(sensorRes.data);
    } catch (err) {
      console.error("Error fetching simulator state:", err);
      setSystemStatus('Offline');
    }
  };

  useEffect(() => {
    fetchState();
    // Poll every 5 seconds to get live stream
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulator Controls
  const handleStart = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/simulator/start`);
      fetchState();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/simulator/stop`);
      fetchState();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if(!window.confirm("WARNING: This will permanently delete all telemetry reading history. Continue?")) return;
    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/simulator/reset`);
      fetchState();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Sensor Controls
  const handleToggleStatus = async (sensorId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${BACKEND_URL}/sensors/${sensorId}/status`, { status: newStatus });
      fetchState();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = () => {
    if (SystemStatus === 'Running') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (SystemStatus === 'Stopped' || SystemStatus === 'Idle') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="flex w-full min-h-screen font-sans max-w-[1600px] mx-auto text-slate-200">
      <div className="flex-1 pr-6 flex flex-col pl-4 md:pl-8 py-6">
        
        {/* Header & Master Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight flex items-center gap-3">
               <Server className="text-blue-500" /> Digital Twin Simulator
               <div className="group relative flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border border-blue-400/50 flex items-center justify-center text-blue-400 text-[10px] font-bold cursor-help hover:bg-blue-400/20 transition-colors">i</div>
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-300 text-xs px-3 py-2.5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-slate-700 w-72 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100]">
                     <strong className="text-blue-400 block mb-1">EnviroPulse Simulator</strong>
                     EnviroPulse simulates a distributed environmental sensor network. Each node represents a real-world monitoring station placed in urban zones. The simulator generates telemetry in real-time.
                  </div>
               </div>
            </h1>
            <p className="text-sm text-slate-400 font-medium tracking-wide mt-1">
              Master Control Panel for Synthetic Telemetry Generation
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 border rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-inner ${getStatusColor()}`}>
               <span className={`w-2 h-2 rounded-full ${SystemStatus === 'Running' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
               SYSTEM {SystemStatus.toUpperCase()}
            </div>
            
            <button 
              onClick={handleStart} 
              disabled={SystemStatus === 'Running' || loading}
              className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Play size={16} /> Start 
            </button>

            <button 
              onClick={handleStop}
              disabled={SystemStatus !== 'Running' || loading}
              className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 rounded-lg text-amber-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Square size={16} /> Stop
            </button>

            <button 
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 rounded-lg text-rose-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RotateCcw size={16} /> Reset DB
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
           
           {/* Telemetry Stream */}
           <div className="xl:col-span-2 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden shadow-lg h-[600px]">
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#1e293b]/50">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={16} className="text-blue-400" /> Live Telemetry Stream
                </h3>
                <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded">Polling (5s)</span>
              </div>
              <div className="overflow-auto flex-1 p-0">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-[#1e293b]/80 text-slate-400 sticky top-0 shadow-sm z-10 hidden sm:table-header-group">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Time</th>
                      <th className="px-4 py-3 font-semibold">Node</th>
                      <th className="px-4 py-3 font-semibold">Region</th>
                      <th className="px-4 py-3 font-semibold text-right">PM2.5</th>
                      <th className="px-4 py-3 font-semibold text-right">Traffic</th>
                      <th className="px-4 py-3 font-semibold text-right">Noise (dB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {telemetry.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-10 text-center text-slate-500 font-medium">No telemetry data. Start the simulation.</td>
                      </tr>
                    ) : (
                      telemetry.map((r, i) => (
                        <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-blue-400 font-mono text-xs">{new Date(r.timestamp).toLocaleTimeString()}</td>
                          <td className="px-4 py-3 font-bold text-white"><span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{r.node}</span></td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-400">{r.region}</td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-400">{r.pm25.toFixed(1)}</td>
                          <td className="px-4 py-3 text-right font-mono text-amber-400">{r.traffic.toFixed(0)}</td>
                          <td className="px-4 py-3 text-right font-mono text-rose-400 animate-pulse">{r.noise.toFixed(0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </div>

           {/* Sensor Control Panel */}
           <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden shadow-lg h-[600px]">
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#1e293b]/50">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={16} className="text-purple-400" /> Sensor Nodes
                </h3>
                <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded">{sensors.length} Active</span>
              </div>
              <div className="overflow-auto flex-1 p-2 space-y-2">
                 {sensors.map((sensor) => (
                    <div key={sensor.id} className="bg-[#1e293b]/40 border border-slate-700/50 rounded-lg p-3 flex justify-between items-center hover:bg-[#1e293b]/80 transition-colors">
                       <div>
                          <p className="text-sm font-bold text-white flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${sensor.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                            {sensor.sensor_name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{sensor.district_id ? `Region ID: ${sensor.district_id}` : 'Unknown Region'}</p>
                       </div>
                       <button 
                          onClick={() => handleToggleStatus(sensor.id, sensor.status)}
                          className={`p-2 rounded-lg border transition-colors ${
                              sensor.status === 'active' 
                                ? 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20' 
                                : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                          }`}
                          title={sensor.status === 'active' ? 'Deactivate Node' : 'Activate Node'}
                       >
                          {sensor.status === 'active' ? <PowerOff size={14} /> : <Power size={14} />}
                       </button>
                    </div>
                 ))}
                 {sensors.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-sm">No sensors deployed.</div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default SimulatorPanel;
