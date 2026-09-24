# Safe MENTORO wording update: Student(s) -> Trainee(s)
# - Updates visible HTML text plus text-facing attributes.
# - Preserves routes such as /students, filenames, CSS classes/IDs, JS references, and Google Form URLs.

$root = Get-Location
$files = Get-ChildItem -Path $root -Recurse -File -Filter *.html
$changed = @()

foreach ($file in $files) {
    $original = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    $updated = [regex]::Replace($original, '(?<tag><[^>]*>)|(?<text>[^<]+)', {
        param($m)
        if ($m.Groups['tag'].Success) {
            $tag = $m.Value
            # Only update human-facing attributes; never touch href/src/class/id/name.
            $tag = [regex]::Replace($tag, '(?<attr>\b(?:alt|aria-label|title|content)\s*=\s*)(?<q>["''])(?<v>.*?)(\k<q>)', {
                param($a)
                $attr = $a.Groups['attr'].Value
                $q = $a.Groups['q'].Value
                $v = $a.Groups['v'].Value
                $v = $v -replace '\bStudents\b', 'Trainees'
                $v = $v -replace '\bstudents\b', 'trainees'
                $v = $v -replace '\bStudent\b', 'Trainee'
                $v = $v -replace '\bstudent\b', 'trainee'
                return $attr + $q + $v + $q
            })
            return $tag
        }

        $text = $m.Value
        $text = $text -replace '\bStudents\b', 'Trainees'
        $text = $text -replace '\bstudents\b', 'trainees'
        $text = $text -replace '\bStudent\b', 'Trainee'
        $text = $text -replace '\bstudent\b', 'trainee'
        return $text
    })

    if ($updated -ne $original) {
        Set-Content -LiteralPath $file.FullName -Value $updated -Encoding UTF8
        $changed += $file.FullName
    }
}

Write-Host "Updated $($changed.Count) HTML file(s):" -ForegroundColor Green
$changed | ForEach-Object { Write-Host " - $($_)" }
Write-Host "Routes, filenames, CSS classes/IDs, JS references, and Google Form URLs were left unchanged." -ForegroundColor Cyan
