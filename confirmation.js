import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc, query, getDocs, getDoc, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');   
  console.log("Extracted Email:", email);
  
  
  
  

        document.getElementById('continue').addEventListener('click', async () => {
            console.log('continue');
            const ecode = document.getElementById('code').value.trim();
            
            if (ecode === '') {
                console.log('empty code');
                alert('Invalid code!');
                return;
            }
        
            try {
                const q = query(collection(db, "users"), where("email", "==", email));
                const snap = await getDocs(q);
        
                if (snap.empty) {
                    console.log('No matching user found');
                    alert('Invalid email!');
                    return;
                } 
        
                let isValid = false;
                snap.forEach((doc) => {
                    const data = doc.data();
                    console.log("Stored Code:", data.verificationCode);
                    if (String(data.verificationCode) === String(ecode)) {
                        isValid = true;
                    }
                    console.log("Stored Code Type:", typeof data.verificationCode, "Value:", data.verificationCode);
console.log("Entered Code Type:", typeof ecode, "Value:", ecode);

                    
                    if (data.verificationCode == ecode) {
                        isValid = true;
                    }
                });
        
                if (isValid) {
                    console.log('Verification successful');
                    alert('Email verified successfully!');
                    window.location.assign("loginpage.html"); 
                } else {
                    console.log('Incorrect code');
                    alert('Incorrect verification code!');
                }
        
            } catch (error) {
                console.error("Error verifying code:", error);
            }
        });
        