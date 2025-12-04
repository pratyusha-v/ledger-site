# Deployment Guide - Supabase + Vercel

## Step 1: Set Up Database Tables in Supabase

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Create grades table
CREATE TABLE grades (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grade INTEGER NOT NULL,
  roll_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (grade) REFERENCES grades(id)
);

-- Create evaluations table
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  grade INTEGER NOT NULL,
  subject_id UUID NOT NULL,
  max_score NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (grade) REFERENCES grades(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Create grade_entries table (stores student scores)
CREATE TABLE grade_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  evaluation_id UUID NOT NULL,
  score NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
  UNIQUE(student_id, evaluation_id)
);

-- Insert sample grades
INSERT INTO grades (id, name) VALUES
  (6, 'Grade 6'), (7, 'Grade 7'), (8, 'Grade 8'),
  (9, 'Grade 9'), (10, 'Grade 10'), (11, 'Grade 11'), (12, 'Grade 12');

-- Insert sample subjects
INSERT INTO subjects (name) VALUES
  ('Mathematics'), ('English'), ('Science'), ('History'), ('Geography');

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (restrict later as needed)
CREATE POLICY "Enable all for students" ON students FOR ALL USING (true);
CREATE POLICY "Enable all for evaluations" ON evaluations FOR ALL USING (true);
CREATE POLICY "Enable all for grade_entries" ON grade_entries FOR ALL USING (true);
CREATE POLICY "Enable all for subjects" ON subjects FOR ALL USING (true);
```

## Step 2: Deploy to GitHub

```bash
cd /Users/pratyusha/Projects/ledger-site

# Check current status
git status

# Add all files
git add .

# Commit changes
git commit -m "Add Supabase integration"

# Push to GitHub
git push origin main
```

## Step 3: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Select your `ledger-site` repository
4. Click "Import"
5. In the "Environment Variables" section, add:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://yvrgxpcjjjfqrofisumr.supabase.co`
   
6. Add another environment variable:
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cmd4cGNqampmcXJvZmlzdW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MDgzMTksImV4cCI6MjA4MDM4NDMxOX0.P-HNDc43SitimDcO_1kDFHMfdGB1BvTVb1S7eKXomxU`

7. Click "Deploy"
8. Wait for deployment to complete

## Step 4: Test Your Deployment

1. Visit your Vercel URL (e.g., `https://ledger-site.vercel.app`)
2. Open Developer Console (F12)
3. Select a grade and subject
4. Test adding a student
5. Test creating an evaluation
6. Check that data persists in Supabase

## Troubleshooting

**Error: "Supabase connection failed"**
- Check that environment variables are correctly set in Vercel
- Verify credentials in Supabase dashboard

**Data not showing up:**
- Check browser console for errors
- Verify RLS policies allow read/write access
- Check Supabase SQL editor to confirm tables have data

**Performance issues:**
- Add proper indexes to frequently queried columns
- Consider caching strategies for grade/subject data

## Local Development

To test locally before deploying:

```bash
cd /Users/pratyusha/Projects/ledger-site
npm install
npm run dev
```

Visit `http://localhost:8000` in your browser.
