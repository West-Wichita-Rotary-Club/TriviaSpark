# TriviaSpark API Logging Implementation

## Overview

This document describes the comprehensive logging implementation for TriviaSpark API using Serilog. The logging system provides structured logging with multiple output destinations and enhanced debugging capabilities, with **minimal console output** to reduce noise during development.

## Features

### 1. **Serilog Integration**
- **Console Logging**: **Errors and warnings only** (no noise in console)
- **File Logging**: Complete structured logs saved to `C:\websites\triviaspark\logs\`
- **Error-specific Logging**: Separate error log files for critical issues
- **Rolling File Policy**: Daily rotation with retention limits

### 2. **Console Output Strategy**

The console output is now **minimal and focused** to reduce noise:

#### Production Console Output
- **Error level and above only** (no Info/Debug messages)
- Clean, simple format for critical issues
- Exceptions and fatal errors prominently displayed

#### Development Console Output  
- **Warning level and above only** (includes warnings and errors)
- Slightly more verbose than production but still clean
- Database errors and performance warnings visible

#### What You'll See in Console
- Application startup/shutdown messages
- Exceptions and critical errors
- Slow requests (>5 seconds)
- HTTP errors (4xx/5xx status codes)
- **No routine API calls, business events, or debug messages**

### 3. **File Logging (Complete Details)**

All detailed logging goes to files with full structured data:

#### Production Logs
- **Main Log**: `C:\websites\triviaspark\logs\triviaspark-.log`
  - Daily rotation, 30-day retention, 10MB file limit
  - Information level and above
  - All API calls, business events, performance data

- **Error Log**: `C:\websites\triviaspark\logs\triviaspark-errors-.log`  
  - Daily rotation, 60-day retention, 10MB file limit
  - Error level only
  - Detailed error context and stack traces

#### Development Logs
- **Dev Log**: `C:\websites\triviaspark\logs\triviaspark-dev-.log`
  - Daily rotation, 7-day retention, 5MB file limit  
  - Debug level and above
  - Most verbose logging for development debugging

### 4. **Log Monitoring Tools**

Use the included PowerShell script to monitor logs in real-time:

```powershell
# View recent errors
.\tools\monitor-logs.ps1 -LogType errors

# Follow main log in real-time
.\tools\monitor-logs.ps1 -LogType main -Follow

# View development logs
.\tools\monitor-logs.ps1 -LogType dev

# View all recent logs
.\tools\monitor-logs.ps1 -LogType all
```

### 5. **Logging Services**

#### ILoggingService Interface
Provides structured logging methods for different scenarios:

```csharp
public interface ILoggingService
{
    void LogApiCall(string endpoint, string method, object? requestData = null, string? userId = null);
    void LogApiResponse(string endpoint, string method, int statusCode, long elapsedMs, object? responseData = null, string? userId = null);
    void LogError(Exception exception, string context, object? additionalData = null);
    void LogBusinessEvent(string eventName, object? eventData = null, string? userId = null);
    void LogPerformance(string operationName, long elapsedMs, object? additionalData = null);
    void LogDatabaseOperation(string operation, string table, object? additionalData = null);
    IDisposable BeginScope(string operationName);
}
```

### 6. **Middleware Components**

#### RequestResponseLoggingMiddleware
- Logs detailed HTTP request/response information **to files only**
- Includes request/response bodies for API calls
- Adds unique request IDs
- Excludes static assets and health checks

#### ExceptionHandlingMiddleware
- Catches unhandled exceptions
- Provides structured error responses
- Maps exception types to appropriate HTTP status codes
- Logs detailed error information **to both console and files**

### 7. **Console vs File Logging Strategy**

| Information Type | Console | File | Rationale |
|-----------------|---------|------|-----------|
| Startup/Shutdown | ? | ? | Important for operations |
| Exceptions | ? | ? | Need immediate visibility |
| HTTP Errors (4xx/5xx) | ? | ? | Important for debugging |
| Slow Requests (>5s) | ? | ? | Performance issues |
| API Calls | ? | ? | Too noisy for console |
| Business Events | ? | ? | Analytics data |
| Performance Metrics | ? | ? | Detailed analysis |
| Database Operations | ? | ? | Debug information |
| Request/Response Bodies | ? | ? | Detailed debugging |

### 8. **Log Structure**

#### Console Format (Minimal)
```
[10:30:45 ERR] Unhandled exception in GetEventById
System.ArgumentNullException: Event ID cannot be null
```

#### File Format (Detailed) 
```
[2024-01-15 10:30:45.123 -06:00 INF] TriviaSpark.Api.Controllers.EventsV2Controller MACHINE-01 123: API Call: GET api/v2/events/event123/teams | User: user123 | Request: {"eventId":"event123"}
```

#### Enrichment Properties
- **Timestamp**: Full timestamp with timezone
- **Level**: Log level (DEBUG, INFO, WARN, ERROR, FATAL)
- **SourceContext**: Logging class name
- **MachineName**: Server machine name
- **ThreadId**: Thread identifier
- **RequestId**: Unique identifier per request

### 9. **Usage Examples**

#### Basic Logging in Controllers
```csharp
public class EventsController : ControllerBase
{
    private readonly ILoggingService _loggingService;

    public EventsController(ILoggingService loggingService)
    {
        _loggingService = loggingService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetEvent(string id)
    {
        using (_loggingService.BeginScope("GetEvent"))
        {
            _loggingService.LogApiCall($"api/events/{id}", "GET", new { id });

            try
            {
                var result = await _loggingService.LogPerformanceAsync("GetEvent", 
                    async () => await _eventService.GetEventAsync(id));

                _loggingService.LogBusinessEvent("EventRetrieved", new { EventId = id });
                return Ok(result);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex, "GetEvent", new { id });
                throw; // Will be caught by exception middleware and shown in console
            }
        }
    }
}
```

### 10. **Configuration**

#### appsettings.json (Production)
```json
{
  "Serilog": {
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "restrictedToMinimumLevel": "Error"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "C:\\websites\\triviaspark\\logs\\triviaspark-.log"
        }
      }
    ]
  }
}
```

#### appsettings.Development.json
```json
{
  "Serilog": {
    "WriteTo": [
      {
        "Name": "Console", 
        "Args": {
          "restrictedToMinimumLevel": "Warning"
        }
      }
    ]
  }
}
```

### 11. **Benefits**

#### For Development
- **Clean Console**: No noise, only important messages
- **Rich File Logging**: Complete debugging information available
- **Real-time Monitoring**: PowerShell tools for log monitoring
- **Performance Tracking**: Automatic timing of operations

#### For Production
- **Silent Running**: Minimal console output for clean deployments
- **Complete Audit Trail**: Full record in log files
- **Error Visibility**: Critical issues immediately visible
- **Compliance**: Detailed logging for auditing requirements

#### For Operations
- **Quick Troubleshooting**: Console shows only problems
- **Detailed Analysis**: Files contain complete context
- **Performance Monitoring**: Track slow operations and bottlenecks
- **Business Intelligence**: Structured event data for analytics

### 12. **Log Monitoring**

#### PowerShell Commands
```powershell
# Monitor errors in real-time
.\tools\monitor-logs.ps1 -LogType errors -Follow

# Check recent main log entries
.\tools\monitor-logs.ps1 -LogType main -TailLines 100

# View development logs
.\tools\monitor-logs.ps1 -LogType dev
```

#### Log Analysis
```bash
# Find all errors for a specific event (Windows)
findstr "EventId.*event123" C:\websites\triviaspark\logs\triviaspark-errors-*.log

# Performance analysis - slow operations (>5000ms)
findstr "Duration.*[5-9][0-9][0-9][0-9]ms" C:\websites\triviaspark\logs\triviaspark-*.log

# API usage patterns
findstr "API Call" C:\websites\triviaspark\logs\triviaspark-*.log | findstr "GET"
```

### 13. **What Changed from Default**

#### Before (Noisy Console)
- All API calls logged to console
- Business events in console  
- Performance metrics in console
- Database operations in console
- Request/response details in console

#### After (Quiet Console)
- **Console**: Only errors, warnings, and critical issues
- **Files**: Complete detailed logging for analysis
- **Monitoring**: Tools available for real-time log viewing
- **Performance**: Reduced console I/O improves performance

This implementation provides the best of both worlds: a clean, quiet development experience with comprehensive logging available when you need it for debugging, analysis, or monitoring.