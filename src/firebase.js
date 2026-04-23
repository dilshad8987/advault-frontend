import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAKNo88XRhtt5iRA0yTSKij_WivRKUHSyE",
  authDomain: "advault-4febe.firebaseapp.com",
  projectId: "advault-4febe",
  storageBucket: "advault-4febe.firebasestorage.app",
  messagingSenderId: "299661123907",
  appId: "1:299661123907:web:7e0f5a35561a4438eccff6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { sendPasswordResetEmail };
