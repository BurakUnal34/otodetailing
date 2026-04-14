@echo off
REM Cursor / PowerShell bazen PATH'e Node eklenmeden acilir; bu dosya npm'i tam yoldan calistirir.
cd /d "%~dp0"

set "NPM=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM%" set "NPM=%ProgramFiles(x86)%\nodejs\npm.cmd"
if not exist "%NPM%" (
  echo [HATA] Node.js bulunamadi. Program Files altinda npm.cmd yok.
  echo        https://nodejs.org adresinden LTS surumunu kurun, ardindan bu dosyayi tekrar calistirin.
  pause
  exit /b 1
)

echo Calistiriliyor: "%NPM%" run dev
call "%NPM%" run dev
