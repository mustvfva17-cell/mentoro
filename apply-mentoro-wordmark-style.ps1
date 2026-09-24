$ErrorActionPreference = 'Stop'
$path = Join-Path (Get-Location) 'styles.css'
if (-not (Test-Path $path)) { throw "styles.css was not found in the current folder." }

$content = Get-Content -Raw -Encoding UTF8 $path
$markerStart = '/* MENTORO WORDMARK STYLE — BEGIN */'
$markerEnd = '/* MENTORO WORDMARK STYLE — END */'

$block = @"
$markerStart
/* Distinctive, modern wordmark treatment — does not add a new dependency. */
.brand,
.footer-brand {
  font-family: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  text-transform: lowercase;
}

.nav .brand {
  font-size: 1.30rem;
}

.footer-brand {
  font-size: 1.14rem;
}
$markerEnd
"@

$pattern = [regex]::Escape($markerStart) + '[\s\S]*?' + [regex]::Escape($markerEnd)
if ($content -match $pattern) {
  $content = [regex]::Replace($content, $pattern, $block)
} else {
  if (-not $content.EndsWith("`n")) { $content += "`n" }
  $content += "`n$block`n"
}

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Host "Updated styles.css successfully."
Write-Host "Run: git --no-pager diff -- styles.css"
