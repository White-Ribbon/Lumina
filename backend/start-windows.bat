@echo off
REM Cosmic Project Forge Backend Startup Script for Windows

echo 🚀 Starting Cosmic Project Forge Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo ⚠️  MongoDB is not running. Please start MongoDB first.
    echo    - Start MongoDB service from Services.msc
    echo    - Or run: net start MongoDB
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip first
echo 📈 Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies with fallback
echo 📥 Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ⚠️  Some packages failed to install. Trying minimal requirements...
    pip install -r requirements-minimal.txt
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚙️  Creating .env file from template...
    copy env.example .env
    echo 📝 Please edit .env file with your configuration
)

REM Initialize database if needed
echo 🗄️  Checking database initialization...
python init_db.py

REM Start the server
echo 🌟 Starting FastAPI server...
echo 📡 API will be available at: http://localhost:8000
echo 📚 API documentation at: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
