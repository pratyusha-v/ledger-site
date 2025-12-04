# 📚 Grading Portal

A simple, teacher-friendly grading application built with vanilla HTML/CSS/JavaScript. No frameworks, no build tools—just clean, minimal code deployed on Vercel.

## Project Overview

This app helps teachers at schools serving grades 6–12 manage student grades without paper ledgers or complex spreadsheets. Teachers can:

- ✅ Add/manage students by grade
- ✅ Create assignments with weights
- ✅ Enter and track grades
- ✅ Calculate weighted subject averages automatically
- ✅ View class-level and individual student reports
- ✅ Print reports for parent–teacher meetings

## Tech Stack

- **Frontend**: HTML5, CSS3, vanilla JavaScript (ES6+)
- **Storage**: localStorage (browser-based, single-computer prototype)
- **Deployment**: Vercel (static site)

## File Structure

```
ledger-site/
├── index.html        # Main HTML markup with 5 tabs
├── styles.css        # Desktop-first, clean styling
├── script.js         # All data model + UI interactions
└── README.md         # This file
```

## Getting Started

### Local Development

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd ledger-site
   ```

2. Open in your browser:
   ```bash
   # Option A: Simple HTTP server
   python3 -m http.server 8000
   # Visit http://localhost:8000

   # Option B: Live Server (if using VS Code)
   # Right-click index.html → "Open with Live Server"

   # Option C: Direct file open
   # Just double-click index.html (works but no live reload)
   ```

3. Start entering data!

### Deployment to Vercel

1. Push to GitHub (if not already):
   ```bash
   git add .
   git commit -m "Initial grading portal"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) and import the repository.

3. Vercel will auto-detect it's a static site. Click "Deploy" and you're done!

### Key Design Decisions

- **No Backend**: Data is stored in `localStorage`. This is fine for a single teacher on one computer. For multi-user or multi-device support, you'd add a backend (e.g., Vercel Postgres + serverless functions).
- **No UI Libraries**: All styling is hand-rolled CSS. Easy to understand and modify.
- **localStorage Key**: `gradingPortalData` stores all students, assignments, and grades.
- **Subjects**: Fixed across all grades (Math, Science, English, etc.). Easy to customize in `script.js`.

## Data Model

### Subjects (Fixed)
```javascript
{ id: 1, name: 'Math' }
{ id: 2, name: 'Science' }
{ id: 3, name: 'English' }
{ id: 4, name: 'Social Studies' }
{ id: 5, name: 'Physical Education' }
```

### Students
```javascript
{ id: 1, name: 'Alice', grade: 6 }
```

### Assignments
```javascript
{
  id: 1,
  title: 'Algebra Quiz',
  grade: 6,
  subjectId: 1,     // Math
  maxScore: 100,
  weight: 20,       // For weighted averages
  date: '2025-01-15'
}
```

### Grade Entries
```javascript
{
  id: 1,
  studentId: 1,
  assignmentId: 1,
  score: 85
}
```

## Features & Workflow

### 1. **Dashboard Tab**
- Select grade and subject
- See class summary: total students, total assignments, class average
- View all assignments for that subject + their class averages
- See individual student averages in that subject

### 2. **Students Tab**
- Select a grade
- Add new students by name
- View and delete students in that grade

### 3. **Assignments Tab**
- Select grade and subject
- Add new assignments with:
  - Title
  - Max score (e.g., 100)
  - Weight (e.g., 20, for weighted average)
  - Date
- View and delete assignments

### 4. **Grades Tab**
- Select grade and subject
- See a table of students × assignments
- Enter scores directly into cells (they save immediately)
- See each student's average in that subject (right column)

### 5. **Reports Tab**
- Select grade and subject
- Optionally pick a specific student
- Generate a detailed report showing:
  - Each assignment score (score, max, %)
  - Subject average (weighted)
  - All subject averages for that student
- Print-friendly styling (no header/tabs visible in print)

## Weighted Averages

The formula for a student's average in a subject:

$$\text{Average} = \frac{\sum (\text{score} / \text{maxScore} \times 100 \times \text{weight})}{\sum \text{weight}}$$

**Example:**
- Assignment 1: 90/100, weight 20 → 90 × 20 = 1800
- Assignment 2: 85/100, weight 30 → 85 × 30 = 2550
- Assignment 3: 95/100, weight 50 → 95 × 50 = 4750

**Average** = (1800 + 2550 + 4750) / (20 + 30 + 50) = 9100 / 100 = **91%**

## Customization

### Add or Change Subjects

Edit `script.js` and modify `DEFAULT_SUBJECTS`:

```javascript
const DEFAULT_SUBJECTS = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    { id: 4, name: 'Social Studies' },
    { id: 5, name: 'Physical Education' },
    // Add new subjects here!
];
```

### Change Header/Branding

Edit `index.html`:
```html
<header class="header">
    <h1>📚 Grading Portal</h1>
    <p class="subtitle">Simple grade entry & tracking for teachers</p>
</header>
```

### Adjust Colors

Edit `styles.css`. Main color: `#667eea` (purple). Search and replace, or change:

```css
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary {
    background-color: #667eea;
}

.tab-btn.active {
    color: #667eea;
    border-bottom-color: #667eea;
}
```

## Limitations & Future Enhancements

### Current Limitations
- Single-computer, single-user (no multi-device sync)
- Data is lost if browser cache is cleared
- No authentication
- Desktop-first (mobile works but not optimized)

### Future Enhancements (Out of Scope for v1)
- Add a backend: Vercel Postgres + serverless functions
- Multi-user support with login
- Export to CSV or Excel
- Bulk import students from a file
- Class period management (multiple classes per grade)
- Photo-based student identification
- Mobile app
- Notifications/alerts when grades are entered

## localStorage Debugging

Open the browser's Developer Tools (F12) and run:

```javascript
// View all data
console.log(JSON.parse(localStorage.getItem('gradingPortalData')));

// Clear all data (fresh start)
localStorage.removeItem('gradingPortalData');
location.reload();
```

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires:
- localStorage support
- ES6+ JavaScript
- CSS Grid & Flexbox

## Deployment Checklist

- [ ] Test all 5 tabs locally
- [ ] Add a few students and assignments
- [ ] Enter some grades and verify averages
- [ ] Generate a report and test print
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test live version
- [ ] Share the URL with teachers!

## Support

If you find bugs or have feature requests:
1. Test in a fresh browser tab (clear cache if needed)
2. Check the browser console for errors (F12 → Console)
3. Review the data structure in localStorage
4. Open an issue on GitHub

---

**Built with ❤️ for teachers. Keep it simple. 📚**