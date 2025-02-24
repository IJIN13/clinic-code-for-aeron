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

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert('No user logged in');
        window.location.assign('portalsection.html');
    } else {
        fetchMedications(user.uid); 
    }
});


async function fetchMedications(userId) {
    try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        tbody.innerHTML = ""; 
        rowCount = 1; 

        let medications = [];

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            medications = userData.medications || [];
        }

        
        medications.forEach((med) => {
            tbody.appendChild(createRow(rowCount++, med));
        });

       
        for (let i = 0; i < 50; i++) {
            tbody.appendChild(createRow(rowCount++)); 
        }

        console.log("Medications loaded:", medications);
    } catch (error) {
        console.error("Error fetching medications:", error);
    }
}


const sidebar = document.getElementById("sidebar");
const collapseBtn = document.getElementById("collapse-btn");

collapseBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
        document.querySelector(".dashboard-container").style.marginLeft = "80px";
        document.querySelector(".dashboard-container").style.width = "calc(100% - 80px)";
    } else {
        document.querySelector(".dashboard-container").style.marginLeft = "250px";
        document.querySelector(".dashboard-container").style.width = "calc(100% - 250px)";
    }
});

let rowCount = 1;
const tbody = document.getElementById('tableBody');
const rowsPerLoad = 50;
function createRow(number, med = {}) {
    const row = document.createElement('tr');
    row.setAttribute('data-medication', med.medication || ""); 

    row.innerHTML = `
        <td class="row-number">${number}</td>
        <td contenteditable="true">${med.medication || ""}</td>
        <td contenteditable="true">${med.stock || ""}</td>
        <td contenteditable="true">${med.received || ""}</td>
        <td contenteditable="true">${med.expiry || ""}</td>
        <td>
            <button class="save-row-btn">Save</button>
            <button class="delete-row-btn">Delete</button>
        </td>
    `;
    return row;
}


function loadMoreRows() {
    for (let i = 0; i < rowsPerLoad; i++) {
        tbody.appendChild(createRow(rowCount++));
    }
}

loadMoreRows();

document.querySelector('.table-container').addEventListener('scroll', (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreRows();
    }
});

document.addEventListener('mouseover', (e) => {
    if(e.target.tagName === 'TD') {
        e.target.parentNode.style.backgroundColor = '#f5f5f5';
    }
});

document.addEventListener('mouseout', (e) => {
    if(e.target.tagName === 'TD') {
        e.target.parentNode.style.backgroundColor = 'white';
    }
});
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;


function applyDarkMode(isDarkMode) {
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.querySelector('i').className = 'fas fa-sun';
        darkModeToggle.querySelector('span').textContent = 'Light Mode';
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.querySelector('i').className = 'fas fa-moon';
        darkModeToggle.querySelector('span').textContent = 'Dark Mode';
    }
}


const savedMode = localStorage.getItem('darkMode');
if (savedMode) {
    applyDarkMode(savedMode === 'true');
}


darkModeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.toggle('dark-mode');
    applyDarkMode(isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
});
tbody.addEventListener('click', async function(event) {
    if (event.target.classList.contains('delete-row-btn')) {
        const rowToDelete = event.target.closest('tr');
        const medicationName = rowToDelete.getAttribute('data-medication');

        if (!medicationName) {
            alert("No medication name found. Cannot delete.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            alert("No user is logged in!");
            return;
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                let medications = userDocSnap.data().medications || [];
                
            
                const updatedMedications = medications.filter(med => med.medication !== medicationName);

           
                await updateDoc(userDocRef, { medications: updatedMedications });

      
                rowToDelete.remove();
                renumberRows();

                alert("Medication deleted successfully!");
            }
        } catch (error) {
            console.error("Error deleting medication:", error);
            alert("Failed to delete medication.");
        }
    }
});


function renumberRows() {
    const rows = tbody.querySelectorAll('tr');
    let number = 1;
    rows.forEach(row => {
        const rowNumberCell = row.querySelector('.row-number');
        if (rowNumberCell) {
            rowNumberCell.textContent = number++;
        }
    });
    rowCount = number;
}

loadMoreRows();
