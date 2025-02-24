import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, updateProfile, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Load saved credentials from localStorage
window.addEventListener('load', () => {
    const savedEmail = localStorage.getItem('rememberMeEmail');
    const savedPassword = localStorage.getItem('rememberMePassword');
    const rememberMeCheckbox = document.getElementById('rememberme');

    if (savedEmail && savedPassword) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('password').value = savedPassword;
        rememberMeCheckbox.checked = true;
    }
});


document.getElementById('login').addEventListener('click', async (event) => {
    event.preventDefault();
    console.log('login');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const rememberMeCheckbox = document.getElementById('rememberme');

    if (email === '' || password === '') {
        alert('No inputs available');
        return;
    } else {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User is logged in');

           
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberMeEmail', email);
                localStorage.setItem('rememberMePassword', password);
            } else {
               
                localStorage.removeItem('rememberMeEmail');
                localStorage.removeItem('rememberMePassword');
            }

            window.location.assign(`adminportal.html`);
        } catch (error) {
            console.error(`Error signing in user:`, error);
        }
    }
});