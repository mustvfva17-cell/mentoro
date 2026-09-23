# MENTORO — static website

MENTORO is a static HTML/CSS/JS website for a medical clinical mentorship platform. The public website is deployed to Vercel with GitHub-connected automatic deployments.

## Application flow

Student and physician applications are handled through the existing Google Forms linked throughout the site. The website does not contain a custom application backend or admin dashboard.

## Local development

No build step is required. Open the project in VS Code and preview the HTML files locally.

## Deployment

The repository is connected to Vercel. Commit and push changes to deploy:

```bash
git add .
git commit -m "Describe the change"
git push
```

`vercel.json` enables clean URLs such as `/students`, `/physicians`, `/how-it-works`, and `/about`.
