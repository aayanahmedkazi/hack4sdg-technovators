import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isConfigured } from '../shared/firebase';
import { DEMO_USERS } from '../demo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check persisted demo user session on mount
  useEffect(() => {
    const savedDemoUser = localStorage.getItem('mediflow_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setCurrentUser(parsed);
        setRole(parsed.role);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('mediflow_demo_user');
      }
    }

    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Attempt to read user role from Firestore 'users' collection
          let userRole = null;
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                userRole = userDoc.data()?.role;
              }
            } catch (err) {
              console.warn('Could not read user role from Firestore:', err);
            }
          }

          // Fallback role resolution based on email keywords if Firestore role is not yet populated
          if (!userRole) {
            const email = (firebaseUser.email || '').toLowerCase();
            if (email.includes('doctor')) userRole = 'doctor';
            else if (email.includes('reception')) userRole = 'receptionist';
            else userRole = 'patient';
          }

          setCurrentUser(firebaseUser);
          setRole(userRole);
        } else {
          setCurrentUser(null);
          setRole(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Standard Email + Password Login
  const loginWithEmail = async (email, password) => {
    if (isConfigured && auth) {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Remove any leftover demo user
      localStorage.removeItem('mediflow_demo_user');
      return result.user;
    } else {
      // Demo fallback if Firebase keys are not provided yet
      const normalized = email.toLowerCase();
      let matchedRole = 'patient';
      if (normalized.includes('doctor')) matchedRole = 'doctor';
      if (normalized.includes('reception')) matchedRole = 'receptionist';

      const demoUser = {
        uid: 'demo-' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        role: matchedRole,
      };
      localStorage.setItem('mediflow_demo_user', JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      setRole(matchedRole);
      return demoUser;
    }
  };

  // Quick Demo Login for instant role switching
  const demoLogin = async (targetRole) => {
    const demoProfile = DEMO_USERS[targetRole];
    if (!demoProfile) return;

    localStorage.setItem('mediflow_demo_user', JSON.stringify(demoProfile));
    setCurrentUser(demoProfile);
    setRole(demoProfile.role);
    return demoProfile;
  };

  const logout = async () => {
    localStorage.removeItem('mediflow_demo_user');
    if (isConfigured && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setRole(null);
  };

  const value = {
    currentUser,
    role,
    loading,
    loginWithEmail,
    demoLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
