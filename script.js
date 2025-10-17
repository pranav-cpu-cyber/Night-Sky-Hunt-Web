// ===============================
// Night Sky Hunt - script.js
// ===============================

// ===============================
// Optional: Firebase Config (fill if using)
// ===============================
/*
const firebaseConfig = {
apiKey: "",
authDomain: "",
projectId: "",
storageBucket: "",
messagingSenderId: "",
appId: ""
};
// Initialize Firebase if needed
*/

// ===============================
// Admin Password (change this!)
// ===============================
const ADMIN_PASSWORD = "admin123";

// ===============================
// Elements
// ===============================
const pages = document.querySelectorAll('.page');
const homeBtn = document.getElementById('homeBtn');
const teamRegBtn = document.getElementById('teamRegBtn');
const teamLoginBtn = document.getElementById('teamLoginBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');

const teamRegPage = document.getElementById('teamRegPage');
const teamLoginPage = document.getElementById('teamLoginPage');
const adminLoginPage = document.getElementById('adminLoginPage');
const teamDashboard = document.getElementById('teamDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const homePage = document.getElementById('homePage');

// ===============================
// Storage Helpers
// ===============================
function getData(key) {
return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}

// ===============================
// Navigation
// ===============================
function showPage(page) {
pages.forEach(p => p.classList.remove('active'));
page.classList.add('active');
}

homeBtn.onclick = () => showPage(homePage);
teamRegBtn.onclick = () => showPage(teamRegPage);
teamLoginBtn.onclick = () => showPage(teamLoginPage);
adminLoginBtn.onclick = () => showPage(adminLoginPage);

// ===============================
// Sequences (20 sequences of 20 numbers)
// ===============================
const sequences = [
[7,14,3,11,19,2,16,5,9,1,18,8,13,4,15,10,12,17,6,20],
[5,17,2,9,14,6,1,10,8,20,3,12,4,19,15,18,13,7,11,16],
[10,3,18,7,1,8,6,19,15,5,2,16,13,17,20,4,12,14,9,11],
[14,8,16,2,19,5,13,9,6,3,11,1,10,20,7,15,4,18,12,17],
[7,1,5,18,13,2,12,16,11,8,17,4,14,9,6,19,20,10,15,3],
[2,4,10,6,7,15,18,13,1,12,8,20,16,5,14,9,3,11,17,19],
[8,11,6,19,4,14,10,1,12,2,9,17,3,15,7,13,18,20,5,16],
[16,9,14,1,11,3,19,5,7,6,18,10,2,8,20,12,15,4,17,13],
[12,18,8,13,6,10,3,7,20,11,19,5,9,2,1,16,4,15,14,17],
[3,7,11,5,18,8,17,4,1,14,6,9,15,10,13,2,12,20,19,16],
[19,6,9,3,20,1,16,15,5,18,7,14,2,13,4,11,8,10,17,12],
[9,12,19,10,3,11,8,6,2,16,15,7,20,4,5,1,14,17,18,13],
[20,15,4,8,17,9,5,14,6,7,13,19,1,16,10,18,3,2,12,11],
[11,14,17,16,12,19,2,3,13,1,5,8,18,6,9,20,15,7,10,4],
[4,16,13,20,8,17,7,2,14,9,1,3,11,10,6,5,19,12,15,18],
[13,10,1,6,17,2,15,7,19,4,20,8,16,12,9,14,3,18,5,11],
[15,5,12,14,8,4,3,20,6,1,16,7,9,19,11,10,17,13,2,18],
[6,8,15,1,9,5,2,17,13,19,10,11,7,3,16,18,20,14,4,12],
[18,7,9,11,2,3,5,12,4,13,8,6,16,20,17,10,15,14,19,1],
[17,13,20,2,4,7,9,6,5,12,14,15,10,1,19,18,8,3,11,16]
];

// ===============================
// Team Registration
// ===============================
const teamRegForm = document.getElementById('teamRegForm');
const teamRegMsg = document.getElementById('teamRegMsg');

teamRegForm.onsubmit = e => {
e.preventDefault();
const teamName = document.getElementById('teamName').value.trim();
const players = Array.from(document.querySelectorAll('.playerName'))
.map(p => p.value.trim())
.filter(name => name !== "");

if (players.length === 0) {
teamRegMsg.textContent = "At least one player is required.";
return;
}
if (players.length > 4) {
teamRegMsg.textContent = "Max 4 players allowed.";
return;
}

const pendingTeams = getData('pendingTeams');
pendingTeams.push({ teamName, players });
setData('pendingTeams', pendingTeams);
teamRegMsg.textContent = `Team '${teamName}' registered. Await admin approval.`;
teamRegForm.reset();
};

// ===============================
// Team Login
// ===============================
const teamLoginForm = document.getElementById('teamLoginForm');
const teamLoginMsg = document.getElementById('teamLoginMsg');
const teamWelcome = document.getElementById('teamWelcome');

teamLoginForm.onsubmit = e => {
e.preventDefault();
const teamNumber = parseInt(document.getElementById('loginTeamNumber').value);
const approvedTeams = getData('approvedTeams');
const team = approvedTeams.find(t => t.teamNumber === teamNumber);
if (!team) {
teamLoginMsg.textContent = "Invalid team number or not approved yet.";
return;
}
localStorage.setItem('currentTeam', teamNumber);
teamWelcome.textContent = `Welcome, Team ${team.teamName} (#${teamNumber})`;
showPage(teamDashboard);
};

// ===============================
// Coordinate Finder
// ===============================
const coordForm = document.getElementById('coordForm');
const coordResult = document.getElementById('coordResult');

coordForm.onsubmit = e => {
e.preventDefault();
const code = document.getElementById('questionCode').value.trim();
const teamNumber = parseInt(localStorage.getItem('currentTeam'));
if (!teamNumber) {
coordResult.textContent = "Not logged in.";
return;
}
const approvedTeams = getData('approvedTeams');
const team = approvedTeams.find(t => t.teamNumber === teamNumber);
if (!team) {
coordResult.textContent = "Team not found.";
return;
}

const questionMapping = getData('questions');
const seq = team.sequence;
// find current index based on code
const qObj = questionMapping.find(q => q.code === code);
if (!qObj) {
coordResult.textContent = "Invalid code.";
return;
}

const qIndex = seq.indexOf(qObj.id);
const nextIndex = qIndex + 1;
if (nextIndex >= seq.length) {
coordResult.textContent = "🎉 You’ve completed the hunt!";
return;
}
const nextQid = seq[nextIndex];
const nextQ = questionMapping.find(q => q.id === nextQid);
coordResult.textContent = nextQ ? `Next Coordinates: ${nextQ.coords}` : "No next question found.";
};

// ===============================
// Admin Login
// ===============================
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginMsg = document.getElementById('adminLoginMsg');

adminLoginForm.onsubmit = e => {
e.preventDefault();
const pass = document.getElementById('adminPassword').value;
if (pass === ADMIN_PASSWORD) {
localStorage.setItem('adminLoggedIn', true);
loadAdminData();
showPage(adminDashboard);
} else {
adminLoginMsg.textContent = "Incorrect password.";
}
};

document.getElementById('logoutAdmin').onclick = () => {
localStorage.removeItem('adminLoggedIn');
showPage(homePage);
};

// ===============================
// Admin Dashboard
// ===============================
const pendingTeamsUL = document.getElementById('pendingTeams');
const approvedTeamsUL = document.getElementById('approvedTeams');

function loadAdminData() {
pendingTeamsUL.innerHTML = '';
approvedTeamsUL.innerHTML = '';

const pendingTeams = getData('pendingTeams');
const approvedTeams = getData('approvedTeams');

pendingTeams.forEach((team, index) => {
const li = document.createElement('li');
li.textContent = `${team.teamName} (${team.players.join(', ')})`;
const approveBtn = document.createElement('button');
approveBtn.textContent = 'Approve';
approveBtn.onclick = () => approveTeam(index);
li.appendChild(approveBtn);
pendingTeamsUL.appendChild(li);
});

approvedTeams.forEach(team => {
const li = document.createElement('li');
li.textContent = `#${team.teamNumber}: ${team.teamName}`;
approvedTeamsUL.appendChild(li);
});
}

function approveTeam(index) {
const pendingTeams = getData('pendingTeams');
const approvedTeams = getData('approvedTeams');
const team = pendingTeams.splice(index, 1)[0];
const teamNumber = approvedTeams.length + 1;
team.teamNumber = teamNumber;
team.sequence = sequences[approvedTeams.length % sequences.length];
approvedTeams.push(team);
setData('pendingTeams', pendingTeams);
setData('approvedTeams', approvedTeams);
loadAdminData();
}

// ===============================
// Question Mapping (Admin)
// ===============================
const questionForm = document.getElementById('questionForm');
const questionList = document.getElementById('questionList');

function renderQuestions() {
const questions = getData('questions');
questionList.innerHTML = '';
questions.forEach(q => {
const li = document.createElement('li');
li.textContent = `ID: ${q.id}, Code: ${q.code}, Coords: ${q.coords}`;
questionList.appendChild(li);
});
}

questionForm.onsubmit = e => {
e.preventDefault();
const id = parseInt(document.getElementById('qID').value);
const code = document.getElementById('qCode').value.trim();
const coords = document.getElementById('qCoords').value.trim();
let questions = getData('questions');
const existing = questions.find(q => q.id === id);
if (existing) {
existing.code = code;
existing.coords = coords;
} else {
questions.push({ id, code, coords });
}
setData('questions', questions);
renderQuestions();
questionForm.reset();
};

// ===============================
// Reset Event
// ===============================
const resetEventBtn = document.getElementById('resetEvent');
resetEventBtn.onclick = () => {
if (confirm('Are you sure you want to reset all event data?')) {
localStorage.removeItem('pendingTeams');
localStorage.removeItem('approvedTeams');
localStorage.removeItem('questions');
localStorage.removeItem('currentTeam');
loadAdminData();
renderQuestions();
}
};

// ===============================
// Auto load admin data if logged in
// ===============================
if (localStorage.getItem('adminLoggedIn')) {
loadAdminData();
}
renderQuestions();
