using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Mvc;
// using Microsoft.AspNetCore.SignalR; // Disabled - SignalR integration pending
using TriviaSpark.Api.Services;
using TriviaSpark.Api.Services.EfCore;
// using TriviaSpark.Api.SignalR; // Disabled - SignalR integration pending
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api;

public static class EfCoreApiEndpoints
{
    public static void MapEfCoreApiEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api").RequireCors("ApiCors").AddEndpointFilter(new CorsFilter());

        // Health check - migrated to EF Core
        api.MapGet("/health", (TriviaSparkDbContext db) =>
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
                return Results.Json(new { 
                    status = "unhealthy", 
                    error = ex.Message,
                    timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    version = "EfCore"
                }, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
        });

        // Authentication endpoints - migrated to EF Core
        api.MapPost("/auth/login", async ([FromBody] LoginRequest body, ISessionService sessions, IEfCoreUserService userService, HttpResponse res) =>
        {
            if (string.IsNullOrWhiteSpace(body.Username) || string.IsNullOrWhiteSpace(body.Password))
                return Results.BadRequest(new { error = "Username and password are required" });

            try
            {
                var user = await userService.GetUserByUsernameAsync(body.Username);
                if (user == null)
                    return Results.Unauthorized();

                // Simple password verification (in production, use proper hashing)
                if (user.Password != body.Password)
                    return Results.Unauthorized();

                var sessionId = sessions.Create(user.Id);
                res.Cookies.Append("sessionId", sessionId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // Set to true in production with HTTPS
                    SameSite = SameSiteMode.Strict,
                    MaxAge = TimeSpan.FromHours(24)
                });

                return Results.Ok(new
                {
                    user = new { id = user.Id, username = user.Username, fullName = user.FullName, email = user.Email },
                    sessionId,
                    message = "Login successful"
                });
            }
            catch (Exception ex)
            {
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

        api.MapGet("/auth/me", async (ISessionService sessions, IEfCoreUserService userService, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var user = await userService.GetUserByIdAsync(userId);
                if (user == null)
                    return Results.Unauthorized();

                return Results.Ok(new { 
                    user = new { id = user.Id, username = user.Username, fullName = user.FullName, email = user.Email }
                });
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/auth/profile", async ([FromBody] ProfileUpdate body, ISessionService sessions, IEfCoreUserService userService, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var user = await userService.GetUserByIdAsync(userId);
                if (user == null)
                    return Results.Unauthorized();

                // Update user profile
                user.FullName = body.FullName ?? user.FullName;
                user.Email = body.Email ?? user.Email;
                user.Username = body.Username ?? user.Username;

                var updated = await userService.UpdateUserAsync(user);
                return Results.Ok(new { id = updated.Id, username = updated.Username, fullName = updated.FullName, email = updated.Email });
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Dashboard endpoints - placeholder for now
        api.MapGet("/dashboard/stats", async (ISessionService sessions, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                // Placeholder stats - implement later
                var stats = new { totalEvents = 0, activeEvents = 0, totalParticipants = 0 };
                return Results.Ok(stats);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/dashboard/insights", async (ISessionService sessions, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Events endpoints - migrated to EF Core
        // Public anonymous events list for homepage (sanitized)
        api.MapGet("/events/home", async ([FromQuery] int? limit, IEfCoreEventService eventService) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        }).AllowAnonymous();

        api.MapGet("/events", async (ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/active", async (ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/upcoming", async ([FromQuery] long? fromEpochMs, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events", async ([FromBody] CreateEventRequest body, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            if (string.IsNullOrWhiteSpace(body.Title))
                return Results.BadRequest(new { error = "Event title is required" });

            try
            {
                var newEvent = new Event
                {
                    Id = Guid.NewGuid().ToString(),
                    Title = body.Title,
                    Description = body.Description,
                    HostId = userId,
                    EventType = body.EventType ?? "general",
                    MaxParticipants = body.MaxParticipants,
                    Difficulty = body.Difficulty ?? "medium",
                    Status = body.Status ?? "draft",
                    QrCode = body.QrCode ?? Guid.NewGuid().ToString("N")[..8],
                    EventDate = body.EventDate,
                    EventTime = body.EventTime,
                    Location = body.Location,
                    SponsoringOrganization = body.SponsoringOrganization,
                    Settings = body.Settings,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await eventService.CreateEventAsync(newEvent);
                return Results.Created($"/api/v2/events/{created.Id}", created);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}", async (string id, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
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

                return Results.Ok(eventEntity);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/events/{id}", async (string id, [FromBody] object body, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
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

                // Update event - for now, just return the existing event
                // TODO: Implement proper event update logic
                return Results.Ok(eventEntity);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Team endpoints - migrated to EF Core
        api.MapGet("/events/{id}/teams", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreTeamService teamService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/{id}/teams", async (string id, [FromBody] CreateTeamRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreTeamService teamService, HttpRequest req) =>
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
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                // TODO: Check for duplicate team name or table number
                // var existing = await teamService.GetTeamByNameOrTableAsync(id, body.Name, body.TableNumber);
                // if (existing != null)
                //     return Results.BadRequest(new { error = "Team name or table number already exists" });

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
                return Results.Created($"/api/v2/events/{id}/teams/{created.Id}", created);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Questions endpoints - migrated to EF Core
        api.MapGet("/events/{id}/questions", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req) =>
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
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var questions = await questionService.GetQuestionsForEventAsync(id);
                var parsedQuestions = questions.Select(ParseQuestionOptions).ToList();
                return Results.Ok(parsedQuestions);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/events/{id}/questions/reorder", async (string id, [FromBody] ReorderQuestionsRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req) =>
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

                // Update question order
                var success = await questionService.ReorderQuestionsAsync(body.QuestionOrder);
                if (!success)
                    return Results.BadRequest(new { error = "Failed to update question order" });

                var updatedQuestions = await questionService.GetQuestionsForEventAsync(id);
                return Results.Ok(new { message = "Question order updated successfully", questions = updatedQuestions });
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/questions/{id}", async (string id, [FromBody] UpdateQuestion body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
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

                var updated = await questionService.UpdateQuestionAsync(question);
                return Results.Ok(updated);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/questions/{id}", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreQuestionService questionService, HttpRequest req) =>
        {
            var (isValid, userId) = sessions.Validate(req.Cookies.TryGetValue("sessionId", out var sid) ? sid : null);
            if (!isValid || userId == null)
                return Results.Unauthorized();

            try
            {
                var question = await questionService.GetQuestionByIdAsync(id);
                if (question == null)
                    return Results.NotFound(new { error = "Question not found" });

                var eventEntity = await eventService.GetEventByIdAsync(question.EventId);
                if (eventEntity == null || eventEntity.HostId != userId)
                    return Results.StatusCode(StatusCodes.Status403Forbidden);

                var success = await questionService.DeleteQuestionAsync(id);
                return success ? Results.NoContent() : Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Participants endpoints - migrated to EF Core
        api.MapGet("/events/{id}/participants", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreParticipantService participantService, HttpRequest req) =>
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

                var participants = await participantService.GetParticipantsByEventAsync(id);
                return Results.Ok(participants);
            }
            catch (Exception ex)
            {
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/join/{qrCode}/check", async (string qrCode, IEfCoreEventService eventService, IEfCoreParticipantService participantService, HttpRequest req) =>
        {
            try
            {
                if (!req.Cookies.TryGetValue("participantToken", out var token))
                    return Results.NotFound(new { error = "No participant token found" });

                var participant = await participantService.GetParticipantByTokenAsync(token);
                if (participant == null)
                    return Results.NotFound(new { error = "Participant not found" });

                var eventEntity = await eventService.GetEventByIdAsync(participant.EventId);
                if (eventEntity == null || eventEntity.QrCode != qrCode)
                    return Results.NotFound(new { error = "Participant not found for this event" });

                // Get team if participant has one
                object? team = null;
                if (!string.IsNullOrWhiteSpace(participant.TeamId))
                {
                    // Note: Would need team service here
                    // team = await teamService.GetTeamByIdAsync(participant.TeamId);
                }

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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/join/{qrCode}", async (string qrCode, [FromBody] JoinEventRequest body, IEfCoreEventService eventService, IEfCoreParticipantService participantService, IEfCoreTeamService teamService, HttpResponse res) =>
        {
            if (string.IsNullOrWhiteSpace(body.Name))
                return Results.BadRequest(new { error = "Name is required" });

            try
            {
                // Find event by QR code (assuming demo host for now)
                var hostEvents = await eventService.GetEventsForHostAsync("mark-user-id");
                var eventEntity = hostEvents.FirstOrDefault(e => e.QrCode == qrCode);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                if (eventEntity.Status == "cancelled")
                    return Results.BadRequest(new { error = "Event has been cancelled" });

                string? teamId = null;

                // Handle team actions
                if (body.TeamAction == "join" && !string.IsNullOrWhiteSpace(body.TeamIdentifier))
                {
                    var teams = await teamService.GetTeamsForEventAsync(eventEntity.Id);
                    var team = teams.FirstOrDefault(t => t.Name == body.TeamIdentifier || t.TableNumber?.ToString() == body.TeamIdentifier);
                    if (team == null)
                        return Results.NotFound(new { error = "Team not found" });

                    var members = team.Participants?.Count ?? 0;
                    if (members >= (team.MaxMembers == 0 ? 6 : team.MaxMembers))
                        return Results.BadRequest(new { error = "Team is full" });

                    teamId = team.Id;
                }
                else if (body.TeamAction == "create" && !string.IsNullOrWhiteSpace(body.TeamIdentifier))
                {
                    var teams = await teamService.GetTeamsForEventAsync(eventEntity.Id);
                    var existing = teams.FirstOrDefault(t => t.Name == body.TeamIdentifier || t.TableNumber?.ToString() == body.TeamIdentifier);
                    if (existing != null)
                        return Results.BadRequest(new { error = "Team name or table number already exists" });

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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/participants/{id}/team", async (string id, [FromBody] SwitchTeamRequest body, IEfCoreParticipantService participantService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/events/{id}/participants/inactive", async (string id, [FromQuery] int inactiveThresholdMinutes, ISessionService sessions, IEfCoreEventService eventService, IEfCoreParticipantService participantService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Fun Facts endpoints - migrated to EF Core
        api.MapGet("/events/{id}/fun-facts", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/events/{id}/fun-facts", async (string id, [FromBody] CreateFunFactRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPut("/fun-facts/{id}", async (string id, [FromBody] UpdateFunFactRequest body, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapDelete("/fun-facts/{id}", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreFunFactService funFactService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Responses endpoints - migrated to EF Core
        api.MapPost("/responses", async ([FromBody] SubmitResponseRequest body, IEfCoreQuestionService questionService, IEfCoreResponseService responseService) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Analytics endpoints - migrated to EF Core
        api.MapGet("/events/{id}/analytics", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}/leaderboard", async (string id, [FromQuery] string? type, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapGet("/events/{id}/responses/summary", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Event management endpoints - migrated to EF Core
        api.MapPost("/events/{id}/start", async (string id, ISessionService sessions, IEfCoreEventService eventService, IEfCoreStorageService storageService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPatch("/events/{id}/status", async (string id, [FromBody] EventStatusUpdate body, ISessionService sessions, IEfCoreEventService eventService, HttpRequest req) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // AI Copy generation (placeholder)
        api.MapPost("/events/{id}/generate-copy", async (string id, [FromBody] GenerateCopyRequest body, IEfCoreEventService eventService) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Questions generation and bulk endpoints
        api.MapPost("/questions/generate", async ([FromBody] GenerateQuestionsRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService) =>
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        api.MapPost("/questions/bulk", async ([FromBody] BulkInsertQuestionsRequest body, IEfCoreEventService eventService, IEfCoreQuestionService questionService) =>
        {
            try
            {
                if (string.IsNullOrWhiteSpace(body.EventId) || body.Questions == null || !body.Questions.Any())
                    return Results.BadRequest(new { error = "EventId and questions are required" });

                var eventEntity = await eventService.GetEventByIdAsync(body.EventId);
                if (eventEntity == null)
                    return Results.NotFound(new { error = "Event not found" });

                var questions = new List<Question>();
                var nextOrderIndex = await questionService.GetNextOrderIndexAsync(body.EventId);

                foreach (var q in body.Questions)
                {
                    var question = new Question
                    {
                        Id = Guid.NewGuid().ToString(),
                        EventId = body.EventId,
                        Type = q.Type,
                        QuestionText = q.Question,
                        Options = q.Options != null ? System.Text.Json.JsonSerializer.Serialize(q.Options) : null,
                        CorrectAnswer = q.CorrectAnswer,
                        Explanation = q.Explanation,
                        Points = 20, // Default points
                        TimeLimit = 30, // Default time limit
                        Difficulty = q.Difficulty ?? "medium",
                        Category = q.Category,
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
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        });

        // Public endpoints for teams (no auth required for participant access)
        api.MapGet("/events/{qrCode}/teams-public", async (string qrCode, IEfCoreEventService eventService, IEfCoreTeamService teamService) =>
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
    }
}

// DTOs for API compatibility
public record LoginRequest(string Username, string Password);
public record ProfileUpdate(string FullName, string Email, string Username);
public record CreateEventRequest(string Title, string? Description, string EventType, int MaxParticipants, string Difficulty, string? Status, string? QrCode, DateTime? EventDate, string? EventTime, string? Location, string? SponsoringOrganization, string? Settings);
public record EventStatusUpdate(string Status);
public record ReorderQuestionsRequest(List<string> QuestionOrder);
public record UpdateQuestion(string Question, string Type, List<string>? Options, string CorrectAnswer, string Difficulty, string? Category, string? Explanation, int? TimeLimit, int? OrderIndex, bool? AiGenerated);
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
public record GenerateQuestionsRequest(string EventId, string Topic, string Type, int Count);
public record BulkInsertQuestionsRequest(string EventId, List<BulkQuestionData> Questions);
public record BulkQuestionData(string Question, string Type, List<string>? Options, string CorrectAnswer, string? Difficulty, string? Category, string? Explanation, bool? AiGenerated);
