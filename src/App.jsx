import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './Dashboard';
import TestAuth from './components/TestAuth';

function App() {
  return (
    <AuthProvider>
      {/* Temporarily show TestAuth for Firebase setup verification */}
      {/* <TestAuth /> */}
      
      {/* Uncomment this when Firebase is configured */}
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App; 