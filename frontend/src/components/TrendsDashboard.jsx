import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRegion } from '../context/RegionContext';
import { getAQIColor } from '../utils/metricColors';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DISTRICTS = [
    'Mumbai City', 'Pune', 'Nagpur', 'Nashik', 'Solapur',
    'Aurangabad', 'Kolhapur', 'Amravati', 'Nanded'
];

// Custom Tooltip for Graph 1
const CustomTrajectoryTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl">
        <p className="text-slate-300 font-bold mb-3 border-b border-slate-700 pb-2">Entry: {label}</p>
        <div className="space-y-1.5 font-medium">
          <p className="text-[#06b6d4]">AQI: <span className="font-bold text-white ml-1">{payload[0]?.value}</span></p>
          <p className="text-[#a855f7]">Stress: <span className="font-bold text-white ml-1">{payload[1]?.value}</span></p>
          <p className="text-[#f97316]">Noise: <span className="font-bold text-white ml-1">{payload[2]?.value} dB</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Graph 2
const CustomPMTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl">
        <p className="text-slate-300 font-bold mb-3 border-b border-slate-700 pb-2">Entry: {label}</p>
        <div className="space-y-1.5 font-medium">
          <p className="text-[#f97316]">PM2.5: <span className="font-bold text-white ml-1">{payload[0]?.value} µg/m³</span></p>
          <p className="text-[#ef4444]">PM10: <span className="font-bold text-white ml-1">{payload[1]?.value} µg/m³</span></p>
        </div>
      </div>
    );
  }
  return null;
};

const TrendsDashboard = () => {
    const { selectedDistrict, setSelectedDistrict } = useRegion();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/analytics/history/${selectedDistrict}`);
            setHistoryData(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching history:", err);
            setError("Failed to fetch historical telemetry.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [selectedDistrict]);

    if (loading && !historyData.length) {
        return (
            <div className="flex w-full min-h-full items-center justify-center font-sans py-20">
                <div className="flex flex-col items-center">
                    <RefreshCw className="text-blue-500 animate-spin w-10 h-10 mb-4" />
                    <p className="text-slate-400 font-medium tracking-widest uppercase">Aggregating Historical Trajectory...</p>
                </div>
            </div>
        );
    }

  const latest = historyData[historyData.length - 1] || {};

  return (
    <div className="w-full min-h-full font-sans max-w-7xl mx-auto text-slate-200 pb-12">
      
      {/* HEADER SECTION */}
      <div className="mb-8 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">Environmental Trends</h1>
            <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide max-w-3xl">
            Retrospective analysis of environmental stress and pollutant variations for <span className="text-blue-400">{selectedDistrict}</span>.
            </p>
        </div>

        <div className="relative">
            <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="appearance-none bg-[#0f172a]/80 border border-slate-700/50 text-blue-100 text-sm font-bold rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xl cursor-pointer"
            >
                {DISTRICTS.map(d => <option key={d} value={d} className="bg-slate-900 text-white uppercase font-bold">{d}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-400">
                <MapPin size={16} />
            </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 animate-pulse">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error} Verify sensor simulation is active.</p>
        </div>
      )}

      {historyData.length === 0 ? (
        <div className="mx-4 mb-12 p-20 bg-[#0f172a]/40 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-500">
            <TrendingUp size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold tracking-widest">NO TRAJECTORY VECTORS DETECTED</p>
            <p className="text-xs uppercase mt-2">Historical aggregation requires active sensor telemetry stream.</p>
        </div>
      ) : (
        <>
        {/* GRAPH 1: Environmental Stress Trajectory */}
        <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 lg:p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] mb-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" /> 
                Environmental Stress Trajectory
                </h2>
                <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Real-Time Aggregation</span>
                <span className={`px-2.5 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm`}>
                    Last {historyData.length} Ticks
                </span>
                </div>
            </div>

            {/* Metrics Top Right */}
            <div className="flex gap-6 bg-[#1e293b]/40 border border-slate-700/40 rounded-xl p-4">
                <div>
                <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">Current AQI</div>
                <div className="text-lg font-black text-white">{latest.aqi}</div>
                </div>
                <div className="w-px bg-slate-700/50"></div>
                <div>
                <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold mb-1">Current Stress</div>
                <div className="text-lg font-black text-white">{latest.stress}</div>
                </div>
                <div className="w-px bg-slate-700/50"></div>
                <div>
                <div className="text-[10px] text-orange-400 uppercase tracking-widest font-bold mb-1">Current Noise</div>
                <div className="text-lg font-black text-white">{latest.noise} <span className="text-xs font-medium text-slate-400">dB</span></div>
                </div>
            </div>
            </div>

            <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} minTickGap={30} />
                <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} domain={[0, 'dataMax + 20']} hide />
                
                <Tooltip content={<CustomTrajectoryTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
                
                <ReferenceArea y1={0} y2={50} fill={getAQIColor(50)} fillOpacity={0.03} />
                <ReferenceArea y1={50} y2={100} fill={getAQIColor(100)} fillOpacity={0.04} />
                <ReferenceArea y1={100} y2={200} fill={getAQIColor(200)} fillOpacity={0.05} />
                <ReferenceArea y1={200} y2={300} fill={getAQIColor(300)} fillOpacity={0.06} />

                <Area type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={3} fill="transparent" filter="url(#glow-cyan)" />
                <Area type="monotone" dataKey="stress" stroke="#a855f7" strokeWidth={3} fill="transparent" filter="url(#glow-purple)" />
                <Area type="monotone" dataKey="noise" stroke="#f97316" strokeWidth={3} fill="transparent" filter="url(#glow-orange)" />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* GRAPH 2: Particulate Matter Variation */}
        <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 lg:p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
            <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Particulate Matter Variation</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">PM2.5 vs PM10 Concentration</p>
            </div>

            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} minTickGap={30} />
                <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} tickFormatter={(val) => `${val} µg`} />
                
                <Tooltip content={<CustomPMTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>

                <Line 
                    type="monotone" dataKey="pm25" name="PM2.5" stroke="#f97316" strokeWidth={3} 
                    dot={{ r: 2, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} 
                    filter="url(#glow-orange)"
                />
                <Line 
                    type="monotone" dataKey="pm10" name="PM10" stroke="#ef4444" strokeWidth={3} 
                    dot={{ r: 2, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }}
                    filter="url(#glow-red)"
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>
        </>
      )}

    </div>
  );
};

export default TrendsDashboard;
