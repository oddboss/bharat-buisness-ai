import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, FirebaseUser, signInWithPopup, googleProvider, signOut, doc, getDoc, setDoc, Timestamp } from '../firebase';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

interface FirebaseContextType {
  user: FirebaseUser | null;
  loading: boolean;
  organizationId: string | null;
  organizationName: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggingIn: boolean;
  db: Firestore;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check if user has an organization
        // For simplicity, we'll use a default organization if none exists
        const defaultOrgId = `org_${currentUser.uid}`;
        const orgRef = doc(db, 'organizations', defaultOrgId);
        const orgDoc = await getDoc(orgRef);

        if (!orgDoc.exists()) {
          // Create default organization
          await setDoc(orgRef, {
            id: defaultOrgId,
            name: `${currentUser.displayName}'s Workspace`,
            ownerId: currentUser.uid,
            plan: 'free',
            createdAt: Timestamp.now()
          });

          // Create user record in organization
          await setDoc(doc(db, 'organizations', defaultOrgId, 'users', currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: 'admin',
            organizationId: defaultOrgId,
            createdAt: Timestamp.now()
          });
          
          setOrganizationId(defaultOrgId);
          setOrganizationName(`${currentUser.displayName}'s Workspace`);
        } else {
          setOrganizationId(defaultOrgId);
          setOrganizationName(orgDoc.data().name);
        }
      } else {
        setOrganizationId(null);
        setOrganizationName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Login popup request was cancelled. This is usually due to multiple clicks.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Login popup was closed by the user.');
      } else {
        console.error('Login error:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, organizationId, organizationName, login, logout, isLoggingIn, db, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
