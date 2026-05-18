
'use client';

import React, { useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [services, setServices] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    // Initialize only on the client after hydration
    setServices(initializeFirebase());
  }, []);

  if (!services || !services.firebaseApp) {
    // Return a minimal structure or null during initial client mount to avoid hydration errors
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
