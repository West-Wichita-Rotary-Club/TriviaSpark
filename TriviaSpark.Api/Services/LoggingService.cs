using Serilog;
using System.Diagnostics;

namespace TriviaSpark.Api.Services
{
    /// <summary>
    /// Interface for structured application logging with support for API calls, errors,
    /// business events, performance metrics, and database operations.
    /// </summary>
    public interface ILoggingService
    {
        /// <summary>Logs an incoming API request with endpoint, method, and optional request data.</summary>
        void LogApiCall(string endpoint, string method, object? requestData = null, string? userId = null);
        /// <summary>Logs an API response including status code and elapsed time.</summary>
        void LogApiResponse(string endpoint, string method, int statusCode, long elapsedMs, object? responseData = null, string? userId = null);
        /// <summary>Logs an exception with contextual information.</summary>
        void LogError(Exception exception, string context, object? additionalData = null);
        /// <summary>Logs a domain-level business event for auditing and analytics.</summary>
        void LogBusinessEvent(string eventName, object? eventData = null, string? userId = null);
        /// <summary>Logs operation performance metrics with adaptive log levels based on duration.</summary>
        void LogPerformance(string operationName, long elapsedMs, object? additionalData = null);
        /// <summary>Logs a database operation at debug level for diagnostic purposes.</summary>
        void LogDatabaseOperation(string operation, string table, object? additionalData = null);
        /// <summary>Creates a logging scope for correlating related log entries within an operation.</summary>
        IDisposable BeginScope(string operationName);
    }

    /// <summary>
    /// Structured logging service implementation using Microsoft.Extensions.Logging.
    /// Provides centralized, consistent logging across API calls, business events, and performance tracking.
    /// </summary>
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

    /// <summary>
    /// Extension methods for convenient performance-tracked async and sync operations.
    /// </summary>
    public static class LoggingExtensions
    {
        /// <summary>
        /// Executes an async operation while measuring and logging its performance.
        /// </summary>
        /// <typeparam name="T">The return type of the operation.</typeparam>
        /// <param name="loggingService">The logging service instance.</param>
        /// <param name="operationName">Name of the operation for logging.</param>
        /// <param name="operation">The async operation to execute.</param>
        /// <param name="additionalData">Optional additional data to include in the log.</param>
        /// <returns>The result of the operation.</returns>
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

        /// <summary>
        /// Executes a synchronous operation while measuring and logging its performance.
        /// </summary>
        /// <typeparam name="T">The return type of the operation.</typeparam>
        /// <param name="loggingService">The logging service instance.</param>
        /// <param name="operationName">Name of the operation for logging.</param>
        /// <param name="operation">The synchronous operation to execute.</param>
        /// <param name="additionalData">Optional additional data to include in the log.</param>
        /// <returns>The result of the operation.</returns>
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