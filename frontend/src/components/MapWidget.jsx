import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Thermometer, Activity, AlertCircle } from 'lucide-react';

function fixLeafletIcon() {
    const L = window.L || require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

const getStressMarkerColor = (stress) => {
  if (stress <= 20) return '#10b981'; // emerald-500
  if (stress <= 40) return '#84cc16'; // lime-500
  if (stress <= 60) return '#eab308'; // yellow-500
  if (stress <= 80) return '#f97316'; // orange-500
  if (stress < 100) return '#ef4444'; // red-500
  return '#9f1239'; // rose-800
};

// Component to dynamically fit bounds to all markers if needed
function MapBoundsUpdate({ data }) {
  const map = useMap();
  useEffect(() => {
    if (data && data.length > 0) {
      const bounds = L.latLngBounds(data.map(d => [d.sensors[0].latest_reading.latitude || d.sensors[0].latitude || 19, d.sensors[0].latest_reading.longitude || d.sensors[0].longitude || 75]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [data, map]);
  return null;
}

const MapWidget = ({ data }) => {
  useEffect(() => { fixLeafletIcon(); }, []);

  // Center of Maharashtra
  const center = [19.7515, 75.7139];
  const zoom = 6;

  return (
    <div className="space-y-4 h-full w-full flex flex-col">
        <div className="mb-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Geospatial Environmental Stress Map</h2>
            
            {/* Custom Stress Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-400 font-medium">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Minimal (≤20)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span> Low (≤40)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span> Moderate (≤60)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span> High (≤80)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> Critical (≤100)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9f1239]"></span> Extreme (&gt;100)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Offline</div>
            </div>
        </div>

        {/* Top Right Stats from Screenshot */}
        <div className="absolute top-4 right-4 z-[400] flex gap-3 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 min-w-[100px] text-center shadow-lg">
                <div className="text-2xl font-black text-emerald-400">{data.length}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Active Nodes</div>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 min-w-[100px] text-center shadow-lg">
                <div className="text-2xl font-black text-amber-400">
                    {Math.round(data.reduce((acc, curr) => acc + (curr.sensors[0].rules?.stress_index || 0), 0) / (data.length || 1))}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Avg Stress</div>
            </div>
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 min-w-[100px] text-center shadow-lg">
                <div className="text-2xl font-black text-rose-500">
                    {data.filter(d => (d.sensors[0].rules?.stress_index || 0) > 80).length}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-1">Critical Zones</div>
            </div>
        </div>

        <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl relative z-0 border border-slate-800/80">
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
              const aqi = primarySensor.predictions?.predicted_aqi || 0;
              const markerColor = getStressMarkerColor(stress);

              const pm25 = primarySensor.latest_reading?.pm25;
              const pm10 = primarySensor.latest_reading?.pm10;
              const category = primarySensor.rules?.stress_category || "Unknown";
              const timestamp = primarySensor.timestamp ? new Date(primarySensor.timestamp).toLocaleString() : new Date().toLocaleString();
              const is_active = true; // All simulated nodes are active

              return (
                <React.Fragment key={`${idx}-${districtNode.district}`}>
                    <Circle
                        center={[lat, lng]}
                        radius={25000} /* 25km radius for district representation */
                        pathOptions={{
                            color: is_active ? markerColor : '#94a3b8',
                            fillColor: is_active ? markerColor : '#cbd5e1',
                            fillOpacity: is_active ? 0.15 : 0.05,
                            weight: is_active ? 2 : 1.5,
                            dashArray: is_active ? null : '5, 5'
                        }}
                    />

                    <Marker 
                      position={[lat, lng]}
                      opacity={is_active ? 1 : 0.4}
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={0.95} className="custom-tooltip shadow-lg border-none">
                          <div className="font-sans text-center">
                              <div className="font-bold text-sm mb-1 text-slate-900">{districtNode.district}</div>
                              {is_active && stress ? (
                                  <div className="mt-1 flex items-center justify-center gap-2">
                                      <span className="font-bold rounded-full text-white px-3 py-0.5 shadow-sm" style={{ backgroundColor: markerColor }}>
                                          Stress {stress.toFixed(1)}
                                      </span>
                                  </div>
                              ) : (
                                  <div className="mt-1 text-xs text-slate-500 italic">Deactivated (Offline)</div>
                              )}
                          </div>
                      </Tooltip>

                      <Popup className="rounded-lg shadow-xl border-none">
                          <div className="p-1 font-sans min-w-[200px] text-slate-800">
                              <h3 className="font-bold text-lg border-b pb-2 mb-3 text-slate-900">
                                  {districtNode.district} <span className="text-sm font-normal text-slate-500">({primarySensor.sensor_name})</span>
                              </h3>
                              {is_active && stress ? (
                                  <div className="space-y-2 text-sm">
                                      <p className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                                          <span className="text-slate-600 font-medium">Status</span>
                                          <span className="font-bold text-white px-2 py-0.5 rounded text-xs shadow-sm shadow-black/10" style={{ backgroundColor: markerColor }}>{category}</span>
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                          <p className="flex flex-col border border-slate-200 p-2 rounded-lg"><span className="text-slate-500 text-[10px] uppercase font-bold">Stress Index</span><span className="font-black text-lg text-slate-900">{stress.toFixed(1)}</span></p>
                                          <p className="flex flex-col border border-slate-200 p-2 rounded-lg"><span className="text-slate-500 text-[10px] uppercase font-bold">AQI Level</span><span className="font-black text-lg text-slate-900">{aqi.toFixed(1)}</span></p>
                                      </div>
                                      <p className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200">
                                          <span className="text-slate-500 text-xs">Coverage Radius</span>
                                          <span className="font-semibold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">25 km</span>
                                      </p>
                                      <div className="text-[10px] text-slate-400 text-center mt-2 pt-2 border-t border-slate-200">{timestamp}</div>
                                      
                                      <div className={`mt-3 p-3 rounded-lg border shadow-sm border-slate-200 bg-slate-50`}>
                                          <div className={`text-base font-black mb-1 text-slate-900`} style={{ color: markerColor }}>Risk: {primarySensor.rules?.health_index || "Moderate"}</div>
                                          <div className="text-sm leading-snug text-slate-900 font-bold opacity-90">
                                              Advice: {primarySensor.rules?.health_advisory || "Standard operational procedures apply."}
                                          </div>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="flex flex-col items-center justify-center p-4 bg-slate-100 border border-slate-200 rounded-lg">
                                      <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-1">System Offline</span>
                                      <span className="text-sm font-medium text-slate-700">Node deactivated by Admin.</span>
                                  </div>
                              )}
                          </div>
                      </Popup>
                    </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
    </div>
  );
};

export default MapWidget;
