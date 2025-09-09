#!/usr/bin/env pwsh
# PowerShell script to monitor TriviaSpark log files in real-time

param(
    [string]$LogType = "all",  # Options: all, main, errors, dev
    [int]$TailLines = 50,      # Number of recent lines to show
    [switch]$Follow            # Follow/watch the log file for new entries
)

$LogPath = "C:\websites\triviaspark\logs"

# Check if log directory exists
if (-not (Test-Path $LogPath)) {
    Write-Host "Log directory not found: $LogPath" -ForegroundColor Red
    Write-Host "Make sure the application has been started and logs are being written." -ForegroundColor Yellow
    exit 1
}

# Function to get the most recent log file matching a pattern
function Get-LatestLogFile {
    param([string]$Pattern)
    
    $files = Get-ChildItem -Path $LogPath -Name $Pattern | Sort-Object LastWriteTime -Descending
    if ($files.Count -gt 0) {
        return Join-Path $LogPath $files[0]
    }
    return $null
}

# Function to display log file with colors
function Show-LogFile {
    param([string]$FilePath, [string]$Title)
    
    if (-not $FilePath -or -not (Test-Path $FilePath)) {
        Write-Host "Log file not found: $Title" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n=== $Title ===" -ForegroundColor Cyan
    Write-Host "File: $FilePath" -ForegroundColor Gray
    Write-Host ("=" * 80) -ForegroundColor Cyan
    
    if ($Follow) {
        # Follow the log file (like tail -f)
        Get-Content $FilePath -Tail $TailLines -Wait | ForEach-Object {
            $line = $_
            if ($line -match '\[ERR\]|\[Error\]') {
                Write-Host $line -ForegroundColor Red
            } elseif ($line -match '\[WRN\]|\[Warning\]') {
                Write-Host $line -ForegroundColor Yellow
            } elseif ($line -match '\[INF\]|\[Information\]') {
                Write-Host $line -ForegroundColor Green
            } elseif ($line -match '\[DBG\]|\[Debug\]') {
                Write-Host $line -ForegroundColor Gray
            } else {
                Write-Host $line
            }
        }
    } else {
        # Show recent lines
        Get-Content $FilePath -Tail $TailLines | ForEach-Object {
            $line = $_
            if ($line -match '\[ERR\]|\[Error\]') {
                Write-Host $line -ForegroundColor Red
            } elseif ($line -match '\[WRN\]|\[Warning\]') {
                Write-Host $line -ForegroundColor Yellow
            } elseif ($line -match '\[INF\]|\[Information\]') {
                Write-Host $line -ForegroundColor Green
            } elseif ($line -match '\[DBG\]|\[Debug\]') {
                Write-Host $line -ForegroundColor Gray
            } else {
                Write-Host $line
            }
        }
    }
}

Write-Host "TriviaSpark Log Viewer" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta

switch ($LogType.ToLower()) {
    "main" {
        $logFile = Get-LatestLogFile "triviaspark-*.log"
        Show-LogFile $logFile "Main Application Log"
    }
    "errors" {
        $logFile = Get-LatestLogFile "triviaspark-errors-*.log"
        Show-LogFile $logFile "Error Log"
    }
    "dev" {
        $logFile = Get-LatestLogFile "triviaspark-dev-*.log"
        Show-LogFile $logFile "Development Log"
    }
    "all" {
        # Show all log types
        $mainLog = Get-LatestLogFile "triviaspark-2*.log"
        $errorLog = Get-LatestLogFile "triviaspark-errors-*.log"
        $devLog = Get-LatestLogFile "triviaspark-dev-*.log"
        
        if ($Follow) {
            Write-Host "Following all logs is not supported. Please specify a single log type." -ForegroundColor Yellow
            Write-Host "Examples:" -ForegroundColor Yellow
            Write-Host "  .\tools\monitor-logs.ps1 -LogType main -Follow" -ForegroundColor Gray
            Write-Host "  .\tools\monitor-logs.ps1 -LogType errors -Follow" -ForegroundColor Gray
            Write-Host "  .\tools\monitor-logs.ps1 -LogType dev -Follow" -ForegroundColor Gray
            exit 1
        }
        
        Show-LogFile $errorLog "Error Log"
        Show-LogFile $devLog "Development Log" 
        Show-LogFile $mainLog "Main Application Log"
    }
    default {
        Write-Host "Invalid log type: $LogType" -ForegroundColor Red
        Write-Host "Valid options: all, main, errors, dev" -ForegroundColor Yellow
        exit 1
    }
}

if (-not $Follow) {
    Write-Host "`nTip: Use -Follow parameter to watch logs in real-time" -ForegroundColor Cyan
    Write-Host "Example: .\tools\monitor-logs.ps1 -LogType main -Follow" -ForegroundColor Gray
}