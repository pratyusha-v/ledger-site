// ===== DATA MODEL & STORAGE =====

const STORAGE_KEY = 'gradingPortalData';

const DEFAULT_SUBJECTS = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    { id: 4, name: 'Social Studies' },
    { id: 5, name: 'Physical Education' }
];

const GRADES = [6, 7, 8, 9, 10, 11, 12];

function initializeData() {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
        return JSON.parse(existingData);
    }

    const newData = {
        subjects: DEFAULT_SUBJECTS,
        students: [],
        evaluations: [],
        gradeEntries: []
    };

    saveData(newData);
    return newData;
}

let appData = initializeData();

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    appData = data;
}

function getNextId(collection) {
    if (collection.length === 0) return 1;
    return Math.max(...collection.map(item => item.id)) + 1;
}

// ===== STUDENT OPERATIONS =====

function addStudent(name, grade, rollNumber) {
    const student = {
        id: getNextId(appData.students),
        name: name,
        grade: parseInt(grade),
        rollNumber: rollNumber || ''
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
    appData.gradeEntries = appData.gradeEntries.filter(ge => ge.studentId !== studentId);
    saveData(appData);
}

function getStudentById(studentId) {
    return appData.students.find(s => s.id === studentId);
}

// ===== EVALUATION OPERATIONS =====

function addEvaluation(title, grade, subjectId, maxScore, weight, date, notes) {
    const evaluation = {
        id: getNextId(appData.evaluations),
        title: title,
        grade: parseInt(grade),
        subjectId: parseInt(subjectId),
        maxScore: parseInt(maxScore),
        weight: parseInt(weight),
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || ''
    };
    appData.evaluations.push(evaluation);
    saveData(appData);
    return evaluation;
}

function getEvaluationsByGradeAndSubject(grade, subjectId) {
    return appData.evaluations
        .filter(e => e.grade === parseInt(grade) && e.subjectId === parseInt(subjectId))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function deleteEvaluation(evaluationId) {
    appData.evaluations = appData.evaluations.filter(e => e.id !== evaluationId);
    appData.gradeEntries = appData.gradeEntries.filter(ge => ge.evaluationId !== evaluationId);
    saveData(appData);
}

function getEvaluationById(evaluationId) {
    return appData.evaluations.find(e => e.id === evaluationId);
}

// ===== GRADE ENTRY OPERATIONS =====

function setGrade(studentId, evaluationId, score) {
    let entry = appData.gradeEntries.find(ge => ge.studentId === studentId && ge.evaluationId === evaluationId);
    
    if (entry) {
        entry.score = score === '' ? null : parseFloat(score);
    } else {
        entry = {
            id: getNextId(appData.gradeEntries),
            studentId: studentId,
            evaluationId: evaluationId,
            score: score === '' ? null : parseFloat(score)
        };
        appData.gradeEntries.push(entry);
    }
    
    saveData(appData);
    return entry;
}

function getGrade(studentId, evaluationId) {
    const entry = appData.gradeEntries.find(ge => ge.studentId === studentId && ge.evaluationId === evaluationId);
    return entry ? entry.score : null;
}

// ===== CALCULATION OPERATIONS =====

function calculateStudentSubjectAverage(studentId, grade, subjectId) {
    const evaluations = getEvaluationsByGradeAndSubject(grade, subjectId);
    
    if (evaluations.length === 0) return null;

    let totalScore = 0;
    let totalWeight = 0;

    evaluations.forEach(evaluation => {
        const score = getGrade(studentId, evaluation.id);
        if (score !== null) {
            const normalizedScore = (score / evaluation.maxScore) * 100;
            totalScore += normalizedScore * evaluation.weight;
            totalWeight += evaluation.weight;
        }
    });

    if (totalWeight === 0) return null;
    return (totalScore / totalWeight).toFixed(2);
}

function calculateClassSubjectAverage(grade, subjectId) {
    const students = getStudentsByGrade(grade);
    const averages = students
        .map(s => parseFloat(calculateStudentSubjectAverage(s.id, grade, subjectId)))
        .filter(a => a !== null && !isNaN(a));

    if (averages.length === 0) return null;
    return (averages.reduce((a, b) => a + b, 0) / averages.length).toFixed(2);
}

function calculateEvaluationAverage(evaluationId) {
    const entries = appData.gradeEntries.filter(ge => ge.evaluationId === evaluationId);
    const evaluation = getEvaluationById(evaluationId);

    if (entries.length === 0) return null;

    const validEntries = entries.filter(e => e.score !== null);
    if (validEntries.length === 0) return null;

    const avgScore = validEntries.reduce((sum, e) => sum + e.score, 0) / validEntries.length;
    return ((avgScore / evaluation.maxScore) * 100).toFixed(2);
}

// ===== SUBJECT OPERATIONS =====

function getSubjectById(subjectId) {
    return appData.subjects.find(s => s.id === subjectId);
}

function getAllSubjects() {
    return appData.subjects;
}

// ===== UI UTILITIES =====

function populateSubjectSelectors() {
    const subjects = getAllSubjects();
    const select = document.getElementById('mainSubjectSelect');
    if (select) {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Choose subject...</option>';
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });
        if (currentValue) select.value = currentValue;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== UI STATE MANAGEMENT =====

let currentGrade = '';
let currentSubject = '';

function checkSelection() {
    const grade = document.getElementById('mainGradeSelect').value;
    const subject = document.getElementById('mainSubjectSelect').value;

    currentGrade = grade;
    currentSubject = subject;

    const actionButtons = document.querySelectorAll('.action-btn');
    const emptyView = document.getElementById('emptyState');

    if (!grade || !subject) {
        actionButtons.forEach(btn => btn.disabled = true);
        emptyView.style.display = 'flex';
        hideAllSections();
    } else {
        actionButtons.forEach(btn => btn.disabled = false);
        emptyView.style.display = 'none';
    }
}

function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
}

function showSection(sectionId) {
    if (!currentGrade || !currentSubject) {
        alert('Please select both a grade and subject first.');
        return;
    }
    hideAllSections();
    document.getElementById(sectionId).classList.add('active');
}

// ===== EVENT LISTENERS SETUP =====

document.addEventListener('DOMContentLoaded', () => {
    populateSubjectSelectors();

    document.getElementById('mainGradeSelect').addEventListener('change', checkSelection);
    document.getElementById('mainSubjectSelect').addEventListener('change', checkSelection);

    document.getElementById('manageStudentsBtn').addEventListener('click', () => {
        showSection('students-section');
        renderStudentsList();
    });

    document.getElementById('manageEvaluationsBtn').addEventListener('click', () => {
        showSection('evaluations-section');
        renderEvaluationsList();
    });

    document.getElementById('newEvaluationBtn').addEventListener('click', () => {
        showSection('new-evaluation-section');
        renderGradeEntryTable();
    });

    document.getElementById('summaryBtn').addEventListener('click', () => {
        showSection('summary-section');
        renderSummary();
    });

    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);
    document.getElementById('addEvaluationForm').addEventListener('submit', handleAddEvaluation);
    const createEvalForm = document.getElementById('createEvaluationForm');
    if (createEvalForm) {
        createEvalForm.addEventListener('submit', handleCreateEvaluation);
    }
    document.getElementById('printSummaryBtn').addEventListener('click', () => window.print());

    checkSelection();
});

// ===== STUDENTS SECTION =====

function renderStudentsList() {
    const studentsList = document.getElementById('studentsList');
    const students = getStudentsByGrade(currentGrade);

    if (students.length === 0) {
        studentsList.innerHTML = '<p class="empty-state">No students in this grade yet.</p>';
        return;
    }

    let html = '';
    students.forEach(student => {
        html += `
            <div class="list-item">
                <div>
                    <div class="list-item-name">${student.rollNumber} - ${student.name}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-icon" title="Edit" onclick="editStudent(${student.id})">✎</button>
                    <button class="btn-icon btn-danger" title="Delete" onclick="deleteAndRefresh('student', ${student.id})">🗑</button>
                </div>
            </div>
        `;
    });

    studentsList.innerHTML = html;
}

function handleAddStudent(e) {
    e.preventDefault();
    const name = document.getElementById('studentNameInput').value.trim();
    const rollNumber = document.getElementById('studentRollInput').value.trim();

    if (!name || !rollNumber) {
        alert('Please enter both student name and roll number.');
        return;
    }

    addStudent(name, currentGrade, rollNumber);
    document.getElementById('studentNameInput').value = '';
    document.getElementById('studentRollInput').value = '';
    renderStudentsList();
}

function editStudent(studentId) {
    const student = getStudentById(studentId);
    if (!student) return;
    
    const newName = prompt('Edit student name:', student.name);
    if (newName === null) return;
    
    const newRoll = prompt('Edit roll number:', student.rollNumber);
    if (newRoll === null) return;
    
    if (newName.trim() && newRoll.trim()) {
        student.name = newName.trim();
        student.rollNumber = newRoll.trim();
        saveData(appData);
        renderStudentsList();
    }
}

function deleteAndRefresh(type, id) {
    if (!confirm('Are you sure?')) return;
    
    if (type === 'student') {
        deleteStudent(id);
        renderStudentsList();
    } else if (type === 'evaluation') {
        deleteEvaluation(id);
        renderEvaluationsList();
    }
}

// ===== EVALUATIONS SECTION =====

function renderEvaluationsList() {
    const evaluationsList = document.getElementById('evaluationsList');
    const evaluations = getEvaluationsByGradeAndSubject(currentGrade, currentSubject);

    if (evaluations.length === 0) {
        evaluationsList.innerHTML = '<p class="empty-state">No evaluations yet for this subject.</p>';
        return;
    }

    let html = '';
    evaluations.forEach(e => {
        html += `
            <div class="list-item">
                <div>
                    <div class="list-item-name">${e.title}</div>
                    <div class="list-item-meta">Max: ${e.maxScore} pts | Weight: ${e.weight} | Date: ${formatDate(e.date)}</div>
                </div>
                <div class="list-item-actions">
                    <button class="btn-danger" onclick="deleteAndRefresh('evaluation', ${e.id})">Delete</button>
                </div>
            </div>
        `;
    });

    evaluationsList.innerHTML = html;
}

function handleAddEvaluation(e) {
    e.preventDefault();
    const title = document.getElementById('evaluationTitle').value.trim();
    const maxScore = document.getElementById('evaluationMaxScore').value;
    const weight = document.getElementById('evaluationWeight').value;
    const date = document.getElementById('evaluationDate').value;

    if (!title || !maxScore || !weight) {
        alert('Please fill in all required fields.');
        return;
    }

    addEvaluation(title, currentGrade, currentSubject, maxScore, weight, date);
    document.getElementById('addEvaluationForm').reset();
    renderEvaluationsList();
}

function handleCreateEvaluation(e) {
    e.preventDefault();
    const name = document.getElementById('newEvalNameInput').value.trim();
    const date = document.getElementById('newEvalDateInput').value;
    const maxScore = document.getElementById('newEvalMaxScoreInput').value;
    const weight = document.getElementById('newEvalWeightInput').value;
    const notes = document.getElementById('newEvalNotesInput').value.trim();

    if (!name || !date || !maxScore || !weight) {
        alert('Please fill in all required fields.');
        return;
    }

    addEvaluation(name, currentGrade, currentSubject, maxScore, weight, date, notes);
    document.getElementById('createEvaluationForm').reset();
    renderGradeEntryTable();
    alert('Evaluation created! Now enter student grades below.');
}

// ===== GRADE ENTRY SECTION =====

function renderGradeEntryTable() {
    const container = document.getElementById('gradeEntryContainer');
    const students = getStudentsByGrade(currentGrade);
    const evaluations = getEvaluationsByGradeAndSubject(currentGrade, currentSubject);

    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">No students in this grade.</p>';
        return;
    }

    if (evaluations.length === 0) {
        container.innerHTML = '<p class="empty-state">No evaluations yet. Create one first.</p>';
        return;
    }

    let html = `<table class="grade-table"><thead><tr><th>Student</th>`;
    
    evaluations.forEach(e => {
        html += `<th>${e.title}<br/><small>(${e.maxScore} pts)</small></th>`;
    });
    
    html += '<th>Average</th></tr></thead><tbody>';

    students.forEach(student => {
        html += `<tr><td><strong>${student.name}</strong></td>`;
        
        evaluations.forEach(e => {
            const score = getGrade(student.id, e.id);
            const scoreValue = score !== null ? score : '';
            html += `<td><input type="number" min="0" max="${e.maxScore}" value="${scoreValue}" 
                data-student-id="${student.id}" data-eval-id="${e.id}" 
                class="grade-input" step="0.5"></td>`;
        });

        const avg = calculateStudentSubjectAverage(student.id, parseInt(currentGrade), parseInt(currentSubject));
        html += `<td><strong>${avg !== null ? avg + '%' : '-'}</strong></td>`;
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const studentId = parseInt(e.target.dataset.studentId);
            const evalId = parseInt(e.target.dataset.evalId);
            setGrade(studentId, evalId, e.target.value);
            renderGradeEntryTable();
        });
    });
}

// ===== SUMMARY SECTION =====

function renderSummary() {
    const container = document.getElementById('summaryContainer');
    const students = getStudentsByGrade(currentGrade);
    const evaluations = getEvaluationsByGradeAndSubject(currentGrade, currentSubject);
    const subject = getSubjectById(parseInt(currentSubject));

    if (evaluations.length === 0) {
        container.innerHTML = '<p class="empty-state">No evaluations for this subject yet.</p>';
        document.getElementById('printSummaryBtn').style.display = 'none';
        return;
    }

    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">No students in this grade.</p>';
        document.getElementById('printSummaryBtn').style.display = 'none';
        return;
    }

    // Calculate total weight to show as reference
    const totalWeight = evaluations.reduce((sum, e) => sum + parseInt(e.weight), 0);

    let html = `<div class="summary-header">
        <h3>Evaluation Summary for ${subject.name} - Grade ${currentGrade}</h3>
        <p>Total Weight: ${totalWeight}</p>
    </div>`;

    // Build table header with evaluation columns
    html += '<table class="summary-table"><thead><tr><th>Student</th>';
    
    evaluations.forEach(e => {
        html += `<th colspan="2">${e.title}</th>`;
    });
    
    html += '<th>Final Score</th></tr>';
    html += '<tr><td></td>';
    
    evaluations.forEach(() => {
        html += '<th class="subheader">Marks</th><th class="subheader">Weighted</th>';
    });
    
    html += '<th class="subheader">(%)</th></tr></thead><tbody>';

    // Add student rows
    students.forEach(student => {
        let studentTotal = 0;
        let totalWeightUsed = 0;
        
        html += `<tr><td class="student-col"><strong>${student.rollNumber}</strong><br/>${student.name}</td>`;
        
        evaluations.forEach(e => {
            const score = getGrade(student.id, e.id);
            const scoreDisplay = score !== null ? parseFloat(score).toFixed(1) : '-';
            
            if (score !== null) {
                const percentage = (parseFloat(score) / parseInt(e.maxScore)) * 100;
                const weighted = (percentage * parseInt(e.weight)) / 100;
                studentTotal += weighted;
                totalWeightUsed += parseInt(e.weight);
                
                html += `<td>${scoreDisplay}/${e.maxScore}</td><td>${weighted.toFixed(1)}</td>`;
            } else {
                html += '<td>-</td><td>-</td>';
            }
        });
        
        const finalScore = totalWeightUsed > 0 ? (studentTotal / totalWeightUsed * 100).toFixed(1) : '-';
        html += `<td class="final-score"><strong>${finalScore}</strong></td></tr>`;
    });

    // Add class average row
    html += '<tr class="average-row"><td><strong>Class Average</strong></td>';
    
    evaluations.forEach(e => {
        let total = 0, count = 0;
        students.forEach(student => {
            const score = getGrade(student.id, e.id);
            if (score !== null) {
                total += (parseFloat(score) / parseInt(e.maxScore)) * 100;
                count++;
            }
        });
        const avg = count > 0 ? (total / count).toFixed(1) : '-';
        const weighted = (avg !== '-') ? ((parseFloat(avg) * parseInt(e.weight)) / 100).toFixed(1) : '-';
        
        html += `<td>${avg}</td><td>${weighted}</td>`;
    });
    
    // Calculate overall class average
    let totalClassScore = 0;
    let totalClassWeightSum = 0;
    students.forEach(student => {
        let studentWeightedScore = 0;
        let studentWeightSum = 0;
        evaluations.forEach(e => {
            const score = getGrade(student.id, e.id);
            if (score !== null) {
                const percentage = (parseFloat(score) / parseInt(e.maxScore)) * 100;
                studentWeightedScore += (percentage * parseInt(e.weight)) / 100;
                studentWeightSum += parseInt(e.weight);
            }
        });
        if (studentWeightSum > 0) {
            totalClassScore += studentWeightedScore;
            totalClassWeightSum += studentWeightSum;
        }
    });
    const classAverage = totalClassWeightSum > 0 ? (totalClassScore / students.length).toFixed(1) : '-';
    
    html += `<td class="final-score"><strong>${classAverage}</strong></td></tr>`;
    
    html += '</tbody></table>';

    container.innerHTML = html;
    document.getElementById('printSummaryBtn').style.display = 'inline-block';
}

populateSubjectSelectors();
