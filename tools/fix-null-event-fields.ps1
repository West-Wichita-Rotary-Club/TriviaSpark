# PowerShell script to fix NULL values in Events table
# This script connects to the SQLite database and updates NULL values with defaults

$DatabasePath = ".\data\trivia.db"
$SqlScript = @"
UPDATE Events 
SET 
    primary_color = '#7C2D12' 
WHERE primary_color IS NULL;

UPDATE Events 
SET 
    secondary_color = '#FEF3C7' 
WHERE secondary_color IS NULL;

UPDATE Events 
SET 
    font_family = 'Inter' 
WHERE font_family IS NULL;

UPDATE Events 
SET 
    settings = '{}' 
WHERE settings IS NULL;

-- Show updated records
SELECT id, title, primary_color, secondary_color, font_family, settings 
FROM Events;
"@

Write-Host "Fixing NULL values in Events table..." -ForegroundColor Yellow

try {
    # Use sqlite3 command line tool if available
    if (Get-Command sqlite3 -ErrorAction SilentContinue) {
        Write-Host "Using sqlite3 command line tool..." -ForegroundColor Green
        $SqlScript | sqlite3 $DatabasePath
    } else {
        Write-Host "sqlite3 command not found. Please run the SQL manually:" -ForegroundColor Red
        Write-Host $SqlScript -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error executing SQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run this SQL manually against the database:" -ForegroundColor Yellow
    Write-Host $SqlScript -ForegroundColor Cyan
}
