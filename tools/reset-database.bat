@echo off
REM Database Reset Script - Batch Version
REM Deletes the existing SQLite database and recreates it with fresh seed data

echo === TriviaSpark Database Reset Tool ===
echo This will completely delete and recreate the database with fresh seed data

if "%1" NEQ "-force" (
    echo.
    echo WARNING: This will permanently delete all existing data!
    echo    - All events, teams, participants, and responses will be lost
    echo    - Only the original seed data will remain
    echo.
    set /p confirm="Are you sure you want to continue? (y/N): "
    if /i NOT "%confirm%" == "y" (
        echo Operation cancelled.
        exit /b 0
    )
)

echo.
echo Starting database reset process...

REM Step 1: Stop running processes
echo 1. Checking for running server processes...
taskkill /f /im TriviaSpark.Api.exe >nul 2>&1
taskkill /f /im dotnet.exe /fi "WINDOWTITLE eq *TriviaSpark*" >nul 2>&1
timeout /t 2 /nobreak >nul
echo    Server processes checked

REM Step 2: Delete existing database
echo 2. Removing existing database...
if exist "data\trivia.db" (
    del /f "data\trivia.db" >nul 2>&1
    if not exist "data\trivia.db" (
        echo    Database deleted successfully
    ) else (
        echo    Error: Could not delete database file
        echo    Make sure the server is stopped and try again
        exit /b 1
    )
) else (
    echo    Database file not found, will create new one
)

REM Delete lock files
del /f "data\trivia.db-wal" >nul 2>&1
del /f "data\trivia.db-shm" >nul 2>&1
del /f "data\trivia.db.lock" >nul 2>&1

REM Step 3: Ensure data directory exists
echo 3. Ensuring data directory exists...
if not exist "data" mkdir data
echo    Data directory ready

REM Step 4: Recreate database with migrations
echo 4. Recreating database with EF Core migrations...
pushd TriviaSpark.Api
dotnet ef database update >nul 2>&1
if %errorlevel% equ 0 (
    echo    Database recreated successfully
) else (
    echo    Error: Migration failed
    popd
    exit /b 1
)
popd

REM Step 5: Seed the database
echo 5. Seeding database with initial data...
if exist "scripts\seed-database.mjs" (
    node "scripts\seed-database.mjs" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    Database seeded successfully
    ) else (
        echo    Warning: Seed script had issues
        echo    You may need to run 'npm run seed' manually
    )
) else (
    echo    Warning: Seed script not found
    echo    Run 'npm run seed' to add sample data
)

REM Step 6: Verify
echo 6. Verifying database reset...
if exist "data\trivia.db" (
    echo    Database file exists and ready
) else (
    echo    Error: Database file not found after reset
    exit /b 1
)

echo.
echo Database reset completed successfully!
echo.
echo What was done:
echo    - Stopped running server processes
echo    - Deleted old database and lock files  
echo    - Recreated database with fresh schema
echo    - Applied EF Core migrations
echo    - Seeded with initial sample data
echo.
echo Next steps:
echo    1. Start the server: dotnet run --project TriviaSpark.Api
echo    2. Test the API: Open tests/http/api-tests.http in VS Code
echo    3. Check the data: Visit http://localhost:14166/api/debug/db
echo.
echo Tip: Use -force parameter to skip confirmation
echo    Example: reset-database.bat -force

pause
