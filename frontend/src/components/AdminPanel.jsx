import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Play, Square, Trash2, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminPanel = () => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth();
  
  const [newSensorName, setNewSensorName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/sensors/`);
      setSensors(res.data);
    } catch (error) {
      console.error("Failed to fetch sensors", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSensorStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${BACKEND_URL}/sensors/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optimistically update UI
      setSensors(sensors.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      alert("Failed to toggle sensor status. Are you an Admin?");
    }
  };

  const deleteSensor = async (id) => {
    if (!window.confirm("WARNING: Deleting this physical node will remove all historical telemetry data permanently. Proceed?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/sensors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSensors(sensors.filter(s => s.id !== id));
    } catch (error) {
      alert("Failed to delete sensor. Are you an Admin?");
    }
  };

  const handleAddSensor = async (e) => {
    e.preventDefault();
    if (!newSensorName.trim()) return;
    
    setIsAdding(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/sensors/`, 
        { 
            sensor_name: newSensorName.replace(' ', '_'),
            district_id: 1, // Defaulting to District 1 (Mumbai) for demo purposes
            status: 'active'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSensors([...sensors, res.data]);
      setNewSensorName('');
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to add sensor");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-indigo-400" />
            Hardware Node Management
          </h2>
          <p className="text-slate-400 mt-2">Add, remove, or halt telemetry streams from the physical sensor grid.</p>
        </div>
        <button 
          onClick={logout}
          className="px-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
        >
          Logout Admin Session
        </button>
      </div>

      {/* Add Sensor Widget */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400"/>
            Provision New Node
        </h3>
        <form onSubmit={handleAddSensor} className="flex gap-4">
          <input
            type="text"
            required
            placeholder="e.g. Pune_City_Central_Node"
            value={newSensorName}
            onChange={(e) => setNewSensorName(e.target.value)}
            className="flex-1 bg-[#1e293b]/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Hardware'}
          </button>
        </form>
      </div>

      {/* Hardware Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#1e293b]/50 border-b border-slate-800 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Node ID</th>
                    <th className="px-6 py-4">Designation Name</th>
                    <th className="px-6 py-4">Coordinates</th>
                    <th className="px-6 py-4">Telemetry Status</th>
                    <th className="px-6 py-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sensors.map((sensor) => (
                    <tr key={sensor.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">#{sensor.id.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4 font-bold text-slate-200">{sensor.sensor_name}</td>
                      <td className="px-6 py-4 text-xs font-mono">[{sensor.latitude?.toFixed(2)}, {sensor.longitude?.toFixed(2)}]</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                            sensor.status === 'active' 
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
                            : 'bg-rose-950/30 text-rose-400 border-rose-900/50'
                        }`}>
                            {sensor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-3">
                        {sensor.status === 'active' ? (
                            <button 
                                onClick={() => toggleSensorStatus(sensor.id, sensor.status)}
                                className="text-amber-400 hover:text-amber-300 bg-amber-400/10 p-2 rounded-lg transition-colors flex items-center gap-2"
                                title="Halt Telemetry Stream"
                            >
                                <Square className="w-4 h-4" /> Stop
                            </button>
                        ) : (
                            <button 
                                onClick={() => toggleSensorStatus(sensor.id, sensor.status)}
                                className="text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 p-2 rounded-lg transition-colors flex items-center gap-2"
                                title="Resume Telemetry Stream"
                            >
                                <Play className="w-4 h-4" /> Start
                            </button>
                        )}
                        <button 
                            onClick={() => deleteSensor(sensor.id)}
                            className="text-rose-400 hover:text-rose-300 bg-rose-400/10 p-2 rounded-lg transition-colors"
                            title="Decommission Node"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sensors.length === 0 && (
                      <tr>
                          <td colSpan="5" className="text-center py-8 text-slate-500">No active physical hardware nodes detected in the grid.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
