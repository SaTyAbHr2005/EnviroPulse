import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRegion } from '../context/RegionContext';
import { MapPin, Activity, RefreshCw } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const RegionSelector = () => {
  const navigate = useNavigate();
  const { setSelectedDistrict } = useRegion();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/analytics/latest`);
        // Map backend data to UI format
        const mappedData = response.data.map(d => ({
          name: d.district,
          aqi: d.aqi,
          status: getStatusFromAQI(d.aqi),
          color: getColorFromAQI(d.aqi),
          text: getTextColorFromAQI(d.aqi)
        }));
        setDistricts(mappedData);
      } catch (err) {
        console.error("Failed to fetch live districts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
    const interval = setInterval(fetchDistricts, 5000); // Dynamic update on selector too
    return () => clearInterval(interval);
  }, []);

  const getStatusFromAQI = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Poor';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Severe';
    return 'Hazardous';
  };

  const getColorFromAQI = (aqi) => {
    if (aqi <= 50) return 'bg-emerald-500';
    if (aqi <= 100) return 'bg-amber-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-rose-600';
    return 'bg-purple-600';
  };

  const getTextColorFromAQI = (aqi) => {
    if (aqi <= 50) return 'text-emerald-400';
    if (aqi <= 100) return 'text-amber-400';
    if (aqi <= 150) return 'text-orange-400';
    if (aqi <= 200) return 'text-red-400';
    if (aqi <= 300) return 'text-rose-400';
    return 'text-purple-400';
  };

  const handleSelect = (districtName) => {
    setSelectedDistrict(districtName);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-200">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl w-full z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Activity size={24} />
               </div>
               <span className="text-3xl font-extrabold tracking-tight text-white uppercase tracking-widest">EnviroPulse</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 mb-3 tracking-tight">Select Monitoring Region</h1>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
              Real-time environmental intelligence matrix powered by distributed sensor networks.
            </p>
        </div>

        {/* Dynamic Grid */}
        {loading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing with Grid...</span>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {districts.map((district) => (
              <div 
                key={district.name}
                onClick={() => handleSelect(district.name)}
                className="group cursor-pointer bg-[#0f172a]/40 backdrop-blur-xl border border-slate-700/30 hover:border-blue-500/50 rounded-2xl p-6 shadow-2xl transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-2 ring-1 ring-white/5 hover:ring-blue-500/20"
              >
                  <MapPin className="text-slate-500 group-hover:text-blue-400 transition-all duration-300 w-6 h-6 mb-4" />
                  <h3 className="text-white font-black text-xl mb-1 tracking-tight">{district.name}</h3>
                  <div className="flex flex-col mb-5">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Live AQI Index</span>
                    <span className="text-2xl font-black text-slate-100">{district.aqi}</span>
                  </div>
                  
                  <div className={`mt-auto w-full py-2.5 rounded-xl border border-opacity-30 flex items-center justify-center gap-2 ${district.color.replace('bg-', 'bg-').replace('500', '950/40').replace('600', '950/40')} ${district.color.replace('bg-', 'border-').replace('500', '500/30').replace('600', '600/30')} ${district.text}`}>
                     <div className={`w-2 h-2 rounded-full ${district.color} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div>
                     <span className="text-[10px] font-black uppercase tracking-widest">{district.status}</span>
                  </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default RegionSelector;
