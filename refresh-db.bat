@echo off
REM TriviaSpark Database Refresh Script (Windows Batch)
REM This script performs a complete database refresh

echo.
echo 🔄 Starting TriviaSpark Database Refresh Process
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the TriviaSpark root directory.
    pause
    exit /b 1
)

REM Step 1: Delete existing database
echo 🔄 Step 1: Removing existing database
if exist "data\trivia.db" (
    del /f "data\trivia.db"
    echo ✅ Deleted existing database file
) else (
    echo ℹ️  No existing database found, continuing...
)

REM Step 2: Create database schema
echo.
echo 🔄 Step 2: Creating database schema
call npx drizzle-kit push
if errorlevel 1 (
    echo ❌ Failed to create database schema
    pause
    exit /b 1
)
echo ✅ Database schema created successfully

REM Step 3: Seed database
echo.
echo 🔄 Step 3: Seeding database with demo data
call npm run seed
if errorlevel 1 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✅ Database seeded successfully

REM Step 4: Extract data
echo.
echo 🔄 Step 4: Extracting data to demo file
call npm run extract-data
if errorlevel 1 (
    echo ❌ Failed to extract data
    pause
    exit /b 1
)
echo ✅ Data extracted to demoData.ts successfully

REM Step 5: Build project
echo.
echo 🔄 Step 5: Building project
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build project
    pause
    exit /b 1
)
echo ✅ Project built successfully

REM Final summary
echo.
echo 🔄 Database Refresh Complete! 🎉
echo ✅ Database deleted and recreated
echo ✅ Schema applied with Drizzle
echo ✅ Demo data seeded (10 questions, 5 fun facts)
echo ✅ Data extracted to demoData.ts
echo ✅ Project built successfully
echo.
echo 🚀 Ready to test:
echo    • Run 'npm run dev' to start development server
echo    • Login with: mark / mark123
echo    • View questions in presenter mode
echo.
pause
