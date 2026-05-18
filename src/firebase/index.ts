
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useMemo, useRef } from 'react';

let memoApp: FirebaseApp;
let memoFirestore: Firestore;
let memoAuth: Auth;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null as any, firestore: null as any, auth: null as any };
  }

  if (!memoApp) {
    memoApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    memoFirestore = getFirestore(memoApp);
    memoAuth = getAuth(memoApp);
  }

  return { firebaseApp: memoApp, firestore: memoFirestore, auth: memoAuth };
}

/**
 * A specialized useMemo hook for Firebase references and queries.
 * Ensures the reference remains stable across renders unless dependencies change.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<T>(null as any);
  const prevDeps = useRef<React.DependencyList>(null as any);

  const changed = !prevDeps.current || deps.some((dep, i) => dep !== prevDeps.current![i]);

  if (changed) {
    ref.current = factory();
    prevDeps.current = deps;
  }

  return ref.current;
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
