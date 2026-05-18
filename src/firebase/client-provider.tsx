
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // نقوم بالتهيئة هنا داخل مكون العميل لضمان عدم تمرير الكائنات من الخادم
  const config = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={config.firebaseApp} 
      firestore={config.firestore} 
      auth={config.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
