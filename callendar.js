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

let userId = null; 
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid; 
        console.log("User ID:", userId); 
    } else {
        console.error("No user logged in.");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById("sidebar");
    const collapseBtn = document.getElementById("collapse-btn");
    const dashboardContainer = document.getElementById("dashboardContainer");

    collapseBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        dashboardContainer.classList.toggle("sidebar-collapsed");
    });

    // Calendar JavaScript
    const monthElement = document.querySelector('.month');
    const yearElement = document.querySelector('.year');
    const calendarGrid = document.getElementById('calendar-grid');
    let currentDate = new Date();
    const calendarView = document.getElementById('calendarView');
    const dailyAdmissionView = document.getElementById('dailyAdmissionView');
    const calendarTitleElement = document.getElementById('calendarTitle');
    const calendarTimeBox = document.getElementById('calendarTimeBox');
    const dailyAdmissionTitleDateSpan = document.getElementById('dailyAdmissionTitleDate');
    const backToCalendarBtn = document.getElementById('backToCalendarBtn');

    // Function to generate the calendar grid
    function generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        const today = new Date();

        // Clear the calendar grid
        calendarGrid.innerHTML = '';

        // Day labels
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        days.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.textContent = day;
            calendarGrid.appendChild(dayLabel);
        });

        // Empty cells before first day
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('disabled');
            calendarGrid.appendChild(emptyCell);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateCell = document.createElement('div');
            const dateLink = document.createElement('a');
            dateLink.href = '#';
            dateLink.textContent = i;

            const dayDate = new Date(year, month, i);
            const dayOfWeek = dayDate.getDay(); // 0 (Sun) to 6 (Sat)

            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday (Weekdays)
                dateLink.dataset.day = i;
                dateLink.dataset.month = month + 1;
                dateLink.dataset.year = year;

                dateLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    showDailyAdmissionForDate(selectedDate);
                });
            } else { // Weekend days (Saturday & Sunday)
                dateCell.classList.add('weekend-day'); // Apply weekend styling if desired
                dateLink.style.pointerEvents = 'none'; // Make weekend days non-clickable for Daily Admission
            }

            // Highlight today's date
            if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                dateCell.classList.add('today');
            }

            dateCell.appendChild(dateLink);
            calendarGrid.appendChild(dateCell);
        }

        // Empty cells after last day
        const totalCells = 42;
        const remainingCells = totalCells - (startingDay + daysInMonth);
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('disabled');
            calendarGrid.appendChild(emptyCell);
        }
    }

    async function showDailyAdmissionForDate(date) {
        calendarView.style.display = 'none';
        dailyAdmissionView.style.display = 'block';
        calendarTitleElement.textContent = 'Daily Admission Records';
        calendarTimeBox.style.display = 'none';
        dailyAdmissionTitleDateSpan.textContent = `Daily Admission Records for ${date}`;
    
        // Fetch data for the selected date
        await populateDailyAdmissionTable(date, userId); // Pass userId here
    }
    async function populateDailyAdmissionTable(date, userId) {
        const dailyAdmissionTbody = document.getElementById('dailyAdmissionTableBody');
        dailyAdmissionTbody.innerHTML = ''; // Clear existing table rows
    
        try {
            const docRef = doc(db, "studentAppointments", date);
            const docSnap = await getDoc(docRef);
    
            if (!docSnap.exists()) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = `<td colspan="7" style="text-align: center;">No student appointments recorded for this date.</td>`;
                dailyAdmissionTbody.appendChild(noDataRow);
                return; // Exit if no data
            }
    
            const data = docSnap.data();
            const appointments = data.appointments || [];
    
            appointments.forEach((appointment) => {
                const row = createDailyAdmissionRow(appointment, date, userId); // Pass userId here
                dailyAdmissionTbody.appendChild(row);
            });
    
        } catch (error) {
            console.error("Error fetching student appointments: ", error);
        }
    }
    function createDailyAdmissionRow(appointment, date, userId) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.section}</td>
            <td contenteditable="true">${appointment.name}</td>
            <td>${appointment.timeIn || 'N/A'}</td>  <!-- Time In is now non-editable -->
            <td contenteditable="true">${appointment.purpose}</td>
            <td><input type="time" value="${appointment.timeOut || ''}" class="time-out"></td>
            <td contenteditable="true" class="medication">${appointment.medication || ''}</td>
            <td>
                <button class="save-row-btn">Save</button>
                <button class="delete-row-btn">X</button>
            </td>
        `;
    
        row.querySelector('.save-row-btn').addEventListener('click', async () => {
            const updatedAppointment = {
                section: row.children[0].textContent, // Retrieve section
                name: row.children[1].textContent, // Retrieve name
                timeIn: appointment.timeIn, // Time In is non-editable
                purpose: row.children[3].textContent, // Retrieve purpose
                timeOut: row.querySelector('.time-out').value, // Retrieve time-out
                medication: row.children[5].textContent // Retrieve medication
            };
            console.log("Updated Appointment:", updatedAppointment); // Debugging log
            await saveAppointment(date, updatedAppointment, userId); // Pass userId here
        });
    
        row.querySelector('.delete-row-btn').addEventListener('click', async () => {
            row.remove();
            await deleteAppointment(date, appointment.name);
        });
    
        return row;
    }
    async function saveAppointment(date, appointment, userId) {
        // Validate the appointment data
        if (!appointment || typeof appointment !== "object") {
            console.error("❌ Invalid appointment data.");
            return;
        }
    
        // Ensure required fields are present and valid
        const validAppointment = {
            section: appointment.section || "N/A",
            name: appointment.name || "Unknown",
            timeIn: appointment.timeIn || "N/A",
            purpose: appointment.purpose || "N/A",
            timeOut: appointment.timeOut || "N/A",
            medication: appointment.medication || "",
        };
    
        console.log("Valid Appointment:", validAppointment); // Debugging log
    
        const docRef = doc(db, "studentAppointments", date);
        const docSnap = await getDoc(docRef);
        let appointments = docSnap.exists() ? docSnap.data().appointments : [];
    
        // Check if the appointment already exists
        const index = appointments.findIndex(a => a.name === validAppointment.name);
        if (index > -1) {
            appointments[index] = validAppointment; // Update existing appointment
        } else {
            appointments.push(validAppointment); // Add new appointment
        }
    
        // Save the updated appointments array to Firestore
        try {
            await setDoc(docRef, { appointments });
            console.log("✅ Appointment saved successfully!");
    
            // Deplete medication stock if a medication is specified
            if (validAppointment.medication && validAppointment.medication.trim() !== "") {
                if (!userId) {
                    console.error("❌ Invalid userId.");
                    return;
                }
                await updateMedicineStock(userId, validAppointment.medication); // Pass medicineName here
            }
        } catch (error) {
            console.error("🔥 Error saving appointment:", error);
        }
    }
    async function deleteAppointment(date, name) {
        const docRef = doc(db, "studentAppointments", date);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;

        let appointments = docSnap.data().appointments.filter(a => a.name !== name);
        await setDoc(docRef, { appointments });
    }
  

    async function updateMedicineStock(userId, medicineName) {
        // Validate inputs
        if (!userId || !medicineName || medicineName.trim() === "") {
            console.error("❌ Invalid userId or medicineName.");
            return;
        }
    
        const userRef = doc(db, "users", userId); // Reference to the user's document
    
        try {
            // Fetch the user's document
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                console.error("❌ User document not found!");
                return;
            }
    
            // Get the user's data
            const userData = userSnap.data();
            let medications = userData.medications || []; // Ensure medications array exists
    
            // Find the medication in the array
            const medIndex = medications.findIndex(med => med.medication === medicineName);
            if (medIndex === -1) {
                console.warn(`⚠ Medicine '${medicineName}' not found in user's medications.`);
                return;
            }
    
            // Reduce stock, ensuring it doesn't go negative
            const currentStock = parseInt(medications[medIndex].stock, 10);
            if (isNaN(currentStock) || currentStock <= 0) {
                console.warn(`⚠ Stock for ${medicineName} is already zero or invalid.`);
                return;
            }
    
            medications[medIndex].stock = String(currentStock - 1); // Update stock
    
            // Update Firestore with the new medications array
            await updateDoc(userRef, { medications });
    
            console.log(`✅ Updated stock for ${medicineName}. New count: ${medications[medIndex].stock}`);
        } catch (error) {
            console.error("🔥 Error updating medicine stock:", error);
        }
    }
    // Function to update the calendar header
    function updateCalendarHeader(date) {
        monthElement.textContent = date.toLocaleString('default', { month: 'long' }).toUpperCase();
        yearElement.textContent = date.getFullYear();
    }

    // Event listeners for month navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendarHeader(currentDate);
        generateCalendar(currentDate);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendarHeader(currentDate);
        generateCalendar(currentDate);
    });

    // Initialize the calendar
    updateCalendarHeader(currentDate);
    generateCalendar(currentDate);

    // Clock functionality for Calendar
    function updateCalendarTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('current-calendar-time').textContent = `${hours}:${minutes}:${seconds}`;
    }

    setInterval(updateCalendarTime, 1000);
    updateCalendarTime();

    // Back to Calendar button
    backToCalendarBtn.addEventListener('click', () => {
        calendarView.style.display = 'block';
        dailyAdmissionView.style.display = 'none';
        calendarTitleElement.textContent = 'Calendar';
        calendarTimeBox.style.display = 'block';
    });

    // Initialize to show Calendar view by default
    calendarView.style.display = 'block';
    dailyAdmissionView.style.display = 'none';
});
const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;

// Function to apply dark mode
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

    // Apply dark mode to table rows
    document.querySelectorAll('#dailyAdmissionTableBody tr').forEach(row => {
        if (isDarkMode) {
            row.classList.add('dark-mode');
        } else {
            row.classList.remove('dark-mode');
        }
    });
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