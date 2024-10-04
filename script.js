// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyVBia-bsTSwZSmGrztGGeyGvbk-3vGUM",
    authDomain: "night-sky-hunt-af24d.firebaseapp.com",
    databaseURL: "https://night-sky-hunt-af24d-default-rtdb.firebaseio.com",
    projectId: "night-sky-hunt-af24d",
    storageBucket: "night-sky-hunt-af24d.appspot.com",
    messagingSenderId: "649615581460",
    appId: "1:649615581460:web:13d2c0d15161e1ef43e201",
    measurementId: "G-YBD7B53TJJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Starfield Generation
const starfield = document.getElementById('starfield');
const numStars = 200;

for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${1 + Math.random() * 3}s`;
    starfield.appendChild(star);
}

// Variables and Data
let teams = {};
let teamSequences = {};
let teamScores = {};
let submissionTimes = {};
let registrationRequests = {};
let eventStart = null;
let eventEnd = null;
let currentTeam = localStorage.getItem('currentTeam') || null;
let adminLoggedIn = false;

const coordinates = {
    1: [9.52, 12.81],
    2: [9.22, 11.43],
    3: [10.14, 10.75],
    4: [11.59, 10.80],
    5: [11.67, 9.59],
    6: [10.74, 6.86],
    7: [9.44, 5.75],
    8: [9.00, 6.86],
    9: [8.59, 7.86],
    10: [6.52, 6.64],
    11: [5.85, 5.80],
    12: [4.07, 5.86],
    13: [3.44, 8.00],
    14: [5.07, 9.53],
    15: [7.00, 8.70],
    16: [7.00, 9.64],
    17: [8.00, 11.00],
    18: [6.07, 4.14],
    19: [10.44, 12.00],
    20: [11.52, 8.44]
};

const questionCodes = {
    1: 3742,
    2: 8169,
    3: 2905,
    4: 6471,
    5: 5038,
    6: 7294,
    7: 1806,
    8: 9532,
    9: 4087,
    10: 6129,
    11: 3748,
    12: 5902,
    13: 8251,
    14: 4937,
    15: 1065,
    16: 7489,
    17: 2541,
    18: 6390,
    19: 4718,
    20: 8023
};

// Fetch Initial Data from Firebase
function fetchInitialData() {
    firebase.database().ref('/').on('value', (snapshot) => {
        const data = snapshot.val();
        teams = data?.teams || {};
        teamSequences = data?.teamSequences || {};
        teamScores = data?.teamScores || {};
        submissionTimes = data?.submissionTimes || {};
        registrationRequests = data?.registrationRequests || {};
        eventStart = data?.eventStart ? parseInt(data.eventStart, 10) : null;
        eventEnd = data?.eventEnd ? parseInt(data.eventEnd, 10) : null;
        
        // Convert teamSequences objects back to arrays
        for (let teamId in teamSequences) {
            teamSequences[teamId] = Object.values(teamSequences[teamId]);
        }

        if (currentTeam && teams[currentTeam]) {
            setupTeamInterface();
        }

        if (adminLoggedIn) {
            // You can trigger leaderboard refresh here if needed
        }
    });
}

fetchInitialData();

// Function Definitions

// Initialize member inputs with minimum 2 members
function initializeMemberInputs() {
    const memberInputs = document.getElementById('memberInputs');
    memberInputs.innerHTML = '';
    for (let i = 1; i <= 2; i++) {
        addMemberInput(i);
    }
    memberCount = 2;
}

let memberCount = 2;

function addMemberInput(i) {
    const memberInputs = document.getElementById('memberInputs');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = `Member ${i} Name`;
    nameInput.required = true;
    nameInput.className = 'member-name';

    const idInput = document.createElement('input');
    idInput.type = 'text';
    idInput.placeholder = `Member ${i} ID`;
    idInput.required = true;
    idInput.className = 'member-id';

    memberInputs.appendChild(nameInput);
    memberInputs.appendChild(idInput);
}

function addMember() {
    if (memberCount >= 4) {
        alert('Maximum 4 members allowed.');
        return;
    }
    memberCount++;
    addMemberInput(memberCount);
}

function removeMember() {
    if (memberCount <= 2) {
        alert('Minimum 2 members required.');
        return;
    }
    const memberInputs = document.getElementById('memberInputs');
    memberInputs.removeChild(memberInputs.lastChild);
    memberInputs.removeChild(memberInputs.lastChild);
    memberCount--;
}

// Register Team
function registerTeam() {
    const names = Array.from(document.getElementsByClassName('member-name')).map(input => input.value.trim());
    const ids = Array.from(document.getElementsByClassName('member-id')).map(input => input.value.trim());
    const teamName = document.getElementById('teamName').value.trim();
    const teamLeaderEmail = document.getElementById('teamLeaderEmail').value.trim();
    const password = document.getElementById('teamPassword').value.trim();
    const outputDiv = document.getElementById('addTeamOutput');

    if (names.includes('') || ids.includes('') || teamName === '' || password === '' || teamLeaderEmail === '') {
        outputDiv.textContent = 'Please fill all fields.';
        return;
    }

    firebase.database().ref('/').once('value').then((snapshot) => {
        const data = snapshot.val();
        teams = data?.teams || {};
        registrationRequests = data?.registrationRequests || {};

        // Check if team name already exists
        for (let existingTeam in teams) {
            if (teams[existingTeam].teamName.toLowerCase() === teamName.toLowerCase()) {
                outputDiv.textContent = `Team name "${teamName}" is already registered.`;
                return;
            }
        }

        // Check if team name is already pending
        for (let existingRequest in registrationRequests) {
            if (registrationRequests[existingRequest].teamName.toLowerCase() === teamName.toLowerCase()) {
                outputDiv.textContent = `Team name "${teamName}" has already requested registration.`;
                return;
            }
        }

        const requestId = 'R' + new Date().getTime();
        registrationRequests[requestId] = {
            teamName,
            names,
            ids,
            teamLeaderEmail,
            password,
            status: 'pending'
        };

        firebase.database().ref('/registrationRequests/' + requestId).set(registrationRequests[requestId]).then(() => {
            outputDiv.textContent = 'Registration request submitted. Please wait for admin approval.';
            document.getElementById('teamForm').reset();
            initializeMemberInputs();
        }).catch((error) => {
            console.error("Error registering team:", error);
            outputDiv.textContent = 'An error occurred. Please try again.';
        });
    }).catch((error) => {
        console.error("Error accessing database:", error);
        outputDiv.textContent = 'An error occurred. Please try again.';
    });
}

// Team Login
function teamLogin() {
    const teamName = document.getElementById('teamNameLogin').value.trim();
    const password = document.getElementById('teamPasswordLogin').value.trim();
    const outputDiv = document.getElementById('startHuntOutput');

    firebase.database().ref('/teams').once('value').then((snapshot) => {
        teams = snapshot.val() || {};
        let found = false;
        let teamIdFound = null;
        for (let teamId in teams) {
            if (teams[teamId].teamName.toLowerCase() === teamName.toLowerCase() && teams[teamId].password === password) {
                found = true;
                teamIdFound = teamId;
                break;
            }
        }

        if (found) {
            currentTeam = teamIdFound;
            localStorage.setItem('currentTeam', currentTeam);
            outputDiv.textContent = 'Login successful!';
            document.getElementById('startHuntModal').style.display = 'none';
            document.getElementById('buttonContainer').style.display = 'none';

            if (teams[currentTeam].currentQuestionIndex !== undefined && teams[currentTeam].currentQuestionIndex !== null) {
                setupTeamInterface();
            } else {
                document.getElementById('startHuntContainer').style.display = 'block';
            }
        } else {
            // Check if the team is pending approval
            firebase.database().ref('/registrationRequests').once('value').then((snapshot) => {
                const requests = snapshot.val() || {};
                let pending = false;
                for (let requestId in requests) {
                    const request = requests[requestId];
                    if (request.teamName.toLowerCase() === teamName.toLowerCase() && request.password === password && request.status === 'pending') {
                        pending = true;
                        break;
                    }
                }
                if (pending) {
                    outputDiv.textContent = 'Your registration is pending approval. Please wait.';
                } else {
                    outputDiv.textContent = 'Invalid team name or password.';
                }
            }).catch((error) => {
                console.error("Error accessing registration requests:", error);
                outputDiv.textContent = 'An error occurred. Please try again.';
            });
        }
    }).catch((error) => {
        console.error("Error accessing teams:", error);
        outputDiv.textContent = 'An error occurred. Please try again.';
    });
}

// Setup Team Interface
function setupTeamInterface() {
    document.getElementById('coordinateFinder').style.display = 'block';
    document.getElementById('startHuntContainer').style.display = 'none';
    document.getElementById('buttonContainer').style.display = 'none';

    const sequence = teamSequences[currentTeam];
    let currentIndex = teams[currentTeam].currentQuestionIndex || 0;

    if (currentIndex < sequence.length) {
        const currentQuestionNumber = sequence[currentIndex];
        const [x, y] = coordinates[currentQuestionNumber];
        document.getElementById('coordinateDisplay').textContent = `Your coordinates are: (${x}, ${y})`;
    } else {
        document.getElementById('coordinateDisplay').textContent = '';
        alert("Congratulations! You have completed all questions!");
    }

    const teamScore = teamScores[currentTeam] || 0;
    document.getElementById('scoreDisplay').textContent = `Your current score: ${teamScore} points`;
}

// Start Hunt
function startHunt() {
    checkEventStatus().then((status) => {
        if (status === 'notSet') {
            alert('Event time not set by admin.');
            return;
        }
        if (status === 'notStarted') {
            alert('Event not started yet.');
            return;
        } else if (status === 'ended') {
            alert('Event has ended.');
            return;
        }

        document.getElementById('startHuntContainer').style.display = 'none';
        document.getElementById('coordinateFinder').style.display = 'block';

        const sequence = teamSequences[currentTeam];
        let currentIndex = teams[currentTeam].currentQuestionIndex;

        if (currentIndex === undefined || currentIndex === null) {
            currentIndex = 0;
            firebase.database().ref('/teams/' + currentTeam + '/currentQuestionIndex').set(currentIndex).catch((error) => {
                console.error("Error setting currentQuestionIndex:", error);
            });
        }

        if (currentIndex < sequence.length) {
            const currentQuestionNumber = sequence[currentIndex];
            const [x, y] = coordinates[currentQuestionNumber];
            document.getElementById('coordinateDisplay').textContent = `Your coordinates are: (${x}, ${y})`;
        } else {
            document.getElementById('coordinateDisplay').textContent = '';
            alert("Congratulations! You have completed all questions!");
        }

        // Display current score
        firebase.database().ref('/teamScores/' + currentTeam).once('value').then((scoreSnapshot) => {
            teamScores = scoreSnapshot.val() || 0;
            document.getElementById('scoreDisplay').textContent = `Your current score: ${teamScores} points`;
        }).catch((error) => {
            console.error("Error fetching team score:", error);
        });
    }).catch((error) => {
        console.error("Error checking event status:", error);
    });
}

// Team Logout
function teamLogout() {
    currentTeam = null;
    localStorage.removeItem('currentTeam');
    document.getElementById('coordinateFinder').style.display = 'none';
    document.getElementById('buttonContainer').style.display = 'flex';
    document.getElementById('codeInput').value = '';
    document.getElementById('output').textContent = '';
    document.getElementById('coordinateDisplay').textContent = '';
    document.getElementById('scoreDisplay').textContent = '';
    document.getElementById('startHuntContainer').style.display = 'none';
}

// Get Next Coordinates
function getNextCoordinates() {
    if (!currentTeam) {
        alert('Please login first.');
        return;
    }

    checkEventStatus().then((status) => {
        if (status === 'notSet') {
            alert('Event time not set by admin.');
            return;
        }
        if (status === 'notStarted') {
            alert("Event not started yet.");
            return;
        } else if (status === 'ended') {
            alert("Sorry, the event has ended.");
            document.getElementById('coordinateFinder').style.display = 'none';
            alert("Event has ended.");
            return;
        }

        const input = document.getElementById('codeInput').value.trim();
        const outputDiv = document.getElementById('output');

        if (!/^\d{6}$/.test(input)) {
            outputDiv.textContent = "Please enter a valid 6-digit code.";
            return;
        }

        const currentQuestionCode = parseInt(input.slice(2), 10);

        let currentQuestionNumber = null;
        for (const [qNum, qCode] of Object.entries(questionCodes)) {
            if (qCode === currentQuestionCode) {
                currentQuestionNumber = parseInt(qNum, 10);
                break;
            }
        }

        if (!currentQuestionNumber) {
            outputDiv.textContent = "Invalid question code.";
            return;
        }

        const sequence = teamSequences[currentTeam];
        let currentIndex = teams[currentTeam].currentQuestionIndex;

        if (currentIndex === undefined || currentIndex === null) {
            currentIndex = 0;
        }

        if (sequence[currentIndex] !== currentQuestionNumber) {
            outputDiv.textContent = "Incorrect code. Please try again.";
            return;
        }

        // Update team's progress
        currentIndex++;
        firebase.database().ref('/teams/' + currentTeam + '/currentQuestionIndex').set(currentIndex).catch((error) => {
            console.error("Error updating currentQuestionIndex:", error);
        });

        // Update team score
        firebase.database().ref('/teamScores/' + currentTeam).once('value').then((scoreSnapshot) => {
            teamScores = scoreSnapshot.val() || 0;
            teamScores += 5;
            firebase.database().ref('/teamScores/' + currentTeam).set(teamScores).then(() => {
                document.getElementById('scoreDisplay').textContent = `Your current score: ${teamScores} points`;
            }).catch((error) => {
                console.error("Error updating team score:", error);
            });
        }).catch((error) => {
            console.error("Error fetching team score:", error);
        });

        // Update submission time
        const currentTime = new Date().toLocaleString();
        submissionTimes[currentTeam] = currentTime;
        firebase.database().ref('/submissionTimes/' + currentTeam).set(currentTime).catch((error) => {
            console.error("Error updating submission time:", error);
        });

        // Provide next coordinate or completion message
        if (currentIndex < sequence.length) {
            const nextQuestionNumber = sequence[currentIndex];
            const [x, y] = coordinates[nextQuestionNumber];
            outputDiv.textContent = `Correct! The coordinates of your next question are: (${x}, ${y})`;
            document.getElementById('coordinateDisplay').textContent = '';
        } else {
            outputDiv.textContent = "Congratulations! You have completed all questions!";
            document.getElementById('coordinateDisplay').textContent = '';
        }

        // Clear input
        document.getElementById('codeInput').value = '';
    }).catch((error) => {
        console.error("Error checking event status:", error);
    });
}

// Admin Login
function adminLogin() {
    const password = document.getElementById('adminPassword').value.trim();
    const outputDiv = document.getElementById('adminLoginOutput');

    const adminPassword = 'admin123'; // Change this to your desired admin password

    if (password === adminPassword) {
        adminLoggedIn = true;
        outputDiv.textContent = 'Login successful!';
        document.getElementById('adminLoginModal').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        document.getElementById('buttonContainer').style.display = 'none';
    } else {
        outputDiv.textContent = 'Incorrect password.';
    }
}

// Admin Logout
function adminLogout() {
    adminLoggedIn = false;
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('buttonContainer').style.display = 'flex';
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginOutput').textContent = '';
}

// Show Leaderboard
function showLeaderboard() {
    if (!adminLoggedIn) return;
    const adminOptionTitle = document.getElementById('adminOptionTitle');
    const adminOptionContent = document.getElementById('adminOptionContent');
    const adminOptionModal = document.getElementById('adminOptionModal');

    firebase.database().ref('/').once('value').then((snapshot) => {
        const data = snapshot.val();
        teams = data?.teams || {};
        teamScores = data?.teamScores || {};

        let leaderboard = [];

        for (let teamId in teamScores) {
            leaderboard.push({
                teamId,
                score: teamScores[teamId]
            });
        }

        leaderboard.sort((a, b) => b.score - a.score);

        let output = 'Leaderboard:\n\n';
        leaderboard.forEach((entry, index) => {
            output += `${index + 1}. ${teams[entry.teamId]?.teamName || 'Unknown Team'} (${entry.teamId}) - ${entry.score} points\n`;
        });

        adminOptionTitle.textContent = 'Leaderboard';
        adminOptionContent.textContent = output;
        adminOptionModal.style.display = 'block';
    }).catch((error) => {
        console.error("Error fetching leaderboard:", error);
        adminOptionContent.textContent = 'Error fetching leaderboard.';
        adminOptionModal.style.display = 'block';
    });
}

// Show Team Sequences
function showTeamSequences() {
    if (!adminLoggedIn) return;
    const adminOptionTitle = document.getElementById('adminOptionTitle');
    const adminOptionContent = document.getElementById('adminOptionContent');
    const adminOptionModal = document.getElementById('adminOptionModal');

    firebase.database().ref('/').once('value').then((snapshot) => {
        const data = snapshot.val();
        teams = data?.teams || {};
        teamSequences = data?.teamSequences || {};

        let output = 'Team Question Sequences:\n\n';

        for (let teamId in teamSequences) {
            output += `${teams[teamId]?.teamName || 'Unknown Team'} (${teamId}): ${teamSequences[teamId].join(', ')}\n`;
        }

        adminOptionTitle.textContent = 'Team Question Sequences';
        adminOptionContent.textContent = output;
        adminOptionModal.style.display = 'block';
    }).catch((error) => {
        console.error("Error fetching team sequences:", error);
        adminOptionContent.textContent = 'Error fetching team sequences.';
        adminOptionModal.style.display = 'block';
    });
}

// Show Submission Times
function showSubmissionTimes() {
    if (!adminLoggedIn) return;
    const adminOptionTitle = document.getElementById('adminOptionTitle');
    const adminOptionContent = document.getElementById('adminOptionContent');
    const adminOptionModal = document.getElementById('adminOptionModal');

    firebase.database().ref('/').once('value').then((snapshot) => {
        const data = snapshot.val();
        teams = data?.teams || {};
        submissionTimes = data?.submissionTimes || {};

        let output = 'Latest Submission Times:\n\n';

        for (let teamId in submissionTimes) {
            output += `${teams[teamId]?.teamName || 'Unknown Team'} (${teamId}): ${submissionTimes[teamId] || 'No submissions yet'}\n`;
        }

        adminOptionTitle.textContent = 'Submission Times';
        adminOptionContent.textContent = output;
        adminOptionModal.style.display = 'block';
    }).catch((error) => {
        console.error("Error fetching submission times:", error);
        adminOptionContent.textContent = 'Error fetching submission times.';
        adminOptionModal.style.display = 'block';
    });
}

// Reset Event
function resetEvent() {
    openResetModal();
}

// Open Reset Confirmation Modal
function openResetModal() {
    if (!adminLoggedIn) return;
    document.getElementById('resetModal').style.display = 'block';
}

// Confirm Reset Event
function confirmResetEvent() {
    firebase.database().ref('/').set(null).then(() => {
        teams = {};
        teamSequences = {};
        teamScores = {};
        submissionTimes = {};
        registrationRequests = {};
        eventStart = null;
        eventEnd = null;
        closeModal('resetModal');
        alert('Event has been reset.');
        adminLogout();
    }).catch((error) => {
        console.error("Error resetting event:", error);
        alert('An error occurred while resetting the event.');
    });
}

// Open Set Time Modal
function openSetTimeModal() {
    if (!adminLoggedIn) return;
    document.getElementById('setTimeModal').style.display = 'block';
    populateEventTimes();
}

// Populate Event Times if already set
function populateEventTimes() {
    firebase.database().ref('/').once('value').then((snapshot) => {
        const data = snapshot.val();
        eventStart = data?.eventStart ? parseInt(data.eventStart, 10) : null;
        eventEnd = data?.eventEnd ? parseInt(data.eventEnd, 10) : null;

        if (eventStart) {
            const startDate = new Date(eventStart);
            const startInput = document.getElementById('eventStartInput');
            startInput.value = startDate.toISOString().slice(0,16);
        }

        if (eventEnd) {
            const endDate = new Date(eventEnd);
            const endInput = document.getElementById('eventEndInput');
            endInput.value = endDate.toISOString().slice(0,16);
        }
    }).catch((error) => {
        console.error("Error fetching event times:", error);
    });
}

// Set Event Time
function setEventTime() {
    const eventStartInput = document.getElementById('eventStartInput').value;
    const eventEndInput = document.getElementById('eventEndInput').value;
    const outputDiv = document.getElementById('setTimeOutput');

    if (!eventStartInput || !eventEndInput) {
        outputDiv.textContent = 'Please select both start and end times.';
        return;
    }

    const startTime = new Date(eventStartInput).getTime();
    const endTime = new Date(eventEndInput).getTime();

    if (endTime <= startTime) {
        outputDiv.textContent = 'End time must be after start time.';
        return;
    }

    firebase.database().ref('/eventStart').set(startTime.toString()).then(() => {
        firebase.database().ref('/eventEnd').set(endTime.toString()).then(() => {
            outputDiv.textContent = 'Event time has been set successfully!';
        }).catch((error) => {
            console.error("Error setting event end time:", error);
            outputDiv.textContent = 'Error setting event end time.';
        });
    }).catch((error) => {
        console.error("Error setting event start time:", error);
        outputDiv.textContent = 'Error setting event start time.';
    });
}

// Handle clicks outside modals to close them
window.onclick = function(event) {
    const modals = ['addTeamModal', 'startHuntModal', 'adminLoginModal', 'adminOptionModal', 'setTimeModal', 'resetModal', 'registrationRequestModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target == modal) {
            closeModal(modalId);
        }
    });
}

// Admin Option Modal Functions
function openAdminOptionModal(option) {
    if (!adminLoggedIn) return;
    switch(option) {
        case 'leaderboard':
            showLeaderboard();
            break;
        case 'teamSequences':
            showTeamSequences();
            break;
        case 'submissionTimes':
            showSubmissionTimes();
            break;
        default:
            break;
    }
}

function closeAdminOptionModal() {
    document.getElementById('adminOptionModal').style.display = 'none';
    document.getElementById('adminOptionContent').textContent = '';
    document.getElementById('adminOptionTitle').textContent = 'Option Title';
}

// Event Timing Control
function checkEventStatus() {
    return firebase.database().ref('/').once('value').then((snapshot) => {
        const data = snapshot.val();
        eventStart = data?.eventStart ? parseInt(data.eventStart, 10) : null;
        eventEnd = data?.eventEnd ? parseInt(data.eventEnd, 10) : null;
        const now = new Date().getTime();
        if (!eventStart || !eventEnd) {
            return 'notSet';
        }
        if (now < eventStart) {
            return 'notStarted';
        } else if (now > eventEnd) {
            return 'ended';
        } else {
            return 'ongoing';
        }
    }).catch((error) => {
        console.error("Error checking event status:", error);
        return 'error';
    });
}

// Open Registration Requests Modal
function openRegistrationRequestsModal() {
    if (!adminLoggedIn) return;
    document.getElementById('registrationRequestModal').style.display = 'block';
    displayRegistrationRequests();
}

// Display Registration Requests
function displayRegistrationRequests() {
    const requestsDiv = document.getElementById('registrationRequestsContent');
    requestsDiv.innerHTML = '';

    firebase.database().ref('/registrationRequests').once('value').then((snapshot) => {
        registrationRequests = snapshot.val() || {};

        for (let requestId in registrationRequests) {
            const request = registrationRequests[requestId];
            const requestDiv = document.createElement('div');
            requestDiv.className = 'registration-request';

            const teamInfo = document.createElement('span');
            teamInfo.textContent = `Team: ${request.teamName}, Members: ${request.names.join(', ')}`;

            if (request.status === 'pending') {
                const approveButton = document.createElement('button');
                approveButton.textContent = 'Approve';
                approveButton.onclick = () => approveRegistrationRequest(requestId, approveButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = 'delete-button';
                deleteButton.onclick = () => deleteRegistrationRequest(requestId);

                requestDiv.appendChild(teamInfo);
                requestDiv.appendChild(approveButton);
                requestDiv.appendChild(deleteButton);
            }

            requestsDiv.appendChild(requestDiv);
        }

        if (Object.keys(registrationRequests).length === 0) {
            requestsDiv.textContent = 'No registration requests.';
        }
    }).catch((error) => {
        console.error("Error fetching registration requests:", error);
        requestsDiv.textContent = 'Error fetching registration requests.';
    });
}

// Approve Registration Request
function approveRegistrationRequest(requestId, buttonElement) {
    const request = registrationRequests[requestId];
    const teamId = 'T' + new Date().getTime();

    teams[teamId] = {
        teamName: request.teamName,
        names: request.names,
        ids: request.ids,
        teamLeaderEmail: request.teamLeaderEmail,
        password: request.password,
        currentQuestionIndex: 0
    };

    teamSequences[teamId] = generateRandomSequence(20);

    teamScores[teamId] = 0;
    submissionTimes[teamId] = null;

    // Save data to Firebase
    const updates = {};
    updates[`/teams/${teamId}`] = teams[teamId];
    updates[`/teamSequences/${teamId}`] = teamSequences[teamId];
    updates[`/teamScores/${teamId}`] = teamScores[teamId];
    updates[`/submissionTimes/${teamId}`] = submissionTimes[teamId];

    firebase.database().ref('/').update(updates).then(() => {
        // Remove the registration request
        firebase.database().ref('/registrationRequests/' + requestId).remove().then(() => {
            displayRegistrationRequests();
            alert(`Team "${request.teamName}" has been approved.`);
        }).catch((error) => {
            console.error("Error removing registration request:", error);
        });
    }).catch((error) => {
        console.error("Error updating Firebase with new team data:", error);
    });
}

// Delete Registration Request
function deleteRegistrationRequest(requestId) {
    firebase.database().ref('/registrationRequests/' + requestId).remove().then(() => {
        displayRegistrationRequests();
        alert('Registration request has been deleted.');
    }).catch((error) => {
        console.error("Error deleting registration request:", error);
    });
}

// Generate random sequence
function generateRandomSequence(n) {
    const array = Array.from({length: n}, (_, index) => index + 1);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    // Convert array to object before saving to Firebase
    const sequenceObject = {};
    array.forEach((value, index) => {
        sequenceObject[index] = value;
    });
    return sequenceObject;
}

// Handle event end
function handleEventEnd() {
    checkEventStatus().then((status) => {
        if (status === 'ended') {
            if (currentTeam) {
                alert("Event has ended.");
                teamLogout();
            }
        }
    }).catch((error) => {
        console.error("Error handling event end:", error);
    });
}

// Set interval to check event status every minute
setInterval(handleEventEnd, 60000);

// Function to open modals
function openAddTeamModal() {
    document.getElementById('addTeamModal').style.display = 'block';
    initializeMemberInputs();
}

function openStartHuntModal() {
    document.getElementById('startHuntModal').style.display = 'block';
}

function openAdminLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'block';
}

// Function to close modals
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    // Clear output messages
    switch(modalId) {
        case 'addTeamModal':
            document.getElementById('addTeamOutput').textContent = '';
            break;
        case 'startHuntModal':
            document.getElementById('startHuntOutput').textContent = '';
            break;
        case 'adminLoginModal':
            document.getElementById('adminLoginOutput').textContent = '';
            break;
        case 'adminOptionModal':
            document.getElementById('adminOptionContent').textContent = '';
            document.getElementById('adminOptionTitle').textContent = 'Option Title';
            break;
        case 'setTimeModal':
            document.getElementById('setTimeOutput').textContent = '';
            break;
        case 'resetModal':
            // No additional action needed
            break;
        case 'registrationRequestModal':
            // No additional action needed
            break;
        default:
            break;
    }
}

// Setup Team Interface on Page Load if Logged In
if (currentTeam && teams[currentTeam]) {
    setupTeamInterface();
}
