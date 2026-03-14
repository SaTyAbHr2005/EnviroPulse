import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard'; // Old map dashboard sideview
import MainDashboard from './components/MainDashboard';
import StressPrediction from './components/StressPrediction';
import TrendsDashboard from './components/TrendsDashboard';
import RegionSelector from './components/RegionSelector';
import { RegionProvider } from './context/RegionContext';
import Layout from './components/Layout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

// New Architecture Components
import LandingPage from './components/LandingPage';
import AdminSimulator from './components/AdminSimulator';
import AdminControlPanel from './components/AdminControlPanel';

function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Public Architecture */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/select-region" element={<RegionSelector />} />
            
            {/* Main App Layout Routes */}
            <Route path="/map" element={<Layout><Dashboard /></Layout>} />
          <Route path="/dashboard" element={<Layout><MainDashboard /></Layout>} />
          <Route path="/prediction" element={<Layout><StressPrediction /></Layout>} />
          <Route path="/trends" element={<Layout><TrendsDashboard /></Layout>} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/admin" element={<Navigate to="/admin/control-panel" replace />} />
             <Route path="/admin/control-panel" element={<Layout><AdminControlPanel /></Layout>} />
             <Route path="/admin/simulator" element={<Layout><AdminSimulator /></Layout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </RegionProvider>
    </AuthProvider>
  );
}

export default App;
