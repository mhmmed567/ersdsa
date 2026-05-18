export const firebaseConfig = {
  apiKey: "AIzaSyCfnYNme66YLKcwEx4GV42TIo-u7fE8_fc",
  authDomain: "demoon-86ff1.firebaseapp.com",
  projectId: "demoon-86ff1",
  storageBucket: "demoon-86ff1.firebasestorage.app",
  messagingSenderId: "813039507536",
  appId: "1:813039507536:web:e8e8cb4eb9a7ad82a2d955",
  measurementId: "G-ZYQE51YD6R"
};

// فحص ما إذا كانت الإعدادات مفعلة بمفاتيح حقيقية
export const isConfigValid = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyAs-DEMO-KEY-FOR-DEVELOPMENT";
};
