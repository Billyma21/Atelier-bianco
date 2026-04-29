@echo off
REM Lance le serveur de dev (equivalent a : npm run dev) meme si npm n'est pas dans le PATH.
cd /d "%~dp0"
where npm >nul 2>nul && (
  npm run dev
  exit /b %ERRORLEVEL%
)
if exist "%ProgramFiles%\nodejs\npm.cmd" (
  "%ProgramFiles%\nodejs\npm.cmd" run dev
  exit /b %ERRORLEVEL%
)
if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" (
  "%ProgramFiles(x86)%\nodejs\npm.cmd" run dev
  exit /b %ERRORLEVEL%
)
echo [erreur] npm introuvable. Installez Node.js depuis https://nodejs.org et cochez "Add to PATH".
pause
exit /b 1
