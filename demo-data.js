// EXAMPLE: How to load demo data into the app
// Copy and paste this into your browser console (F12 → Console)
// Then reload the page to see it populated!

const demoData = {
    "subjects": [
        { "id": 1, "name": "Math" },
        { "id": 2, "name": "Science" },
        { "id": 3, "name": "English" },
        { "id": 4, "name": "Social Studies" },
        { "id": 5, "name": "Physical Education" }
    ],
    "students": [
        { "id": 1, "name": "Alice Johnson", "grade": 6, "rollNumber": "601" },
        { "id": 2, "name": "Bob Smith", "grade": 6, "rollNumber": "602" },
        { "id": 3, "name": "Charlie Brown", "grade": 6, "rollNumber": "603" },
        { "id": 4, "name": "Diana Prince", "grade": 6, "rollNumber": "604" },
        { "id": 5, "name": "Eva Martinez", "grade": 7, "rollNumber": "701" },
        { "id": 6, "name": "Frank Chen", "grade": 7, "rollNumber": "702" }
    ],
    "evaluations": [
        { "id": 1, "title": "Math Quiz 1", "grade": 6, "subjectId": 1, "maxScore": 100, "weight": 20, "date": "2025-01-10", "notes": "Quick assessment on Ch. 1-2" },
        { "id": 2, "title": "Math Test 1", "grade": 6, "subjectId": 1, "maxScore": 100, "weight": 30, "date": "2025-01-17", "notes": "Comprehensive test on algebra basics" },
        { "id": 3, "title": "Math Homework", "grade": 6, "subjectId": 1, "maxScore": 50, "weight": 10, "date": "2025-01-15", "notes": "Weekly problem sets" },
        { "id": 4, "title": "Science Lab Report", "grade": 6, "subjectId": 2, "maxScore": 100, "weight": 40, "date": "2025-01-12", "notes": "Physics experiment report" },
        { "id": 5, "title": "Science Quiz", "grade": 6, "subjectId": 2, "maxScore": 100, "weight": 20, "date": "2025-01-18", "notes": "Unit 1 assessment" },
        { "id": 6, "title": "English Essay", "grade": 6, "subjectId": 3, "maxScore": 100, "weight": 50, "date": "2025-01-14", "notes": "Narrative essay assignment" },
        { "id": 7, "title": "Reading Assignment", "grade": 6, "subjectId": 3, "maxScore": 50, "weight": 10, "date": "2025-01-16", "notes": "Chapter comprehension questions" }
    ],
    "gradeEntries": [
        // Alice - Grade 6 - Math
        { "id": 1, "studentId": 1, "evaluationId": 1, "score": 92 },
        { "id": 2, "studentId": 1, "evaluationId": 2, "score": 88 },
        { "id": 3, "studentId": 1, "evaluationId": 3, "score": 45 },
        // Alice - Grade 6 - Science
        { "id": 4, "studentId": 1, "evaluationId": 4, "score": 95 },
        { "id": 5, "studentId": 1, "evaluationId": 5, "score": 90 },
        // Alice - Grade 6 - English
        { "id": 6, "studentId": 1, "evaluationId": 6, "score": 98 },
        { "id": 7, "studentId": 1, "evaluationId": 7, "score": 48 },
        
        // Bob - Grade 6 - Math
        { "id": 8, "studentId": 2, "evaluationId": 1, "score": 78 },
        { "id": 9, "studentId": 2, "evaluationId": 2, "score": 82 },
        { "id": 10, "studentId": 2, "evaluationId": 3, "score": 40 },
        // Bob - Grade 6 - Science
        { "id": 11, "studentId": 2, "evaluationId": 4, "score": 75 },
        { "id": 12, "studentId": 2, "evaluationId": 5, "score": 80 },
        // Bob - Grade 6 - English
        { "id": 13, "studentId": 2, "evaluationId": 6, "score": 85 },
        { "id": 14, "studentId": 2, "evaluationId": 7, "score": 42 },
        
        // Charlie - Grade 6 - Math
        { "id": 15, "studentId": 3, "evaluationId": 1, "score": 88 },
        { "id": 16, "studentId": 3, "evaluationId": 2, "score": 91 },
        { "id": 17, "studentId": 3, "evaluationId": 3, "score": 48 },
        // Charlie - Grade 6 - Science
        { "id": 18, "studentId": 3, "evaluationId": 4, "score": 92 },
        { "id": 19, "studentId": 3, "evaluationId": 5, "score": 88 },
        // Charlie - Grade 6 - English
        { "id": 20, "studentId": 3, "evaluationId": 6, "score": 90 },
        { "id": 21, "studentId": 3, "evaluationId": 7, "score": 46 },
        
        // Diana - Grade 6 - Math
        { "id": 22, "studentId": 4, "evaluationId": 1, "score": 95 },
        { "id": 23, "studentId": 4, "evaluationId": 2, "score": 93 },
        { "id": 24, "studentId": 4, "evaluationId": 3, "score": 50 },
        // Diana - Grade 6 - Science
        { "id": 25, "studentId": 4, "evaluationId": 4, "score": 98 },
        { "id": 26, "studentId": 4, "evaluationId": 5, "score": 96 },
        // Diana - Grade 6 - English
        { "id": 27, "studentId": 4, "evaluationId": 6, "score": 99 },
        { "id": 28, "studentId": 4, "evaluationId": 7, "score": 50 }
    ]
};

// Load the demo data
localStorage.setItem('gradingPortalData', JSON.stringify(demoData));
console.log('✅ Demo data loaded! Reload the page to see it.');

// To verify:
// console.log(JSON.parse(localStorage.getItem('gradingPortalData')));
