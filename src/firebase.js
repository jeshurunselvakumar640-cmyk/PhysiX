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
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

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
let db = null;
try {
  db = getFirestore(app);
} catch (e) {
  console.warn("Firestore initialization notice:", e);
}

export {
  app,
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged
};
export default app;
