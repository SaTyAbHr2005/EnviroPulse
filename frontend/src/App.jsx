import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard'; // Old map dashboard sideview
import MainDashboard from './components/MainDashboard';
import StressPrediction from './components/StressPrediction';
import TrendsDashboard from './components/TrendsDashboard';
import SimulatorPanel from './components/SimulatorPanel';
import RegionSelector from './components/RegionSelector';
import { RegionProvider } from './context/RegionContext';
import Layout from './components/Layout';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Initial Region Selection */}
            <Route path="/" element={<RegionSelector />} />
            
            {/* Main App Layout Routes */}
            <Route path="/map" element={<Layout><Dashboard /></Layout>} />
          <Route path="/dashboard" element={<Layout><MainDashboard /></Layout>} />
          <Route path="/prediction" element={<Layout><StressPrediction /></Layout>} />
          <Route path="/trends" element={<Layout><TrendsDashboard /></Layout>} />
          <Route path="/simulator" element={<Layout><SimulatorPanel /></Layout>} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </RegionProvider>
    </AuthProvider>
  );
}

export default App;
