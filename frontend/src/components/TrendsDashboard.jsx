import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

// Mocked historical time-series data
const trajectoryData = [
  { time: '05:51 PM', aqi: 105, stress: 30, noise: 50 },
  { time: '06:02 PM', aqi: 120, stress: 45, noise: 55 },
  { time: '06:21 PM', aqi: 155, stress: 55, noise: 60 },
  { time: '06:45 PM', aqi: 182, stress: 68, noise: 75 },
  { time: '07:15 PM', aqi: 210, stress: 80, noise: 82 },
  { time: '07:40 PM', aqi: 190, stress: 75, noise: 78 },
  { time: '08:00 PM', aqi: 160, stress: 60, noise: 65 },
];

const pmData = [
  { time: '05:51 PM', pm25: 45, pm10: 89 },
  { time: '06:02 PM', pm25: 55, pm10: 105 },
  { time: '06:21 PM', pm25: 75, pm10: 140 },
  { time: '06:45 PM', pm25: 95, pm10: 165 },
  { time: '07:15 PM', pm25: 120, pm10: 190 },
  { time: '07:40 PM', pm25: 105, pm10: 175 },
  { time: '08:00 PM', pm25: 85, pm10: 145 },
];

// Custom Tooltip for Graph 1
const CustomTrajectoryTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl">
        <p className="text-slate-300 font-bold mb-3 border-b border-slate-700 pb-2">Time: {label}</p>
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
        <p className="text-slate-300 font-bold mb-3 border-b border-slate-700 pb-2">Time: {label}</p>
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
  return (
    <div className="w-full min-h-full font-sans max-w-7xl mx-auto text-slate-200 pb-12">
      
      {/* HEADER SECTION */}
      <div className="mb-8 p-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">Environmental Trends</h1>
        <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide max-w-3xl">
          Real-time analytical view of environmental conditions and urban stress patterns.
        </p>
      </div>

      {/* GRAPH 1: Environmental Stress Trajectory */}
      <div className="bg-[#0f172a]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 lg:p-8 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] mb-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> 
              Environmental Stress Trajectory
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Trajectory Analysis</span>
              <span className="px-2.5 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                Increasing
              </span>
            </div>
          </div>

          {/* Metrics Top Right */}
          <div className="flex gap-6 bg-[#1e293b]/40 border border-slate-700/40 rounded-xl p-4">
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">Current AQI</div>
              <div className="text-lg font-black text-white">99.9</div>
              <div className="text-[10px] text-slate-500 mt-1">24h Peak: 434</div>
            </div>
            <div className="w-px bg-slate-700/50"></div>
            <div>
              <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold mb-1">Current Stress</div>
              <div className="text-lg font-black text-white">52</div>
              <div className="text-[10px] text-slate-500 mt-1">24h Peak: 92</div>
            </div>
            <div className="w-px bg-slate-700/50"></div>
            <div>
              <div className="text-[10px] text-orange-400 uppercase tracking-widest font-bold mb-1">Current Noise</div>
              <div className="text-lg font-black text-white">71 <span className="text-xs font-medium text-slate-400">dB</span></div>
              <div className="text-[10px] text-slate-500 mt-1">24h Peak: 88 dB</div>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {/* AQI Glow */}
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Stress Glow */}
                <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Noise Glow */}
                <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} minTickGap={20} />
              <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} domain={[0, 300]} hide />
              
              <Tooltip content={<CustomTrajectoryTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              {/* Threshold Background Bands for AQI */}
              <ReferenceArea y1={0} y2={50} fill="#10b981" fillOpacity={0.03} />    {/* Good */}
              <ReferenceArea y1={50} y2={100} fill="#f59e0b" fillOpacity={0.04} />  {/* Moderate */}
              <ReferenceArea y1={100} y2={200} fill="#f97316" fillOpacity={0.05} /> {/* Poor */}
              <ReferenceArea y1={200} y2={300} fill="#ef4444" fillOpacity={0.06} /> {/* Hazardous */}

              {/* Multi-Line Data */}
              <Area 
                type="monotone" dataKey="aqi" stroke="#06b6d4" strokeWidth={3} fill="transparent" 
                filter="url(#glow-cyan)"
              />
              <Area 
                type="monotone" dataKey="stress" stroke="#a855f7" strokeWidth={3} fill="transparent" 
                filter="url(#glow-purple)"
              />
              <Area 
                type="monotone" dataKey="noise" stroke="#f97316" strokeWidth={3} fill="transparent" 
                filter="url(#glow-orange)"
              />
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
            <LineChart data={pmData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                 <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} minTickGap={20} />
              <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} tickFormatter={(val) => `${val} µg`} />
              
              <Tooltip content={<CustomPMTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>

              <Line 
                type="monotone" dataKey="pm25" name="PM2.5" stroke="#f97316" strokeWidth={3} 
                dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} 
                filter="url(#glow-orange)"
              />
              <Line 
                type="monotone" dataKey="pm10" name="PM10" stroke="#ef4444" strokeWidth={3} 
                dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }}
                filter="url(#glow-red)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default TrendsDashboard;
