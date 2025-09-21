@echo off
echo Setting up Python virtual environment for AI Backend...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Upgrade pip
python -m pip install --upgrade pip

REM Install requirements
pip install -r requirements.txt

echo Virtual environment setup complete!
echo To activate: ai-backend\venv\Scripts\activate.bat
pause
