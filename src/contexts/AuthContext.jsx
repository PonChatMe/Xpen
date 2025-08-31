import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChange, signInWithGoogle, signOutUser } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      // Check if user has completed onboarding
      if (user) {
        // TODO: Check Firestore for onboarding status
        // For now, we'll assume onboarding is complete if user exists
        setOnboardingComplete(true);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setOnboardingComplete(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const completeOnboarding = () => {
    setOnboardingComplete(true);
    // TODO: Save onboarding status to Firestore
  };

  const value = {
    user,
    loading,
    onboardingComplete,
    signIn,
    signOut,
    completeOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 