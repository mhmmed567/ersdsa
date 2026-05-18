export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAs-DEMO-KEY-FOR-DEVELOPMENT",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "diamond-cafe-demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "diamond-cafe-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "diamond-cafe-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

// Check if config is using placeholder values
export const isConfigValid = () => {
  return firebaseConfig.apiKey !== "AIzaSyAs-DEMO-KEY-FOR-DEVELOPMENT";
};