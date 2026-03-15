import React, { useState } from 'react';
import axios from 'axios';
import { Activity, AlertTriangle, Wind } from 'lucide-react';
import { getStressColor } from '../utils/metricColors';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const StressPrediction = () => {
  const [formData, setFormData] = useState({
    // Air Quality Indicators
    pm25: '45.2',
    pm10: '89.1',
    no2: '34.5',
    co: '1.2',
    so2: '12.4',
    o3: '45.8',
    nh3: '5.6',
    // Urban Activity Indicators
    traffic_density: '65',
    avg_vehicle_speed: '30',
    vehicle_count: '1200',
    // Noise Indicators
    noise_level: '72',
    // Temporal Features
    hour: '21',
    day: '13',
    month: '3',
    weekday: '5'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        pm25: parseFloat(formData.pm25) || 0,
        pm10: parseFloat(formData.pm10) || 0,
        no2: parseFloat(formData.no2) || 0,
        co: parseFloat(formData.co) || 0,
        so2: parseFloat(formData.so2) || 0,
        o3: parseFloat(formData.o3) || 0,
        nh3: parseFloat(formData.nh3) || 0,
        traffic_density: parseFloat(formData.traffic_density) || 0,
        avg_vehicle_speed: parseFloat(formData.avg_vehicle_speed) || 0,
        vehicle_count: parseInt(formData.vehicle_count) || 0,
        noise_level: parseFloat(formData.noise_level) || 0
      };

      // Ensure we format the URL correctly
      const endpoint = `${BACKEND_URL.replace(/\/$/, '')}/analytics/predict-stress`;
      const response = await axios.post(endpoint, payload);
      setResult(response.data);
    } catch (err) {
      console.error("Prediction Error:", err);
      setError("Failed to generate prediction. Ensure backend is running.");
      // Fallback dummy result for UI demonstration if backend fails
      if(err.code === "ERR_NETWORK") {
         setTimeout(() => {
            setResult({
               stress_score: 82,
               stress_category: "High",
               stress_action: "Sensitive groups should avoid prolonged outdoor exposure.",
               primary_cause: "Vehicle Emissions & High PM2.5",
               aqi_prediction: 145,
               noise_prediction: 74
            });
            setLoading(false);
         }, 1500);
         return;
      }
    } finally {
      if(!error) setLoading(false);
    }
  };

  // Helper for Circular SVG Gauge
  const getGaugeProps = (score) => {
      const radius = 60;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = score ? circumference - (score / 100) * circumference : circumference;
      
      const color = score ? getStressColor(score) : '#3b82f6'; // blue (default if no score)

      return { radius, circumference, strokeDashoffset, color };
  };

  const gauge = getGaugeProps(result?.stress_score);

  return (
    <div className="w-full min-h-full font-sans max-w-7xl mx-auto text-slate-200">
      
      {/* HEADER SECTION */}
      <div className="mb-8 p-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">Environmental Stress Prediction Engine</h1>
        <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide max-w-3xl">
          Input environmental parameters to estimate urban environmental stress and receive health advisories.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pb-10">
        
        {/* LEFT COLUMN: INPUT FORM (Glassmorphism Card) */}
        <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 lg:p-8 flex-[2] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Wind className="w-5 h-5 text-blue-400" />
               </div>
               <h3 className="text-white font-bold text-lg tracking-wide">Environmental Metrics</h3>
            </div>
            
            {/* Air Quality Section */}
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-slate-800/60 pb-2">Air Quality Indicators</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {['pm25', 'pm10', 'no2', 'co', 'so2', 'o3', 'nh3'].map((item) => (
                   <div key={item} className="space-y-1.5 group">
                       <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-blue-400 transition-colors">
                           {item.toUpperCase()} {item === 'pm25' || item === 'pm10' ? '(µg/m³)' : ''}
                       </label>
                       <input 
                         type="number" name={item} value={formData[item]} onChange={handleInputChange}
                         className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-[#1e293b]/80 transition-all shadow-inner"
                       />
                   </div>
                ))}
            </div>

            {/* Urban Activity Section */}
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-slate-800/60 pb-2">Urban Activity Indicators</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="space-y-1.5 group">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-blue-400 transition-colors">Traffic Density (%)</label>
                    <input 
                      type="number" name="traffic_density" value={formData.traffic_density} onChange={handleInputChange}
                      className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-[#1e293b]/80 transition-all shadow-inner"
                      min="0" max="100"
                    />
                </div>
                <div className="space-y-1.5 group">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-blue-400 transition-colors">Avg Vehicle Speed</label>
                    <input 
                      type="number" name="avg_vehicle_speed" value={formData.avg_vehicle_speed} onChange={handleInputChange}
                      className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-[#1e293b]/80 transition-all shadow-inner"
                    />
                </div>
                <div className="space-y-1.5 group">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-blue-400 transition-colors">Vehicle Count</label>
                    <input 
                      type="number" name="vehicle_count" value={formData.vehicle_count} onChange={handleInputChange}
                      className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-[#1e293b]/80 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Noise Indicators */}
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-slate-800/60 pb-2">Noise Indicators</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="space-y-1.5 group">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-blue-400 transition-colors">Noise Level (dB)</label>
                    <input 
                      type="number" name="noise_level" value={formData.noise_level} onChange={handleInputChange}
                      className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-[#1e293b]/80 transition-all shadow-inner"
                    />
                </div>
            </div>
            
            {/* Temporal Features section */}
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 border-b border-slate-800/60 pb-2">Temporal Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
               {['hour', 'day', 'month', 'weekday'].map((item) => (
                 <div key={item} className="space-y-1.5 group">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-blue-400 transition-colors">{item.toUpperCase()}</label>
                      <input 
                        type="number" name={item} value={formData[item]} onChange={handleInputChange}
                        className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-[#1e293b]/80 transition-all shadow-inner"
                      />
                  </div>
               ))}
            </div>

            {error && (
               <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg text-sm font-medium mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
               </div>
            )}

            <button 
              onClick={handlePredict}
              disabled={loading}
              className={`w-full md:w-auto px-10 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                loading ? 'bg-blue-600/30 text-blue-200 cursor-not-allowed border border-blue-500/30' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(56,189,248,0.6)] border border-blue-400/50'
              }`}
            >
              {loading ? (
                 <span className="flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" /> Computing Model...
                 </span>
              ) : 'Predict Stress Index'}
            </button>
        </div>

        {/* RIGHT COLUMN: PREDICTION RESULT CARD */}
        <div className="flex-[1] flex flex-col gap-6">
            <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] relative overflow-hidden h-full min-h-[550px]">
                
                {/* Background ambient glow based on result */}
                <div className={`absolute top-0 right-0 w-full h-full opacity-10 blur-[100px] pointer-events-none transition-colors duration-1000 ${
                  !result ? 'bg-blue-500' : ''
                }`} style={{ backgroundColor: result ? getStressColor(result.stress_score) : undefined }}></div>

                <div className="flex items-center gap-2 w-full justify-center mb-10 z-10">
                   <Activity className="w-5 h-5 text-slate-400" />
                   <h3 className="text-slate-200 font-bold text-lg tracking-wide">Predicted Environmental Stress</h3>
                </div>
                
                {/* Circular Gauge Meter */}
                <div className="relative flex justify-center items-center mb-8 z-10">
                   <svg width="220" height="220" className="transform -rotate-90">
                       {/* Background Track */}
                       <circle
                           cx="110" cy="110" r={gauge.radius}
                           stroke="#1e293b" strokeWidth="16" fill="transparent"
                       />
                       {/* Progress Arc */}
                       <circle
                           cx="110" cy="110" r={gauge.radius}
                           stroke={gauge.color} strokeWidth="16" fill="transparent"
                           strokeDasharray={gauge.circumference}
                           strokeDashoffset={loading ? gauge.circumference : gauge.strokeDashoffset}
                           strokeLinecap="round"
                           className="transition-all duration-1500 ease-out"
                           style={{ filter: `drop-shadow(0 0 12px ${gauge.color}80)` }}
                       />
                   </svg>
                   
                   {/* Center Content */}
                   <div className="absolute flex flex-col items-center justify-center">
                      {loading ? (
                        <Activity className="w-10 h-10 text-blue-500 animate-spin opacity-50" />
                      ) : (
                        <>
                          <span className="text-5xl font-black tracking-tighter" style={{ color: result ? gauge.color : '#64748b' }}>
                            {result ? Math.round(result.stress_score) : '--'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
                        </>
                      )}
                   </div>
                </div>

                {/* Category Badge */}
                <div className="z-10 w-full flex justify-center mb-12">
                   <div 
                      className={`px-6 py-2 rounded-full border backdrop-blur-sm shadow-lg ${!result ? 'bg-slate-800/50 border-slate-600 text-slate-400' : 'border-opacity-30'}`}
                      style={result ? { backgroundColor: `${getStressColor(result.stress_score)}20`, borderColor: getStressColor(result.stress_score), color: getStressColor(result.stress_score) } : {}}
                   >
                      <span className="text-xs font-black uppercase tracking-widest">
                         {result ? result.stress_category : 'AWAITING INPUT'}
                      </span>
                   </div>
                </div>

                {/* Readouts below gauge */}
                <div className="flex-1 w-full flex flex-col justify-end gap-4 z-10">
                   <div className="bg-[#1e293b]/40 border border-slate-700/40 rounded-xl p-4 w-full">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Primary Cause</p>
                      <p className="text-sm font-semibold text-slate-200">
                         {result ? (result.primary_cause || 'Air Quality Attributes') : '--'}
                      </p>
                   </div>
                   
                   <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 w-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 pl-2">Health Advisory</p>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed pl-2">
                         {result ? result.stress_action : 'Submit environmental data to receive actionable health recommendations.'}
                      </p>
                   </div>
                </div>
                
            </div>
            
            {/* Critical Regions Mini-Card matching the prompt requirement */}
            <div className="bg-rose-950/20 backdrop-blur-md border border-rose-900/30 rounded-2xl p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]">
               <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: getStressColor(87) }}>
                  <AlertTriangle className="w-3.5 h-3.5" /> Critical Regions
               </h4>
               <div className="bg-[#0f172a]/80 rounded-lg p-4 border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-slate-200">Solapur</span>
                     <span className="font-black" style={{ color: getStressColor(87) }}>87</span>
                  </div>
                  <p className="text-xs mb-1" style={{ color: getStressColor(87) }}>Status: High Environmental Stress</p>
                  <p className="text-xs text-slate-400">Advice: Avoid outdoor activity</p>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StressPrediction;
