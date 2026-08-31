import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged
} from "firebase/auth";

// Firebase Configuration from User Project
const firebaseConfig = {
  apiKey: "AIzaSyCaxt7IyXNAm5N41gWX0AJA3iJsq9_O-Cc",
  authDomain: "authentication-2708d.firebaseapp.com",
  projectId: "authentication-2708d",
  storageBucket: "authentication-2708d.firebasestorage.app",
  messagingSenderId: "101323771563",
  appId: "1:101323771563:web:68073d61462d90b39471ee",
  measurementId: "G-9P985Z2SN2"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  app,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged
};
export default app;
