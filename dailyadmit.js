import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, getDoc, where, updateDoc, collection, onSnapshot, orderBy, doc, limit, arrayUnion, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6ruE8_Je180qm8QvhqXpXDV3jZ0uYi_w",
    authDomain: "cfsi-clinic.firebaseapp.com",
    projectId: "cfsi-clinic",
    storageBucket: "cfsi-clinic.firebasestorage.app",
    messagingSenderId: "1033385834319",
    appId: "1:1033385834319:web:4157095c0bed489770773a",
    measurementId: "G-2WZT5LYKGP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert('No user logged in');
        window.location.assign('loginpage.html');
    } else {
        fetchAppointments();
    }
});

const sidebar = document.getElementById("sidebar");
const collapseBtn = document.getElementById("collapse-btn");

collapseBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    document.querySelector(".dashboard-container").style.marginLeft = sidebar.classList.contains("collapsed") ? "80px" : "250px";
    document.querySelector(".dashboard-container").style.width = sidebar.classList.contains("collapsed") ? "calc(100% - 80px)" : "calc(100% - 250px)";
});



const tbody = document.getElementById('tableBody');
const rowsPerLoad = 50; 
let rowCount = 1;

function fetchAppointments() {
    const appointmentsRef = collection(db, "studentAppointments");

    onSnapshot(appointmentsRef, (snapshot) => {
        const appointments = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            appointments.push(data);
        });

        loadAppointments(appointments);
    }, (error) => {
        console.error("Error fetching appointments:", error);
    });
}

function createRow(number, name, purpose, time, id) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="row-number">${number}</td>
        <td>${name || ''}</td>
        <td class="time-in-cell time-cell">${time || ''}</td>
        <td>${purpose || ''}</td>
        <td class="time-out-cell time-cell">
            <input type="time" class="time-out-input" id="time-out-${id}">
            <button class="save-time-out" data-id="${id}">Save</button>
        </td>
    `;

    row.querySelector(".save-time-out").addEventListener("click", () => {
        saveTimeOut(id, row);
    });

    return row;
}

const updatedCells = new Set(); 

async function saveTimeOut(docId, row) {
    const timeOutInput = document.getElementById(`time-out-${docId}`);
    const timeOutValue = timeOutInput.value; 

    if (!timeOutValue) {
        alert("Please enter a valid time.");
        return;
    }

    try {
        const docRef = doc(db, "studentAppointments", docId);
        await updateDoc(docRef, { 
            timeOut: timeOutValue,
            timeOutSet: true 
        });

        alert("Time Out saved successfully!");

    } catch (error) {
        console.error("Error updating Time Out:", error);
        alert("Failed to save Time Out.");
    }
}
function loadAppointments(appointments) {
    tbody.innerHTML = ""; 
    appointments.forEach((appointment, index) => {
        const row = createRow(rowCount++, appointment.name, appointment.purpose, appointment.time, appointment.id);

     
        const timeOutInput = row.querySelector(`#time-out-${appointment.id}`);
        if (appointment.timeOut) {
            timeOutInput.value = appointment.timeOut;
        }

        if (appointment.timeOutSet) {
            row.querySelector(".time-out-cell").style.backgroundColor = "rgba(107, 6, 6, 0.719)";
        }

        tbody.appendChild(row);
    });
}


document.querySelector('.table-container').addEventListener('scroll', (e) => {
    if (e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100) {
        fetchAppointments();
    }
});


document.addEventListener('mouseover', (e) => {
    if (e.target.tagName === 'TD') {
        e.target.parentNode.style.backgroundColor = '#f5f5f5';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.tagName === 'TD') {
        const row = e.target.parentNode;
        if (!row.classList.contains("highlight-row")) { 
            row.style.backgroundColor = 'white'; 
        }
    }
});

// Live Clock
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    document.getElementById('liveClock').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}

setInterval(updateClock, 1000);
updateClock();

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    darkModeToggle.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
    darkModeToggle.querySelector('span').textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';

    document.querySelectorAll('tr').forEach(row => {
        row.classList.toggle('dark-mode', isDarkMode);
    });
});
