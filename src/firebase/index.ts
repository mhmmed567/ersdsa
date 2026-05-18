
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useMemo } from 'react';

let memoApp: FirebaseApp | undefined;
let memoFirestore: Firestore | undefined;
let memoAuth: Auth | undefined;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  if (!memoApp) {
    memoApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    memoFirestore = getFirestore(memoApp);
    memoAuth = getAuth(memoApp);
  }

  return { 
    firebaseApp: memoApp as FirebaseApp, 
    firestore: memoFirestore as Firestore, 
    auth: memoAuth as Auth 
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
