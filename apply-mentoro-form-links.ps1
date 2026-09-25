$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$traineeUrl = "https://mentoro-trainee.zite.so/"
$mentorUrl  = "https://mentor-form.zite.so/"

$files = Get-ChildItem -Path $root -Recurse -File |
  Where-Object {
    $_.Extension -in @(".html",".htm",".js") -and
    $_.FullName -notmatch "\\(\.git|node_modules)\\"
  }

$changed = @()

foreach ($file in $files) {
  $content = Get-Content -LiteralPath $file.FullName -Raw
  $original = $content

  # Replace hrefs in CTA elements whose text/attributes identify the audience.
  $content = [regex]::Replace(
    $content,
    '(?is)(<a\b(?=[^>]*(?:student|trainee))[^>]*href\s*=\s*["''])([^"'']+)(["''])',
    '$1' + $traineeUrl + '$3'
  )

  $content = [regex]::Replace(
    $content,
    '(?is)(<a\b(?=[^>]*(?:mentor|physician|doctor))[^>]*href\s*=\s*["''])([^"'']+)(["''])',
    '$1' + $mentorUrl + '$3'
  )

  if ($content -ne $original) {
    Set-Content -LiteralPath $file.FullName -Value $content -Encoding UTF8
    $changed += $file.FullName
  }
}

Write-Host ""
Write-Host "MENTORO form-link update finished." -ForegroundColor Green
Write-Host ""
if ($changed.Count) {
  Write-Host "Changed files:" -ForegroundColor Cyan
  $changed | ForEach-Object { Write-Host " - $_" }
} else {
  Write-Host "No CTA links were changed automatically." -ForegroundColor Yellow
  Write-Host "Use the verification command below to locate remaining form links."
}
Write-Host ""
Write-Host "Verify with:"
Write-Host 'git --no-pager diff'
Write-Host 'git grep -n -i "google.com/forms\|forms.gle\|mentoro-trainee.zite.so\|mentor-form.zite.so"'
