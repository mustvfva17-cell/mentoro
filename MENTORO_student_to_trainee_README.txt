MENTORO — Student → Trainee wording update

Run this PowerShell script from the root of the current MENTORO project:

  Set-ExecutionPolicy -Scope Process Bypass
  .\MENTORO_student_to_trainee.ps1

The script updates visible wording in HTML and text-facing attributes only.
It intentionally does NOT change:
- /students route URLs
- students.html filename
- CSS classes/IDs such as students-page
- JS filenames/references
- Google Form URLs

After running, review:
  git diff

Then commit:
  git add .
  git commit -m "Rename students to trainees across site"
  git push
