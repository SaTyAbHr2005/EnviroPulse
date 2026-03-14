import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getAQIColor, getNoiseColor, getStressColor } from '../utils/metricColors';
import { useCityTelemetry } from '../hooks/useCityTelemetry';
import {
   AlertTriangle,
   Activity,
   RefreshCw,
   Wind,
   MapPin,
   TrendingUp,
   ShieldAlert,
   Droplets
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

const DISTRICTS = [
   'Mumbai City', 'Pune', 'Nagpur', 'Nashik', 'Solapur',
   'Aurangabad', 'Kolhapur', 'Amravati', 'Nanded'
];

const MainDashboard = () => {
   const { selectedDistrict, setSelectedDistrict } = useRegion();

   // Use centralized telemetry store (SWR pattern)
   const { data: regionData, topPolluted, loading } = useCityTelemetry(selectedDistrict);


   // Render loading state ONLY if we don't even have a cache hit
   if (loading && !regionData) {
      return (
         <div className="flex w-full min-h-screen items-center justify-center font-sans">
            <div className="flex flex-col items-center">
               <RefreshCw className="text-blue-500 animate-spin w-10 h-10 mb-4" />
               <p className="text-slate-400 font-medium tracking-widest uppercase">Connecting to Sensor Network...</p>
            </div>
         </div>
      );
   }

   const { pollutants, stress_score, aqi, noise_db, cause, health_advice } = regionData;

   // Derive Impact percentages based on stress score
   const impacts = {
      agriculture: Math.min(100, Math.round(stress_score * 0.9)),
      tourism: Math.min(100, Math.round(stress_score * 0.8)),
      wildlife: Math.min(100, Math.round(stress_score * 0.65)),
      health: Math.min(100, Math.round(stress_score * 1.1)),
      economy: Math.min(100, Math.round(stress_score * 0.55)),
   };

   const getImpactStatus = (val) => {
      if (val > 80) return { label: 'High Alert', color: 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30' };
      if (val > 65) return { label: 'High Risk', color: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30' };
      if (val > 50) return { label: 'Stressed', color: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30' };
      return { label: 'Stable', color: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30' };
   };

   return (
      <div className="flex w-full min-h-full font-sans max-w-[1600px] mx-auto text-slate-900 dark:text-slate-200 transition-colors duration-300">

         {/* LEFT AREA: MAIN DASHBOARD */}
         <div className="flex-1 pr-6 flex flex-col pl-4 md:pl-8 py-6">

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight mb-1 flex items-center gap-3">
                     Maharashtra Environmental Dashboard
                     <div className="group relative flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border border-blue-400/50 flex items-center justify-center text-blue-400 text-[10px] font-bold cursor-help hover:bg-blue-400/20 transition-colors">i</div>
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-2.5 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-72 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100]">
                           <strong className="text-blue-500 dark:text-blue-400 block mb-1">Sensor Coverage</strong>
                           Environmental metrics shown for each district are calculated as the average of multiple synthetic sensor nodes deployed across high traffic zones, industrial sectors, and residential areas to simulate a realistic environmental monitoring network.
                        </div>
                     </div>
                  </h1>
                  <p className="text-sm text-slate-400 font-medium tracking-wide flex items-center gap-2">
                     <span className="text-blue-400">
                        {regionData.timestamp ? new Date(regionData.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                     </span> – {selectedDistrict}
                  </p>
               </div>

               <div className="flex items-center gap-4">
                  {/* District Selector Dropdown */}
                  <div className="relative">
                     <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="appearance-none bg-white dark:bg-[#1e293b]/60 border border-slate-200 dark:border-blue-500/30 text-slate-800 dark:text-blue-100 text-sm font-bold rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm dark:shadow-inner cursor-pointer"
                     >
                        {DISTRICTS.map(d => <option key={d} value={d} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white uppercase font-bold">{d}</option>)}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                     </div>
                  </div>

                  <div className="px-3 py-2.5 border border-orange-500/30 bg-orange-500/10 rounded-lg text-orange-400 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                     <Wind size={14} /> {cause}
                  </div>
                </div>
             </div>

            {/* Analytics Grid 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

               {/* AQI Card */}
               <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm dark:shadow-lg group transition-colors">
                  <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[40px] transition-all z-0" style={{ backgroundColor: `${getAQIColor(aqi)}20` }}></div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 w-full text-left z-10 flex items-center gap-2"><Wind size={14} style={{ color: getAQIColor(aqi) }} /> AQI LEVEL</h3>

                  <div className="relative w-32 h-32 rounded-full border-[6px] border-slate-100 dark:border-[#1e293b] flex items-center justify-center z-10 shadow-inner">
                     {/* CSS Half-circle indicator mask mock */}
                     <div
                        className="absolute inset-[-6px] rounded-full border-[6px] border-transparent"
                        style={{ transform: `rotate(${Math.min(180, (aqi / 500) * 180 - 45)}deg)`, borderTopColor: getAQIColor(aqi), borderRightColor: getAQIColor(aqi) }}
                     ></div>
                     <div className="text-center font-sans tracking-tight">
                        <span className="text-4xl font-black text-slate-900 dark:text-white">{Math.round(aqi)}</span>
                     </div>
                  </div>
                  <div className="mt-6 px-4 py-1.5 border rounded-full z-10" style={{ borderColor: getAQIColor(aqi), backgroundColor: `${getAQIColor(aqi)}15`, color: getAQIColor(aqi) }}>
                     <span className="text-xs font-black uppercase">{aqi > 200 ? 'Severe' : aqi > 100 ? 'Poor' : 'Moderate'}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest z-10">District Average</div>
               </div>

               {/* Noise Level */}
               <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-sm dark:shadow-lg group transition-colors">
                  <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[40px] z-0" style={{ backgroundColor: `${getNoiseColor(noise_db)}20` }}></div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-2 z-10 flex items-center gap-2"><Activity size={14} style={{ color: getNoiseColor(noise_db) }} /> NOISE PREDICTION</h3>
                  <div className="flex-1 flex flex-col justify-center z-10">
                     <p className="text-5xl font-black text-slate-900 dark:text-white">{Math.round(noise_db)} <span className="text-lg font-medium text-slate-400 dark:text-slate-500">dB</span></p>
                     <p className="text-xs font-bold mt-2" style={{ color: getNoiseColor(noise_db) }}>Acoustic Stress Detected</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Aggregated from sensor network</p>
                  </div>
               </div>

               {/* Stress Index */}
               <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm dark:shadow-lg group transition-colors">
                  <div className="absolute top-0 right-0 w-[80%] h-[80%] rounded-full blur-[50px] z-0" style={{ backgroundColor: `${getStressColor(stress_score)}20` }}></div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 w-full text-left z-10 flex items-center gap-2"><TrendingUp size={14} style={{ color: getStressColor(stress_score) }} /> ENVIRONMENTAL STRESS</h3>

                  <div className="relative w-32 h-20 overflow-hidden rounded-t-full border-b-[6px] border-slate-100 dark:border-[#1e293b] z-10 flex flex-col items-center justify-end pb-2">
                     <div
                        className="absolute top-0 left-0 w-32 h-32 rounded-full border-[8px] border-b-transparent border-r-transparent origin-center transition-transform duration-1000"
                        style={{ transform: `rotate(${Math.min(135, (stress_score / 100) * 180 - 45)}deg)`, borderTopColor: getStressColor(stress_score), borderLeftColor: getStressColor(stress_score) }}
                     ></div>
                     <span className="text-3xl font-black text-slate-900 dark:text-white">{stress_score.toFixed(1)}</span>
                  </div>
                  <div className="mt-4 px-4 py-1.5 border rounded-full z-10" style={{ borderColor: getStressColor(stress_score), backgroundColor: `${getStressColor(stress_score)}15` }}>
                     <span className="text-xs font-black uppercase" style={{ color: getStressColor(stress_score) }}>{regionData.stress_category}</span>
                  </div>
                  <div className="mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest z-10 text-center max-w-[90%]">Derived from AQI, Noise, and Traffic</div>
               </div>

               {/* Pollution Source */}
               <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 flex flex-col relative overflow-hidden shadow-sm dark:shadow-lg transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent z-0"></div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-auto z-10 flex items-center gap-2"><Droplets size={14} className="text-indigo-400" /> POLLUTION SOURCE</h3>
                  <div className="z-10 mt-6">
                     <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Detected Source</p>
                     <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{cause}</p>
                  </div>
               </div>
            </div>

            {/* Pollutant Concentration Grid */}
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
               <ShieldAlert size={16} className="text-slate-400" /> Pollutant Concentrations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
               {Object.entries(pollutants).map(([key, value]) => {
                  const val = value.toFixed(1);
                  // Simple threshold logic for colors
                  const isRed = val > 100;
                  const isYellow = val > 40 && val <= 100;
                  const colorClass = isRed ? 'bg-rose-500' : isYellow ? 'bg-amber-500' : 'bg-emerald-500';
                  const unit = key === 'co' ? 'mg/m³' : 'µg/m³';

                  return (
                     <div key={key} className="bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 flex flex-col shadow-sm hover:bg-slate-50 dark:hover:bg-[#1e293b]/60 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider transition-colors">{key}</span>
                           <div className={`w-2 h-2 rounded-full ${colorClass} shadow-[0_0_8px_currentColor]`}></div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-auto">
                           <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{val}</span>
                           <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium transition-colors">{unit}</span>
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Top Polluted Regions */}
            <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm dark:shadow-lg transition-colors">
               <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <MapPin size={14} className="text-rose-500" /> TOP POLLUTED REGIONS – MAHARASHTRA
               </h3>
               <div className="flex flex-wrap gap-3">
                  {topPolluted.length > 0 ? topPolluted.map((reg, idx) => (
                     <div key={reg.name} className="flex-1 min-w-[140px] bg-slate-50 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 flex flex-col relative transition-colors">
                        <span className="absolute top-3 left-3 text-[10px] font-black text-slate-400 dark:text-slate-600">#{idx + 1}</span>
                        <span className="text-center font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">{reg.name}</span>
                        <span className="text-center text-2xl font-black mb-1" style={{ color: getAQIColor(reg.val) }}>{Math.round(reg.val)}</span>
                        <span className="text-center text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded px-1.5 py-0.5 mx-auto">{reg.cat}</span>
                     </div>
                  )) : (
                     <div className="text-sm text-slate-400 p-4 border border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl w-full text-center">Awaiting regional sensor data...</div>
                  )}
               </div>
            </div>

         </div>

         {/* RIGHT AREA: IMPACT SIDEBAR */}
         <div className="w-[380px] shrink-0 bg-white/95 dark:bg-[#060b13]/80 border-l border-slate-200 dark:border-slate-800 flex flex-col p-6 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] dark:shadow-[-10px_0_30px_rgba(0,0,0,0.3)] z-10 sticky top-0 max-h-screen overflow-y-auto transition-colors">

            <div className="mb-8">
               <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
                  <Activity className="text-blue-500 w-5 h-5" /> Impact Intelligence
               </h2>
               <p className="text-xs text-slate-500 dark:text-slate-500 font-medium mt-2 leading-relaxed transition-colors">
                  Sector level impact derived from environmental stress in <span className="text-blue-500 dark:text-blue-400">{selectedDistrict}</span>.
               </p>
            </div>

            {/* Sector Bars */}
            <div className="space-y-5 flex-1">

               {/* Agriculture */}
               <div className="group">
                  <div className="flex justify-between items-end mb-1.5">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase transition-colors">Agriculture</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{impacts.agriculture}%</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getImpactStatus(impacts.agriculture).color}`}>
                           {getImpactStatus(impacts.agriculture).label}
                        </span>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#1e293b] rounded-full overflow-hidden shadow-inner transition-colors">
                     <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${impacts.agriculture}%` }}></div>
                  </div>
               </div>

               {/* Tourism */}
               <div className="group">
                  <div className="flex justify-between items-end mb-1.5">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase transition-colors">Tourism</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">{impacts.tourism}%</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getImpactStatus(impacts.tourism).color}`}>
                           {getImpactStatus(impacts.tourism).label}
                        </span>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#1e293b] rounded-full overflow-hidden shadow-inner transition-colors">
                     <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${impacts.tourism}%` }}></div>
                  </div>
               </div>

               {/* Wildlife */}
               <div className="group">
                  <div className="flex justify-between items-end mb-1.5">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase transition-colors">Wildlife</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-600 dark:text-amber-500">{impacts.wildlife}%</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getImpactStatus(impacts.wildlife).color}`}>
                           {getImpactStatus(impacts.wildlife).label}
                        </span>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#1e293b] rounded-full overflow-hidden shadow-inner transition-colors">
                     <div className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)] dark:shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${impacts.wildlife}%` }}></div>
                  </div>
               </div>

               {/* Public Health */}
               <div className="group">
                  <div className="flex justify-between items-end mb-1.5">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase transition-colors">Public Health</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-rose-600 dark:text-rose-500">{impacts.health}%</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getImpactStatus(impacts.health).color}`}>
                           {getImpactStatus(impacts.health).label}
                        </span>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#1e293b] rounded-full overflow-hidden shadow-inner transition-colors">
                     <div className="h-full bg-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(225,29,72,0.3)] dark:shadow-[0_0_10px_rgba(225,29,72,0.5)]" style={{ width: `${impacts.health}%` }}></div>
                  </div>
               </div>

               {/* Economy */}
               <div className="group">
                  <div className="flex justify-between items-end mb-1.5">
                     <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase transition-colors">Economy</span>
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-600 dark:text-purple-500">{impacts.economy}%</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getImpactStatus(impacts.economy).color}`}>
                           {getImpactStatus(impacts.economy).label}
                        </span>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#1e293b] rounded-full overflow-hidden shadow-inner transition-colors">
                     <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.3)] dark:shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: `${impacts.economy}%` }}></div>
                  </div>
               </div>

            </div>

            {/* Health Advisory Panel Bottom */}
            <div className="mt-8 bg-white dark:bg-[#0f172a]/80 backdrop-blur-md border border-slate-200 dark:border-rose-900/40 rounded-xl p-5 relative overflow-hidden shadow-sm dark:shadow-[0_0_20px_rgba(225,29,72,0.05)] transition-colors">
               <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="text-rose-500 w-3.5 h-3.5" /> Health Advisory
               </h3>
               <span className="block text-lg font-black text-rose-500 mb-1">{impacts.health > 75 ? 'Emergency' : impacts.health > 50 ? 'Warning' : 'Normal'}</span>
               <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed transition-colors">
                  {health_advice}
               </p>
            </div>

         </div>

      </div>
   );
};

export default MainDashboard;
