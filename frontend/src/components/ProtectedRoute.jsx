import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
    const { token, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }
    
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
