import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged , createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, doc, where, orderBy, limit, arrayUnion, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyA6ruE8_Je180qm8QvhqXpXDV3jZ0uYi_w",
    authDomain: "cfsi-clinic.firebaseapp.com",
    projectId: "cfsi-clinic",
    storageBucket: "cfsi-clinic.firebasestorage.app",
    messagingSenderId: "1033385834319",
    appId: "1:1033385834319:web:4157095c0bed489770773a",
    measurementId: "G-2WZT5LYKGP"
  };

  let userSelectedGrade = null;
  let userSelectedStrand = null;
  let userSelectedSection = null;

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);

  const auth = getAuth(app);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      
     
    } else {
        alert('no user logged in');
    window.location.assign('portalsection.html');
      const uid = user.uid;
    }
  });

 const sidebar = document.getElementById("sidebar");
 const collapseBtn = document.getElementById("collapse-btn");
 const dashboardContainer = document.getElementById('dashboardContainer');

 collapseBtn.addEventListener("click", () => {
     sidebar.classList.toggle("collapsed");
     dashboardContainer.classList.toggle('sidebar-collapsed');
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

document.addEventListener('DOMContentLoaded', function() {
    const recordTableBody = document.getElementById('recordTableBody');
    const headerGradeStrandSectionSpan = document.getElementById('headerGradeStrandSection');
    const recordTableContainer = document.getElementById('recordTableContainer');
    const studentInfoDisplay = document.getElementById('studentInfoDisplay'); // Get Student Info Display Section
    const backToListButton = document.getElementById('backToListButton'); // Back to list button
    const backToSelectionButton = document.getElementById('backToSelectionButton'); // Back to selection button
    const studentNameInput = document.getElementById('name'); // Get the student name input field

    const gradeLevelButtonsDiv = document.getElementById('gradeLevelButtons');
    const strandButtonsDiv = document.getElementById('strandButtons');
    const sectionButtonsDiv = document.getElementById('sectionButtons');

    let rowCount = 1;
    const rowsToLoad = 70;
    let currentGrade = null;
    let currentStrand = null;
    let currentSection = null;
    let currentlyClickedNameLink = null; // Variable to store the clicked name link

    const predefinedSections = { // Predefined sections data (Keep as is)
        'Grade 11': {
            'ICT': ["BABBAGE", "WAYNE", "NAPIER"],
            'HUMSS': ["MACHIAVELLI", "ROUSSEAU", "GALILEO", "NIETZSCHE", "HOBBES"],
            'ABM': ["DECARTES", "COLLINSON", "PRICE", "STEVENSB"]
        },
        'Grade 12': {
            'ICT': ["GATES", "JOBS", "ROBERTS"],
            'HUMSS': ["ARISTOTLE", "LOCKE", "SOCRATES", "PLATO", "CONFUCIUS"],
            'ABM': ["VALIX", "PACIOLI", "MARX"]
        }
    };

    function initializeTable() {
        recordTableBody.innerHTML = '';
        rowCount = 1;
        for (let i = 0; i < rowsToLoad; i++) addRow();
    }

    function addRow() { /* Function to add blank row (Modified to show info section on click) */
        const row = recordTableBody.insertRow();
        row.insertCell().textContent = rowCount++;
        // Make the "Name of student" cell contain a link
        let nameCell = row.insertCell();
        // Create an <a> element
        let nameLink = document.createElement('a');
        nameLink.href = '#'; // Placeholder link, prevents page jump, or use javascript:void(0);
        nameLink.textContent = ''; // Initially empty, can be filled by user
        nameCell.appendChild(nameLink);
        nameCell.classList.add('student-name'); // Add the CSS class for styling

        nameLink.addEventListener('click', function(event) { // Add click event listener
            event.preventDefault(); // Prevent default link behavior (page jump if href='#')
            recordTableContainer.style.display = 'none'; // Hide student list table
            backToSelectionButton.style.display = 'none'; // Hide back to selection button
            studentInfoDisplay.style.display = 'block'; // Show the student info section
            currentlyClickedNameLink = this; // Store the clicked link
            studentNameInput.value = this.textContent; // PRE-FILL the student name input with the clicked name
        });

        row.insertCell().contentEditable = 'true';
        row.insertCell().contentEditable = 'true';
        row.insertCell().contentEditable = 'true';
    }

    function showStrandButtons(gradeLevel) { // Function to show strand buttons for a grade
        currentGrade = gradeLevel;
        gradeLevelButtonsDiv.style.display = 'none';
        strandButtonsDiv.innerHTML = ''; // Clear any previous buttons
        strandButtonsDiv.style.display = 'flex';
        studentInfoDisplay.style.display = 'none'; // Hide student info when changing view
        recordTableContainer.style.display = 'none'; // Hide table when changing view
        backToSelectionButton.style.display = 'none'; // Hide back to selection button

        const strands = predefinedSections[`Grade ${gradeLevel}`];
        for (const strand in strands) {
            if (strands.hasOwnProperty(strand)) {
                const strandButton = document.createElement('button');
                strandButton.className = 'navigation-button';
                strandButton.textContent = `${strand} Strand`;
                strandButton.dataset.strand = strand; // Store strand for later use

                strandButton.addEventListener('click', function() {
                    showSectionButtons(gradeLevel, strand);
                    userSelectedStrand = strand
                });
                strandButtonsDiv.appendChild(strandButton);
            }
        }
    }

    function showSectionButtons(gradeLevel, strandName) { // Function to show section buttons for a strand
        currentStrand = strandName;
        strandButtonsDiv.style.display = 'none';
        sectionButtonsDiv.innerHTML = ''; // Clear previous section buttons
        sectionButtonsDiv.style.display = 'flex';
        studentInfoDisplay.style.display = 'none'; // Hide student info when changing view
        recordTableContainer.style.display = 'none'; // Hide table when changing view
        backToSelectionButton.style.display = 'none'; // Hide back to selection button

        const sections = predefinedSections[`Grade ${gradeLevel}`][strandName];
        sections.forEach(section => {
            const sectionButton = document.createElement('button');
            sectionButton.className = 'navigation-button';
            sectionButton.textContent = section;
            sectionButton.dataset.section = section;

            sectionButton.addEventListener('click', function() {
                currentSection = section;
                showStudentListTable(gradeLevel, strandName, section);
                userSelectedSection = section
            });
            sectionButtonsDiv.appendChild(sectionButton);
        });
    }

    function showStudentListTable(gradeLevel, strandName, sectionName) { // Function to show table
        currentGrade = gradeLevel;
        currentStrand = strandName;
        currentSection = sectionName;
        sectionButtonsDiv.style.display = 'none';
        headerGradeStrandSectionSpan.textContent = `GRADE ${gradeLevel} / ${strandName} / ${sectionName} `;
        recordTableContainer.style.display = 'flex'; // Show the table
        studentInfoDisplay.style.display = 'none'; // Hide student info when showing table
        backToSelectionButton.style.display = 'block'; // Show back to selection button
        initializeTable(); // Initialize the table with blank rows
    }

    // Back to List Button - Event Listener to Hide Student Info and Show Table
    backToListButton.addEventListener('click', function() {
        studentInfoDisplay.style.display = 'none'; // Hide Student Info Section
        recordTableContainer.style.display = 'flex'; // Show Student List Table
        backToSelectionButton.style.display = 'block'; // Show back to selection button

        if (currentlyClickedNameLink) { // Check if a name link was clicked
            currentlyClickedNameLink.textContent = studentNameInput.value; // Update the link text with the input value
        }
        currentlyClickedNameLink = null; // Reset the stored link after updating
        studentNameInput.value = ''; // Clear the input field after updating the table
    });

    // Back to Selection Button - Event Listener to go back to Grade Selection
    backToSelectionButton.addEventListener('click', function() {
        recordTableContainer.style.display = 'none'; // Hide table
        backToSelectionButton.style.display = 'none'; // Hide back to selection button
        strandButtonsDiv.style.display = 'none'; // Hide strand buttons if visible
        sectionButtonsDiv.style.display = 'none'; // Hide section buttons if visible
        gradeLevelButtonsDiv.style.display = 'flex'; // Show grade level buttons
    });

    // Grade Level Button Event Listeners
    gradeLevelButtonsDiv.addEventListener('click', function(event) {
        if (event.target.classList.contains('navigation-button')) {
            const selectedGrade = event.target.dataset.grade;
            userSelectedGrade = event.target.dataset.grade
            showStrandButtons(selectedGrade);
        }
    });

    // Initialize with Grade Level Buttons visible and Table Hidden
    gradeLevelButtonsDiv.style.display = 'flex';
    recordTableContainer.style.display = 'none'; // Initially hide the table
    studentInfoDisplay.style.display = 'none'; // Initially hide student info
    backToSelectionButton.style.display = 'none'; // Initially hide back to selection button
});

// Function to copy table to Excel/CSV format (Keep as is) - NO CHANGES IN JS
function copyToExcel() {
    const table = document.getElementById('recordTableBody');
    let csv = [];

    let headerRow = Array.from(document.querySelectorAll('#recordTableBody thead th')).map(th => th.textContent.trim());
    csv.push(headerRow.join(','));

    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        let rowData = [];
        const cells = rows[i].cells;
        for (let j = 0; j < cells.length; j++) {
            rowData.push(cells[j].textContent.trim());
        }
        csv.push(rowData.join(','));
    }

    downloadCSVFile(csv.join('\n'), 'clinic_records.csv');
}

function downloadCSVFile(csvData, filename) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}