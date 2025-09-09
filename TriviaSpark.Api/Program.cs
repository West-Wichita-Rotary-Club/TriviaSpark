using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using Serilog;
using TriviaSpark.Api.Middleware;
// using TriviaSpark.Api.SignalR; // Disabled - SignalR integration pending
using TriviaSpark.Api;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;

// Configure minimal bootstrap logger - only errors and critical messages
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Error)
    .CreateBootstrapLogger();

Log.Information("Starting up TriviaSpark API");

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Configure Serilog
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .Enrich.WithEnvironmentName());

    // Ensure the log directory exists
    var logPath = "C:\\websites\\triviaspark\\logs";
    if (!Directory.Exists(logPath))
    {
        Directory.CreateDirectory(logPath);
        Log.Information("Created log directory: {LogPath}", logPath);
    }

    // Ensure SQLite native provider is initialized
    SQLitePCL.Batteries_V2.Init();

    builder.Services.Configure<JsonOptions>(opts =>
    {
        opts.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // use camelCase for frontend compatibility
        opts.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ApiCors", policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                // Dev: allow any localhost origin, including https Kestrel (14165)
                policy
                    .SetIsOriginAllowed(_ => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                policy.WithOrigins(
                          "https://localhost:14165",
                          "http://localhost:14166",
                          "http://localhost:5173",
                          "https://localhost:5173",
                          "http://127.0.0.1:5173",
                          "https://127.0.0.1:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
        });
    });

    builder.Services.AddSignalR();

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
    builder.Services.AddRouting();
    builder.Services.AddControllers().AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // use camelCase for frontend compatibility
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    }); // Add MVC controllers support
    builder.Services.AddSpaStaticFiles(configuration =>
    {
        configuration.RootPath = "wwwroot";
    });

    // App services
    builder.Services.AddSingleton<ISessionService, SessionService>();
    builder.Services.AddScoped<ILoggingService, LoggingService>();
    // Legacy Dapper services (deprecated for rollback only)
    // builder.Services.AddSingleton<IDb, SqliteDb>();
    // builder.Services.AddSingleton<IStorage, Storage>();

    // EF Core configuration
    builder.Services.AddDbContext<TriviaSparkDbContext>(options =>
        options.UseSqlite("Data Source=C:\\websites\\TriviaSpark\\trivia.db"));

    // EF Core services
    builder.Services.AddScoped<IEfCoreUserService, EfCoreUserService>();
    builder.Services.AddScoped<IEfCoreEventService, EfCoreEventService>();
    builder.Services.AddScoped<IEfCoreQuestionService, EfCoreQuestionService>();
    builder.Services.AddScoped<IEfCoreTeamService, EfCoreTeamService>();
    builder.Services.AddScoped<IEfCoreParticipantService, EfCoreParticipantService>();
    builder.Services.AddScoped<IEfCoreResponseService, EfCoreResponseService>();
    builder.Services.AddScoped<IEfCoreFunFactService, EfCoreFunFactService>();
    builder.Services.AddScoped<IEfCoreStorageService, EfCoreStorageService>();
    builder.Services.AddScoped<IEventImageService, EventImageService>();

    // External API services
    builder.Services.AddUnsplashService(builder.Configuration);

    // OpenAI service
    builder.Services.AddHttpClient<IOpenAIService, OpenAIService>();
    builder.Services.AddScoped<IOpenAIService, OpenAIService>();

    Log.Information("Building application with environment: {Environment}", builder.Environment.EnvironmentName);

    var app = builder.Build();

    // Add exception handling middleware (should be first)
    app.UseExceptionHandling();

    // Configure minimal Serilog request logging for console
    app.UseSerilogRequestLogging(options =>
    {
        // Only log requests that result in errors or take too long
        options.GetLevel = (httpContext, elapsed, ex) => 
        {
            if (ex != null) 
                return Serilog.Events.LogEventLevel.Error;
            
            if (httpContext.Response.StatusCode >= 500) 
                return Serilog.Events.LogEventLevel.Error;
            
            if (httpContext.Response.StatusCode >= 400) 
                return Serilog.Events.LogEventLevel.Warning;
            
            // For successful requests, only log if they're slow
            if (elapsed > 5000) // 5+ seconds
                return Serilog.Events.LogEventLevel.Warning;
                
            // All other successful requests logged at Information level (will go to file only)
            return Serilog.Events.LogEventLevel.Information;
        };
        
        // Minimal message template for console
        options.MessageTemplate = "{RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0}ms";
        
        // Attach additional properties for file logging
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.FirstOrDefault());
            if (httpContext.User.Identity?.IsAuthenticated == true)
            {
                diagnosticContext.Set("UserName", httpContext.User.Identity.Name);
            }
        };
    });

    // Add detailed request/response logging middleware (for API calls) - goes to file only
    app.UseRequestResponseLogging();

    app.UseDefaultFiles();
    app.UseStaticFiles();
    app.UseSpaStaticFiles();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
        // Only log this to file, not console
        Log.Information("Swagger UI enabled for development environment");
    }

    // Cookie parsing (for simplicity)
    app.Use(async (ctx, next) =>
    {
        ctx.Request.Headers.TryGetValue("Cookie", out var _);
        await next();
    });

    app.UseCors();

    // Map SignalR hub (disabled - pending EF Core integration)
    // app.MapHub<TriviaHub>("/ws");
    app.MapControllers(); // Map controller routes

    // EF Core API endpoints (main implementation) - MIGRATION COMPLETE!
    app.MapEfCoreApiEndpoints();

    // Legacy Dapper endpoints (deprecated) - keeping for rollback capability
    // app.MapApiEndpoints();

    // Quiet browsers/extensions requesting /favicon.ico
    app.MapGet("/favicon.ico", () => Results.NoContent());

    // Add health check endpoint with logging
    app.MapGet("/health", (ILoggingService loggingService) =>
    {
        loggingService.LogBusinessEvent("HealthCheck", new { Status = "Healthy", Timestamp = DateTime.UtcNow });
        return Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    });

    // SPA fallback to index.html for client routes
    app.MapFallbackToFile("index.html");

    Log.Information("TriviaSpark API startup completed successfully");
    
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
