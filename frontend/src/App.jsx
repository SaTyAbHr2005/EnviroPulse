import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Main App Layout Routes */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          
          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
             <Route path="/admin" element={<Layout><AdminPanel /></Layout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
