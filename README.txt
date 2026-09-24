MENTORO wordmark definitive fix

This patch changes only the visible MENTORO brand-name typography in the navbar/footer.
It preserves your current styles.css and replaces only a marked override block if it already exists.
No new font dependency is added.

Run from the project root in VS Code PowerShell:

Set-ExecutionPolicy -Scope Process Bypass
.\apply-mentoro-wordmark-style.ps1

git --no-pager diff -- styles.css

Then refresh the site with Ctrl+F5.
