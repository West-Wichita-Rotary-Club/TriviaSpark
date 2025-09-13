using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Utils;
using Microsoft.EntityFrameworkCore;

namespace TriviaSpark.Api;

public static class EfCoreApiEndpoints
{
    public static void MapEfCoreApiEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api").RequireCors("ApiCors").AddEndpointFilter(new CorsFilter());
        var apiV2 = app.MapGroup("/api/v2").RequireCors("ApiCors").AddEndpointFilter(new CorsFilter());

        // Health check - migrated to EF Core with enhanced diagnostics
        app.MapGet("/health", async (TriviaSparkDbContext db, ILogger<Program> logger) =>
        {
            var healthStatus = new
            {
                status = "unknown",
                database = new { },
                timestamp = DateTimeOffset.UtcNow,
                version = "1.0.0-EfCore-Anonymous",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                checks = new List<object>()
            };

            var checks = new List<object>();
            bool isHealthy = true;

            try
            {
                // Basic API health check
                checks.Add(new { 
                    name = "api", 
                    status = "healthy", 
                    message = "API is responding (anonymous mode)" 
                });

                // Database connectivity check
                try
                {
                    var canConnect = await db.Database.CanConnectAsync();
                    if (canConnect)
                    {
                        checks.Add(new { 
                            name = "database_connectivity", 
                            status = "healthy", 
                            message = "Database connection successful" 
                        });

                        // Data integrity checks
                        try
                        {
                            var userCount = await db.Users.CountAsync();
                            var eventCount = await db.Events.CountAsync();
                            
                            checks.Add(new { 
                                name = "database_data", 
                                status = "healthy", 
                                message = $"Data accessible - {userCount} users, {eventCount} events",
                                data = new { userCount, eventCount }
                            });
                        }
                        catch (Exception dataEx)
                        {
                            logger.LogWarning(dataEx, "Health check - database data access failed");
                            checks.Add(new { 
                                name = "database_data", 
                                status = "degraded", 
                                message = "Database connected but data access failed",
                                error = dataEx.Message
                            });
                            // Don't mark as unhealthy for data access issues, just degraded
                        }
                    }
                    else
                    {
                        logger.LogError("Health check - database connection failed");
                        checks.Add(new { 
                            name = "database_connectivity", 
                            status = "unhealthy", 
                            message = "Cannot connect to database" 
                        });
                        isHealthy = false;
                    }
                }
                catch (Exception dbEx)
                {
                    logger.LogError(dbEx, "Health check - database check exception");
                    checks.Add(new { 
                        name = "database_connectivity", 
                        status = "unhealthy", 
                        message = "Database check failed",
                        error = dbEx.Message
                    });
                    isHealthy = false;
                }

                // Memory check
                try
                {
                    var workingSet = GC.GetTotalMemory(false);
                    var workingSetMB = workingSet / 1024 / 1024;
                    
                    var memoryStatus = workingSetMB > 500 ? "degraded" : "healthy";
                    if (workingSetMB > 1000)
                    {
                        memoryStatus = "unhealthy";
                        isHealthy = false;
                    }

                    checks.Add(new { 
                        name = "memory", 
                        status = memoryStatus, 
                        message = $"Memory usage: {workingSetMB} MB",
                        workingSetMB
                    });
                }
                catch (Exception memEx)
                {
                    logger.LogWarning(memEx, "Health check - memory check failed");
                    checks.Add(new { 
                        name = "memory", 
                        status = "degraded", 
                        message = "Memory check failed",
                        error = memEx.Message
                    });
                }

                var result = new
                {
                    status = isHealthy ? "healthy" : "unhealthy",
                    timestamp = DateTimeOffset.UtcNow,
                    version = "1.0.0-EfCore-Anonymous",
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    checks = checks
                };

                var statusCode = isHealthy ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable;
                return Results.Json(result, statusCode: statusCode);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Health check failed with unexpected error");
                return Results.Json(new { 
                    status = "unhealthy", 
                    error = "Health check failed",
                    details = ex.Message,
                    timestamp = DateTimeOffset.UtcNow,
                    version = "1.0.0-EfCore-Anonymous",
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                    checks = new[] { new { 
                        name = "health_check", 
                        status = "unhealthy", 
                        message = "Health check system failed",
                        error = ex.Message
                    }}
                }, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        }).WithTags("Health").AllowAnonymous().RequireCors("ApiCors");

        // Dashboard endpoints - no auth required
        api.MapGet("/dashboard/stats", async (IEfCoreEventService eventService, IEfCoreParticipantService participantService, IEfCoreUserService userService, ILogger<Program> logger) =>
        {
            try
            {
                // Get total stats from all events and users
                var totalUsers = await userService.GetUserCountAsync();
                
                // Get all events across all hosts by querying the database directly
                var allEvents = await eventService.GetPublicUpcomingEventsAsync(1000); // Get all events
                var totalEvents = allEvents.Count;
                var activeEvents = allEvents.Count(e => e.Status == "active" || e.Status == "started");

                // Get total participants across all events
                var totalParticipants = 0;
                foreach (var eventItem in allEvents)
                {
                    var eventParticipants = await participantService.GetParticipantsByEventAsync(eventItem.Id);
                    totalParticipants += eventParticipants.Count(p => p.IsActive);
                }

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
                logger.LogError(ex, "Failed to retrieve dashboard stats");
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/dashboard/insights", (ILogger<Program> logger) =>
        {
            try
            {
                // Placeholder insights - implement later
                var insights = new { popularEventTypes = new string[0], averageParticipants = 0 };
                return Results.Ok(insights);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve dashboard insights");
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Events endpoints - no auth required
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

        api.MapGet("/events", async (IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            try
            {
                // Return all public events since no authentication is required
                var events = await eventService.GetPublicUpcomingEventsAsync(100);
                return Results.Ok(events);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve events");
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/active", async (IEfCoreEventService eventService, TriviaSparkDbContext db, ILogger<Program> logger) =>
        {
            try
            {
                // Get all active events by querying database directly
                var activeEvents = await db.Events
                    .Where(e => e.Status == "active" || e.Status == "started")
                    .ToListAsync();

                return Results.Ok(activeEvents);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve active events");
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/upcoming", async ([FromQuery] long? fromEpochMs, IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            try
            {
                // Return all upcoming events
                var events = await eventService.GetPublicUpcomingEventsAsync(100);
                return Results.Ok(events);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve upcoming events");
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events", async ([FromBody] CreateEventRequest body, IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Title))
                return Results.BadRequest(new { error = "Event title is required" });

            try
            {
                // Use a default host ID since no authentication is required
                var defaultHostId = "anonymous-host";

                // Check for duplicate event title for this host
                var existingEvents = await eventService.GetEventsForHostAsync(defaultHostId);
                var duplicateTitle = existingEvents.FirstOrDefault(e => 
                    e.Title.Trim().Equals(body.Title.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    e.Status != "cancelled"
                );
                if (duplicateTitle != null)
                {
                    logger.LogWarning("Event creation failed - duplicate title: {Title} for anonymous host", body.Title);
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
                    HostId = defaultHostId,
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
                logger.LogInformation("Event created successfully: {EventId} ({Title}) for anonymous host", created.Id, created.Title);
                return Results.Created($"/api/v2/events/{created.Id}", created);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                // Database constraint violation (like duplicate ID/key)
                if (ex.InnerException?.Message?.Contains("UNIQUE constraint failed") == true)
                {
                    logger.LogWarning(ex, "Event creation failed - database constraint violation for title: {Title}", body.Title);
                    return Results.BadRequest(new { error = "An event with this information already exists" });
                }
                
                logger.LogError(ex, "Database error during event creation for title: {Title}", body.Title);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to create event with title: {Title}", body.Title);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}", async (string id, IEfCoreEventService eventService, ILoggingService loggingService) =>
        {
            var operationName = "GetEventById";
            using (loggingService.BeginScope(operationName))
            {
                try
                {
                    loggingService.LogApiCall($"api/events/{id}", "GET", new { id });
                    
                    var result = await loggingService.LogPerformanceAsync(operationName, async () =>
                    {
                        loggingService.LogDatabaseOperation("SELECT", "Events", new { id });
                        return await eventService.GetEventByIdAsync(id);
                    });

                    if (result == null)
                    {
                        loggingService.LogBusinessEvent("EventNotFound", new { EventId = id });
                        return Results.NotFound(new { error = "Event not found" });
                    }

                    loggingService.LogBusinessEvent("EventRetrieved", new { EventId = id, EventTitle = result.Title });
                    return Results.Ok(result);
                }
                catch (Exception ex)
                {
                    loggingService.LogError(ex, operationName, new { id });
                    return Results.StatusCode(StatusCodes.Status500InternalServerError);
                }
            }
        });

        api.MapPut("/events/{id}", async (string id, [FromBody] System.Text.Json.JsonElement body, IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Event update failed - event not found: {EventId}", id);
                    return Results.NotFound(new { error = "Event not found" });
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

                // Save the updated event
                var updatedEvent = await eventService.UpdateEventAsync(eventEntity);
                logger.LogInformation("Event updated successfully: {EventId} ({Title})", id, updatedEvent.Title);
                return Results.Ok(updatedEvent);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to update event {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Team endpoints - no auth required
        api.MapGet("/events/{id}/teams", async (string id, IEfCoreEventService eventService, IEfCoreTeamService teamService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Teams request failed - event not found: {EventId}", id);
                    return Results.NotFound(new { error = "Event not found" });
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
                logger.LogError(ex, "Failed to retrieve teams for event {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/{id}/teams", async (string id, [FromBody] CreateTeamRequest body, IEfCoreEventService eventService, IEfCoreTeamService teamService, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { error = "Team name is required" });

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Team creation failed - event not found: {EventId}", id);
                    return Results.NotFound(new { error = "Event not found" });
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
                logger.LogError(ex, "Failed to create team {TeamName} in event {EventId}", body.Name, id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Questions endpoints - no auth required
        api.MapGet("/events/{id}/questions", async (string id, IEfCoreEventService eventService, IEfCoreQuestionService questionService, ILogger<Program> logger) =>
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
                        QuestionType = question.QuestionType,
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
                        QuestionType = question.QuestionType,
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

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Questions request failed - event not found: {EventId}", id);
                    return Results.NotFound(new { error = "Event not found" });
                }

                var questions = await questionService.GetQuestionsForEventAsync(id);
                var parsedQuestions = questions.Select(ParseQuestionOptions).ToList();
                return Results.Ok(parsedQuestions);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve questions for event {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/events/{id}/questions/reorder", async (string id, [FromBody] ReorderQuestionsRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Questions reorder failed - event not found: {EventId}", id);
                    return Results.NotFound(new { error = "Event not found" });
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
                logger.LogError(ex, "Failed to reorder questions for event {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/questions/{id}", async (string id, [FromBody] UpdateQuestion body, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IEventImageService eventImageService, ILogger<Program> logger) =>
        {
            try
            {
                logger.LogInformation("Updating question {QuestionId}, SelectedImage provided: {HasSelectedImage}", id, body.SelectedImage != null);
                if (body.SelectedImage != null)
                {
                    logger.LogInformation("SelectedImage details: Id={ImageId}, Author={Author}", body.SelectedImage.Id, body.SelectedImage.Author);
                }

                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("Question not found for update: {QuestionId}", id);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null)
                {
                    logger.LogWarning("Event not found for question {QuestionId}: {EventId}", id, question.EventId);
                    return Results.NotFound(new { error = "Event not found" });
                }

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
                question.QuestionType = body.QuestionType ?? question.QuestionType;

                // Update question first to ensure it exists in the database
                var updated = await questionService.UpdateQuestionAsync(question);

                // Handle EventImage creation if SelectedImage data is provided - do this AFTER the question is updated
                if (body.SelectedImage != null)
                {
                    try
                    {
                        logger.LogInformation("Creating EventImage for question {QuestionId} with image {ImageId}", question.Id, body.SelectedImage.Id);
                        var createImageRequest = new CreateEventImageRequest
                        {
                            QuestionId = question.Id,
                            UnsplashImageId = body.SelectedImage.Id,
                            SizeVariant = "regular",
                            UsageContext = "question_background",
                            SelectedByUserId = "anonymous" // Default user since no auth
                        };
                        var eventImage = await eventImageService.SaveImageForQuestionAsync(createImageRequest);
                        logger.LogInformation("EventImage creation result: {Success}", eventImage != null ? "Success" : "Failed");
                    }
                    catch (Exception imageEx)
                    {
                        // Log the image error but don't fail the entire question update
                        logger.LogError(imageEx, "Failed to save EventImage for question {QuestionId}, but question update succeeded", question.Id);
                    }
                }
                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating question {QuestionId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/questions/{id}", async (string id, IEfCoreEventService eventService, IEfCoreQuestionService questionService, ILogger<Program> logger) =>
        {
            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("Question delete failed - question not found: {QuestionId}", id);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null)
                {
                    logger.LogWarning("Question delete failed - event not found: {EventId}", question.EventId);
                    return Results.NotFound(new { error = "Event not found" });
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
                logger.LogError(ex, "Failed to delete question {QuestionId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // EventImages for questions - no auth required
        api.MapGet("/questions/{id}/eventimage", async (string id, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IEventImageService eventImageService, ILogger<Program> logger) =>
        {
            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("EventImage request failed - question not found: {QuestionId}", id);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null)
                {
                    logger.LogWarning("EventImage request failed - event not found: {EventId}", question.EventId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                var eventImage = await eventImageService.GetImageForQuestionAsync(id);
                if (eventImage == null)
                    return Results.Ok(new { eventImage = (object?)null });

                var response = eventImageService.ToEventImageResponse(eventImage);
                return Results.Ok(new { eventImage = response });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve EventImage for question {QuestionId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // PUT endpoint to save/update EventImage for a question - no auth required
        api.MapPut("/questions/{id}/eventimage", async (string id, [FromBody] SaveEventImageRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IEventImageService eventImageService, ILogger<Program> logger) =>
        {
            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                {
                    logger.LogWarning("EventImage save failed - question not found: {QuestionId}", id);
                    return Results.NotFound(new { error = "Question not found" });
                }

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null)
                {
                    logger.LogWarning("EventImage save failed - event not found: {EventId}", question.EventId);
                    return Results.NotFound(new { error = "Event not found" });
                }

                // Convert SaveEventImageRequest to CreateEventImageRequest
                var createRequest = new CreateEventImageRequest
                {
                    QuestionId = id,
                    UnsplashImageId = body.UnsplashImageId,
                    SizeVariant = body.SizeVariant ?? "regular",
                    UsageContext = body.UsageContext ?? "question_background",
                    SelectedByUserId = "anonymous", // Default user since no auth
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
                logger.LogError(ex, "Failed to save EventImage for question {QuestionId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Participants endpoints - no auth required
        api.MapGet("/events/{id}/participants", async (string id, IEfCoreEventService eventService, IEfCoreParticipantService participantService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                {
                    logger.LogWarning("Participants request failed - event not found: {EventId}", id);
                    return Results.NotFound(new { error = "Event not found" });
                }

                // public participants info
                var participants = await participantService.GetParticipantsByEventAsync(id);
                return Results.Ok(participants);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to retrieve participants for event {EventId}", id);
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

        api.MapPost("/events/join/{qrCode}", async (string qrCode, [FromBody] JoinEventRequest body, IEfCoreEventService eventService, IEfCoreParticipantService participantService, IEfCoreTeamService teamService, TriviaSparkDbContext db, HttpResponse res, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { error = "Name is required" });

            try
            {
                // Find event by QR code directly from database
                var eventEntity = await db.Events
                    .FirstOrDefaultAsync(e => e.QrCode == qrCode);

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

        api.MapDelete("/events/{id}/participants/inactive", async (string id, [FromQuery] int inactiveThresholdMinutes, IEfCoreEventService eventService, IEfCoreParticipantService participantService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        // Fun Facts endpoints - no auth required
        api.MapGet("/events/{id}/fun-facts", async (string id, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                var funFacts = await funFactService.GetFunFactsForEventAsync(id);
                return Results.Ok(funFacts);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get fun facts for event: {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/{id}/fun-facts", async (string id, [FromBody] CreateFunFactRequest body, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, ILogger<Program> logger) =>
        {
            if (string.IsNullOrWhiteSpace(body.Title))
                return Results.BadRequest(new { error = "Fun fact title is required" });

            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        api.MapPut("/fun-facts/{id}", async (string id, [FromBody] UpdateFunFactRequest body, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, ILogger<Program> logger) =>
        {
            try
            {
                var funFact = await funFactService.GetFunFactByIdAsync(id);
                if (funFact == null)
                    return Results.NotFound(new { error = "Fun fact not found" });

                var eventEntity = await eventService.GetEventByIdAsync(funFact.EventId);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        api.MapDelete("/fun-facts/{id}", async (string id, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, ILogger<Program> logger) =>
        {
            try
            {
                var funFact = await funFactService.GetFunFactByIdAsync(id);
                if (funFact == null)
                    return Results.NotFound(new { error = "Fun fact not found" });

                var eventEntity = await eventService.GetEventByIdAsync(funFact.EventId);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                var success = await funFactService.DeleteFunFactAsync(id);
                return success ? Results.NoContent() : Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to delete fun fact: {FunFactId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Responses endpoints - no auth required
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

        // Analytics endpoints - no auth required
        api.MapGet("/events/{id}/analytics", async (string id, IEfCoreEventService eventService, IEfCoreStorageService storageService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        api.MapGet("/events/{id}/leaderboard", async (string id, [FromQuery] string? type, IEfCoreEventService eventService, IEfCoreStorageService storageService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        api.MapGet("/events/{id}/responses/summary", async (string id, IEfCoreEventService eventService, IEfCoreStorageService storageService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                var summary = await storageService.GetResponseSummaryAsync(id);
                return Results.Ok(summary);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get response summary for event: {EventId}", id);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Event management endpoints - no auth required
        api.MapPost("/events/{id}/start", async (string id, IEfCoreEventService eventService, IEfCoreStorageService storageService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        api.MapPatch("/events/{id}/status", async (string id, [FromBody] EventStatusUpdate body, IEfCoreEventService eventService, ILogger<Program> logger) =>
        {
            try
            {
                var eventEntity = await eventService.GetEventByIdAsync(id);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

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

        // AI Copy generation (placeholder) - no auth required
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

        // Questions generation and bulk endpoints - no auth required
        api.MapPost("/events/generate-questions", async ([FromBody] GenerateQuestionsRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService, IOpenAIService openAIService) =>
        {
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
                        OrderIndex = 0, // Will be set by the service
                        QuestionType = body.QuestionType ?? "game",
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
                        QuestionType = q.QuestionType ?? "game",
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
        api.MapGet("/events/{qrCode}/teams-public", async (string qrCode, IEfCoreEventService eventService, IEfCoreTeamService teamService, TriviaSparkDbContext db, ILogger<Program> logger) =>
        {
            try
            {
                // Find event by QR code directly from database
                var eventEntity = await db.Events
                    .FirstOrDefaultAsync(e => e.QrCode == qrCode);

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

        // Debug endpoints - no auth required
        api.MapGet("/debug/cookies", (HttpRequest req) =>
        {
            return Results.Ok(new
            {
                rawCookies = req.Headers["Cookie"].ToString(),
                parsedCookies = req.Cookies.ToDictionary(kv => kv.Key, kv => kv.Value),
                version = "EfCore-Anonymous"
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
                    db = new { connected = canConnect, version = "EfCore-Anonymous" },
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
                return Results.Json(new { error = ex.Message, version = "EfCore-Anonymous" }, statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        // Database Analysis endpoints - no auth required
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
                
                var sampleData = new List<Dictionary<string, object?>>(10);
                using (var reader = await dataCommand.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var row = new Dictionary<string, object?>(reader.FieldCount);
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
public record BootstrapAdminRequest(string Username);
public record ProfileUpdate(string FullName, string Email, string Username);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record CreateEventRequest(string Title, string? Description, string EventType, int MaxParticipants, string Difficulty, string? Status, string? QrCode, DateTime? EventDate, string? EventTime, string? Location, string? SponsoringOrganization, string? Settings);
public record EventStatusUpdate(string Status);
public record ReorderQuestionsRequest(List<string> QuestionOrder);
public record UpdateQuestion(string Question, string Type, List<string>? Options, string CorrectAnswer, string Difficulty, string? Category, string? Explanation, int? TimeLimit, int? OrderIndex, bool? AiGenerated, string? BackgroundImageUrl, SelectedImageData? SelectedImage, string? QuestionType);

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
public record GenerateQuestionsRequest(string EventId, string Topic, string? Type, int Count, string? QuestionType);
public record BulkInsertQuestionsRequest(string EventId, List<BulkQuestionData> Questions);
public record BulkQuestionData(string Question, string Type, List<string>? Options, string CorrectAnswer, string? Difficulty, string? Category, string? Explanation, bool? AiGenerated, string? QuestionType);
