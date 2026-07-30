<#
  push-marketing.ps1  (logged)
  Commits and pushes the marketing site (branch: main). This is a SEPARATE
  repo from the app — it has no build step. Logs to marketing-push-log.txt.
  Changes in this batch:
    - index.html      : "Just Looking Around" -> /onboarding.html?intent=guest
    - onboarding.html : intent=guest opens the guest capture modal; generic
                        placeholder names (no "Sandra Kowalski")
#>
$ErrorActionPreference = 'Continue'
Set-Location C:\Projects\pci-nexus-marketing
$log = "C:\Projects\pci-nexus-marketing\marketing-push-log.txt"

"=== status before ===" | Set-Content $log
(git status -sb) 2>&1    | Add-Content $log
git add -A
$msg = "Just Looking Around -> guest capture -> demo (bypass login); generic placeholders (de-Coastal)"
(git commit -m $msg) 2>&1 | Add-Content $log
"=== push ==="            | Add-Content $log
(git push) 2>&1          | Add-Content $log
"=== push exit code: $LASTEXITCODE ===" | Add-Content $log
"local  " + (git rev-parse HEAD) 2>&1   | Add-Content $log
"remote " + (git rev-parse '@{u}') 2>&1 | Add-Content $log
Write-Host "Done - wrote marketing-push-log.txt"
