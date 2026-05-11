using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;
using Serilog;
using Microsoft.AspNetCore.Authentication;
using TriviaSpark.Api.Middleware;
using TriviaSpark.Api;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;
using TriviaSpark.Api.Utils;


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

    builder.Services.AddScoped<ILoggingService, LoggingService>();
    builder.Services.AddScoped<ISessionService, EfCoreSessionService>();

    // ASP.NET Core authentication/authorization
    builder.Services.AddAuthentication("Session")
        .AddScheme<AuthenticationSchemeOptions, SessionAuthenticationHandler>("Session", null);
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
        options.AddPolicy("Owner", policy => policy.RequireRole("Admin", "Owner"));
    });

    // EF Core configuration
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? Environment.GetEnvironmentVariable("DATABASE_URL") 
        ?? "Data Source=C:\\websites\\TriviaSpark\\trivia.db";
    
    // Ensure the database directory exists
    var dbPath = connectionString.Replace("Data Source=", "").Replace("file:", "");
    var dbDirectory = Path.GetDirectoryName(Path.GetFullPath(dbPath));
    if (!string.IsNullOrEmpty(dbDirectory) && !Directory.Exists(dbDirectory))
    {
        Directory.CreateDirectory(dbDirectory);
        Log.Information("Created database directory: {DatabaseDirectory}", dbDirectory);
    }
    
    builder.Services.AddDbContext<TriviaSparkDbContext>(options =>
        options.UseSqlite(connectionString));
        
    Log.Information("Database path: {DatabasePath}", dbPath);
    Log.Information("Database configured with connection string: {ConnectionString}", connectionString);

    // EF Core services
    builder.Services.AddScoped<IEfCoreUserService, EfCoreUserService>();
    builder.Services.AddScoped<IAdminService, EfCoreAdminService>();
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
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.ToString());
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);

            var userAgent = httpContext.Request.Headers.UserAgent.FirstOrDefault();
            if (!string.IsNullOrEmpty(userAgent))
            {
                diagnosticContext.Set("UserAgent", userAgent);
            }

            // Removed authentication context
        };
    });

    // Add detailed request/response logging middleware (for API calls) - goes to file only
    app.UseRequestResponseLogging();

    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }

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

    app.UseCors("ApiCors"); // Apply CORS policy by name

    // Session auth middleware — after static files to avoid unnecessary DB queries on assets
    app.UseMiddleware<SessionAuthMiddleware>();
    app.UseAuthentication();
    app.UseAuthorization();

    // Map SignalR hub (disabled - pending EF Core integration)
    // app.MapHub<TriviaHub>("/ws");
    app.MapControllers(); // Map controller routes

    // EF Core API endpoints (main implementation) - MIGRATION COMPLETE!
    // This includes the health endpoint with database connectivity checks
    app.MapEfCoreApiEndpoints();

    // Legacy Dapper endpoints (deprecated) - keeping for rollback capability
    // app.MapApiEndpoints();

    // Quiet browsers/extensions requesting /favicon.ico
    app.MapGet("/favicon.ico", () => Results.NoContent());

    // SPA fallback to index.html for client routes
    app.MapFallbackToFile("index.html");

    Log.Information("TriviaSpark API startup completed successfully");

    // Startup initialization: roles, default admin, session cleanup
    using (var scope = app.Services.CreateScope())
    {
        var adminService = scope.ServiceProvider.GetRequiredService<IAdminService>();
        var db = scope.ServiceProvider.GetRequiredService<TriviaSparkDbContext>();
        var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        // Ensure default roles exist (Admin, Owner, Participant)
        await adminService.EnsureDefaultRolesExistAsync();

        // Ensure an admin user with a valid BCrypt password exists
        var adminRole = await adminService.GetRoleByNameAsync("Admin");
        if (adminRole != null)
        {
            var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (adminUser == null)
            {
                // No "admin" user exists — create one
                await adminService.CreateUserAsync(new CreateUserRequest(
                    "admin", "admin@triviaspark.local", AuthConstants.DefaultAdminPassword,
                    "System Administrator", adminRole.Id));
                startupLogger.LogInformation("Default admin user created (username: admin)");
            }
            else if (string.IsNullOrEmpty(adminUser.Password) || !adminUser.Password.StartsWith("$2"))
            {
                // Existing admin user has a non-BCrypt password — rehash it
                adminUser.Password = BCrypt.Net.BCrypt.HashPassword(AuthConstants.DefaultAdminPassword);
                adminUser.RoleId = adminRole.Id;
                await db.SaveChangesAsync();
                startupLogger.LogInformation("Admin user password reset to default (was not BCrypt-hashed)");
            }
        }

        // Clean up expired sessions
        var expiredSessions = await db.UserSessions
            .Where(s => s.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        if (expiredSessions.Count > 0)
        {
            db.UserSessions.RemoveRange(expiredSessions);
            await db.SaveChangesAsync();
            startupLogger.LogInformation("Cleaned up {Count} expired sessions on startup", expiredSessions.Count);
        }
    }

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
