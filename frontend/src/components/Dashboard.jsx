import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Activity, Wind, AlertTriangle, AlertCircle, Thermometer, Droplets } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import MapWidget from './MapWidget';

const BACKEND_URL = 'http://localhost:8000';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/analytics/latest`);
      
      // The backend returns an array of objects
      const dataArray = response.data;
      
      // Group by district
      const districtsMap = {};
      
      dataArray.forEach(sensor => {
        if (!districtsMap[sensor.district]) {
          districtsMap[sensor.district] = {
            district: sensor.district,
            sensors: []
          };
        }
        
        districtsMap[sensor.district].sensors.push({
          sensor_name: sensor.sensor_name,
          latitude: sensor.latitude,
          longitude: sensor.longitude,
          latest_reading: {
            pm25: null, // Since the backend is not directly giving pm25/no2/traffic in this endpoint,
            no2: null,  // we'll use placeholder or extract from rules if possible.
            traffic_density: null 
          },
          predictions: {
            predicted_aqi: sensor.aqi,
            predicted_noise_dba: sensor.noise_db
          },
          rules: {
            derived_cause: sensor.cause,
            health_advisory: sensor.health_advice,
            stress_index: sensor.stress_score,
            stress_category: sensor.stress_category
          }
        });
      });

      const districtsData = Object.values(districtsMap);
      
      setData(districtsData);
      setLastUpdated(dataArray.length > 0 ? new Date(dataArray[0].timestamp).toLocaleTimeString() : new Date().toLocaleTimeString());
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      // Wait for backend to be online
      setError("Failed to connect to monitoring agent...");
      // Don't set loading to false so we keep polling attempts
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const intervalId = setInterval(fetchAnalytics, 5000); // 5s interval

    return () => clearInterval(intervalId);
  }, []);

  // Helper for Stress color mapping (0-100 scale)
  const getStressColor = (stress) => {
    if (stress <= 20) return 'text-emerald-400';
    if (stress <= 40) return 'text-lime-400';
    if (stress <= 60) return 'text-yellow-400';
    if (stress <= 80) return 'text-orange-400';
    if (stress < 100) return 'text-red-400';
    return 'text-rose-500';
  };
  
  const getStressBgColor = (stress) => {
    if (stress <= 20) return 'bg-emerald-500/10 border-emerald-500/20';
    if (stress <= 40) return 'bg-lime-500/10 border-lime-500/20';
    if (stress <= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (stress <= 80) return 'bg-orange-500/10 border-orange-500/20';
    if (stress < 100) return 'bg-red-500/10 border-red-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  if (loading && !data.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <Activity className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-semibold tracking-wider">Establishing Uplink...</h2>
        {error && <p className="text-red-400 mt-2 text-sm max-w-md text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full h-full font-sans">
      
      {/* Top Level Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Overall Stress */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 font-medium">Avg. Stress Index</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.sensors[0].rules?.stress_index || 0), 0) / data.length) : '--'}
            </p>
          </div>
          <Thermometer className="w-8 h-8 text-blue-500/70" />
        </div>

        {/* Card 2: Average Noise */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 font-medium">Avg. Noise (dBA)</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">
              {data.length > 0 ? (data.reduce((sum, d) => sum + d.sensors[0].predictions.predicted_noise_dba, 0) / data.length).toFixed(1) : '--'}
            </p>
          </div>
          <Droplets className="w-8 h-8 text-amber-500/70" />
        </div>

        {/* Card 3: Active Sensors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 font-medium">Active Sensors</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{data.length}</p>
          </div>
          <Activity className="w-8 h-8 text-emerald-500/70" />
        </div>

        {/* Card 4: Last Updated */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-sm text-slate-400 font-medium">Last Sync</p>
            <p className="text-xl font-bold text-slate-300 mt-1">{lastUpdated || 'Pending'}</p>
          </div>
          <Wind className="w-8 h-8 text-slate-500/70" />
        </div>
      </div>
      
      {/* ERROR BANNER */}
      {error && (
        <div className="mb-8 p-4 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error} (Retrying in background...)</p>
        </div>
      )}

      {/* GEO-SPATIAL MAP WIDGET */}
      <div className="mb-8 w-full h-[550px] lg:h-[650px] flex flex-col">
        {data.length > 0 ? (
           <MapWidget data={data} />
        ) : (
           <div className="w-full h-full rounded-xl border border-slate-800 bg-slate-900/50 animate-pulse flex items-center justify-center">
             <span className="text-slate-500 font-mono text-sm tracking-widest">AWAITING SATELLITE TELEMETRY...</span>
           </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {data.map((districtNode, index) => {
          // Flatten latest data from the sensor array for display
          // We assume displaying the first primary sensor for the district in the card
          const primarySensor = districtNode.sensors[0]; 
          const readings = primarySensor.latest_reading;
          const predictions = primarySensor.predictions || {};
          const rules = primarySensor.rules || {};
          
          return (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/50 transition-all hover:border-slate-700">
              
              {/* Card Header */}
              <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Activity className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">{districtNode.district}</h2>
                    <p className="text-xs text-slate-400 font-mono tracking-widest">{primarySensor.sensor_name}</p>
                  </div>
                </div>
                
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStressBgColor(rules?.stress_index || 0)}`}>
                  <Thermometer className={`w-4 h-4 ${getStressColor(rules?.stress_index || 0)}`} />
                  <span className={`font-bold ${getStressColor(rules?.stress_index || 0)}`}>
                    Stress {Math.round(rules?.stress_index || 0)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column - Metrics */}
                <div className="space-y-6">
                  {/* Primary Telemetry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><CloudDustIcon /> PM 2.5</p>
                      <p className="text-2xl font-bold text-slate-200">{readings?.pm25?.toFixed(1) || '--'} <span className="text-xs font-normal text-slate-500">µg/m³</span></p>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">NO2 Level</p>
                      <p className="text-2xl font-bold text-slate-200">{readings?.no2?.toFixed(1) || '--'} <span className="text-xs font-normal text-slate-500">ppb</span></p>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Traffic Flow</p>
                      <p className="text-2xl font-bold text-slate-200">{readings?.traffic_density || '--'} <span className="text-xs font-normal text-slate-500">v/m</span></p>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Noise Out</p>
                      <p className="text-2xl font-bold text-amber-400">{predictions?.predicted_noise_dba?.toFixed(1) || '--'} <span className="text-xs font-normal text-slate-500">dBA</span></p>
                    </div>
                  </div>
                  
                  {/* AI Inferences */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30">
                      <div className="mt-0.5"><Settings className="w-5 h-5 text-indigo-400" /></div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Causal Inference</h4>
                        <p className="text-sm text-slate-300 leading-snug">
                          {rules?.derived_cause || "Analyzing base metrics..."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-orange-950/20 border border-orange-900/30">
                      <div className="mt-0.5"><AlertCircle className="w-5 h-5 text-orange-400" /></div>
                      <div>
                        <h4 className="text-xs font-bold text-orange-300 uppercase tracking-widest mb-1">Action Advisory</h4>
                        <p className="text-sm text-slate-300 leading-snug">
                          {rules?.health_advisory || "Standard operational procedures apply."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Forecast Graph & Index Mode */}
                <div className="flex flex-col">
                  {/* Stress Index Mode */}
                  <div className="mb-6 p-5 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Environmental Stress Index</p>
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-500">
                        {rules?.stress_index?.toFixed(0) || '0'}
                      </span>
                      <span className="text-slate-500 font-mono mb-2">/ 100</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-emerald-400 via-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
                         style={{ width: `${Math.min(rules?.stress_index || 0, 100)}%` }}
                       ></div>
                    </div>
                  </div>
                  
                  {/* Small Chart for aesthetic layout */}
                  <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col min-h-[160px]">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex justify-between">
                      <span>1H Stress Forecast</span>
                      <span className="text-indigo-400">ML Engine</span>
                    </p>
                    {predictions?.forecast_aqi_1hr && predictions?.predicted_aqi ? (
                       <div className="flex-1 flex items-end w-full pb-2">
                          <ForecastChart 
                              currentValue={rules?.stress_index || 0} 
                              forecastValue={(rules?.stress_index || 0) * (predictions.forecast_aqi_1hr / predictions.predicted_aqi)} 
                          />
                       </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-600 font-mono">
                        Awaiting sequential data vectors...
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// SVG Icon Helper
const CloudDustIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19V17h3" />
    <path d="M17.5 13H21.5" />
    <path d="M17.5 9v2M12 17v2" />
    <path d="M12 13V9" />
    <path d="M6.5 17v2M6.5 13V9" />
    <path d="M6.5 9A5.5 5.5 0 0 1 12 3.5c2.3 0 4.3 1.4 5.2 3.5A3.5 3.5 0 0 1 17.5 14H6.5A3.5 3.5 0 0 1 6.5 9Z" />
  </svg>
);

// Mini chart component for showing trend difference
const ForecastChart = ({ currentValue, forecastValue }) => {
  if (!currentValue || !forecastValue) return null;
  
  // Dummy data generated around current and forecast for a visual spline
  const data = [
    { time: 'Now', val: currentValue },
    { time: '+15m', val: currentValue + (forecastValue - currentValue) * 0.25 },
    { time: '+30m', val: currentValue + (forecastValue - currentValue) * 0.5 },
    { time: '+45m', val: currentValue + (forecastValue - currentValue) * 0.75 },
    { time: '+1Hr', val: forecastValue },
  ];
  
  const isIncreasing = forecastValue > currentValue;
  const strokeColor = isIncreasing ? '#f87171' : '#34d399'; // red-400 or emerald-400
  const fillColor = isIncreasing ? '#7f1d1d' : '#064e3b';
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
          itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="val" stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Dashboard;
