using Serilog;
using System.Diagnostics;

namespace TriviaSpark.Api.Services
{
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

    public class LoggingService : ILoggingService
    {
        private readonly ILogger<LoggingService> _logger;

        public LoggingService(ILogger<LoggingService> logger)
        {
            _logger = logger;
        }

        public void LogApiCall(string endpoint, string method, object? requestData = null, string? userId = null)
        {
            _logger.LogInformation("API Call: {Method} {Endpoint} | User: {UserId} | Request: {@RequestData}",
                method, endpoint, userId ?? "Anonymous", requestData);
        }

        public void LogApiResponse(string endpoint, string method, int statusCode, long elapsedMs, object? responseData = null, string? userId = null)
        {
            var logLevel = statusCode >= 400 ? LogLevel.Warning : LogLevel.Information;
            
            _logger.Log(logLevel, "API Response: {Method} {Endpoint} | Status: {StatusCode} | Duration: {ElapsedMs}ms | User: {UserId} | Response: {@ResponseData}",
                method, endpoint, statusCode, elapsedMs, userId ?? "Anonymous", responseData);
        }

        public void LogError(Exception exception, string context, object? additionalData = null)
        {
            _logger.LogError(exception, "Error in {Context} | Additional Data: {@AdditionalData}",
                context, additionalData);
        }

        public void LogBusinessEvent(string eventName, object? eventData = null, string? userId = null)
        {
            _logger.LogInformation("Business Event: {EventName} | User: {UserId} | Data: {@EventData}",
                eventName, userId ?? "System", eventData);
        }

        public void LogPerformance(string operationName, long elapsedMs, object? additionalData = null)
        {
            var logLevel = elapsedMs > 5000 ? LogLevel.Warning : 
                          elapsedMs > 1000 ? LogLevel.Information : LogLevel.Debug;

            _logger.Log(logLevel, "Performance: {OperationName} completed in {ElapsedMs}ms | Data: {@AdditionalData}",
                operationName, elapsedMs, additionalData);
        }

        public void LogDatabaseOperation(string operation, string table, object? additionalData = null)
        {
            _logger.LogDebug("Database Operation: {Operation} on {Table} | Data: {@AdditionalData}",
                operation, table, additionalData);
        }

        public IDisposable BeginScope(string operationName)
        {
            var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["Operation"] = operationName,
                ["OperationId"] = Guid.NewGuid(),
                ["StartTime"] = DateTime.UtcNow
            });
            
            return scope ?? new NullDisposable();
        }
    }

    // Simple null object pattern for IDisposable
    internal class NullDisposable : IDisposable
    {
        public void Dispose() { }
    }

    // Extension for convenient performance logging
    public static class LoggingExtensions
    {
        public static async Task<T> LogPerformanceAsync<T>(this ILoggingService loggingService, string operationName, Func<Task<T>> operation, object? additionalData = null)
        {
            var stopwatch = Stopwatch.StartNew();
            using (loggingService.BeginScope(operationName))
            {
                try
                {
                    var result = await operation();
                    stopwatch.Stop();
                    loggingService.LogPerformance(operationName, stopwatch.ElapsedMilliseconds, additionalData);
                    return result;
                }
                catch (Exception ex)
                {
                    stopwatch.Stop();
                    loggingService.LogError(ex, operationName, additionalData);
                    throw;
                }
            }
        }

        public static T LogPerformance<T>(this ILoggingService loggingService, string operationName, Func<T> operation, object? additionalData = null)
        {
            var stopwatch = Stopwatch.StartNew();
            using (loggingService.BeginScope(operationName))
            {
                try
                {
                    var result = operation();
                    stopwatch.Stop();
                    loggingService.LogPerformance(operationName, stopwatch.ElapsedMilliseconds, additionalData);
                    return result;
                }
                catch (Exception ex)
                {
                    stopwatch.Stop();
                    loggingService.LogError(ex, operationName, additionalData);
                    throw;
                }
            }
        }
    }
}