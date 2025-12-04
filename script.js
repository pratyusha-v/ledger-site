// ===== DATA MODEL & STORAGE =====

// Initialize or retrieve data from localStorage
const STORAGE_KEY = 'gradingPortalData';

// Default subjects (same across all grades)
const DEFAULT_SUBJECTS = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    { id: 4, name: 'Social Studies' },
    { id: 5, name: 'Physical Education' }
];

// Grades in the school
const GRADES = [6, 7, 8, 9, 10, 11, 12];

// Initialize data structure
function initializeData() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
        return JSON.parse(existingData);
    }

    // Default empty data structure
    const newData = {
        subjects: DEFAULT_SUBJECTS,
        students: [],
        assignments: [],
        gradeEntries: []
    };

    saveData(newData);
    return newData;
}

let appData = initializeData();

// Save data to localStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    appData = data;
}

// Get next available ID for a collection
function getNextId(collection) {
    if (collection.length === 0) return 1;
    return Math.max(...collection.map(item => item.id)) + 1;
}

// ===== STUDENT OPERATIONS =====

function addStudent(name, grade) {
    const student = {
        id: getNextId(appData.students),
        name: name,
        grade: parseInt(grade)
    };
    appData.students.push(student);
    saveData(appData);
    return student;
}

function getStudentsByGrade(grade) {
    return appData.students.filter(s => s.grade === parseInt(grade)).sort((a, b) => a.name.localeCompare(b.name));
}

function deleteStudent(studentId) {
    appData.students = appData.students.filter(s => s.id !== studentId);
    // Also delete associated grade entries
    appData.gradeEntries = appData.gradeEntries.filter(ge => ge.studentId !== studentId);
    saveData(appData);
}

function getStudentById(studentId) {
    return appData.students.find(s => s.id === studentId);
}

// ===== ASSIGNMENT OPERATIONS =====

function addAssignment(title, grade, subjectId, maxScore, weight, date) {
    const assignment = {
        id: getNextId(appData.assignments),
        title: title,
        grade: parseInt(grade),
        subjectId: parseInt(subjectId),
        maxScore: parseInt(maxScore),
        weight: parseInt(weight),
        date: date || new Date().toISOString().split('T')[0]
    };
    appData.assignments.push(assignment);
    saveData(appData);
    return assignment;
}

function getAssignmentsByGradeAndSubject(grade, subjectId) {
    return appData.assignments
        .filter(a => a.grade === parseInt(grade) && a.subjectId === parseInt(subjectId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function deleteAssignment(assignmentId) {
    appData.assignments = appData.assignments.filter(a => a.id !== assignmentId);
    // Also delete associated grade entries
    appData.gradeEntries = appData.gradeEntries.filter(ge => ge.assignmentId !== assignmentId);
    saveData(appData);
}

function getAssignmentById(assignmentId) {
    return appData.assignments.find(a => a.id === assignmentId);
}

// ===== GRADE ENTRY OPERATIONS =====

function setGrade(studentId, assignmentId, score) {
    // Check if entry already exists
    let entry = appData.gradeEntries.find(ge => ge.studentId === studentId && ge.assignmentId === assignmentId);
    
    if (entry) {
        entry.score = score === '' ? null : parseFloat(score);
    } else {
        entry = {
            id: getNextId(appData.gradeEntries),
            studentId: studentId,
            assignmentId: assignmentId,
            score: score === '' ? null : parseFloat(score)
        };
        appData.gradeEntries.push(entry);
    }
    
    saveData(appData);
    return entry;
}

function getGrade(studentId, assignmentId) {
    const entry = appData.gradeEntries.find(ge => ge.studentId === studentId && ge.assignmentId === assignmentId);
    return entry ? entry.score : null;
}

function getGradeEntriesByStudent(studentId) {
    return appData.gradeEntries.filter(ge => ge.studentId === studentId);
}

// ===== CALCULATION OPERATIONS =====

// Calculate weighted average for a student in a specific subject
function calculateStudentSubjectAverage(studentId, grade, subjectId) {
    const assignments = getAssignmentsByGradeAndSubject(grade, subjectId);
    
    if (assignments.length === 0) return null;

    let totalScore = 0;
    let totalWeight = 0;

    assignments.forEach(assignment => {
        const score = getGrade(studentId, assignment.id);
        if (score !== null) {
            const normalizedScore = (score / assignment.maxScore) * 100;
            totalScore += normalizedScore * assignment.weight;
            totalWeight += assignment.weight;
        }
    });

    if (totalWeight === 0) return null;
    return (totalScore / totalWeight).toFixed(2);
}

// Calculate class average for a subject
function calculateClassSubjectAverage(grade, subjectId) {
    const students = getStudentsByGrade(grade);
    const averages = students
        .map(s => parseFloat(calculateStudentSubjectAverage(s.id, grade, subjectId)))
        .filter(a => a !== null && !isNaN(a));

    if (averages.length === 0) return null;
    return (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2);
}

// Calculate average for a specific assignment
function calculateAssignmentAverage(assignmentId) {
    const entries = appData.gradeEntries.filter(ge => ge.assignmentId === assignmentId);
    const assignment = getAssignmentById(assignmentId);

    if (entries.length === 0) return null;

    const validEntries = entries.filter(e => e.score !== null);
    if (validEntries.length === 0) return null;

    const avgScore = validEntries.reduce((sum, e) => sum + e.score, 0) / validEntries.length;
    return ((avgScore / assignment.maxScore) * 100).toFixed(2);
}

// Get all subject averages for a student
function getStudentAllSubjectAverages(studentId) {
    const student = getStudentById(studentId);
    if (!student) return {};

    const averages = {};
    appData.subjects.forEach(subject => {
        const avg = calculateStudentSubjectAverage(studentId, student.grade, subject.id);
        if (avg !== null) {
            averages[subject.id] = { name: subject.name, average: avg };
        }
    });

    return averages;
}

// Get all assignment scores for a student
function getStudentAssignmentScores(studentId) {
    const entries = getGradeEntriesByStudent(studentId);
    const scores = {};

    entries.forEach(entry => {
        const assignment = getAssignmentById(entry.assignmentId);
        if (assignment && entry.score !== null) {
            scores[entry.assignmentId] = {
                title: assignment.title,
                score: entry.score,
                maxScore: assignment.maxScore,
                subject: getSubjectById(assignment.subjectId).name,
                date: assignment.date
            };
        }
    });

    return scores;
}

// ===== SUBJECT OPERATIONS =====

function getSubjectById(subjectId) {
    return appData.subjects.find(s => s.id === subjectId);
}

function getAllSubjects() {
    return appData.subjects;
}

// ===== UI UTILITIES =====

// Populate subject selectors
function populateSubjectSelectors() {
    const subjects = getAllSubjects();
    const selectors = [
        'subjectSelect',
        'assignmentSubjectSelect',
        'gradeEntrySubjectSelect',
        'reportSubjectSelect'
    ];

    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Choose a subject --</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                select.appendChild(option);
            });
            if (currentValue) select.value = currentValue;
        }
    });
}

// Format a date string to readable format
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== UI INTERACTION HANDLERS =====

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        button.classList.add('active');
    });
});

// ===== DASHBOARD TAB =====

document.getElementById('gradeSelect').addEventListener('change', renderDashboard);
document.getElementById('subjectSelect').addEventListener('change', renderDashboard);

function renderDashboard() {
    const grade = document.getElementById('gradeSelect').value;
    const subjectId = document.getElementById('subjectSelect').value;
    const dashboardContent = document.getElementById('dashboardContent');

    if (!grade || !subjectId) {
        dashboardContent.innerHTML = '<p class="empty-state">Select a grade and subject to view class information.</p>';
        return;
    }

    const students = getStudentsByGrade(grade);
    const assignments = getAssignmentsByGradeAndSubject(grade, subjectId);
    const subject = getSubjectById(parseInt(subjectId));

    let html = `<h3>${subject.name} - Grade ${grade}</h3>`;

    // Summary cards
    html += '<div class="summary-row">';
    html += `<div class="summary-card">
        <h4>Total Students</h4>
        <div class="value">${students.length}</div>
    </div>`;
    html += `<div class="summary-card">
        <h4>Total Assignments</h4>
        <div class="value">${assignments.length}</div>
    </div>`;

    const classAvg = calculateClassSubjectAverage(parseInt(grade), parseInt(subjectId));
    html += `<div class="summary-card">
        <h4>Class Average</h4>
        <div class="value">${classAvg !== null ? classAvg + '%' : 'N/A'}</div>
    </div>`;
    html += '</div>';

    // Assignments table
    if (assignments.length > 0) {
        html += '<h4>Assignments</h4><table><thead><tr><th>Title</th><th>Max Score</th><th>Weight</th><th>Date</th><th>Class Avg</th></tr></thead><tbody>';
        assignments.forEach(assignment => {
            const avg = calculateAssignmentAverage(assignment.id);
            html += `<tr>
                <td>${assignment.title}</td>
                <td>${assignment.maxScore}</td>
                <td>${assignment.weight}</td>
                <td>${formatDate(assignment.date)}</td>
                <td>${avg !== null ? avg + '%' : 'N/A'}</td>
            </tr>`;
        });
        html += '</tbody></table>';
    }

    // Student averages
    if (students.length > 0) {
        html += '<h4>Student Averages in ' + subject.name + '</h4><table><thead><tr><th>Student Name</th><th>Average</th></tr></thead><tbody>';
        students.forEach(student => {
            const avg = calculateStudentSubjectAverage(student.id, parseInt(grade), parseInt(subjectId));
            const avgText = avg !== null ? avg + '%' : 'No grades';
            html += `<tr><td>${student.name}</td><td>${avgText}</td></tr>`;
        });
        html += '</tbody></table>';
    } else {
        html += '<p class="empty-state">No students in this grade.</p>';
    }

    dashboardContent.innerHTML = html;
}

// ===== STUDENTS TAB =====

document.getElementById('studentGradeSelect').addEventListener('change', renderStudentsList);
document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);

function renderStudentsList() {
    const grade = document.getElementById('studentGradeSelect').value;
    const studentsList = document.getElementById('studentsList');

    if (!grade) {
        studentsList.innerHTML = '<p class="empty-state">Select a grade to see students.</p>';
        return;
    }

    const students = getStudentsByGrade(grade);

    if (students.length === 0) {
        studentsList.innerHTML = '<p class="empty-state">No students in this grade yet.</p>';
        return;
    }

    let html = '';
    students.forEach(student => {
        html += `
            <div class="list-item">
                <div>
                    <div class="list-item-name">${student.name}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-danger btn-small" onclick="handleDeleteStudent(${student.id})">Delete</button>
                </div>
            </div>
        `;
    });

    studentsList.innerHTML = html;
}

function handleAddStudent(e) {
    e.preventDefault();
    const grade = document.getElementById('studentGradeSelect').value;
    const name = document.getElementById('studentName').value.trim();

    if (!grade) {
        alert('Please select a grade first.');
        return;
    }

    if (!name) {
        alert('Please enter a student name.');
        return;
    }

    addStudent(name, grade);
    document.getElementById('studentName').value = '';
    renderStudentsList();
}

function handleDeleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? Their grade entries will also be deleted.')) {
        deleteStudent(studentId);
        renderStudentsList();
    }
}

// ===== ASSIGNMENTS TAB =====

document.getElementById('assignmentGradeSelect').addEventListener('change', updateAssignmentSubjects);
document.getElementById('assignmentSubjectSelect').addEventListener('change', renderAssignmentsList);
document.getElementById('addAssignmentForm').addEventListener('submit', handleAddAssignment);

function updateAssignmentSubjects() {
    renderAssignmentsList();
}

function renderAssignmentsList() {
    const grade = document.getElementById('assignmentGradeSelect').value;
    const subjectId = document.getElementById('assignmentSubjectSelect').value;
    const assignmentsList = document.getElementById('assignmentsList');

    if (!grade || !subjectId) {
        assignmentsList.innerHTML = '<p class="empty-state">Select a grade and subject to see assignments.</p>';
        return;
    }

    const assignments = getAssignmentsByGradeAndSubject(grade, subjectId);

    if (assignments.length === 0) {
        assignmentsList.innerHTML = '<p class="empty-state">No assignments yet for this grade and subject.</p>';
        return;
    }

    let html = '';
    assignments.forEach(assignment => {
        html += `
            <div class="list-item">
                <div>
                    <div class="list-item-name">${assignment.title}</div>
                    <div class="list-item-meta">Max: ${assignment.maxScore} pts | Weight: ${assignment.weight} | Date: ${formatDate(assignment.date)}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-danger btn-small" onclick="handleDeleteAssignment(${assignment.id})">Delete</button>
                </div>
            </div>
        `;
    });

    assignmentsList.innerHTML = html;
}

function handleAddAssignment(e) {
    e.preventDefault();
    const grade = document.getElementById('assignmentGradeSelect').value;
    const subjectId = document.getElementById('assignmentSubjectSelect').value;
    const title = document.getElementById('assignmentTitle').value.trim();
    const maxScore = document.getElementById('assignmentMaxScore').value;
    const weight = document.getElementById('assignmentWeight').value;
    const date = document.getElementById('assignmentDate').value;

    if (!grade || !subjectId) {
        alert('Please select a grade and subject first.');
        return;
    }

    if (!title || !maxScore || !weight) {
        alert('Please fill in all required fields.');
        return;
    }

    addAssignment(title, grade, subjectId, maxScore, weight, date);
    document.getElementById('addAssignmentForm').reset();
    renderAssignmentsList();
}

function handleDeleteAssignment(assignmentId) {
    if (confirm('Are you sure you want to delete this assignment? All grades for this assignment will be deleted.')) {
        deleteAssignment(assignmentId);
        renderAssignmentsList();
    }
}

// ===== GRADES TAB =====

document.getElementById('gradeEntryGradeSelect').addEventListener('change', renderGradeEntryTable);
document.getElementById('gradeEntrySubjectSelect').addEventListener('change', renderGradeEntryTable);

function renderGradeEntryTable() {
    const grade = document.getElementById('gradeEntryGradeSelect').value;
    const subjectId = document.getElementById('gradeEntrySubjectSelect').value;
    const gradeEntryTable = document.getElementById('gradeEntryTable');

    if (!grade || !subjectId) {
        gradeEntryTable.innerHTML = '<p class="empty-state">Select a grade and subject to enter grades.</p>';
        return;
    }

    const students = getStudentsByGrade(grade);
    const assignments = getAssignmentsByGradeAndSubject(grade, subjectId);
    const subject = getSubjectById(parseInt(subjectId));

    if (students.length === 0) {
        gradeEntryTable.innerHTML = '<p class="empty-state">No students in this grade.</p>';
        return;
    }

    if (assignments.length === 0) {
        gradeEntryTable.innerHTML = '<p class="empty-state">No assignments yet for this subject. Create an assignment first.</p>';
        return;
    }

    let html = `<h3>Grade Entry - ${subject.name}</h3><table><thead><tr><th>Student</th>`;
    
    assignments.forEach(assignment => {
        html += `<th>${assignment.title}<br/><small>(${assignment.maxScore} pts)</small></th>`;
    });
    
    html += '<th>Average</th></tr></thead><tbody>';

    students.forEach(student => {
        html += `<tr><td><strong>${student.name}</strong></td>`;
        
        assignments.forEach(assignment => {
            const score = getGrade(student.id, assignment.id);
            const scoreValue = score !== null ? score : '';
            html += `<td><input type="number" min="0" max="${assignment.maxScore}" value="${scoreValue}" 
                data-student-id="${student.id}" data-assignment-id="${assignment.id}" 
                class="grade-input" step="0.5"></td>`;
        });

        const avg = calculateStudentSubjectAverage(student.id, parseInt(grade), parseInt(subjectId));
        html += `<td><strong>${avg !== null ? avg + '%' : '-'}</strong></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    gradeEntryTable.innerHTML = html;

    // Attach event listeners to grade inputs
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const studentId = parseInt(e.target.dataset.studentId);
            const assignmentId = parseInt(e.target.dataset.assignmentId);
            setGrade(studentId, assignmentId, e.target.value);
            renderGradeEntryTable(); // Re-render to update averages
        });
    });
}

// ===== REPORTS TAB =====

document.getElementById('reportGradeSelect').addEventListener('change', updateReportStudentSelect);
document.getElementById('reportSubjectSelect').addEventListener('change', updateReportStudentSelect);
document.getElementById('generateReportBtn').addEventListener('click', generateReport);
document.getElementById('printBtn').addEventListener('click', () => window.print());

function updateReportStudentSelect() {
    const grade = document.getElementById('reportGradeSelect').value;
    const studentSelect = document.getElementById('reportStudentSelect');

    if (!grade) {
        studentSelect.innerHTML = '<option value="">-- All students --</option>';
        return;
    }

    const students = getStudentsByGrade(grade);
    let html = '<option value="">-- All students --</option>';
    
    students.forEach(student => {
        html += `<option value="${student.id}">${student.name}</option>`;
    });

    studentSelect.innerHTML = html;
}

function generateReport() {
    const grade = document.getElementById('reportGradeSelect').value;
    const subjectId = document.getElementById('reportSubjectSelect').value;
    const studentId = document.getElementById('reportStudentSelect').value;
    const reportContent = document.getElementById('reportContent');

    if (!grade || !subjectId) {
        alert('Please select a grade and subject.');
        return;
    }

    const students = getStudentsByGrade(grade);
    const subject = getSubjectById(parseInt(subjectId));
    const assignments = getAssignmentsByGradeAndSubject(grade, subjectId);

    if (assignments.length === 0) {
        reportContent.innerHTML = '<p class="empty-state">No assignments found for this subject and grade.</p>';
        return;
    }

    let html = `<h3>${subject.name} Report - Grade ${grade}</h3>`;

    const filteredStudents = studentId ? students.filter(s => s.id === parseInt(studentId)) : students;

    if (filteredStudents.length === 0) {
        reportContent.innerHTML = '<p class="empty-state">No students found.</p>';
        return;
    }

    filteredStudents.forEach(student => {
        const avg = calculateStudentSubjectAverage(student.id, parseInt(grade), parseInt(subjectId));
        const subjectAverages = getStudentAllSubjectAverages(student.id);

        html += `<div class="student-report">
            <h3>${student.name}</h3>
            <div class="report-grid">
                <div class="report-item">
                    <div class="report-item-label">Grade</div>
                    <div class="report-item-value">${parseInt(grade)}</div>
                </div>
                <div class="report-item">
                    <div class="report-item-label">${subject.name} Average</div>
                    <div class="report-item-value">${avg !== null ? avg + '%' : 'No grades'}</div>
                </div>
            </div>

            <h4 style="margin-top: 20px;">Assignment Scores</h4>
            <table style="margin-top: 10px;">
                <thead>
                    <tr>
                        <th>Assignment</th>
                        <th>Score</th>
                        <th>Max</th>
                        <th>%</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>`;

        assignments.forEach(assignment => {
            const score = getGrade(student.id, assignment.id);
            const percent = score !== null ? ((score / assignment.maxScore) * 100).toFixed(1) : '-';
            const scoreText = score !== null ? score : '-';

            html += `<tr>
                <td>${assignment.title}</td>
                <td>${scoreText}</td>
                <td>${assignment.maxScore}</td>
                <td>${percent}${percent !== '-' ? '%' : ''}</td>
                <td>${formatDate(assignment.date)}</td>
            </tr>`;
        });

        html += `</tbody>
            </table>

            <h4 style="margin-top: 20px;">All Subject Averages</h4>
            <div class="report-grid">`;

        Object.entries(subjectAverages).forEach(([subId, data]) => {
            html += `<div class="report-item">
                <div class="report-item-label">${data.name}</div>
                <div class="report-item-value">${data.average}%</div>
            </div>`;
        });

        html += `</div>
        </div>`;
    });

    reportContent.innerHTML = html;
}

// ===== INITIALIZATION =====
populateSubjectSelectors();
renderDashboard();
renderStudentsList();
