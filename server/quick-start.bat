@echo off
echo ========================================
echo   Student Transcript Ledger - Server
echo ========================================
echo.

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Checking .env file...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Creating from env.example...
    copy env.example .env
    echo.
    echo Please edit .env file and add your MongoDB URI
    echo Then run this script again.
    pause
    exit /b 1
)

echo.
echo Starting server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop
echo.
call npm run dev

