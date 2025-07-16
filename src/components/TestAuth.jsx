import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FaGoogle, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const TestAuth = () => {
  const { user, loading, signIn, signOut } = useAuth();

  const handleTestSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Test sign in failed:', error);
      alert('Sign in failed. Check console for details.');
    }
  };

  const handleTestSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Test sign out failed:', error);
      alert('Sign out failed. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-700">Firebase Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Firebase Config Status */}
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Firebase Configuration Status:</h3>
            <div className="flex items-center gap-2">
              {window.location.hostname === 'localhost' ? (
                <>
                  <FaExclamationTriangle className="text-yellow-500" />
                  <span className="text-sm text-yellow-700">Development Mode - Config needed</span>
                </>
              ) : (
                <>
                  <FaCheck className="text-green-500" />
                  <span className="text-sm text-green-700">Production Ready</span>
                </>
              )}
            </div>
          </div>

          {/* Auth Status */}
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Authentication Status:</h3>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span className="text-sm text-green-700">Signed In</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
                  <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                  <p><strong>UID:</strong> {user.uid}</p>
                </div>
                <Button 
                  onClick={handleTestSignOut}
                  variant="outline"
                  className="w-full"
                >
                  Test Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-500" />
                  <span className="text-sm text-yellow-700">Not Signed In</span>
                </div>
                <Button 
                  onClick={handleTestSignIn}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <FaGoogle className="mr-2" />
                  Test Google Sign In
                </Button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-800">Next Steps:</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Create a Firebase project at console.firebase.google.com</li>
              <li>Enable Google Authentication</li>
              <li>Update src/lib/firebase-config.js with your values</li>
              <li>Test the sign-in functionality</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAuth; 