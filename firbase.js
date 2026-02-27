import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAq5UzeDtCsOent9p7IsrbsE4VT6ZnnUSI",
  authDomain: "together-52fe2.firebaseapp.com",
  projectId: "together-52fe2",
  storageBucket: "together-52fe2.firebasestorage.app",
  messagingSenderId: "670564062938",
  appId: "1:670564062938:web:7b19f6e7c3071848ac77e3",
  measurementId: "G-JS2M7P69TC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;