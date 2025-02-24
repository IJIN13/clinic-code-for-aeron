import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged , createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
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


function generateCode() {
    return Math.floor(100000 + Math.random() * 900000);
}
document.getElementById('signup').addEventListener('click', async (event) =>{
    event.preventDefault();
    console.log('signup');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === '' || password === ''){
        console.log('Empty inputs');
        alert("Empty input fields");
        return;

    }
 
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: email
        });
        const verificationCode = generateCode();
        console.log('Username:', email);
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            password: password,
            createdAt: new Date(),
            verificationCode: verificationCode
        });
        const templateParams = {
            to_email: email,  
            verification_code: verificationCode, 
          };
          
          emailjs.send("service_sy48374", "template_aj95mw6", templateParams, "eVD2ySQLrruxVJQ9E")
            .then(response => {
              console.log("Email sent successfully:", response);
              alert('Code sent to email. Go to confirmation page?');
              window.location.assign(`confirmationpage.html?email=${email}`);

            })
            .catch(error => {
              console.error("Error sending email:", error);
            });
          
            
    } catch (error){
        console.error(`Error creating user:`, error);
    }
})