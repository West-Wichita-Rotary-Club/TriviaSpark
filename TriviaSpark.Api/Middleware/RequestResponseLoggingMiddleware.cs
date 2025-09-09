using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace TriviaSpark.Api.Middleware
{
    public class RequestResponseLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestResponseLoggingMiddleware> _logger;
        private readonly HashSet<string> _excludedPaths = new()
        {
            "/favicon.ico",
            "/health",
            "/swagger"
        };

        public RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value ?? "";
            
            // Skip logging for excluded paths
            if (_excludedPaths.Any(excluded => path.StartsWith(excluded, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();
            var requestId = Guid.NewGuid().ToString("N")[..8];
            
            // Add request ID to response headers
            context.Response.Headers.Add("X-Request-ID", requestId);

            // Log request
            await LogRequestAsync(context, requestId);

            // Capture response
            var originalBodyStream = context.Response.Body;
            using var responseBodyStream = new MemoryStream();
            context.Response.Body = responseBodyStream;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception during request {RequestId} to {Method} {Path}",
                    requestId, context.Request.Method, context.Request.Path);
                throw;
            }
            finally
            {
                stopwatch.Stop();
                
                // Log response
                await LogResponseAsync(context, requestId, stopwatch.ElapsedMilliseconds, responseBodyStream);
                
                // Copy response back to original stream
                responseBodyStream.Position = 0;
                await responseBodyStream.CopyToAsync(originalBodyStream);
                context.Response.Body = originalBodyStream;
            }
        }

        private async Task LogRequestAsync(HttpContext context, string requestId)
        {
            var request = context.Request;
            var requestBody = string.Empty;

            // Only log request body for API calls and if content length is reasonable
            if (request.Path.StartsWithSegments("/api") && 
                request.ContentLength.HasValue && 
                request.ContentLength.Value > 0 && 
                request.ContentLength.Value < 10000)
            {
                request.EnableBuffering();
                var buffer = new byte[request.ContentLength.Value];
                await request.Body.ReadAsync(buffer, 0, buffer.Length);
                requestBody = Encoding.UTF8.GetString(buffer);
                request.Body.Position = 0;
            }

            _logger.LogInformation(
                "HTTP Request {RequestId} | {Method} {Path} | Query: {Query} | Content-Type: {ContentType} | User-Agent: {UserAgent} | Body: {RequestBody}",
                requestId,
                request.Method,
                request.Path,
                request.QueryString.ToString(),
                request.ContentType ?? "none",
                request.Headers.UserAgent.FirstOrDefault() ?? "unknown",
                string.IsNullOrEmpty(requestBody) ? "none" : requestBody);
        }

        private async Task LogResponseAsync(HttpContext context, string requestId, long elapsedMs, MemoryStream responseBodyStream)
        {
            var response = context.Response;
            var responseBody = string.Empty;

            // Only log response body for API calls and if not too large
            if (context.Request.Path.StartsWithSegments("/api") && 
                responseBodyStream.Length > 0 && 
                responseBodyStream.Length < 10000)
            {
                responseBodyStream.Position = 0;
                responseBody = await new StreamReader(responseBodyStream).ReadToEndAsync();
                responseBodyStream.Position = 0;
            }

            var logLevel = response.StatusCode >= 500 ? LogLevel.Error :
                          response.StatusCode >= 400 ? LogLevel.Warning :
                          LogLevel.Information;

            _logger.Log(logLevel,
                "HTTP Response {RequestId} | {Method} {Path} | Status: {StatusCode} | Duration: {ElapsedMs}ms | Content-Type: {ContentType} | Body: {ResponseBody}",
                requestId,
                context.Request.Method,
                context.Request.Path,
                response.StatusCode,
                elapsedMs,
                response.ContentType ?? "none",
                string.IsNullOrEmpty(responseBody) ? "none" : responseBody);
        }
    }

    public static class RequestResponseLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestResponseLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestResponseLoggingMiddleware>();
        }
    }
}