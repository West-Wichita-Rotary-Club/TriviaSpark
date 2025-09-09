using System.Net;
using System.Text.Json;

namespace TriviaSpark.Api.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _environment;

        public ExceptionHandlingMiddleware(
            RequestDelegate next, 
            ILogger<ExceptionHandlingMiddleware> logger,
            IWebHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var requestId = context.Response.Headers["X-Request-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString("N")[..8];
            
            _logger.LogError(exception,
                "Unhandled exception in request {RequestId} | {Method} {Path} | User: {User} | Exception: {ExceptionType}",
                requestId,
                context.Request.Method,
                context.Request.Path,
                context.User?.Identity?.Name ?? "Anonymous",
                exception.GetType().Name);

            var response = context.Response;
            response.ContentType = "application/json";

            var responseModel = new ErrorResponse
            {
                RequestId = requestId,
                Timestamp = DateTime.UtcNow,
                Path = context.Request.Path,
                Method = context.Request.Method
            };

            switch (exception)
            {
                case ArgumentException argEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    responseModel.Error = "Invalid argument";
                    responseModel.Message = argEx.Message;
                    break;

                case UnauthorizedAccessException:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    responseModel.Error = "Unauthorized";
                    responseModel.Message = "Access denied";
                    break;

                case KeyNotFoundException:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    responseModel.Error = "Not found";
                    responseModel.Message = "The requested resource was not found";
                    break;

                case InvalidOperationException invOpEx:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    responseModel.Error = "Invalid operation";
                    responseModel.Message = invOpEx.Message;
                    break;

                case TimeoutException:
                    response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                    responseModel.Error = "Request timeout";
                    responseModel.Message = "The request timed out";
                    break;

                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    responseModel.Error = "Internal server error";
                    responseModel.Message = _environment.IsDevelopment() 
                        ? exception.Message 
                        : "An unexpected error occurred";
                    break;
            }

            // Add stack trace in development
            if (_environment.IsDevelopment())
            {
                responseModel.Details = exception.ToString();
            }

            var jsonResponse = JsonSerializer.Serialize(responseModel, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await response.WriteAsync(jsonResponse);
        }
    }

    public class ErrorResponse
    {
        public string RequestId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Path { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
    }

    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}