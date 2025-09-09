using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services.EfCore;
using TriviaSpark.Api.Services;

namespace TriviaSpark.Api.Controllers;

[ApiController]
[Route("api/efcore")]
public class EfCoreTestController : ControllerBase
{
    private readonly IEfCoreStorageService _efCoreStorage;
    private readonly ILoggingService _loggingService;

    public EfCoreTestController(IEfCoreStorageService efCoreStorage, ILoggingService loggingService)
    {
        _efCoreStorage = efCoreStorage;
        _loggingService = loggingService;
    }

    [HttpGet("events/{eventId}/teams")]
    public async Task<IActionResult> GetTeamsEfCore(string eventId)
    {
        var operationName = "GetTeamsEfCore";
        using (_loggingService.BeginScope(operationName))
        {
            _loggingService.LogApiCall($"api/efcore/events/{eventId}/teams", "GET", new { eventId });

            try
            {
                var teams = await _loggingService.LogPerformanceAsync(operationName, async () =>
                {
                    _loggingService.LogDatabaseOperation("SELECT", "Teams", new { eventId });
                    return await _efCoreStorage.GetTeamsForEventAsync(eventId);
                });
                
                // Convert to same format as Dapper response for comparison
                var teamRows = teams.Select(t => new
                {
                    Id = t.Id,
                    EventId = t.EventId,
                    Name = t.Name,
                    TableNumber = t.TableNumber,
                    MaxMembers = t.MaxMembers,
                    CreatedAt = ((DateTimeOffset)t.CreatedAt).ToUnixTimeSeconds().ToString(),
                    MemberCount = t.Participants.Count
                }).ToList();

                _loggingService.LogBusinessEvent("EfCoreTeamsRetrieved", new { 
                    EventId = eventId, 
                    TeamCount = teamRows.Count,
                    TotalMembers = teamRows.Sum(t => t.MemberCount)
                });

                return Ok(teamRows);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex, operationName, new { eventId });
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    [HttpGet("events/{eventId}/participants")]
    public async Task<IActionResult> GetParticipantsEfCore(string eventId)
    {
        var operationName = "GetParticipantsEfCore";
        using (_loggingService.BeginScope(operationName))
        {
            _loggingService.LogApiCall($"api/efcore/events/{eventId}/participants", "GET", new { eventId });

            try
            {
                var participants = await _loggingService.LogPerformanceAsync(operationName, async () =>
                {
                    _loggingService.LogDatabaseOperation("SELECT", "Participants", new { eventId });
                    return await _efCoreStorage.GetParticipantsForEventAsync(eventId);
                });
                
                var participantRows = participants.Select(p => new
                {
                    Id = p.Id,
                    EventId = p.EventId,
                    TeamId = p.TeamId,
                    Name = p.Name,
                    ParticipantToken = p.ParticipantToken,
                    JoinedAt = ((DateTimeOffset)p.JoinedAt).ToUnixTimeSeconds().ToString(),
                    LastActiveAt = ((DateTimeOffset)p.LastActiveAt).ToUnixTimeSeconds().ToString(),
                    IsActive = p.IsActive,
                    CanSwitchTeam = p.CanSwitchTeam
                }).ToList();

                _loggingService.LogBusinessEvent("EfCoreParticipantsRetrieved", new { 
                    EventId = eventId, 
                    ParticipantCount = participantRows.Count,
                    ActiveCount = participantRows.Count(p => p.IsActive)
                });

                return Ok(participantRows);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex, operationName, new { eventId });
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    [HttpGet("events/{eventId}/questions")]
    public async Task<IActionResult> GetQuestionsEfCore(string eventId)
    {
        var operationName = "GetQuestionsEfCore";
        using (_loggingService.BeginScope(operationName))
        {
            _loggingService.LogApiCall($"api/efcore/events/{eventId}/questions", "GET", new { eventId });

            try
            {
                var questions = await _loggingService.LogPerformanceAsync(operationName, async () =>
                {
                    _loggingService.LogDatabaseOperation("SELECT", "Questions", new { eventId });
                    return await _efCoreStorage.GetQuestionsForEventAsync(eventId);
                });
                
                var questionRows = questions.Select(q => new
                {
                    Id = q.Id,
                    EventId = q.EventId,
                    Type = q.Type,
                    Question = q.QuestionText,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    Points = q.Points,
                    TimeLimit = q.TimeLimit,
                    Difficulty = q.Difficulty,
                    Category = q.Category,
                    BackgroundImageUrl = q.BackgroundImageUrl,
                    AiGenerated = q.AiGenerated,
                    OrderIndex = q.OrderIndex,
                    CreatedAt = ((DateTimeOffset)q.CreatedAt).ToUnixTimeSeconds().ToString()
                }).ToList();

                _loggingService.LogBusinessEvent("EfCoreQuestionsRetrieved", new { 
                    EventId = eventId, 
                    QuestionCount = questionRows.Count,
                    AiGeneratedCount = questionRows.Count(q => q.AiGenerated),
                    Categories = questionRows.Select(q => q.Category).Distinct().ToList()
                });

                return Ok(questionRows);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex, operationName, new { eventId });
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    [HttpGet("events/{eventId}/fun-facts")]
    public async Task<IActionResult> GetFunFactsEfCore(string eventId)
    {
        var operationName = "GetFunFactsEfCore";
        using (_loggingService.BeginScope(operationName))
        {
            _loggingService.LogApiCall($"api/efcore/events/{eventId}/fun-facts", "GET", new { eventId });

            try
            {
                var funFacts = await _loggingService.LogPerformanceAsync(operationName, async () =>
                {
                    _loggingService.LogDatabaseOperation("SELECT", "FunFacts", new { eventId });
                    return await _efCoreStorage.GetFunFactsForEventAsync(eventId);
                });
                
                var funFactRows = funFacts.Select(f => new
                {
                    Id = f.Id,
                    EventId = f.EventId,
                    Title = f.Title,
                    Content = f.Content,
                    OrderIndex = f.OrderIndex,
                    IsActive = f.IsActive,
                    CreatedAt = ((DateTimeOffset)f.CreatedAt).ToUnixTimeSeconds().ToString()
                }).ToList();

                _loggingService.LogBusinessEvent("EfCoreFunFactsRetrieved", new { 
                    EventId = eventId, 
                    FunFactCount = funFactRows.Count,
                    ActiveCount = funFactRows.Count(f => f.IsActive)
                });

                return Ok(funFactRows);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex, operationName, new { eventId });
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
