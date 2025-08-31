using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;
using TriviaSpark.Api.Data;
// using TriviaSpark.Api.SignalR; // Disabled - SignalR integration pending
using TriviaSpark.Api;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Ensure SQLite native provider is initialized
SQLitePCL.Batteries_V2.Init();

builder.Services.Configure<JsonOptions>(opts =>
{
    opts.SerializerOptions.PropertyNamingPolicy = null; // keep exact casing
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
    opts.JsonSerializerOptions.PropertyNamingPolicy = null; // keep exact casing
    opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
}); // Add MVC controllers support
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot";
});

// App services
builder.Services.AddSingleton<ISessionService, SessionService>();
// Legacy Dapper services (deprecated for rollback only)
// builder.Services.AddSingleton<IDb, SqliteDb>();
// builder.Services.AddSingleton<IStorage, Storage>();

// EF Core configuration
builder.Services.AddDbContext<TriviaSparkDbContext>(options =>
    options.UseSqlite("Data Source=../data/trivia.db"));

// EF Core services
builder.Services.AddScoped<IEfCoreUserService, EfCoreUserService>();
builder.Services.AddScoped<IEfCoreEventService, EfCoreEventService>();
builder.Services.AddScoped<IEfCoreQuestionService, EfCoreQuestionService>();
builder.Services.AddScoped<IEfCoreTeamService, EfCoreTeamService>();
builder.Services.AddScoped<IEfCoreParticipantService, EfCoreParticipantService>();
builder.Services.AddScoped<IEfCoreResponseService, EfCoreResponseService>();
builder.Services.AddScoped<IEfCoreFunFactService, EfCoreFunFactService>();
builder.Services.AddScoped<IEfCoreStorageService, EfCoreStorageService>();

var app = builder.Build();


app.UseDefaultFiles();
app.UseStaticFiles();
app.UseSpaStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
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

// SPA fallback to index.html for client routes
app.MapFallbackToFile("index.html");

app.Run();
