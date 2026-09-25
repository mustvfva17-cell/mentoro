MENTORO — New Application Form Links

Trainee application:
https://mentoro-trainee.zite.so/

Mentor application:
https://mentor-form.zite.so/

This patch edits the existing project in place so your current work is preserved.

1. Put apply-mentoro-form-links.ps1 in the project root.
2. In VS Code Terminal:

Set-ExecutionPolicy -Scope Process Bypass
.\apply-mentoro-form-links.ps1

3. Verify:

git --no-pager diff
git grep -n -i "google.com/forms\|forms.gle\|mentoro-trainee.zite.so\|mentor-form.zite.so"

4. Deploy:

git add .
git commit -m "Update trainee and mentor application forms"
git push
