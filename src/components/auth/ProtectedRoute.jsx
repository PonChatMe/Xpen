import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import Onboarding from './Onboarding';

const ProtectedRoute = ({ children }) => {
  const { user, loading, onboardingComplete } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login
  if (!user) {
    return <Login />;
  }

  // If authenticated but onboarding not complete, show onboarding
  if (!onboardingComplete) {
    return <Onboarding />;
  }

  // If authenticated and onboarding complete, show the protected content
  return children;
};

export default ProtectedRoute; 