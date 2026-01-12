// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdJ7Zk756-Z4g0LpllryWX7Hdhz0yGdSg",
  authDomain: "echo-v2-5b53f.firebaseapp.com",
  projectId: "echo-v2-5b53f",
  storageBucket: "echo-v2-5b53f.firebasestorage.app",
  messagingSenderId: "705572297758",
  appId: "1:705572297758:web:bdc4de98cb953e7e70220f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);