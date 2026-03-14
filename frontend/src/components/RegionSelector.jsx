import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { MapPin, Activity } from 'lucide-react';

const MOCK_DISTRICTS = [
  { name: 'Mumbai City', aqi: 222, status: 'Severe', color: 'bg-rose-500', text: 'text-rose-400' },
  { name: 'Pune', aqi: 208, status: 'Severe', color: 'bg-rose-500', text: 'text-rose-400' },
  { name: 'Nagpur', aqi: 145, status: 'Poor', color: 'bg-orange-500', text: 'text-orange-400' },
  { name: 'Nashik', aqi: 85, status: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' },
  { name: 'Solapur', aqi: 281, status: 'Severe', color: 'bg-rose-500', text: 'text-rose-400' },
  { name: 'Kolhapur', aqi: 45, status: 'Good', color: 'bg-emerald-500', text: 'text-emerald-400' },
  { name: 'Amravati', aqi: 110, status: 'Poor', color: 'bg-orange-500', text: 'text-orange-400' },
  { name: 'Nanded', aqi: 95, status: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' },
];

const RegionSelector = () => {
  const navigate = useNavigate();
  const { setSelectedDistrict } = useRegion();

  const handleSelect = (district) => {
    setSelectedDistrict(district.name);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Activity size={24} />
               </div>
               <span className="text-3xl font-extrabold tracking-tight text-white">EnviroPulse</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-3 tracking-tight">Select Monitoring Region</h1>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
              Choose a district to view environmental intelligence and impact analytics.
            </p>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {MOCK_DISTRICTS.map((district) => (
            <div 
              key={district.name}
              onClick={() => handleSelect(district)}
              className="group cursor-pointer bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.25)] transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1"
            >
                <MapPin className="text-slate-500 group-hover:text-blue-400 transition-colors w-6 h-6 mb-3" />
                <h3 className="text-slate-200 font-bold text-lg mb-1">{district.name}</h3>
                <p className="text-slate-500 text-xs font-semibold mb-4 tracking-wider uppercase">Latest AQI: <span className="text-slate-300">{district.aqi}</span></p>
                
                <div className={`mt-auto w-full py-1.5 rounded-md border border-opacity-30 ${district.color.replace('bg-', 'bg-').replace('500', '950/40')} ${district.color.replace('bg-', 'border-').replace('500', '500/30')} ${district.text}`}>
                   <span className="text-[10px] font-black uppercase tracking-widest">{district.status}</span>
                </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RegionSelector;
