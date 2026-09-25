$ErrorActionPreference = 'Stop'
$root = Get-Location
$files = @('index.html','students.html','physicians.html','how-it-works.html','about.html')

foreach ($name in $files) {
    $path = Join-Path $root $name
    if (-not (Test-Path $path)) { continue }
    $text = Get-Content -Raw -Encoding UTF8 $path
    $new = [regex]::Replace($text, '>\s*mentoro\s*<', '><span class="brand-wordmark">mentor<span class="brand-o">o</span></span><')
    if ($new -ne $text) {
        [System.IO.File]::WriteAllText($path, $new, (New-Object System.Text.UTF8Encoding($false)))
    }
}

$cssPath = Join-Path $root 'styles.css'
if (-not (Test-Path $cssPath)) { throw 'styles.css not found.' }
$css = Get-Content -Raw -Encoding UTF8 $cssPath
$block = @'

/* MENTORO radical wordmark treatment */
.brand-wordmark,
.footer-brand .brand-wordmark {
  display: inline-flex;
  align-items: baseline;
  font-family: "Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif;
  font-size: 1.42rem;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.055em;
  color: var(--ink);
  text-transform: lowercase;
  transform: translateY(1px) scaleX(0.98);
  transform-origin: left center;
}

.brand-o,
.footer-brand .brand-o {
  color: var(--mentoro-red, #B4233A);
  font-size: 1.08em;
  font-weight: 900;
  letter-spacing: -0.075em;
  margin-left: 0.01em;
  position: relative;
  top: 0.005em;
}

.footer-brand .brand-wordmark {
  font-size: 1.18rem;
  color: #fff;
}

.footer-brand .brand-o {
  color: var(--mentoro-red, #B4233A);
}

@media (max-width: 700px) {
  .brand-wordmark {
    font-size: 1.28rem;
  }
}
'@
if ($css -notmatch 'MENTORO radical wordmark treatment') {
    Add-Content -Path $cssPath -Value $block -Encoding UTF8
}

Write-Host 'Applied radical mentoro wordmark treatment to the five public pages.' -ForegroundColor Green
