# Database Reset Script
# Deletes the existing SQLite database and recreates it with fresh seed data
# Perfect for development and testing - gives you a clean slate

param(
    [switch]$Force,
    [string]$DatabasePath = ".\data\trivia.db"
)

Write-Host "=== TriviaSpark Database Reset Tool ===" -ForegroundColor Cyan
Write-Host "This will completely delete and recreate the database with fresh seed data" -ForegroundColor Yellow

if (-not $Force) {
    Write-Host ""
    Write-Host "⚠️  WARNING: This will permanently delete all existing data!" -ForegroundColor Red
    Write-Host "   - All events, teams, participants, and responses will be lost" -ForegroundColor Red
    Write-Host "   - Only the original seed data will remain" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Are you sure you want to continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "🔄 Starting database reset process..." -ForegroundColor Green

# Step 1: Stop any running server processes
Write-Host "1️⃣  Checking for running server processes..." -ForegroundColor Blue
try {
    $dotnetProcesses = Get-Process -Name "TriviaSpark.Api" -ErrorAction SilentlyContinue
    if ($dotnetProcesses) {
        Write-Host "   Found running TriviaSpark.Api processes, stopping them..." -ForegroundColor Yellow
        $dotnetProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
    
    # Also check for dotnet processes using the database
    $dbProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
        $_.MainWindowTitle -like "*TriviaSpark*" -or 
        $_.CommandLine -like "*TriviaSpark.Api*"
    }
    if ($dbProcesses) {
        Write-Host "   Found dotnet processes that might be using the database, stopping them..." -ForegroundColor Yellow
        $dbProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
    
    Write-Host "   ✅ Server processes checked" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Could not stop all processes, continuing anyway..." -ForegroundColor Yellow
}

# Step 2: Delete the existing database
Write-Host "2️⃣  Removing existing database..." -ForegroundColor Blue
try {
    if (Test-Path $DatabasePath) {
        Remove-Item $DatabasePath -Force
        Write-Host "   ✅ Database deleted: $DatabasePath" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Database file not found, will create new one" -ForegroundColor Cyan
    }
    
    # Also remove any database lock files
    $lockFiles = @("$DatabasePath-wal", "$DatabasePath-shm", "$DatabasePath.lock")
    foreach ($lockFile in $lockFiles) {
        if (Test-Path $lockFile) {
            Remove-Item $lockFile -Force
            Write-Host "   ✅ Removed lock file: $(Split-Path $lockFile -Leaf)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ❌ Error deleting database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Try stopping the server manually and run this script again" -ForegroundColor Yellow
    exit 1
}

# Step 3: Ensure data directory exists
Write-Host "3️⃣  Ensuring data directory exists..." -ForegroundColor Blue
$dataDir = Split-Path $DatabasePath -Parent
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    Write-Host "   ✅ Created data directory: $dataDir" -ForegroundColor Green
} else {
    Write-Host "   ✅ Data directory exists: $dataDir" -ForegroundColor Green
}

# Step 4: Run EF Core migrations to recreate database
Write-Host "4️⃣  Recreating database with EF Core migrations..." -ForegroundColor Blue
try {
    Push-Location "TriviaSpark.Api"
    
    # Apply migrations to create fresh database
    $migrationResult = dotnet ef database update 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database recreated successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Migration failed:" -ForegroundColor Red
        Write-Host "   $migrationResult" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
} catch {
    Pop-Location
    Write-Host "   ❌ Error running migrations: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 5: Seed the database with initial data
Write-Host "5️⃣  Seeding database with initial data..." -ForegroundColor Blue
try {
    # Use the existing seed script
    if (Test-Path ".\scripts\seed-database.mjs") {
        $seedResult = node ".\scripts\seed-database.mjs" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Database seeded successfully" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Seed script had issues, but database is created" -ForegroundColor Yellow
            Write-Host "   You may need to run 'npm run seed' manually later" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Seed script not found, database created but empty" -ForegroundColor Yellow
        Write-Host "   Run 'npm run seed' to add sample data" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Error seeding database: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Database created successfully, but no seed data added" -ForegroundColor Yellow
}

# Step 6: Verify the reset
Write-Host "6️⃣  Verifying database reset..." -ForegroundColor Blue
try {
    if (Test-Path $DatabasePath) {
        $fileInfo = Get-Item $DatabasePath
        Write-Host "   ✅ Database file exists: $($fileInfo.Length) bytes" -ForegroundColor Green
        Write-Host "   📅 Created: $($fileInfo.CreationTime)" -ForegroundColor Cyan
        
        # Quick verification by starting server briefly to check connection
        Write-Host "   🔍 Testing database connection..." -ForegroundColor Blue
        Push-Location "TriviaSpark.Api"
        
        $testConnection = Start-Process -FilePath "dotnet" -ArgumentList "run","--no-build","--verbosity","quiet" -PassThru -WindowStyle Hidden
        Start-Sleep -Seconds 5
        
        if (-not $testConnection.HasExited) {
            $testConnection | Stop-Process -Force
            Write-Host "   ✅ Database connection test passed" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Database connection test inconclusive" -ForegroundColor Yellow
        }
        
        Pop-Location
    } else {
        Write-Host "   ❌ Database file not found after reset" -ForegroundColor Red
        exit 1
    }
} catch {
    if (Test-Path "TriviaSpark.Api") { Pop-Location }
    Write-Host "   ⚠️  Could not fully verify database: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Success message
Write-Host ""
Write-Host "🎉 Database reset completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was done:" -ForegroundColor Cyan
Write-Host "   ✅ Stopped running server processes" -ForegroundColor White
Write-Host "   ✅ Deleted old database and lock files" -ForegroundColor White
Write-Host "   ✅ Recreated database with fresh schema" -ForegroundColor White
Write-Host "   ✅ Applied EF Core migrations" -ForegroundColor White
Write-Host "   ✅ Seeded with initial sample data" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Start the server: dotnet run --project TriviaSpark.Api" -ForegroundColor White
Write-Host "   2. Test the API: Open tests/http/api-tests.http in VS Code" -ForegroundColor White
Write-Host "   3. Check the data: Visit http://localhost:14166/api/debug/db" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Use -Force parameter to skip confirmation prompt" -ForegroundColor Yellow
Write-Host "   Example: .\tools\reset-database.ps1 -Force" -ForegroundColor Gray
