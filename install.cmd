@echo off
REM Installe les dependances (equivalent a : npm install) sans passer par npm.ps1 sous PowerShell.
cd /d "%~dp0"
where npm >nul 2>nul && (
  npm install
  exit /b %ERRORLEVEL%
)
if exist "%ProgramFiles%\nodejs\npm.cmd" (
  "%ProgramFiles%\nodejs\npm.cmd" install
  exit /b %ERRORLEVEL%
)
if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" (
  "%ProgramFiles(x86)%\nodejs\npm.cmd" install
  exit /b %ERRORLEVEL%
)
echo [erreur] npm introuvable. Installez Node.js depuis https://nodejs.org
pause
exit /b 1
