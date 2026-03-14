import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Cpu, Power, PowerOff, ShieldAlert, PlusCircle, Trash2 } from 'lucide-react';
import DeployNodeModal from './DeployNodeModal';

const BACKEND_URL = 'http://localhost:8000';

const AdminControlPanel = () => {

  const [sensors, setSensors] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to get district name safely
  const getDistrictName = (districtId) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : "Unknown Grid";
  };

  const fetchSensors = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/sensors/`);
      setSensors(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching sensors:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Unauthorized: Admin Access Required");
      }
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/hardware/districts`);
      setDistricts(res.data || []);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  useEffect(() => {
    fetchSensors();
    fetchDistricts();

    const interval = setInterval(fetchSensors, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeploySubmit = async (formData) => {
    try {
      await axios.post(`${BACKEND_URL}/hardware/deploy`, formData);
      setIsModalOpen(false);
      fetchSensors();
      alert("Hardware Node successfully deployed to the field.");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to deploy hardware node");
    }
  };

  const handleToggleStatus = async (sensorId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${BACKEND_URL}/sensors/${sensorId}/status`, { status: newStatus });
      fetchSensors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (sensorId) => {
    if (!window.confirm("WARNING: Destroying a physical node will immediately halt its telemetry flow. Continue?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/sensors/${sensorId}`);
      fetchSensors();
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center font-sans text-rose-500">
        <ShieldAlert className="w-6 h-6 mr-2" /> {error}
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen font-sans max-w-[1200px] mx-auto text-slate-200">

      <div className="flex-1 pr-6 flex flex-col pl-4 md:pl-8 py-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight flex items-center gap-3">
              <Cpu className="text-blue-500" /> System Control Panel
            </h1>
            <p className="text-sm text-slate-400 font-medium tracking-wide mt-1">
              Infrastructure Management & Deployment Interface [Admin Protected]
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 rounded-lg text-blue-400 font-bold transition-colors flex items-center gap-2 shadow-lg"
          >
            <PlusCircle size={16} /> Deploy Node
          </button>
        </div>

        {/* Deploy Modal */}
        <DeployNodeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleDeploySubmit}
          districts={districts}
          sensors={sensors}
        />

        {/* Table */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden shadow-lg flex-1">

          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-[#1e293b]/50">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={16} className="text-purple-400" /> Active Grid Architecture
            </h3>
            <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
              {sensors.length} Nodes
            </span>
          </div>

          <div className="overflow-auto flex-1">

            <table className="w-full text-left text-sm text-slate-300">

              <thead className="text-xs uppercase bg-[#1e293b]/80 text-slate-400 sticky top-0 shadow-sm z-10 hidden sm:table-header-group">
                <tr>
                  <th className="px-6 py-4 font-semibold">Node Identity</th>
                  <th className="px-6 py-4 font-semibold text-center">Coordinates</th>
                  <th className="px-6 py-4 font-semibold text-center">Telemetry Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Action Controls</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">

                {(!sensors || sensors.length === 0) ? (

                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-semibold tracking-widest uppercase text-xs">
                      No Physical Nodes Deployed in Network
                    </td>
                  </tr>

                ) : (

                  sensors.map((sensor) => (

                    <tr key={sensor.id} className="hover:bg-slate-800/40 transition-colors">

                      <td className="px-6 py-4">

                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shadow-lg ${sensor.status === 'active'
                              ? 'bg-emerald-500 shadow-emerald-500/50'
                              : 'bg-slate-600'
                              }`}
                          ></span>

                          {sensor.sensor_name}
                        </p>

                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          District Hub: {getDistrictName(sensor.district_id)}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-center font-mono text-xs text-slate-400">

                        {sensor.latitude && sensor.longitude
                          ? `[${sensor.latitude.toFixed(2)}, ${sensor.longitude.toFixed(2)}]`
                          : '[N/A]'
                        }

                      </td>

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${sensor.status === 'active'
                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                            : 'text-slate-400 border-slate-500/30 bg-slate-500/10'
                            }`}
                        >
                          {sensor.status === 'active' ? 'TRANSMITTING' : 'OFFLINE'}
                        </span>

                      </td>

                      <td className="px-6 py-4 flex items-center justify-center gap-3">

                        <button
                          onClick={() => handleToggleStatus(sensor.id, sensor.status)}
                          className={`p-2 rounded-lg border transition-all ${sensor.status === 'active'
                            ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/30'
                            : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/30'
                            }`}
                        >
                          {sensor.status === 'active'
                            ? <PowerOff size={16} />
                            : <Power size={16} />}
                        </button>

                        <button
                          onClick={() => handleDelete(sensor.id)}
                          className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/30 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminControlPanel;
