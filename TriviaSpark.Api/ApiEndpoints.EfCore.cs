using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.SignalR; // Disabled - SignalR integration pending
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;
// using TriviaSpark.Api.SignalR; // Disabled - SignalR integration pending
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Utils;

namespace TriviaSpark.Api;

public static class EfCoreApiEndpoints
{
    public static void MapEfCoreApiEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api").RequireCors("ApiCors").AddEndpointFilter(new CorsFilter());

        // Health check - migrated to EF Core
        api.MapGet("/health", (TriviaSparkDbContext db, ILogger<Program> logger) =>
        {
            try
            {
                // Test database connectivity
                var canConnect = db.Database.CanConnect();
                var userCount = db.Users.Count();
                var eventCount = db.Events.Count();
                
                return Results.Ok(new { 
                    status = "healthy", 
                    database = new { 
                        connected = canConnect,
                        userCount,
                        eventCount 
                    },
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    version = "EfCore"
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Health check failed");
                return Results.Json(new { 
                    status = "unhealthy", 
                    error = ex.Message,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    version = "EfCore"
                }, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        });

        // Authentication endpoints - migrated to EF Core
        api.MapPost("/auth/login", async ([FromBody] LoginRequest body, ISessionService sessions, IEfCoreUserService userService, HttpResponse res, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Username) || string.IsNullOrWhiteSpace(body.Password))
                return Results.BadRequest(new { error = "Username and password are required" });

            try
            {
                var user = await userService.GetUserByUsernameAsync(body.Username);
                if (user == null)
                {
                    logger.LogWarning("Login attempt failed - user not found: {Username}", body.Username);
                    return Results.Unauthorized();
                }

                // Simple password verification (in production, use proper hashing)
                if (user.Password != body.Password)
                {
                    logger.LogWarning("Login attempt failed - invalid password: {Username}", body.Username);
                    return Results.Unauthorized();
                }

                var sessionId = sessions.Create(user.Id);
                res.Cookies.Append("sessionId", sessionId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // Set to true in production with HTTPS
                    SameSite = SameSiteMode.Strict,
                    MaxAge = TimeSpan.FromHours(24)
                });

                logger.LogInformation("User successfully logged in: {Username}", body.Username);
                return Results.Ok(new
                {
                    user = new { id = user.Id, username = user.Username, fullName = user.FullName, email = user.Email },
                    sessionId,
                    message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Login failed for user: {Username}", body.Username);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/auth/logout", (ISessionService sessions, HttpRequest req, HttpResponse res) =>
        {
            if (req.Cookies.TryGetValue("sessionId", out var sessionId))
            {
                sessions.Delete(sessionId);
            }
            res.Cookies.Delete("sessionId");
            return Results.Ok(new { message = "Logged out successfully" });
        });

        api.MapPost("/register", async ([FromBody] RegisterRequest body, IEfCoreUserService userService, ISessionService sessions, HttpResponse res, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Email) || string.IsNullOrWhiteSpace(body.Password) || string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { error = "Email, password, and name are required" });

            try
            {
                // Check if user already exists
                var existingUserByEmail = await userService.GetUserByEmailAsync(body.Email);
                if (existingUserByEmail != null)
                {
                    logger.LogWarning("Registration failed - email already exists: {Email}", body.Email);
                    return Results.BadRequest(new { error = "A user with this email already exists" });
                }

                // Generate username from email
                var username = body.Email.Split('@')[0].ToLowerInvariant();
                var existingUserByUsername = await userService.GetUserByUsernameAsync(username);
                if (existingUserByUsername != null)
                {
                    // Make username unique by appending a number
                    var counter = 1;
                    var originalUsername = username;
                    do
                    {
                        username = $"{originalUsername}{counter}";
                        existingUserByUsername = await userService.GetUserByUsernameAsync(username);
                        counter++;
                    } while (existingUserByUsername != null && counter < 100);
                    
                    if (existingUserByUsername != null)
                        return Results.BadRequest(new { error = "Unable to generate unique username" });
                }

                var newUser = new Services.User
                {
                    Id = Guid.NewGuid().ToString(),
                    Username = username,
                    Email = body.Email,
                    FullName = body.Name,
                    Password = body.Password, // In production, hash this password
                    CreatedAt = DateTime.UtcNow
                };

                var created = await userService.CreateUserAsync(newUser);
                
                // Auto-login the new user
                var sessionId = sessions.Create(created.Id);
                res.Cookies.Append("sessionId", sessionId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // Set to true in production with HTTPS
                    SameSite = SameSiteMode.Strict,
                    MaxAge = TimeSpan.FromHours(24)
                });

                logger.LogInformation("User successfully registered and logged in: {Username} ({Email})", created.Username, created.Email);
                return Results.Created($"/api/users/{created.Id}", new
                {
                    user = new { id = created.Id, username = created.Username, fullName = created.FullName, email = created.Email },
                    sessionId,
                    message = "User registered successfully"
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "User registration failed for email: {Email}", body.Email);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/logout", (ISessionService sessions, HttpRequest req, HttpResponse res) =>
        {
            if (req.Cookies.TryGetValue("sessionId", out var sessionId))
            {
                sessions.Delete(sessionId);
            }
            res.Cookies.Delete("sessionId");
            return Results.Ok(new { message = "Logged out successfully" });
        });

        api.MapGet("/auth/me", async (ISessionService sessions, IEfCoreUserService userService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var user = await userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    logger.LogWarning("Auth/me request failed - user not found: {UserId}", userId);
                    return Results.Unauthorized();
                }

                return Results.Ok(new { 
                    user = new { id = user.Id, username = user.Username, fullName = user.FullName, email = user.Email }
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve user profile for userId: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/auth/profile", async ([FromBody] ProfileUpdate body, ISessionService sessions, IEfCoreUserService userService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var user = await userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    logger.LogWarning("Profile update failed - user not found: {UserId}", userId);
                    return Results.Unauthorized();
                }

                // Update user profile
                user.FullName = body.FullName ?? user.FullName;
                user.Email = body.Email ?? user.Email;
                user.Username = body.Username ?? user.Username;

                var updated = await userService.UpdateUserAsync(user);
                logger.LogInformation("User profile updated successfully: {UserId} ({Username})", userId, updated.Username);
                return Results.Ok(new { id = updated.Id, username = updated.Username, fullName = updated.FullName, email = updated.Email });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update user profile for userId: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Dashboard endpoints - actual statistics
        api.MapGet("/dashboard/stats", async (ISessionService sessions, IEfCoreEventService eventService, IEfCoreParticipantService participantService, IEfCoreUserService userService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                // Get all events for this user
                var userEvents = await eventService.GetEventsForHostAsync(userId);
                var totalEvents = userEvents.Count;
                var activeEvents = userEvents.Count(e => e.Status == "active" || e.Status == "started");

                // Get total participants across all user's events
                var totalParticipants = 0;
                foreach (var eventItem in userEvents)
                {
                    var eventParticipants = await participantService.GetParticipantsByEventAsync(eventItem.Id);
                    totalParticipants += eventParticipants.Count(p => p.IsActive);
                }

                // Get total user count (system-wide stat for admin view)
                var totalUsers = await userService.GetUserCountAsync();

                var stats = new { 
                    totalEvents, 
                    activeEvents, 
                    totalParticipants,
                    totalUsers
                };
                return Results.Ok(stats);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve dashboard stats for user: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/dashboard/insights", (ISessionService sessions, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                // Placeholder insights - implement later
                var insights = new { popularEventTypes = new string[0], averageParticipants = 0 };
                return Results.Ok(insights);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve dashboard insights for user: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Events endpoints - migrated to EF Core
        // Public anonymous events list for homepage (sanitized)
        api.MapGet("/events/home", async ([FromQuery] int? limit, IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            try
            {
                var events = await eventService.GetPublicUpcomingEventsAsync(Math.Clamp(limit ?? 8, 1, 24));
                // Project only safe, minimal fields needed by homepage
                var projection = events.Select(e => new {
                    id = e.Id,
                    title = e.Title,
                    description = e.Description,
                    eventDate = e.EventDate,
                    eventTime = e.EventTime,
                    location = e.Location,
                    status = e.Status,
                    difficulty = e.Difficulty
                });
                return Results.Ok(projection);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve home events list with limit: {Limit}", limit);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        }).AllowAnonymous();

        api.MapGet("/events", async (ISessionService sessions, IEfCoreEventService eventService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var events = await eventService.GetEventsForHostAsync(userId);
                return Results.Ok(events);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve events for user: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/active", async (ISessionService sessions, IEfCoreEventService eventService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var events = await eventService.GetActiveEventsAsync(userId);
                return Results.Ok(events);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve active events for user: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/upcoming", async ([FromQuery] long? fromEpochMs, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var events = await eventService.GetUpcomingEventsAsync(userId);
                return Results.Ok(events);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve upcoming events for user: {UserId}", userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events", async ([FromBody] CreateEventRequest body, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(body.Title))
                return Results.BadRequest(new { error = "Event title is required" });

            try
            {
                // Check for duplicate event title for this host
                var existingEvents = await eventService.GetEventsForHostAsync(userId);
                var duplicateTitle = existingEvents.FirstOrDefault(e => 
                    e.Title.Trim().Equals(body.Title.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    e.Status != "cancelled"
                );
                if (duplicateTitle != null)
                {
                    logger.LogWarning("Event creation failed - duplicate title: {Title} for user: {UserId}", body.Title, userId);
                    return Results.BadRequest(new { error = "An active event with this title already exists" });
                }

                // Generate unique slug-based ID from title
                var baseSlug = SlugGenerator.GenerateSlug(body.Title);
                var existingSlugs = existingEvents.Select(e => e.Id).ToList();
                var uniqueSlug = SlugGenerator.MakeUniqueSlug(baseSlug, existingSlugs);

                // Double-check slug uniqueness across all users (defensive programming)
                var existingEventWithSlug = await eventService.GetEventByIdAsync(uniqueSlug);
                if (existingEventWithSlug != null)
                {
                    logger.LogWarning("Event creation failed - unable to generate unique slug for title: {Title}", body.Title);
                    return Results.BadRequest(new { error = "Unable to generate unique identifier for this event title" });
                }

                // Check for duplicate QR code if provided
                if (!string.IsNullOrWhiteSpace(body.QrCode))
                {
                    var allEvents = await eventService.GetPublicUpcomingEventsAsync(1000); // Get large set to check QR codes
                    var duplicateQr = allEvents.FirstOrDefault(e => e.QrCode == body.QrCode);
                    if (duplicateQr != null)
                    {
                        logger.LogWarning("Event creation failed - duplicate QR code: {QrCode}", body.QrCode);
                        return Results.BadRequest(new { error = "This QR code is already in use" });
                    }
                }

                var newEvent = new Event
                {
                    Id = uniqueSlug,
                    Title = body.Title,
                    Description = body.Description,
                    HostId = userId,
                    EventType = body.EventType ?? "general",
                    MaxParticipants = body.MaxParticipants,
                    Difficulty = body.Difficulty ?? "medium",
                    Status = body.Status ?? "draft",
                    QrCode = body.QrCode ?? SlugGenerator.GenerateSlug(body.Title, 12), // Use shorter slug for QR codes
                    EventDate = body.EventDate,
                    EventTime = body.EventTime,
                    Location = body.Location,
                    SponsoringOrganization = body.SponsoringOrganization,
                    Settings = body.Settings ?? "{}",
                    // Provide defaults for previously required fields that are now nullable
                    PrimaryColor = "#7C2D12", // wine color
                    SecondaryColor = "#FEF3C7", // champagne color
                    FontFamily = "Inter",
                    CreatedAt = DateTime.UtcNow
                };

                var created = await eventService.CreateEventAsync(newEvent);
                logger.LogInformation("Event created successfully: {EventId} ({Title}) for user: {UserId}", created.Id, created.Title, userId);
                return Results.Created($"/api/v2/events/{created.Id}", created);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                // Database constraint violation (like duplicate ID/key)
                if (ex.InnerException?.Message?.Contains("UNIQUE constraint failed") == true)
                {
                    logger.LogWarning(ex, "Event creation failed - database constraint violation for title: {Title}, user: {UserId}", body.Title, userId);
                    return Results.BadRequest(new { error = "An event with this information already exists" });
                }
                
                logger.LogError(ex, "Database error during event creation for title: {Title}, user: {UserId}", body.Title, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create event with title: {Title} for user: {UserId}", body.Title, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}", async (string id, ISessionService sessions, IEfCoreEventService eventService, ILoggingService loggingService, HttpRequest req) =>
        {
            var operationName = "GetEventById";
            using (loggingService.BeginScope(operationName))
            {
                var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
                if (!isValid || userId == null)
                    return Results.Unauthorized();

                try
                {
                    loggingService.LogApiCall($"api/events/{id}", "GET", new { id, userId });
                    
                    var result = await loggingService.LogPerformanceAsync(operationName, async () =>
                    {
                        loggingService.LogDatabaseOperation("SELECT", "Events", new { id });
                        return await eventService.GetEventByIdAsync(id);
                    });

                    if (result == null)
                    {
                        loggingService.LogBusinessEvent("EventNotFound", new { EventId = id, UserId = userId });
                        return Results.NotFound(new { error = "Event not found" });
                    }

                    if (result.HostId != userId)
                    {
                        loggingService.LogBusinessEvent("EventAccessDenied", new { EventId = id, RequestingUserId = userId, ActualHostId = result.HostId });
                        return Results.StatusCode(StatusCodes.Status403Forbidden);
                    }

                    loggingService.LogBusinessEvent("EventRetrieved", new { EventId = id, EventTitle = result.Title, UserId = userId });
                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    loggingService.LogError(ex, operationName, new { id, userId });
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }
            }
        });

        api.MapPut("/events/{id}", async (string id, [FromBody] System.Text.Json.JsonElement body, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Event update failed - event not found: {EventId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.HostId != userId)
                {
                    logger.LogWarning("Event update failed - access denied: {EventId} requested by user: {UserId}, actual host: {HostId}", id, userId, eventEntity.HostId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                // Update properties from the request body
                if (body.TryGetProperty("title", out var titleProp) && titleProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                    eventEntity.Title = titleProp.GetString() ?? "";
                    
                if (body.TryGetProperty("description", out var descProp) && descProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                    eventEntity.Description = descProp.GetString() ?? "";
                    
                if (body.TryGetProperty("eventType", out var eventTypeProp) && eventTypeProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                    eventEntity.EventType = eventTypeProp.GetString() ?? "";
                    
                if (body.TryGetProperty("maxParticipants", out var maxParticipantsProp) && maxParticipantsProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                    eventEntity.MaxParticipants = maxParticipantsProp.GetInt32();
                    
                if (body.TryGetProperty("difficulty", out var difficultyProp) && difficultyProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                    eventEntity.Difficulty = difficultyProp.GetString() ?? "";
                    
                if (body.TryGetProperty("eventDate", out var eventDateProp))
                    eventEntity.EventDate = eventDateProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : 
                        (DateTime.TryParse(eventDateProp.GetString(), out var parsedEventDate) ? parsedEventDate : null);
                    
                if (body.TryGetProperty("eventTime", out var eventTimeProp))
                    eventEntity.EventTime = eventTimeProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : eventTimeProp.GetString();
                    
                if (body.TryGetProperty("location", out var locationProp))
                    eventEntity.Location = locationProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : locationProp.GetString();
                    
                if (body.TryGetProperty("sponsoringOrganization", out var sponsorProp))
                    eventEntity.SponsoringOrganization = sponsorProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : sponsorProp.GetString();
                    
                if (body.TryGetProperty("allowParticipants", out var allowProp) && allowProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                    eventEntity.AllowParticipants = allowProp.GetBoolean();
                    
                if (body.TryGetProperty("prizeInformation", out var prizeProp))
                    eventEntity.PrizeInformation = prizeProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : prizeProp.GetString();
                    
                if (body.TryGetProperty("eventRules", out var eventRulesProp))
                    eventEntity.EventRules = eventRulesProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : eventRulesProp.GetString();
                    
                if (body.TryGetProperty("specialInstructions", out var specialInstructionsProp))
                    eventEntity.SpecialInstructions = specialInstructionsProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : specialInstructionsProp.GetString();
                    
                if (body.TryGetProperty("accessibilityInfo", out var accessibilityProp))
                    eventEntity.AccessibilityInfo = accessibilityProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : accessibilityProp.GetString();
                    
                if (body.TryGetProperty("dietaryAccommodations", out var dietaryProp))
                    eventEntity.DietaryAccommodations = dietaryProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : dietaryProp.GetString();
                    
                if (body.TryGetProperty("dressCode", out var dressProp))
                    eventEntity.DressCode = dressProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : dressProp.GetString();
                    
                if (body.TryGetProperty("ageRestrictions", out var ageProp))
                    eventEntity.AgeRestrictions = ageProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : ageProp.GetString();
                    
                if (body.TryGetProperty("technicalRequirements", out var techProp))
                    eventEntity.TechnicalRequirements = techProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : techProp.GetString();
                    
                if (body.TryGetProperty("registrationDeadline", out var regDeadlineProp))
                    eventEntity.RegistrationDeadline = regDeadlineProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : 
                        (DateTime.TryParse(regDeadlineProp.GetString(), out var parsedRegDate) ? parsedRegDate : null);
                    
                if (body.TryGetProperty("cancellationPolicy", out var cancelProp))
                    eventEntity.CancellationPolicy = cancelProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : cancelProp.GetString();
                    
                if (body.TryGetProperty("refundPolicy", out var refundProp))
                    eventEntity.RefundPolicy = refundProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : refundProp.GetString();
                    
                if (body.TryGetProperty("sponsorInformation", out var sponsorInfoProp))
                    eventEntity.SponsorInformation = sponsorInfoProp.ValueKind == System.Text.Json.JsonValueKind.Null ? null : sponsorInfoProp.GetString();

                // Save the updated event
                var updatedEvent = await eventService.UpdateEventAsync(eventEntity);
                logger.LogInformation("Event updated successfully: {EventId} ({Title}) for user: {UserId}", id, updatedEvent.Title, userId);
                return Results.Ok(updatedEvent);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update event {EventId} for user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Team endpoints - migrated to EF Core
        api.MapGet("/events/{id}/teams", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreTeamService teamService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Teams request failed - event not found: {EventId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.HostId != userId)
                {
                    logger.LogWarning("Teams request failed - access denied: {EventId} requested by user: {UserId}, actual host: {HostId}", id, userId, eventEntity.HostId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                var teams = await teamService.GetTeamsForEventAsync(id);
                var result = new List<object>();

                foreach (var team in teams)
                {
                    result.Add(new
                    {
                        team.Id,
                        team.EventId,
                        team.Name,
                        team.TableNumber,
                        team.MaxMembers,
                        team.CreatedAt,
                        participantCount = team.Participants?.Count ?? 0,
                        participants = team.Participants ?? new List<Participant>()
                    });
                }

                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve teams for event {EventId}, user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/{id}/teams", async (string id, [FromBody] CreateTeamRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreTeamService teamService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { error = "Team name is required" });

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Team creation failed - event not found: {EventId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.HostId != userId)
                {
                    logger.LogWarning("Team creation failed - access denied: {EventId} requested by user: {UserId}, actual host: {HostId}", id, userId, eventEntity.HostId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                // Check for duplicate team name in this event
                var existingTeams = await teamService.GetTeamsForEventAsync(id);
                var duplicateName = existingTeams.FirstOrDefault(t => 
                    t.Name.Trim().Equals(body.Name.Trim(), StringComparison.OrdinalIgnoreCase)
                );
                if (duplicateName != null)
                {
                    logger.LogWarning("Team creation failed - duplicate name: {TeamName} in event: {EventId}", body.Name, id);
                    return Results.BadRequest(new { error = "A team with this name already exists in this event" });
                }

                // Check for duplicate table number in this event (if provided)
                if (body.TableNumber.HasValue)
                {
                    var duplicateTable = existingTeams.FirstOrDefault(t => t.TableNumber == body.TableNumber.Value);
                    if (duplicateTable != null)
                    {
                        logger.LogWarning("Team creation failed - duplicate table number: {TableNumber} in event: {EventId}", body.TableNumber, id);
                        return Results.BadRequest(new { error = $"Table number {body.TableNumber} is already assigned in this event" });
                    }
                }

                var newTeam = new Team
                {
                    Id = Guid.NewGuid().ToString(),
                    EventId = id,
                    Name = body.Name,
                    TableNumber = body.TableNumber,
                    MaxMembers = 6,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await teamService.CreateTeamAsync(newTeam);
                logger.LogInformation("Team created successfully: {TeamId} ({TeamName}) in event: {EventId}", created.Id, created.Name, id);
                return Results.Created($"/api/v2/events/{id}/teams/{created.Id}", created);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create team {TeamName} in event {EventId} for user: {UserId}", body.Name, id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Questions endpoints - migrated to EF Core
        api.MapGet("/events/{id}/questions", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req, ILogger<Program> logger) =>
        {
            // Helper function to parse options JSON to array
            static object ParseQuestionOptions(Question question)
            {
                try
                {
                    if (string.IsNullOrEmpty(question.Options))
                        return new string[0];
                    
                    var options = System.Text.Json.JsonSerializer.Deserialize<string[]>(question.Options);
                    return new
                    {
                        Id = question.Id,
                        EventId = question.EventId,
                        Type = question.Type,
                        Question = question.QuestionText,
                        Options = options ?? new string[0],
                        CorrectAnswer = question.CorrectAnswer,
                        Explanation = question.Explanation,
                        Points = question.Points,
                        TimeLimit = question.TimeLimit,
                        Difficulty = question.Difficulty,
                        Category = question.Category,
                        BackgroundImageUrl = question.BackgroundImageUrl,
                        AiGenerated = question.AiGenerated,
                        OrderIndex = question.OrderIndex,
                        CreatedAt = ((DateTimeOffset)question.CreatedAt).ToUnixTimeSeconds().ToString()
                    };
                }
                catch
                {
                    // Fallback if JSON parsing fails
                    return new
                    {
                        Id = question.Id,
                        EventId = question.EventId,
                        Type = question.Type,
                        Question = question.QuestionText,
                        Options = new string[0],
                        CorrectAnswer = question.CorrectAnswer,
                        Explanation = question.Explanation,
                        Points = question.Points,
                        TimeLimit = question.TimeLimit,
                        Difficulty = question.Difficulty,
                        Category = question.Category,
                        BackgroundImageUrl = question.BackgroundImageUrl,
                        AiGenerated = question.AiGenerated,
                        OrderIndex = question.OrderIndex,
                        CreatedAt = ((DateTimeOffset)question.CreatedAt).ToUnixTimeSeconds().ToString()
                    };
                }
            }

            // Special handling for demo/seed events
            if (id.StartsWith("seed-event-"))
            {
                var eventExists = await eventService.GetEventByIdAsync(id);
                if (eventExists == null)
                    return Results.NotFound(new { error = "Event not found" });

                var demoQuestions = await questionService.GetQuestionsForEventAsync(id);
                var parsedDemoQuestions = demoQuestions.Select(ParseQuestionOptions).ToList();
                return Results.Ok(parsedDemoQuestions);
            }

            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Questions request failed - event not found: {EventId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.HostId != userId)
                {
                    logger.LogWarning("Questions request failed - access denied: {EventId} requested by user: {UserId}, actual host: {HostId}", id, userId, eventEntity.HostId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                var questions = await questionService.GetQuestionsForEventAsync(id);
                var parsedQuestions = questions.Select(ParseQuestionOptions).ToList();
                return Results.Ok(parsedQuestions);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve questions for event {EventId}, user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/events/{id}/questions/reorder", async (string id, [FromBody] ReorderQuestionsRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Questions reorder failed - event not found: {EventId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.HostId != userId)
                {
                    logger.LogWarning("Questions reorder failed - access denied: {EventId} requested by user: {UserId}, actual host: {HostId}", id, userId, eventEntity.HostId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                // Update question order
                var success = await questionService.ReorderQuestionsAsync(body.QuestionOrder);
                if (!success)
                {
                    logger.LogWarning("Questions reorder failed - service returned false for event: {EventId}", id);
                    return Results.BadRequest(new { error = "Failed to update question order" });
                }

                var updatedQuestions = await questionService.GetQuestionsForEventAsync(id);
                logger.LogInformation("Questions reordered successfully for event: {EventId}, count: {QuestionCount}", id, body.QuestionOrder.Count);
                return Results.Ok(new { message = "Question order updated successfully", questions = updatedQuestions });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to reorder questions for event {EventId}, user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/questions/{id}", async (string id, [FromBody] UpdateQuestion body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IEventImageService eventImageService, ILogger<Program> logger, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                logger.LogInformation("Updating question {QuestionId}, SelectedImage provided: {HasSelectedImage}", id, body.SelectedImage != null);
                if (body.SelectedImage != null)
                {
                    logger.LogInformation("SelectedImage details: Id={ImageId}, Author={Author}", body.SelectedImage.Id, body.SelectedImage.Author);
                }

                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                    return Results.NotFound(new { error = "Question not found" });

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // Update question
                question.QuestionText = body.Question ?? question.QuestionText;
                question.Type = body.Type ?? question.Type;
                question.Options = body.Options != null ? System.Text.Json.JsonSerializer.Serialize(body.Options) : question.Options;
                question.CorrectAnswer = body.CorrectAnswer ?? question.CorrectAnswer;
                question.Difficulty = body.Difficulty ?? question.Difficulty;
                question.Category = body.Category ?? question.Category;
                question.Explanation = body.Explanation ?? question.Explanation;
                question.TimeLimit = body.TimeLimit ?? question.TimeLimit;
                question.OrderIndex = body.OrderIndex ?? question.OrderIndex;
                question.AiGenerated = body.AiGenerated ?? question.AiGenerated;
                question.BackgroundImageUrl = body.BackgroundImageUrl ?? question.BackgroundImageUrl;

                // Handle EventImage creation if SelectedImage data is provided
                if (body.SelectedImage != null)
                {
                    logger.LogInformation("Creating EventImage for question {QuestionId} with image {ImageId}", question.Id, body.SelectedImage.Id);
                    var createImageRequest = new CreateEventImageRequest
                    {
                        QuestionId = question.Id,
                        UnsplashImageId = body.SelectedImage.Id,
                        SizeVariant = "regular",
                        UsageContext = "question_background",
                        SelectedByUserId = userId
                    };
                    var eventImage = await eventImageService.SaveImageForQuestionAsync(createImageRequest);
                    logger.LogInformation("EventImage creation result: {Success}", eventImage != null ? "Success" : "Failed");
                }

                var updated = await questionService.UpdateQuestionAsync(question);
                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating question {QuestionId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/questions/{id}", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("Question delete failed - question not found: {QuestionId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                {
                    logger.LogWarning("Question delete failed - access denied: {QuestionId} in event: {EventId} requested by user: {UserId}", id, question.EventId, userId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                var success = await questionService.DeleteQuestionAsync(id);
                if (success)
                {
                    logger.LogInformation("Question deleted successfully: {QuestionId} from event: {EventId}", id, question.EventId);
                    return Results.NoContent();
                }
                else
                {
                    logger.LogWarning("Question delete failed - service returned false: {QuestionId}", id);
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete question {QuestionId} for user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // EventImages for questions
        api.MapGet("/questions/{id}/eventimage", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IEventImageService eventImageService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("EventImage request failed - question not found: {QuestionId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                {
                    logger.LogWarning("EventImage request failed - access denied: {QuestionId} in event: {EventId} requested by user: {UserId}", id, question.EventId, userId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                var eventImage = await eventImageService.GetImageForQuestionAsync(id);
                if (eventImage == null)
                    return Results.Ok(new { eventImage = (object?)null });

                var response = eventImageService.ToEventImageResponse(eventImage);
                return Results.Ok(new { eventImage = response });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve EventImage for question {QuestionId}, user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // PUT endpoint to save/update EventImage for a question
        api.MapPut("/questions/{id}/eventimage", async (string id, [FromBody] SaveEventImageRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IEventImageService eventImageService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("EventImage save failed - question not found: {QuestionId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                {
                    logger.LogWarning("EventImage save failed - access denied: {QuestionId} in event: {EventId} requested by user: {UserId}", id, question.EventId, userId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                // Convert SaveEventImageRequest to CreateEventImageRequest
                var createRequest = new CreateEventImageRequest
                {
                    QuestionId = id,
                    UnsplashImageId = body.UnsplashImageId,
                    SizeVariant = body.SizeVariant ?? "regular",
                    UsageContext = body.UsageContext ?? "question_background",
                    SelectedByUserId = userId,
                    SearchContext = body.SearchContext
                };

                var eventImage = await eventImageService.SaveImageForQuestionAsync(createRequest);
                if (eventImage == null)
                {
                    logger.LogWarning("EventImage save failed - service returned null for question: {QuestionId}", id);
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }

                var response = eventImageService.ToEventImageResponse(eventImage);
                logger.LogInformation("EventImage saved successfully for question: {QuestionId}, image: {ImageId}", id, body.UnsplashImageId);
                return Results.Ok(new { eventImage = response });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to save EventImage for question {QuestionId}, user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Participants endpoints - migrated to EF Core
        api.MapGet("/events/{id}/participants", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreParticipantService participantService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Participants request failed - event not found: {EventId} for user: {UserId}", id, userId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.HostId != userId)
                {
                    logger.LogWarning("Participants request failed - access denied: {EventId} requested by user: {UserId}, actual host: {HostId}", id, userId, eventEntity.HostId);
                    return Results.StatusCode(StatusCodes.Status403Forbidden);
                }

                var participants = await participantService.GetParticipantsByEventAsync(id);
                return Results.Ok(participants);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve participants for event {EventId}, user: {UserId}", id, userId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/join/{qrCode}/check", async (string qrCode, IEfCoreEventService eventService, IEfCoreParticipantService participantService, HttpRequest req, ILogger<Program> logger) =>
        {
            try
            {
                if (!req.Cookies.TryGetValue("participantToken", out var token))
                {
                    logger.LogWarning("Join check failed - no participant token found for QR code: {QrCode}", qrCode);
                    return Results.NotFound(new { error = "No participant token found" });
                }

                var participant = await participantService.GetParticipantByTokenAsync(token);
                if (participant == null)
                {
                    logger.LogWarning("Join check failed - participant not found for token and QR code: {QrCode}", qrCode);
                    return Results.NotFound(new { error = "Participant not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(participant.EventId);
                if (eventEntity == null || eventEntity.QrCode != qrCode)
                {
                    logger.LogWarning("Join check failed - event not found or QR code mismatch: {QrCode}, participant event: {EventId}", qrCode, participant.EventId);
                    return Results.NotFound(new { error = "Participant not found for this event" });
                }

                // Get team if participant has one
                object? team = null;
                if (!string.IsNullOrWhiteSpace(participant.TeamId))
                {
                    // Note: Would need team service here
                    // team = await teamService.GetTeamByIdAsync(participant.TeamId);
                }

                logger.LogInformation("Join check successful for QR code: {QrCode}, participant: {ParticipantId}", qrCode, participant.Id);
                return Results.Ok(new
                {
                    participant,
                    team,
                    event_ = new { id = eventEntity.Id, title = eventEntity.Title, description = eventEntity.Description, status = eventEntity.Status },
                    returning = true
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to check participant join status for QR code: {QrCode}", qrCode);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/join/{qrCode}", async (string qrCode, [FromBody] JoinEventRequest body, IEfCoreEventService eventService, IEfCoreParticipantService participantService, IEfCoreTeamService teamService, HttpResponse res, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { error = "Name is required" });

            try
            {
                // Find event by QR code (assuming demo host for now)
                var hostEvents = await eventService.GetEventsForHostAsync("mark-user-id");
                var eventEntity = hostEvents.FirstOrDefault(e => e.QrCode == qrCode);
                if (eventEntity == null)
                {
                    logger.LogWarning("Event join failed - event not found for QR code: {QrCode}", qrCode);
                    return Results.NotFound(new { error = "Event not found" });
                }

                if (eventEntity.Status == "cancelled")
                {
                    logger.LogWarning("Event join failed - event cancelled: {EventId} ({QrCode})", eventEntity.Id, qrCode);
                    return Results.BadRequest(new { error = "Event has been cancelled" });
                }

                // Check for duplicate participant name in this event
                var existingParticipants = await participantService.GetParticipantsByEventAsync(eventEntity.Id);
                var duplicateParticipant = existingParticipants.FirstOrDefault(p => 
                    p.Name.Trim().Equals(body.Name.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    p.IsActive
                );
                if (duplicateParticipant != null)
                {
                    logger.LogWarning("Event join failed - participant name already exists: {ParticipantName} in event: {EventId}", body.Name, eventEntity.Id);
                    return Results.BadRequest(new { error = "A participant with this name is already registered for this event" });
                }

                string? teamId = null;

                // Handle team actions
                if (body.TeamAction == "join" && !string.IsNullOrWhiteSpace(body.TeamIdentifier))
                {
                    var teams = await teamService.GetTeamsForEventAsync(eventEntity.Id);
                    var team = teams.FirstOrDefault(t => t.Name == body.TeamIdentifier || t.TableNumber?.ToString() == body.TeamIdentifier);
                    if (team == null)
                    {
                        logger.LogWarning("Event join failed - team not found: {TeamIdentifier} in event: {EventId}", body.TeamIdentifier, eventEntity.Id);
                        return Results.NotFound(new { error = "Team not found" });
                    }

                    var members = team.Participants?.Count ?? 0;
                    if (members >= (team.MaxMembers == 0 ? 6 : team.MaxMembers))
                    {
                        logger.LogWarning("Event join failed - team full: {TeamId} ({TeamName}) in event: {EventId}", team.Id, team.Name, eventEntity.Id);
                        return Results.BadRequest(new { error = "Team is full" });
                    }

                    teamId = team.Id;
                }
                else if (body.TeamAction == "create" && !string.IsNullOrWhiteSpace(body.TeamIdentifier))
                {
                    var teams = await teamService.GetTeamsForEventAsync(eventEntity.Id);
                    var existing = teams.FirstOrDefault(t => t.Name == body.TeamIdentifier || t.TableNumber?.ToString() == body.TeamIdentifier);
                    if (existing != null)
                    {
                        logger.LogWarning("Event join failed - team name/table already exists: {TeamIdentifier} in event: {EventId}", body.TeamIdentifier, eventEntity.Id);
                        return Results.BadRequest(new { error = "Team name or table number already exists" });
                    }

                    var isTable = int.TryParse(body.TeamIdentifier, out var tbl);
                    var newTeam = new Team
                    {
                        Id = Guid.NewGuid().ToString(),
                        EventId = eventEntity.Id,
                        Name = isTable ? $"Table {tbl}" : body.TeamIdentifier,
                        TableNumber = isTable ? tbl : null,
                        MaxMembers = 6,
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdTeam = await teamService.CreateTeamAsync(newTeam);
                    teamId = createdTeam.Id;
                    logger.LogInformation("New team created during participant join: {TeamId} ({TeamName}) in event: {EventId}", createdTeam.Id, createdTeam.Name, eventEntity.Id);
                }

                // Create participant
                var participant = new Participant
                {
                    Id = Guid.NewGuid().ToString(),
                    EventId = eventEntity.Id,
                    TeamId = teamId,
                    Name = body.Name,
                    ParticipantToken = Guid.NewGuid().ToString("N"),
                    JoinedAt = DateTime.UtcNow,
                    LastActiveAt = DateTime.UtcNow,
                    IsActive = true,
                    CanSwitchTeam = eventEntity.Status != "active"
                };

                var created = await participantService.CreateParticipantAsync(participant);

                // Set participant cookie
                res.Cookies.Append("participantToken", created.ParticipantToken, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Strict,
                    MaxAge = TimeSpan.FromHours(24)
                });

                // Get team info if participant joined one
                object? joinedTeam = null;
                if (!string.IsNullOrWhiteSpace(created.TeamId))
                {
                    var team = await teamService.GetTeamByIdAsync(created.TeamId);
                    joinedTeam = team;
                }

                logger.LogInformation("Participant successfully joined event: {ParticipantId} ({ParticipantName}) in event: {EventId}, team: {TeamId}", 
                    created.Id, created.Name, eventEntity.Id, created.TeamId);

                return Results.Created($"/api/v2/participants/{created.Id}", new
                {
                    participant = created,
                    team = joinedTeam,
                    event_ = new { id = eventEntity.Id, title = eventEntity.Title, description = eventEntity.Description, status = eventEntity.Status },
                    returning = false
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to join event with QR code: {QrCode}, participant name: {ParticipantName}", qrCode, body.Name);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/participants/{id}/team", async (string id, [FromBody] SwitchTeamRequest body, IEfCoreParticipantService participantService, HttpRequest req, ILogger<Program> logger) =>
        {
            try
            {
                if (!req.Cookies.TryGetValue("participantToken", out var token))
                    return Results.Unauthorized();

                var participant = await participantService.GetParticipantByTokenAsync(token);
                if (participant == null || participant.Id != id)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                if (!participant.CanSwitchTeam)
                    return Results.BadRequest(new { error = "Team switching is locked" });

                participant.TeamId = body.TeamId;
                var updated = await participantService.UpdateParticipantAsync(participant);
                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to switch team for participant: {ParticipantId}, new team: {TeamId}", id, body.TeamId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/events/{id}/participants/inactive", async (string id, [FromQuery] int inactiveThresholdMinutes, ISessionService sessions, IEfCoreEventService eventService, IEfCoreParticipantService participantService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var participants = await participantService.GetParticipantsByEventAsync(id);
                var thresholdTime = DateTime.UtcNow.AddMinutes(-1 * (inactiveThresholdMinutes == 0 ? 30 : inactiveThresholdMinutes));
                
                var toRemove = participants.Where(p => !p.IsActive || p.LastActiveAt < thresholdTime).ToList();
                var removed = 0;

                foreach (var p in toRemove)
                {
                    if (await participantService.DeleteParticipantAsync(p.Id))
                        removed++;
                }

                return Results.Ok(new
                {
                    message = $"Removed {removed} inactive participants",
                    removedCount = removed,
                    thresholdMinutes = inactiveThresholdMinutes == 0 ? 30 : inactiveThresholdMinutes,
                    remainingParticipants = participants.Count - removed
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to remove inactive participants from event: {EventId}, threshold: {ThresholdMinutes}", id, inactiveThresholdMinutes);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Fun Facts endpoints - migrated to EF Core
        api.MapGet("/events/{id}/fun-facts", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req, ILogger<Program> logger) =>
        {
            // Special handling for demo/seed events
            if (id.StartsWith("seed-event-"))
            {
                var eventExists = await eventService.GetEventByIdAsync(id);
                if (eventExists == null)
                    return Results.NotFound(new { error = "Event not found" });

                var demoFacts = await funFactService.GetFunFactsForEventAsync(id);
                return Results.Ok(demoFacts);
            }

            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var funFacts = await funFactService.GetFunFactsForEventAsync(id);
                return Results.Ok(funFacts);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get fun facts for event: {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/{id}/fun-facts", async (string id, [FromBody] CreateFunFactRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(body.Title))
                return Results.BadRequest(new { error = "Fun fact title is required" });

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // Check for duplicate fun fact title in this event
                var existingFunFacts = await funFactService.GetFunFactsForEventAsync(id);
                var duplicateTitle = existingFunFacts.FirstOrDefault(f => 
                    f.Title.Trim().Equals(body.Title.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    f.IsActive
                );
                if (duplicateTitle != null)
                    return Results.BadRequest(new { error = "A fun fact with this title already exists for this event" });

                var funFact = new FunFact
                {
                    Id = Guid.NewGuid().ToString(),
                    EventId = id,
                    Title = body.Title,
                    Content = body.Content,
                    OrderIndex = body.OrderIndex ?? 0,
                    IsActive = body.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await funFactService.CreateFunFactAsync(funFact);
                return Results.Created($"/api/v2/fun-facts/{created.Id}", created);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create fun fact for event: {EventId}, title: {FunFactTitle}", id, body.Title);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/fun-facts/{id}", async (string id, [FromBody] UpdateFunFactRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var funFact = await funFactService.GetFunFactByIdAsync(id);
                if (funFact == null)
                    return Results.NotFound(new { error = "Fun fact not found" });

                var eventEntity = await eventService.GetEventByIdAsync(funFact.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // Update fun fact
                funFact.Title = body.Title ?? funFact.Title;
                funFact.Content = body.Content ?? funFact.Content;
                funFact.OrderIndex = body.OrderIndex ?? funFact.OrderIndex;
                funFact.IsActive = body.IsActive ?? funFact.IsActive;

                var updated = await funFactService.UpdateFunFactAsync(funFact);
                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update fun fact: {FunFactId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/fun-facts/{id}", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var funFact = await funFactService.GetFunFactByIdAsync(id);
                if (funFact == null)
                    return Results.NotFound(new { error = "Fun fact not found" });

                var eventEntity = await eventService.GetEventByIdAsync(funFact.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var success = await funFactService.DeleteFunFactAsync(id);
                return success ? Results.NoContent() : Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete fun fact: {FunFactId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Responses endpoints - migrated to EF Core
        api.MapPost("/responses", async ([FromBody] SubmitResponseRequest body, IEfCoreQuestionService questionService, IEfCoreResponseService responseService, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.ParticipantId) || string.IsNullOrWhiteSpace(body.QuestionId) || string.IsNullOrWhiteSpace(body.Answer))
                return Results.BadRequest(new { error = "Missing required fields" });

            try
            {
                var question = await questionService.GetQuestionByIdAsync(body.QuestionId);
                if (question == null)
                    return Results.NotFound(new { error = "Question not found" });

                var isCorrect = string.Equals((question.CorrectAnswer ?? "").Trim(), body.Answer.Trim(), StringComparison.OrdinalIgnoreCase);
                var points = 0;

                if (isCorrect && (body.TimeRemaining ?? 0) > 0)
                {
                    var tr = body.TimeRemaining ?? 0;
                    points = tr >= 20 ? 20 : tr >= 15 ? 15 : tr >= 10 ? 10 : tr >= 5 ? 5 : 1;
                }

                var response = new Response
                {
                    Id = Guid.NewGuid().ToString(),
                    ParticipantId = body.ParticipantId,
                    QuestionId = body.QuestionId,
                    Answer = body.Answer,
                    IsCorrect = isCorrect,
                    Points = points,
                    ResponseTime = body.ResponseTime,
                    TimeRemaining = body.TimeRemaining,
                    SubmittedAt = DateTime.UtcNow
                };

                var created = await responseService.CreateResponseAsync(response);
                return Results.Created($"/api/v2/responses/{created.Id}", created);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to submit response for participant: {ParticipantId}, question: {QuestionId}", body.ParticipantId, body.QuestionId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Analytics endpoints - migrated to EF Core
        api.MapGet("/events/{id}/analytics", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // Use the unified storage service for analytics
                var analytics = await storageService.GetEventAnalyticsAsync(id);
                return Results.Ok(analytics);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get analytics for event: {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}/leaderboard", async (string id, [FromQuery] string? type, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var leaderboardType = (type ?? "teams").ToLowerInvariant();
                var leaderboard = await storageService.GetLeaderboardAsync(id, leaderboardType);
                return Results.Ok(leaderboard);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get leaderboard for event: {EventId}, type: {LeaderboardType}", id, type ?? "teams");
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}/responses/summary", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var summary = await storageService.GetResponseSummaryAsync(id);
                return Results.Ok(summary);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get response summary for event: {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Event management endpoints - migrated to EF Core
        api.MapPost("/events/{id}/start", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // Update event status and lock team switching
                eventEntity.Status = "active";
                eventEntity.StartedAt = DateTime.UtcNow;
                var updated = await eventService.UpdateEventAsync(eventEntity);

                // Lock team switching for all participants
                await storageService.LockTeamSwitchingAsync(id);

                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to start event: {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPatch("/events/{id}/status", async (string id, [FromBody] EventStatusUpdate body, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req, ILogger<Program> logger) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                eventEntity.Status = body.Status;
                if (body.Status == "completed")
                    eventEntity.CompletedAt = DateTime.UtcNow;

                var updated = await eventService.UpdateEventAsync(eventEntity);
                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update event status: {EventId}, new status: {Status}", id, body.Status);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // AI Copy generation (placeholder)
        api.MapPost("/events/{id}/generate-copy", async (string id, [FromBody] GenerateCopyRequest body, IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                var copy = body.Type?.ToLowerInvariant() switch
                {
                    "promotional" => $"Join us for {eventEntity.Title}! A fun {eventEntity.EventType} trivia night.",
                    "welcome" => $"Welcome to {eventEntity.Title}!",
                    "thankyou" => $"Thanks for playing {eventEntity.Title}!",
                    "rules" => "Answer quickly for more points!",
                    _ => eventEntity.Description ?? "A great trivia event"
                };

                return Results.Ok(new { type = body.Type, copy, eventId = id });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to generate copy for event: {EventId}, type: {CopyType}", id, body.Type);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Questions generation and bulk endpoints
        api.MapPost("/events/generate-questions", async ([FromBody] GenerateQuestionsRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IOpenAIService openAIService, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                if (string.IsNullOrWhiteSpace(body.EventId))
                    return Results.BadRequest(new { error = "EventId is required" });

                if (string.IsNullOrWhiteSpace(body.Topic))
                    return Results.BadRequest(new { error = "Topic is required" });

                if (body.Count <= 0 || body.Count > 50)
                    return Results.BadRequest(new { error = "Count must be between 1 and 50" });

                var eventEntity = await eventService.GetEventByIdAsync(body.EventId);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // Create event context for better question generation
                var eventContext = $"This is a {eventEntity.EventType} event";
                if (!string.IsNullOrEmpty(eventEntity.Description))
                    eventContext += $" - {eventEntity.Description}";
                if (!string.IsNullOrEmpty(eventEntity.Location))
                    eventContext += $" taking place at {eventEntity.Location}";

                List<Question> savedQuestions;
                try
                {
                    // Generate questions using OpenAI
                    var generatedQuestions = await openAIService.GenerateQuestionsAsync(
                        body.EventId, 
                        body.Topic, 
                        body.Type ?? "medium", // Use type as difficulty if not specified separately
                        body.Count,
                        eventContext
                    );

                    // Convert generated questions to Question entities
                    var questionEntities = generatedQuestions.Select(q => new Question
                    {
                        Id = Guid.NewGuid().ToString(),
                        EventId = body.EventId,
                        Type = "multiple_choice",
                        QuestionText = q.Question,
                        Options = System.Text.Json.JsonSerializer.Serialize(q.Options),
                        CorrectAnswer = q.CorrectAnswer,
                        Explanation = q.Explanation,
                        Difficulty = q.Difficulty,
                        Category = q.Category ?? body.Topic,
                        AiGenerated = true,
                        Points = 100,
                        TimeLimit = 30,
                        OrderIndex = 0 // Will be set by the service
                    }).ToList();

                    // Save questions to database
                    savedQuestions = (await questionService.CreateQuestionsAsync(questionEntities)).ToList();
                }
                catch (InvalidOperationException ex) when (ex.Message.Contains("OpenAI API key"))
                {
                    // Fallback to demo questions when OpenAI is not configured
                    var demoQuestions = Enumerable.Range(1, body.Count).Select(i => new Question
                    {
                        Id = Guid.NewGuid().ToString(),
                        EventId = body.EventId,
                        Type = "multiple_choice",
                        QuestionText = $"Demo question {i} about {body.Topic}: What is a key characteristic of this topic?",
                        Options = System.Text.Json.JsonSerializer.Serialize(new[] { "Option A", "Option B", "Option C", "Option D" }),
                        CorrectAnswer = "Option A",
                        Explanation = $"This is demo question {i} about {body.Topic}. To generate real AI questions, please configure your OpenAI API key.",
                        Difficulty = body.Type ?? "medium",
                        Category = body.Topic,
                        AiGenerated = false,
                        Points = 100,
                        TimeLimit = 30,
                        OrderIndex = 0
                    }).ToList();
                    
                    // Save demo questions to database
                    savedQuestions = (await questionService.CreateQuestionsAsync(demoQuestions)).ToList();
                }

                // Convert saved questions to API response format
                var responseQuestions = savedQuestions.Select(q => new
                {
                    id = q.Id,
                    question = q.QuestionText,
                    type = q.Type,
                    options = System.Text.Json.JsonSerializer.Deserialize<string[]>(q.Options) ?? new string[0],
                    correctAnswer = q.CorrectAnswer,
                    difficulty = q.Difficulty,
                    category = q.Category,
                    explanation = q.Explanation,
                    points = q.Points,
                    timeLimit = q.TimeLimit,
                    orderIndex = q.OrderIndex,
                    aiGenerated = q.AiGenerated,
                    createdAt = q.CreatedAt
                }).ToList();

                return Results.Ok(new { 
                    questions = responseQuestions, 
                    count = responseQuestions.Count,
                    eventId = body.EventId,
                    topic = body.Topic,
                    type = body.Type ?? "multiple_choice",
                    generatedBy = savedQuestions.Any(q => q.AiGenerated) ? "OpenAI GPT-4o" : "Demo Questions",
                    message = $"Successfully generated and saved {responseQuestions.Count} questions to the event."
                });
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Failed to generate and save questions: {ex.Message}", statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/questions/generate", async ([FromBody] GenerateQuestionsRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService, ILogger<Program> logger) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(body.EventId))
                    return Results.BadRequest(new { error = "EventId is required" });

                var eventEntity = await eventService.GetEventByIdAsync(body.EventId);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                // TODO: Implement AI question generation
                // For now, return a placeholder response
                var placeholderQuestions = new List<object>
                {
                    new
                    {
                        question = $"Sample {body.Type} question about {body.Topic}?",
                        type = body.Type,
                        options = body.Type == "multiple_choice" ? new[] { "A", "B", "C", "D" } : new[] { "True", "False" },
                        correctAnswer = body.Type == "multiple_choice" ? "A" : "True",
                        difficulty = "medium",
                        aiGenerated = true
                    }
                };

                return Results.Ok(new { questions = placeholderQuestions, count = body.Count });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to generate questions for event: {EventId}, topic: {Topic}, type: {Type}", body.EventId, body.Topic, body.Type);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/questions/bulk", async ([FromBody] BulkInsertQuestionsRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService, ILogger<Program> logger) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(body.EventId) || body.Questions == null || !body.Questions.Any())
                    return Results.BadRequest(new { error = "EventId and questions are required" });

                var eventEntity = await eventService.GetEventByIdAsync(body.EventId);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                // Check for duplicate questions in the event
                var existingQuestions = await questionService.GetQuestionsForEventAsync(body.EventId);
                var existingQuestionTexts = existingQuestions
                    .Select(q => q.QuestionText.Trim().ToLowerInvariant())
                    .ToHashSet();

                // Check for duplicates in the incoming questions
                var incomingQuestionTexts = new HashSet<string>();
                foreach (var q in body.Questions)
                {
                    if (string.IsNullOrWhiteSpace(q.Question))
                        return Results.BadRequest(new { error = "All questions must have question text" });

                    var normalizedText = q.Question.Trim().ToLowerInvariant();
                    
                    // Check against existing questions in database
                    if (existingQuestionTexts.Contains(normalizedText))
                        return Results.BadRequest(new { error = $"Question already exists in this event: {q.Question.Substring(0, Math.Min(50, q.Question.Length))}..." });
                    
                    // Check for duplicates within the current batch
                    if (!incomingQuestionTexts.Add(normalizedText))
                        return Results.BadRequest(new { error = $"Duplicate question in batch: {q.Question.Substring(0, Math.Min(50, q.Question.Length))}..." });
                }

                var questions = new List<Question>();
                var nextOrderIndex = await questionService.GetNextOrderIndexAsync(body.EventId);

                foreach (var q in body.Questions)
                {
                    var question = new Question
                    {
                        Id = Guid.NewGuid().ToString(),
                        EventId = body.EventId,
                        Type = q.Type ?? "multiple-choice",
                        QuestionText = q.Question ?? "Unknown question",
                        Options = q.Options != null ? System.Text.Json.JsonSerializer.Serialize(q.Options) : "[]",
                        CorrectAnswer = q.CorrectAnswer ?? "",
                        Explanation = q.Explanation ?? "",
                        Points = 20, // Default points
                        TimeLimit = 30, // Default time limit
                        Difficulty = q.Difficulty ?? "medium",
                        Category = q.Category ?? "General",
                        OrderIndex = nextOrderIndex++,
                        AiGenerated = q.AiGenerated ?? false,
                        CreatedAt = DateTime.UtcNow
                    };
                    questions.Add(question);
                }

                var created = await questionService.BulkInsertQuestionsAsync(questions);
                return Results.Created($"/api/v2/events/{body.EventId}/questions", new { questions = created, count = created.Count });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to bulk insert questions for event: {EventId}, count: {QuestionCount}", body.EventId, body.Questions?.Count());
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Public endpoints for teams (no auth required for participant access)
        api.MapGet("/events/{qrCode}/teams-public", async (string qrCode, IEfCoreEventService eventService, IEfCoreTeamService teamService, ILogger<Program> logger) =>
        {
            try
            {
                // Demo behavior: find host 'mark-user-id' events and match qr
                var hostEvents = await eventService.GetEventsForHostAsync("mark-user-id");
                var eventEntity = hostEvents.FirstOrDefault(e => e.QrCode == qrCode);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                var teams = await teamService.GetTeamsForEventAsync(eventEntity.Id);
                var result = teams.Select(t => new
                {
                    t.Id,
                    t.EventId,
                    t.Name,
                    t.TableNumber,
                    participantCount = t.Participants?.Count ?? 0
                }).ToList();

                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get public teams for event QR code: {QrCode}", qrCode);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Debug endpoints - migrated to EF Core
        api.MapGet("/debug/cookies", (ISessionService sessions, HttpRequest req) =>
        {
            var sessionId = req.Cookies.TryGetValue("sessionId", out var s) ? s : null;
            return Results.Ok(new
            {
                rawCookies = req.Headers["Cookie"].ToString(),
                parsedCookies = req.Cookies.ToDictionary(kv => kv.Key, kv => kv.Value),
                sessionCount = 0, // Sessions are not tracked in this implementation
                availableSessions = sessionId == null ? Array.Empty<string>() : new[] { sessionId },
                version = "EfCore"
            });
        });

        api.MapGet("/debug/db", (TriviaSparkDbContext dbContext) =>
        {
            try
            {
                var canConnect = dbContext.Database.CanConnect();
                var userCount = dbContext.Users.Count();
                var eventCount = dbContext.Events.Count();
                var teamCount = dbContext.Teams.Count();
                var participantCount = dbContext.Participants.Count();
                var questionCount = dbContext.Questions.Count();
                var responseCount = dbContext.Responses.Count();
                var funFactCount = dbContext.FunFacts.Count();

                var sampleUsers = dbContext.Users
                    .Take(5)
                    .Select(u => u.Username)
                    .ToList();

                return Results.Ok(new
                {
                    db = new { connected = canConnect, version = "EfCore" },
                    tables = new
                    {
                        users = new { count = userCount, sample = sampleUsers },
                        events = new { count = eventCount },
                        teams = new { count = teamCount },
                        participants = new { count = participantCount },
                        questions = new { count = questionCount },
                        responses = new { count = responseCount },
                        funFacts = new { count = funFactCount }
                    }
                });
            }
            catch (Exception ex)
            {
                return Results.Json(new { error = ex.Message, version = "EfCore" }, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        // Database Analysis endpoints
        api.MapGet("/db/analyze", async () =>
        {
            try
            {
                var databasePath = Path.Combine(Directory.GetCurrentDirectory(), "../data/trivia.db");
                if (!File.Exists(databasePath))
                    return Results.NotFound(new { error = "Database file not found", path = databasePath });

                using var connection = new Microsoft.Data.Sqlite.SqliteConnection($"Data Source={databasePath}");
                await connection.OpenAsync();

                // Get all tables
                var tablesCommand = connection.CreateCommand();
                tablesCommand.CommandText = @"
                    SELECT name, sql 
                    FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                    ORDER BY name";

                var tables = new List<object>();
                using (var reader = await tablesCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var tableName = reader.GetString(0); // name column
                        var createSql = reader.GetString(1); // sql column
                        
                        // Get row count for this table
                        var countCommand = connection.CreateCommand();
                        countCommand.CommandText = $"SELECT COUNT(*) FROM [{tableName}]";
                        var rowCount = 0;
                        try
                        {
                            rowCount = Convert.ToInt32(await countCommand.ExecuteScalarAsync());
                        }
                        catch
                        {
                            rowCount = 0; // If we can't count, assume 0
                        }

                        tables.Add(new
                        {
                            name = tableName,
                            rowCount = rowCount,
                            createSql = createSql
                        });
                    }
                }

                return Results.Ok(new
                {
                    databasePath = databasePath,
                    databaseSize = new FileInfo(databasePath).Length,
                    tableCount = tables.Count,
                    tables = tables
                });
            }
            catch (Exception ex)
            {
                return Results.Json(new { 
                    error = ex.Message, 
                    details = ex.ToString() 
                }, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/db/analyze/table/{tableName}", async (string tableName) =>
        {
            try
            {
                var databasePath = Path.Combine(Directory.GetCurrentDirectory(), "../data/trivia.db");
                if (!File.Exists(databasePath))
                    return Results.NotFound(new { error = "Database file not found", path = databasePath });

                using var connection = new Microsoft.Data.Sqlite.SqliteConnection($"Data Source={databasePath}");
                await connection.OpenAsync();

                // Validate table exists
                var tableExistsCommand = connection.CreateCommand();
                tableExistsCommand.CommandText = @"
                    SELECT COUNT(*) 
                    FROM sqlite_master 
                    WHERE type='table' AND name = @tableName";
                tableExistsCommand.Parameters.AddWithValue("@tableName", tableName);
                
                var tableExists = Convert.ToInt32(await tableExistsCommand.ExecuteScalarAsync()) > 0;
                if (!tableExists)
                    return Results.NotFound(new { error = "Table not found", tableName = tableName });

                // Get table schema
                var schemaCommand = connection.CreateCommand();
                schemaCommand.CommandText = $"PRAGMA table_info([{tableName}])";
                
                var columns = new List<object>();
                using (var reader = await schemaCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        columns.Add(new
                        {
                            cid = reader.GetInt32(0),          // cid
                            name = reader.GetString(1),        // name  
                            type = reader.GetString(2),        // type
                            notNull = reader.GetInt32(3) == 1, // notnull (SQLite boolean as int)
                            defaultValue = reader.IsDBNull(4) ? null : reader.GetValue(4), // dflt_value
                            primaryKey = reader.GetInt32(5) == 1 // pk (SQLite boolean as int)
                        });
                    }
                }

                // Get row count
                var countCommand = connection.CreateCommand();
                countCommand.CommandText = $"SELECT COUNT(*) FROM [{tableName}]";
                var rowCount = Convert.ToInt32(await countCommand.ExecuteScalarAsync());

                // Get sample data (first 10 rows)
                var dataCommand = connection.CreateCommand();
                dataCommand.CommandText = $"SELECT * FROM [{tableName}] LIMIT 10";
                
                var sampleData = new List<Dictionary<string, object?>>();
                using (var reader = await dataCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var row = new Dictionary<string, object?>();
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var fieldName = reader.GetName(i);
                            var fieldValue = reader.IsDBNull(i) ? null : reader.GetValue(i);
                            row[fieldName] = fieldValue;
                        }
                        sampleData.Add(row);
                    }
                }

                // Get indexes
                var indexCommand = connection.CreateCommand();
                indexCommand.CommandText = $"PRAGMA index_list([{tableName}])";
                
                var indexes = new List<object>();
                using (var reader = await indexCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var indexName = reader.GetString(1);       // name
                        var isUnique = reader.GetInt32(2) == 1;    // unique (SQLite boolean as int)
                        
                        // Get index details
                        var indexInfoCommand = connection.CreateCommand();
                        indexInfoCommand.CommandText = $"PRAGMA index_info([{indexName}])";
                        
                        var indexColumns = new List<string>();
                        using (var indexReader = await indexInfoCommand.ExecuteReaderAsync())
                        {
                            while (await indexReader.ReadAsync())
                            {
                                indexColumns.Add(indexReader.GetString(2)); // name column (index 2 in index_info)
                            }
                        }

                        indexes.Add(new
                        {
                            name = indexName,
                            unique = isUnique,
                            columns = indexColumns
                        });
                    }
                }

                // Get foreign keys
                var foreignKeyCommand = connection.CreateCommand();
                foreignKeyCommand.CommandText = $"PRAGMA foreign_key_list([{tableName}])";
                
                var foreignKeys = new List<object>();
                using (var reader = await foreignKeyCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        foreignKeys.Add(new
                        {
                            id = reader.GetInt32(0),     // id
                            seq = reader.GetInt32(1),    // seq
                            table = reader.GetString(2), // table
                            from = reader.GetString(3),  // from
                            to = reader.GetString(4),    // to
                            onUpdate = reader.GetString(5), // on_update
                            onDelete = reader.GetString(6), // on_delete
                            match = reader.GetString(7)     // match
                        });
                    }
                }

                return Results.Ok(new
                {
                    tableName = tableName,
                    rowCount = rowCount,
                    columnCount = columns.Count,
                    columns = columns,
                    indexes = indexes,
                    foreignKeys = foreignKeys,
                    sampleData = sampleData
                });
            }
            catch (Exception ex)
            {
                return Results.Json(new { 
                    error = ex.Message, 
                    details = ex.ToString(),
                    tableName = tableName
                }, statusCode: StatusCodes.Status500InternalServerError);
            }
        });
    }
}

// DTOs for API compatibility
public record LoginRequest(string Username, string Password);
public record RegisterRequest(string Email, string Password, string Name);
public record ProfileUpdate(string FullName, string Email, string Username);
public record CreateEventRequest(string Title, string? Description, string EventType, int MaxParticipants, string Difficulty, string? Status, string? QrCode, DateTime? EventDate, string? EventTime, string? Location, string? SponsoringOrganization, string? Settings);
public record EventStatusUpdate(string Status);
public record ReorderQuestionsRequest(List<string> QuestionOrder);
public record UpdateQuestion(string Question, string Type, List<string>? Options, string CorrectAnswer, string Difficulty, string? Category, string? Explanation, int? TimeLimit, int? OrderIndex, bool? AiGenerated, string? BackgroundImageUrl, SelectedImageData? SelectedImage);

public record SelectedImageData(string Id, string Author, string AuthorUrl, string PhotoUrl, string DownloadUrl);

public record SaveEventImageRequest(string UnsplashImageId, string? SizeVariant, string? UsageContext, string? SearchContext);
public record CreateTeamRequest(string Name, int? TableNumber);
public record JoinEventRequest(string Name, string? TeamAction, string? TeamIdentifier);
public record SwitchTeamRequest(string? TeamId);
public record SubmitResponseRequest(string ParticipantId, string QuestionId, string Answer, int? ResponseTime, int? TimeRemaining);
public record CreateFunFactRequest(string Title, string Content, int? OrderIndex, bool IsActive);
public record UpdateFunFactRequest(string? Title, string? Content, int? OrderIndex, bool? IsActive);
public record GenerateCopyRequest(string? Type);

// CORS filter for API endpoints
class CorsFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var res = await next(context);
        return res;
    }
}

// New DTOs specific to EF Core endpoints
public record GenerateQuestionsRequest(string EventId, string Topic, string? Type, int Count);
public record BulkInsertQuestionsRequest(string EventId, List<BulkQuestionData> Questions);
public record BulkQuestionData(string Question, string Type, List<string>? Options, string CorrectAnswer, string? Difficulty, string? Category, string? Explanation, bool? AiGenerated);
