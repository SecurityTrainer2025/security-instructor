@echo off
setlocal
cd /d "%~dp0"
set "PY=py -3"
%PY% -c "import sys; sys.exit(sys.version_info < (3,10))" >nul 2>&1
if errorlevel 1 set "PY=python"
%PY% -c "import sys; sys.exit(sys.version_info < (3,10))" >nul 2>&1
if errorlevel 1 (
  echo Python 3.10 or newer is required. Install it from python.org.
  goto failed
)
if not "%~1"=="" (
  %PY% produce.py %*
  if errorlevel 1 goto failed
  exit /b 0
)
%PY% produce.py --validate
if errorlevel 1 goto failed
echo.
echo Place optional Arabic recordings in the narration folder. See README.md.
choice /c RE /n /m "[R] Use only local recordings  [E] Use free Edge voice for missing recordings: "
if errorlevel 3 goto failed
if errorlevel 2 goto edge
%PY% produce.py
if errorlevel 1 goto failed
goto done
:edge
%PY% -c "import edge_tts" >nul 2>&1
if errorlevel 1 (
  %PY% -m pip install --user edge-tts
  if errorlevel 1 goto failed
)
%PY% produce.py --edge-voice ar-EG-ShakirNeural
if errorlevel 1 goto failed
:done
echo Complete. See review-output.
pause
exit /b 0
:failed
echo Production failed. Read the error above and see README.md.
pause
exit /b 1
