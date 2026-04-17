cd "C:\Projects\pci-nexus-marketing"

$files = @("index.html","features.html","security.html","consultants.html","comparison.html","onboarding.html")

foreach ($file in $files) {
    if (-not (Test-Path $file)) { Write-Host "SKIP: $file"; continue }
    
    $c = Get-Content $file -Raw

    # Remove the injected PowerShell garbage that got written into the CSS
    $c = $c -replace "if \(\`$m -notmatch 'white-space'\) \{ \`$m -replace '\\}'`r?`n", ""
    $c = $c -replace "</script>, 'white-space: nowrap; \}' \}`r?`n", ""
    $c = $c -replace "if \(\`$m -notmatch 'white-space'\) \{ \`$m -replace '\\}'\n", ""
    $c = $c -replace "</script>, 'white-space: nowrap; \}' \}\n", ""

    # Fix arrow encoding (â†' should be →)
    $c = $c -replace "â†'", "→"

    # Ensure nav-links has correct spacing CSS
    $c = $c -replace "\.nav-links \{ display: flex; align-items: center;[^}]+\}", ".nav-links { display: flex; align-items: center; justify-content: space-evenly; flex: 1; gap: 0; margin: 0 1rem; }"

    # Ensure nav-links a has white-space nowrap and correct font size
    $c = $c -replace "(\.nav-links a \{)([^}]+)(\})", {
        param($m)
        $inner = $m.Groups[2].Value
        if ($inner -notmatch "white-space") { $inner += " white-space: nowrap;" }
        $inner = $inner -replace "font-size: 0\.\d+rem", "font-size: 0.78rem"
        $m.Groups[1].Value + $inner + $m.Groups[3].Value
    }

    Set-Content $file $c -NoNewline -Encoding UTF8
    Write-Host "Cleaned: $file"
}

Write-Host ""
Write-Host "All done. Verify in browser then:"
Write-Host "git add *.html"
Write-Host "git commit -m 'fix: clean nav CSS corruption, even spacing, no line breaks, fix arrow encoding'"
Write-Host "git push"
