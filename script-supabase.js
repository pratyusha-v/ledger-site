import { supabase } from './supabase-client.js';

// ===== GLOBAL STATE =====
let currentGrade = '';
let currentSubject = '';
let currentEvaluation = null;
let editingEvaluationId = null;
let gradeEntries = {}; // Track score inputs

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('[INIT] DOM loaded, initializing app with Supabase...');
    populateSubjectSelectors();

    document.getElementById('mainGradeSelect').addEventListener('change', checkSelection);
    document.getElementById('mainSubjectSelect').addEventListener('change', checkSelection);

    document.getElementById('manageStudentsBtn').addEventListener('click', (e) => {
        console.log('[CLICK] Manage Students button clicked');
        e.preventDefault();
        showSection('students-section');
        renderStudentsList();
    });

    document.getElementById('manageEvaluationsBtn').addEventListener('click', (e) => {
        console.log('[CLICK] Manage Evaluations button clicked');
        e.preventDefault();
        showSection('evaluations-section');
        renderEvaluationsList();
        hideCreateEvalForm();
    });

    document.getElementById('summaryBtn').addEventListener('click', (e) => {
        console.log('[CLICK] Summary button clicked');
        e.preventDefault();
        showSection('summary-section');
        renderSummary();
    });

    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        addStudentForm.addEventListener('submit', handleAddStudent);
    }

    const addNewEvalBtn = document.getElementById('addNewEvalBtn');
    if (addNewEvalBtn) {
        addNewEvalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCreateEvalForm();
        });
    }

    const cancelEvalBtn = document.getElementById('cancelEvalBtn');
    if (cancelEvalBtn) {
        cancelEvalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideCreateEvalForm();
        });
    }

    const createEvaluationForm = document.getElementById('createEvaluationForm');
    if (createEvaluationForm) {
        createEvaluationForm.addEventListener('submit', handleCreateEvaluation);
    }

    document.getElementById('printSummaryBtn').addEventListener('click', () => window.print());

    // Grade Entry View listeners
    document.getElementById('saveGradesBtn').addEventListener('click', handleSaveGrades);

    // Edit Evaluation Modal listeners
    document.getElementById('closeEditEvalBtn').addEventListener('click', closeEditEvalModal);
    document.getElementById('cancelEditEvalBtn').addEventListener('click', closeEditEvalModal);
    document.getElementById('editEvalForm').addEventListener('submit', handleEditEvalSubmit);

    checkSelection();
});

// ===== SUBJECTS & GRADES =====
async function populateSubjectSelectors() {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('id, name')
            .order('name');

        if (error) throw error;

        const select = document.getElementById('mainSubjectSelect');
        data.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });

        console.log('[SUBJECTS] Loaded:', data.length, 'subjects');
    } catch (error) {
        console.error('[ERROR] Failed to populate subjects:', error);
    }
}

// ===== SELECTION & VISIBILITY =====
function checkSelection() {
    const grade = document.getElementById('mainGradeSelect').value;
    const subject = document.getElementById('mainSubjectSelect').value;

    currentGrade = grade;
    currentSubject = subject;

    const actionButtons = document.querySelectorAll('.action-btn');
    const emptyView = document.getElementById('emptyState');

    console.log('[SELECT] Grade:', grade, 'Subject:', subject, 'Buttons found:', actionButtons.length);

    if (!grade || !subject) {
        actionButtons.forEach(btn => btn.disabled = true);
        emptyView.style.display = 'flex';
        hideAllSections();
        console.log('[SELECT] Buttons disabled - selection incomplete');
    } else {
        actionButtons.forEach(btn => btn.disabled = false);
        emptyView.style.display = 'none';
        console.log('[SELECT] Buttons enabled - selection complete');
    }
}

function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
}

function showSection(sectionId) {
    if (!currentGrade || !currentSubject) {
        alert('Please select a grade and subject first.');
        return;
    }
    hideAllSections();
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
        section.classList.add('active');
        console.log('[SECTION] Showing:', sectionId);
    } else {
        console.error('[ERROR] Section not found:', sectionId);
    }
}

// ===== STUDENTS SECTION =====
async function renderStudentsList() {
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .eq('grade', parseInt(currentGrade))
            .order('name');

        if (error) throw error;

        const studentsList = document.getElementById('studentsList');
        if (!studentsList) return;

        if (!students || students.length === 0) {
            studentsList.innerHTML = '<p class="empty-state">No students added yet.</p>';
            return;
        }

        studentsList.innerHTML = students.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <strong>${student.name}</strong>
                    <span class="roll-number">Roll: ${student.roll_number || 'N/A'}</span>
                </div>
                <div class="student-actions">
                    <button class="btn-icon" onclick="editStudent('${student.id}')" title="Edit">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteStudent('${student.id}')" title="Delete">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        console.log('[STUDENTS] Rendered:', students.length, 'students');
    } catch (error) {
        console.error('[ERROR] Failed to render students:', error);
    }
}

async function handleAddStudent(e) {
    e.preventDefault();
    try {
        const name = document.getElementById('studentNameInput').value.trim();
        const rollNumber = document.getElementById('studentRollInput').value.trim();

        if (!name || !rollNumber) {
            alert('Please fill in all fields.');
            return;
        }

        const { error } = await supabase
            .from('students')
            .insert([{
                name,
                roll_number: rollNumber,
                grade: parseInt(currentGrade)
            }]);

        if (error) throw error;

        console.log('[STUDENTS] Added:', name);
        document.getElementById('studentNameInput').value = '';
        document.getElementById('studentRollInput').value = '';
        renderStudentsList();
    } catch (error) {
        console.error('[ERROR] Failed to add student:', error);
        alert('Failed to add student: ' + error.message);
    }
}

async function editStudent(studentId) {
    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();

        if (error) throw error;

        const newName = prompt('Enter new student name:', student.name);
        if (!newName) return;

        const newRoll = prompt('Enter new roll number:', student.roll_number);
        if (!newRoll) return;

        const { error: updateError } = await supabase
            .from('students')
            .update({ name: newName, roll_number: newRoll })
            .eq('id', studentId);

        if (updateError) throw updateError;

        console.log('[STUDENTS] Updated:', studentId);
        renderStudentsList();
    } catch (error) {
        console.error('[ERROR] Failed to edit student:', error);
        alert('Failed to edit student: ' + error.message);
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', studentId);

        if (error) throw error;

        console.log('[STUDENTS] Deleted:', studentId);
        renderStudentsList();
    } catch (error) {
        console.error('[ERROR] Failed to delete student:', error);
        alert('Failed to delete student: ' + error.message);
    }
}

// ===== EVALUATIONS SECTION =====
async function renderEvaluationsList() {
    try {
        const { data: evaluations, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('grade', parseInt(currentGrade))
            .eq('subject_id', currentSubject)
            .order('date', { ascending: false });

        if (error) throw error;

        const evaluationsList = document.getElementById('evaluationsList');
        if (!evaluationsList) return;

        if (!evaluations || evaluations.length === 0) {
            evaluationsList.innerHTML = '<p class="empty-state">No evaluations yet.</p>';
            return;
        }

        evaluationsList.innerHTML = evaluations.map(evaluation => `
            <div class="evaluation-item" onclick="openGradeEntryView('${evaluation.id}')">
                <div>
                    <div class="evaluation-header">
                        <h4>${evaluation.title}</h4>
                    </div>
                    <div class="evaluation-details">
                        <span><strong>Total:</strong> ${evaluation.max_score}</span>
                        <span><strong>Weight:</strong> ${evaluation.weight}%</span>
                        <span><strong>Date:</strong> ${evaluation.date}</span>
                    </div>
                    ${evaluation.notes ? `<p class="evaluation-notes">${evaluation.notes}</p>` : ''}
                </div>
                <div class="evaluation-actions">
                    <button class="btn-icon" onclick="editEvaluation(event, '${evaluation.id}')" title="Edit">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="deleteEvaluation(event, '${evaluation.id}')" title="Delete">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        console.log('[EVALUATIONS] Rendered:', evaluations.length, 'evaluations');
    } catch (error) {
        console.error('[ERROR] Failed to render evaluations:', error);
    }
}

async function handleCreateEvaluation(e) {
    e.preventDefault();
    try {
        const name = document.getElementById('newEvalNameInput').value.trim();
        const date = document.getElementById('newEvalDateInput').value;
        const maxScore = document.getElementById('newEvalMaxScoreInput').value;
        const weight = document.getElementById('newEvalWeightInput').value;
        const notes = document.getElementById('newEvalNotesInput').value.trim();

        console.log('[DEBUG] Creating evaluation:', { name, date, maxScore, weight, currentGrade, currentSubject });

        if (!name || !date || !maxScore || !weight) {
            alert('Please fill in all required fields.');
            return;
        }

        if (!currentGrade || !currentSubject) {
            alert('Please select a grade and subject first.');
            return;
        }

        const { error } = await supabase
            .from('evaluations')
            .insert([{
                title: name,
                grade: parseInt(currentGrade),
                subject_id: currentSubject,
                max_score: parseFloat(maxScore),
                weight: parseFloat(weight),
                date,
                notes: notes || null
            }]);

        if (error) throw error;

        console.log('[DEBUG] Evaluation created successfully');
        document.getElementById('createEvaluationForm').reset();
        hideCreateEvalForm();
        renderEvaluationsList();
    } catch (error) {
        console.error('[ERROR] Failed to create evaluation:', error);
        alert('Failed to create evaluation: ' + error.message);
    }
}

async function editEvaluation(event, evaluationId) {
    event.stopPropagation();
    try {
        const { data: evaluation, error } = await supabase
            .from('evaluations')
            .select('*')
            .eq('id', evaluationId)
            .single();

        if (error) throw error;

        // Populate modal form
        editingEvaluationId = evaluationId;
        document.getElementById('editEvalTitle').value = evaluation.title;
        document.getElementById('editEvalDate').value = evaluation.date;
        document.getElementById('editEvalMaxScore').value = evaluation.max_score;
        document.getElementById('editEvalWeight').value = evaluation.weight;
        document.getElementById('editEvalNotes').value = evaluation.notes || '';

        // Show modal
        document.getElementById('editEvalModal').classList.remove('hidden');
        console.log('[MODAL] Opened edit evaluation:', evaluationId);
    } catch (error) {
        console.error('[ERROR] Failed to open edit evaluation modal:', error);
        alert('Failed to load evaluation: ' + error.message);
    }
}

function closeEditEvalModal() {
    document.getElementById('editEvalModal').classList.add('hidden');
    editingEvaluationId = null;
    console.log('[MODAL] Closed edit evaluation modal');
}

async function handleEditEvalSubmit(e) {
    e.preventDefault();
    
    if (!editingEvaluationId) {
        alert('No evaluation selected');
        return;
    }

    try {
        const title = document.getElementById('editEvalTitle').value.trim();
        const date = document.getElementById('editEvalDate').value;
        const maxScore = parseFloat(document.getElementById('editEvalMaxScore').value);
        const weight = parseFloat(document.getElementById('editEvalWeight').value);
        const notes = document.getElementById('editEvalNotes').value.trim();

        if (!title || !date || !maxScore || !weight) {
            alert('Please fill in all required fields');
            return;
        }

        const { error } = await supabase
            .from('evaluations')
            .update({
                title,
                date,
                max_score: maxScore,
                weight,
                notes: notes || null
            })
            .eq('id', editingEvaluationId);

        if (error) throw error;

        console.log('[EVALUATIONS] Updated:', editingEvaluationId);
        closeEditEvalModal();
        renderEvaluationsList();
        alert('Evaluation updated successfully!');
    } catch (error) {
        console.error('[ERROR] Failed to update evaluation:', error);
        alert('Failed to update evaluation: ' + error.message);
    }
}
async function deleteEvaluation(event, evaluationId) {
    event.stopPropagation(); // Prevent opening grade entry modal
    if (!confirm('Are you sure you want to delete this evaluation?')) return;

    try {
        const { error } = await supabase
            .from('evaluations')
            .delete()
            .eq('id', evaluationId);

        if (error) throw error;

        console.log('[EVALUATIONS] Deleted:', evaluationId);
        renderEvaluationsList();
    } catch (error) {
        console.error('[ERROR] Failed to delete evaluation:', error);
        alert('Failed to delete evaluation: ' + error.message);
    }
}

function showCreateEvalForm() {
    const form = document.getElementById('createEvalForm');
    if (form) {
        form.classList.remove('hidden');
        console.log('[FORM] Showing create evaluation form');
    }
}

function hideCreateEvalForm() {
    const form = document.getElementById('createEvalForm');
    if (form) {
        form.classList.add('hidden');
        console.log('[FORM] Hiding create evaluation form');
    }
}

// ===== SUMMARY / REPORTS =====
async function renderSummary() {
    try {
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('id, name')
            .eq('grade', parseInt(currentGrade));

        if (studentsError) throw studentsError;

        const { data: evaluations, error: evalsError } = await supabase
            .from('evaluations')
            .select('*')
            .eq('grade', parseInt(currentGrade))
            .eq('subject_id', currentSubject)
            .order('date');

        if (evalsError) throw evalsError;

        const summaryContainer = document.getElementById('summaryContainer');
        if (!summaryContainer) return;

        if (!evaluations || evaluations.length === 0) {
            summaryContainer.innerHTML = '<p class="empty-state">No evaluations to summarize.</p>';
            return;
        }

        // Build evaluation score matrix
        const { data: gradeEntries, error: entriesError } = await supabase
            .from('grade_entries')
            .select('*');

        if (entriesError) throw entriesError;

        const gradeMap = {};
        gradeEntries.forEach(entry => {
            if (!gradeMap[entry.student_id]) gradeMap[entry.student_id] = {};
            gradeMap[entry.student_id][entry.evaluation_id] = entry.score;
        });

        // Build HTML table with marks and weighted marks columns
        let html = `
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        ${evaluations.map(e => `<th colspan="2" style="text-align: center;">${e.title}<br><small>(${e.max_score} marks, ${e.weight}% weight)</small></th>`).join('')}
                        <th colspan="2" style="text-align: center;">Total</th>
                    </tr>
                    <tr>
                        <th></th>
                        ${evaluations.map(() => `<th>Marks</th><th>Weighted</th>`).join('')}
                        <th>Marks</th>
                        <th>Weighted</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach(student => {
            const scores = evaluations.map((evaluation, idx) => {
                const score = gradeMap[student.id]?.[evaluation.id];
                return {
                    score: score || '-',
                    max: evaluation.max_score,
                    weight: evaluation.weight,
                    percent: score ? ((score / evaluation.max_score) * 100).toFixed(1) : '-',
                    weightedMarks: score ? ((score / evaluation.max_score) * 100 * evaluation.weight / 100).toFixed(2) : '-'
                };
            });

            // Calculate totals
            const totalMarks = scores.every(s => s.score === '-')
                ? '-'
                : scores.reduce((sum, s) => sum + (s.score === '-' ? 0 : parseFloat(s.score)), 0).toFixed(2);

            const totalMaxMarks = evaluations.reduce((sum, e) => sum + e.max_score, 0);

            const totalWeighted = scores.every(s => s.score === '-')
                ? '-'
                : scores.reduce((sum, s) => sum + (s.weightedMarks === '-' ? 0 : parseFloat(s.weightedMarks)), 0).toFixed(2);

            html += `
                <tr>
                    <td><strong>${student.name}</strong></td>
                    ${scores.map(s => `<td>${s.score}</td><td>${s.weightedMarks}</td>`).join('')}
                    <td><strong>${totalMarks}</strong></td>
                    <td><strong>${totalWeighted}</strong></td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        summaryContainer.innerHTML = html;
        document.getElementById('printSummaryBtn').style.display = 'block';

        console.log('[SUMMARY] Rendered for', students.length, 'students');
    } catch (error) {
        console.error('[ERROR] Failed to render summary:', error);
        const summaryContainer = document.getElementById('summaryContainer');
        if (summaryContainer) {
            summaryContainer.innerHTML = '<p class="error">Error loading summary: ' + error.message + '</p>';
        }
    }
}

// ===== GRADE ENTRY VIEW =====
async function openGradeEntryView(evaluationId) {
    try {
        console.log('[GRADES] Opening grade entry for evaluation:', evaluationId);

        // Fetch evaluation details
        const { data: evaluation, error: evalError } = await supabase
            .from('evaluations')
            .select('*')
            .eq('id', evaluationId)
            .single();

        if (evalError) throw evalError;

        currentEvaluation = evaluation;
        gradeEntries = {};

        // Fetch all students
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('grade', parseInt(currentGrade))
            .order('name');

        if (studentsError) throw studentsError;

        // Fetch existing grades for this evaluation
        const { data: grades, error: gradesError } = await supabase
            .from('grade_entries')
            .select('*')
            .eq('evaluation_id', evaluationId);

        if (gradesError) throw gradesError;

        // Build grades map
        const gradesMap = {};
        grades.forEach(g => {
            gradesMap[g.student_id] = g.score;
        });

        // Update title
        const titleEl = document.getElementById('gradeEntryViewTitle');
        titleEl.textContent = `Enter Grades - ${evaluation.title}`;

        // Populate grade entry list
        const gradeEntryList = document.getElementById('gradeEntryList');
        gradeEntryList.innerHTML = students.map(student => {
            const existingScore = gradesMap[student.id] || '';
            const weightedMark = existingScore 
                ? ((existingScore / evaluation.max_score) * evaluation.weight).toFixed(2)
                : '';
            return `
                <div class="grade-entry-row">
                    <div class="student-name">${student.name}</div>
                    <input type="number" 
                           id="score-${student.id}" 
                           placeholder="Score" 
                           min="0" 
                           max="${evaluation.max_score}"
                           value="${existingScore}"
                           onchange="updateWeightedMark('${student.id}', ${evaluation.max_score}, ${evaluation.weight})">
                    <div class="weighted-mark ${weightedMark ? '' : 'empty'}" id="mark-${student.id}">
                        ${weightedMark ? weightedMark : '-'}
                    </div>
                </div>
            `;
        }).join('');

        // Switch views
        document.getElementById('evaluationsListView').classList.add('hidden');
        document.getElementById('gradeEntryView').classList.remove('hidden');
        document.getElementById('gradeEntryView').classList.add('active');
        
        console.log('[GRADES] Grade entry view opened');
    } catch (error) {
        console.error('[ERROR] Failed to open grade entry view:', error);
        alert('Failed to open grades: ' + error.message);
    }
}

function updateWeightedMark(studentId, maxScore, weight) {
    const scoreInput = document.getElementById(`score-${studentId}`);
    const markDisplay = document.getElementById(`mark-${studentId}`);
    
    const score = parseFloat(scoreInput.value);
    if (score !== null && score !== '' && !isNaN(score)) {
        const weightedMark = ((score / maxScore) * weight).toFixed(2);
        markDisplay.textContent = weightedMark;
        markDisplay.classList.remove('empty');
    } else {
        markDisplay.textContent = '-';
        markDisplay.classList.add('empty');
    }
}

function backToEvaluationsList() {
    document.getElementById('gradeEntryView').classList.remove('active');
    document.getElementById('gradeEntryView').classList.add('hidden');
    document.getElementById('evaluationsListView').classList.remove('hidden');
    currentEvaluation = null;
    console.log('[GRADES] Back to evaluations list');
}

async function handleSaveGrades() {
    if (!currentEvaluation) {
        alert('No evaluation selected');
        return;
    }

    try {
        // Get all score inputs
        const scoreInputs = document.querySelectorAll('#gradeEntryList input[type="number"]');
        const updates = [];

        scoreInputs.forEach(input => {
            const studentId = input.id.replace('score-', '');
            const score = parseFloat(input.value);

            if (score !== null && score !== '' && !isNaN(score)) {
                updates.push({
                    student_id: studentId,
                    evaluation_id: currentEvaluation.id,
                    score: score
                });
            }
        });

        if (updates.length === 0) {
            alert('Please enter at least one grade.');
            return;
        }

        console.log('[GRADES] Saving', updates.length, 'grades for evaluation:', currentEvaluation.id);

        // Delete existing grades for this evaluation
        await supabase
            .from('grade_entries')
            .delete()
            .eq('evaluation_id', currentEvaluation.id);

        // Insert new grades
        const { error } = await supabase
            .from('grade_entries')
            .insert(updates);

        if (error) throw error;

        console.log('[GRADES] Saved successfully');
        backToEvaluationsList();
        renderEvaluationsList();
        renderSummary();
        alert('Grades saved successfully!');
    } catch (error) {
        console.error('[ERROR] Failed to save grades:', error);
        alert('Failed to save grades: ' + error.message);
    }
}

// ===== WINDOW FUNCTIONS (for onclick handlers) =====
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.editEvaluation = editEvaluation;
window.closeEditEvalModal = closeEditEvalModal;
window.deleteEvaluation = deleteEvaluation;
window.openGradeEntryView = openGradeEntryView;
window.updateWeightedMark = updateWeightedMark;
window.backToEvaluationsList = backToEvaluationsList;
