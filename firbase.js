import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAniTex_frxnVpPK0-iEPCVsB67gEAj4Lw",
  authDomain: "together-ad6f2.firebaseapp.com",
  projectId: "together-ad6f2",
  storageBucket: "together-ad6f2.firebasestorage.app",
  messagingSenderId: "7172804923",
  appId: "1:7172804923:web:544599e1f7f818d3b5671e",
  measurementId: "G-JBQR23MEVG"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);

export default app;
