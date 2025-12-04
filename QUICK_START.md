🎓 GRADING PORTAL - Quick Start Guide
=====================================

Your vanilla HTML/CSS/JS grading portal is ready! Here's what's included:

## Files Created

✅ index.html      - Main markup with 5 tabs (Dashboard, Students, Assignments, Grades, Reports)
✅ styles.css      - Desktop-first styling, print-friendly
✅ script.js       - Complete data model + UI interactions (~800 lines)
✅ README.md       - Comprehensive documentation

## What You Can Do Right Now

1. **Open the app locally:**
   
   Option A - Python server:
   $ cd /Users/pratyusha/Projects/ledger-site
   $ python3 -m http.server 8000
   Then visit: http://localhost:8000

   Option B - VS Code Live Server:
   Right-click index.html → "Open with Live Server"

   Option C - Direct open:
   Just double-click index.html in Finder

2. **Test the workflow:**
   
   a) Go to "Students" tab
      - Select "Grade 6"
      - Add a few students: "Alice", "Bob", "Charlie"
   
   b) Go to "Assignments" tab
      - Select "Grade 6" → "Math"
      - Add: "Quiz 1" (max: 100, weight: 20, today)
      - Add: "Test 1" (max: 100, weight: 30, today)
   
   c) Go to "Grades" tab
      - Select "Grade 6" → "Math"
      - Enter some scores (e.g., Alice: 90, 85 → 87.5% average)
   
   d) Go to "Dashboard" tab
      - See class summary and all averages
   
   e) Go to "Reports" tab
      - Generate report for a specific student
      - Click "Print" to save as PDF

## How It Works

🔹 **Data Storage**: All data lives in browser localStorage (gradingPortalData key)
🔹 **Weighted Averages**: Automatically calculated using assignment weights
🔹 **No Backend Needed**: Perfect for prototype/single-computer use
🔹 **Print-Friendly**: Reports look great when printed or saved as PDF

## Data Persists Across Sessions

- Your data is saved in localStorage automatically
- Refresh the page → data is still there
- Clear browser cache → data is lost (optional warning: could add localStorage backup)

## Ready to Deploy?

Push to GitHub and deploy to Vercel (static site):

$ git add .
$ git commit -m "Grading portal v1"
$ git push origin main

Then:
1. Go to vercel.com
2. Click "New Project"
3. Import your ledger-site repo
4. Click "Deploy"
5. Share the URL with teachers!

## Key Features

✅ Add/edit/delete students by grade
✅ Add/edit/delete assignments with weights
✅ Enter grades directly in a table (instant save)
✅ Auto-calculate weighted averages per subject
✅ Class summaries (total students, avg scores, etc.)
✅ Individual student reports (all subjects + assignments)
✅ Print-to-PDF support (browser print dialog)
✅ Clean, minimal UI (desktop-first)
✅ Mobile-responsive (bonus, not primary focus)

## Customization Examples

Want to change subjects? Edit script.js:

const DEFAULT_SUBJECTS = [
    { id: 1, name: 'Math' },
    { id: 2, name: 'Science' },
    { id: 3, name: 'English' },
    // ... add more
];

Want to change colors? Edit styles.css:

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

Change to green:
background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);

## Troubleshooting

❌ "Changes aren't saving?"
→ Check if localStorage is enabled (not in private mode)

❌ "Data disappeared after refresh?"
→ You probably cleared browser cache. That's expected.

❌ "Averages look wrong?"
→ Check weights sum to a reasonable total (e.g., 20+30+50=100)

❌ "Print looks ugly?"
→ The @media print styles hide tabs/buttons. Should be clean.

## Next Steps

1. ✅ Test locally (add some dummy data)
2. ✅ Deploy to Vercel
3. ✅ Share with teachers (get feedback)
4. ✅ Iterate (UX tweaks, color changes, etc.)

Later (out of scope for v1):
- Add backend: Vercel Postgres + serverless functions
- Multi-user support
- CSV export
- Mobile app

---

That's it! You have a simple, functional, ready-to-use grading portal.
No frameworks. No build tools. Just HTML/CSS/JS that works. 🎉

Questions? Check README.md for more details.

