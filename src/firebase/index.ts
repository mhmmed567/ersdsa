
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence, terminate } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useMemo } from 'react';

// استخدام متغيرات عامة لضمان وجود نسخة واحدة فقط من الخدمة
let cachedApp: FirebaseApp | undefined;
let cachedFirestore: Firestore | undefined;
let cachedAuth: Auth | undefined;

/**
 * تهيئة Firebase بشكل مستقر لبيئة Next.js.
 * تضمن هذه الوظيفة عدم حدوث تعارضات "Unexpected state" عبر منع التهيئة المتكررة.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(firebaseConfig);
    }

    if (!cachedFirestore) {
      cachedFirestore = getFirestore(cachedApp);
    }

    if (!cachedAuth) {
      cachedAuth = getAuth(cachedApp);
    }
  } catch (error) {
    console.error("Firebase Initialization Critical Error:", error);
    // محاولة استعادة الحالة في حال حدوث خطأ
    const app = getApp();
    return { 
      firebaseApp: app, 
      firestore: getFirestore(app), 
      auth: getAuth(app) 
    };
  }

  return { 
    firebaseApp: cachedApp as FirebaseApp, 
    firestore: cachedFirestore as Firestore, 
    auth: cachedAuth as Auth 
  };
}

/**
 * Hook مخصص لضمان ثبات المراجع (References) والاستعلامات (Queries).
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
