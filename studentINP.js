import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, setDoc, doc, getDoc, arrayUnion, updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

// Populate time selectors
function populateTimeSelectors() {
    const hourSelect = document.getElementById('hour');
    const minuteSelect = document.getElementById('minute');

    for (let i = 1; i <= 12; i++) {
        let option = document.createElement('option');
        option.value = i.toString().padStart(2, '0');
        option.textContent = i.toString().padStart(2, '0');
        hourSelect.appendChild(option);
    }

    for (let i = 0; i < 60; i++) {
        let option = document.createElement('option');
        option.value = i.toString().padStart(2, '0');
        option.textContent = i.toString().padStart(2, '0');
        minuteSelect.appendChild(option);
    }
}

populateTimeSelectors();
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault();

    const section = document.getElementById('section').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const purpose = document.getElementById('purposeOfVisit').value.trim();
    const hour = document.getElementById('hour').value;
    const minute = document.getElementById('minute').value;
    const ampm = document.getElementById('ampm').value;
    const date = document.getElementById('date').value;

    if (!name || !purpose || !section || !date) {
        alert("Please enter all required fields.");
        return;
    }

    try {
        const docRef = doc(db, "studentAppointments", date);
        const docSnap = await getDoc(docRef);

       
        const newAppointment = {
            name: name,
            purpose: purpose,
            timeIn: `${hour}:${minute} ${ampm}`,
            timestamp: new Date(),
            section: section
        };

        if (docSnap.exists()) {
          
            await updateDoc(docRef, {
                appointments: arrayUnion(newAppointment)
            });
        } else {
           
            await setDoc(docRef, {
                date: date,
                appointments: [newAppointment]
            });
        }

        console.log("Appointment successfully submitted!");
        alert("Appointment successfully submitted!");
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error submitting appointment.");
    }
});