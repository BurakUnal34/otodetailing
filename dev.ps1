# PowerShell: PATH'e Node ekleyip dev sunucusunu baslatir (Cursor eski PATH ile acildiginda kullanin).
$ErrorActionPreference = "Stop"
$nodeDir = Join-Path $env:ProgramFiles "nodejs"
if (-not (Test-Path (Join-Path $nodeDir "npm.cmd"))) {
  $nodeDir = Join-Path ${env:ProgramFiles(x86)} "nodejs"
}
if (-not (Test-Path (Join-Path $nodeDir "npm.cmd"))) {
  Write-Host "[HATA] Node.js bulunamadi. https://nodejs.org - LTS kurun." -ForegroundColor Red
  exit 1
}
$env:Path = "$nodeDir;$env:Path"
Set-Location $PSScriptRoot
Write-Host "npm: $(Get-Command npm | Select-Object -ExpandProperty Source)" -ForegroundColor DarkGray
npm run dev
