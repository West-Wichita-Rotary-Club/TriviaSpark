#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete database refresh script for TriviaSpark
    
.DESCRIPTION
    This script performs a complete database refresh including:
    1. Delete existing database
    2. Create new database schema
    3. Seed with demo data
    4. Extract data to demoData.ts
    5. Build the project
    
.PARAMETER SkipBuild
    Skip the final build step (useful for development)
    
.EXAMPLE
    .\refresh-db.ps1
    
.EXAMPLE
    .\refresh-db.ps1 -SkipBuild
#>

param(
    [switch]$SkipBuild
)

# Color functions for better output
function Write-Header {
    param([string]$Message)
    Write-Host "`n🔄 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

# Main script execution
try {
    Write-Header "Starting TriviaSpark Database Refresh Process"
    
    # Check if we're in the right directory
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the TriviaSpark root directory."
        exit 1
    }
    
    # Step 1: Delete existing database
    Write-Header "Step 1: Removing existing database"
    $dbPath = "./data/trivia.db"
    if (Test-Path $dbPath) {
        Remove-Item -Path $dbPath -Force
        Write-Success "Deleted existing database file"
    }
    else {
        Write-Info "No existing database found, continuing..."
    }
    
    # Step 2: Create database schema
    Write-Header "Step 2: Creating database schema"
    $result = & npx drizzle-kit push 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to create database schema"
        Write-Host $result
        exit 1
    }
    Write-Success "Database schema created successfully"
    
    # Step 3: Seed database with demo data
    Write-Header "Step 3: Seeding database with demo data"
    $result = & npm run seed 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to seed database"
        Write-Host $result
        exit 1
    }
    Write-Success "Database seeded successfully"
    
    # Step 4: Extract data to demoData.ts
    Write-Header "Step 4: Extracting data to demo file"
    $result = & npm run extract-data 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to extract data"
        Write-Host $result
        exit 1
    }
    Write-Success "Data extracted to demoData.ts successfully"
    
    # Step 5: Build project (optional)
    if (-not $SkipBuild) {
        Write-Header "Step 5: Building project"
        $result = & npm run build 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build project"
            Write-Host $result
            exit 1
        }
        Write-Success "Project built successfully"
    }
    else {
        Write-Info "Skipping build step as requested"
    }
    
    # Final summary
    Write-Header "Database Refresh Complete! 🎉"
    Write-Success "✅ Database deleted and recreated"
    Write-Success "✅ Schema applied with Drizzle"
    Write-Success "✅ Demo data seeded (10 questions, 5 fun facts)"
    Write-Success "✅ Data extracted to demoData.ts"
    if (-not $SkipBuild) {
        Write-Success "✅ Project built successfully"
    }
    
    Write-Info "`n🚀 Ready to test:"
    Write-Info "   • Run 'npm run dev' to start development server"
    Write-Info "   • Login with: mark / mark123"
    Write-Info "   • View questions in presenter mode"
    
}
catch {
    Write-Error "An unexpected error occurred: $_"
    exit 1
}
