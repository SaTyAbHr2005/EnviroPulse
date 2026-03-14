import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getStressColor } from '../utils/metricColors';

function fixLeafletIcon() {
    const L = window.L || require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

const MapWidget = ({ data, sensors = [] }) => {
  useEffect(() => { fixLeafletIcon(); }, []);

  const center = [19.7515, 75.7139];
  const zoom = 6;

  return (
    <div className="space-y-4 h-full w-full flex flex-col relative">
        <div className="mb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors">Geospatial AQI Map</h2>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }}></span> Good</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#84cc16' }}></span> Satisfactory</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#eab308' }}></span> Moderate</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f97316' }}></span> Poor</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }}></span> Very Poor</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#475569' }}></span> Offline</div>
            </div>
        </div>

        {/* Floating Stats Overlay - Re-styled for light/dark */}
        <div className="absolute top-[75px] right-6 z-[400] flex gap-3 pointer-events-none items-stretch">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 min-w-[100px] text-center shadow-lg flex flex-col justify-center transition-colors">
                <div className="text-2xl font-black text-emerald-500">{sensors.length}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mt-0.5">Active Nodes</div>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 min-w-[100px] text-center shadow-lg flex flex-col justify-center transition-colors">
                <div className="text-2xl font-black text-amber-500">
                    {data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.sensors[0].rules?.stress_index || 0), 0) / data.length) : '0'}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mt-0.5">Avg Stress</div>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 min-w-[100px] text-center shadow-lg flex flex-col justify-center transition-colors">
                <div className="text-2xl font-black text-rose-500">
                    {data.filter(d => (d.sensors[0].rules?.stress_index || 0) > 80).length}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mt-0.5">Severe Zones</div>
            </div>
        </div>

        <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-xl relative z-0 border border-slate-200 dark:border-slate-800">
          <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%', background: '#f8fafc' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {data.map((districtNode, idx) => {
              const primarySensor = districtNode.sensors[0];
              const lat = primarySensor.latitude || 19.0;
              const lng = primarySensor.longitude || 75.0;
              const stress = primarySensor.rules?.stress_index || 0;
              const markerColor = getStressColor(stress);

              return (
                  <Circle
                      key={`circle-${idx}-${districtNode.district}`}
                      center={[lat, lng]}
                      radius={25000}
                      pathOptions={{
                          color: markerColor,
                          fillColor: markerColor,
                          fillOpacity: 0.1,
                          weight: 1.5,
                      }}
                  />
              );
            })}

            {sensors.map((sensor, idx) => {
               const is_active = sensor.status === 'active' || sensor.aqi !== undefined;
               
               const seed = (sensor.id || idx) * 0.12345;
               const jitterLat = (Math.sin(seed) * 0.006);
               const jitterLng = (Math.cos(seed) * 0.006);
               
               const lat = (sensor.latitude || 19.0) + jitterLat;
               const lng = (sensor.longitude || 75.0) + jitterLng;

               return (
                  <Marker 
                      key={`sensor-${sensor.id || idx}`}
                      position={[lat, lng]}
                      opacity={is_active ? 1 : 0.6}
                  >
                      <Popup minWidth={280} className="compact-clean-popup">
                         <div className="bg-white text-slate-800 p-4 rounded-xl font-sans min-w-[260px]">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                               <div>
                                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{sensor.district}</h4>
                                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest leading-none mt-1">{sensor.sensor_name}</p>
                               </div>
                               <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                  {is_active ? 'ACTIVE' : 'OFFLINE'}
                               </span>
                            </div>

                            {/* Two Column Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                               <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                                  <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">AQI</p>
                                  <p className="text-xl font-black text-emerald-600">{Math.round(sensor.aqi || 0)}</p>
                                  <p className="text-[8px] text-emerald-500 font-bold uppercase mt-0.5">Satisfactory</p>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                                   <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">NOISE</p>
                                   <p className="text-xl font-black text-blue-600">{Math.round(sensor.noise_db || 0)}</p>
                                   <p className="text-[8px] text-blue-500 font-bold uppercase mt-0.5">dB</p>
                                </div>
                             </div>

                             {/* Low Profile Insights */}
                             <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                   ESI <span className="text-amber-500 ml-1">{(sensor.stress_score || 0).toFixed(1)}</span>
                                </span>
                                <span className="text-[9px] text-slate-500 font-medium italic">{sensor.cause || 'Clear Sky'}</span>
                             </div>

                             {/* Metric Row */}
                             <div className="flex justify-around items-center py-2 border-y border-slate-50 mb-3 grayscale opacity-70">
                                <div className="text-center">
                                   <p className="text-[7px] font-bold text-slate-400 uppercase">PM2.5</p>
                                   <p className="text-[10px] font-bold text-slate-700">{sensor.pollutants?.pm25?.toFixed(1) || '--'}</p>
                                </div>
                                <div className="text-center border-x border-slate-50 px-4">
                                   <p className="text-[7px] font-bold text-slate-400 uppercase">PM10</p>
                                   <p className="text-[10px] font-bold text-slate-700">{sensor.pollutants?.pm10?.toFixed(1) || '--'}</p>
                                </div>
                                <div className="text-center">
                                   <p className="text-[7px] font-bold text-slate-400 uppercase">NO2</p>
                                   <p className="text-[10px] font-bold text-slate-700">{sensor.pollutants?.no2?.toFixed(1) || '--'}</p>
                                </div>
                             </div>

                             {/* Advisory */}
                             <div className="bg-orange-50/50 border border-orange-100 p-2.5 rounded-lg mb-2">
                                <p className="text-[9px] text-orange-600 font-medium leading-relaxed">
                                   Acceptable air quality. Sensitive individuals should limit prolonged outdoor exertion.
                                </p>
                             </div>

                             <div className="text-[8px] text-slate-300 text-right font-mono">
                                {sensor.timestamp ? new Date(sensor.timestamp).toLocaleString() : 'N/A'}
                             </div>
                          </div>
                       </Popup>
                  </Marker>
               );
            })}
          </MapContainer>
        </div>
    </div>
  );
};

export default MapWidget;
