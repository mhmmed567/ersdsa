
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useMemo } from 'react';

// Singletons for Firebase services to prevent re-initialization errors
let cachedApp: FirebaseApp | undefined;
let cachedFirestore: Firestore | undefined;
let cachedAuth: Auth | undefined;

/**
 * Robust Firebase initialization for Next.js.
 * Ensures that services are initialized only once and only on the client.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  if (!cachedApp) {
    try {
      cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      cachedFirestore = getFirestore(cachedApp);
      cachedAuth = getAuth(cachedApp);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      // Fallback if app is already initialized but not cached
      const app = getApp();
      return { 
        firebaseApp: app, 
        firestore: getFirestore(app), 
        auth: getAuth(app) 
      };
    }
  }

  return { 
    firebaseApp: cachedApp as FirebaseApp, 
    firestore: cachedFirestore as Firestore, 
    auth: cachedAuth as Auth 
  };
}

/**
 * A specialized useMemo hook for Firebase references and queries.
 * Ensures the reference remains stable across renders unless dependencies change.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
