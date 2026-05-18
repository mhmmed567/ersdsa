
'use client';

import React, { useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

/**
 * Client-side only provider that ensures Firebase is initialized correctly
 * before rendering any children that depend on it.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [services, setServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // This effect runs only once on mount, ensuring client-side initialization
    const initializedServices = initializeFirebase();
    if (initializedServices.firebaseApp) {
      setServices(initializedServices);
    }
  }, []);

  // Show a consistent background color during initial load to prevent flickering
  if (!services || !services.firebaseApp || !services.firestore || !services.auth) {
    return <div className="min-h-screen bg-[#F2E8D9]" />;
  }

  return (
    <FirebaseProvider 
      firebaseApp={services.firebaseApp} 
      firestore={services.firestore} 
      auth={services.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
