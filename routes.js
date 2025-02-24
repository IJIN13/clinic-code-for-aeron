import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, where, query, doc, setDoc, updateDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6ruE8_Je180qm8QvhqXpXDV3jZ0uYi_w",
    authDomain: "cfsi-clinic.firebaseapp.com",
    projectId: "cfsi-clinic",
    storageBucket: "cfsi-clinic.firebasestorage.app",
    messagingSenderId: "1033385834319",
    appId: "1:1033385834319:web:4157095c0bed489770773a",
    measurementId: "G-2WZT5LYKGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


onAuthStateChanged(auth, (user) => {
    if (user) {
       
      window.location.assign('dashboarhome.html');
    } else {
        console.error("No user logged in.");
        window.location.assign('portalsection.html');
    }
});