@echo off
echo Starting AI Productivity App Servers...

REM Start Node.js server in background
echo Starting Node.js server on port 5000...
start "Node Server" cmd /k "cd /d %~dp0 && npm run server"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start Python AI backend
echo Starting Python AI backend on port 5001...
start "AI Backend" cmd /k "cd /d %~dp0\ai-backend && venv\Scripts\activate && python app.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start React frontend
echo Starting React frontend on port 5173...
start "React Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo All servers started!
echo - Node.js API: http://localhost:5000
echo - Python AI: http://localhost:5001
echo - React App: http://localhost:5173
pause
