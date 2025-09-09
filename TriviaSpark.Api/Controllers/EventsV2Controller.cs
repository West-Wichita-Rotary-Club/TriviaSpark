using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services.EfCore;
using TriviaSpark.Api.Services;

namespace TriviaSpark.Api.Controllers;

/// <summary>
/// Migration example: Teams endpoint using EF Core instead of Dapper
/// This demonstrates how to replace the existing Dapper-based minimal API endpoints
/// Enhanced with robust logging capabilities
/// </summary>
[ApiController]
[Route("api/v2/events")]
public class EventsV2Controller : ControllerBase
{
    private readonly IEfCoreStorageService _efCoreStorage;
    private readonly ILoggingService _loggingService;

    public EventsV2Controller(IEfCoreStorageService efCoreStorage, ILoggingService loggingService)
    {
        _efCoreStorage = efCoreStorage;
        _loggingService = loggingService;
    }

    /// <summary>
    /// Get teams for an event using EF Core (replaces Dapper version)
    /// This endpoint demonstrates the migration from Dapper to EF Core
    /// </summary>
    [HttpGet("{eventId}/teams")]
    public async Task<IActionResult> GetTeams(string eventId)
    {
        var operationName = "GetEventTeams";
        
        using (_loggingService.BeginScope(operationName))
        {
            _loggingService.LogApiCall($"api/v2/events/{eventId}/teams", "GET", new { eventId });

            try
            {
                var result = await _loggingService.LogPerformanceAsync(operationName, async () =>
                {
                    _loggingService.LogDatabaseOperation("SELECT", "Teams", new { eventId });
                    return await _efCoreStorage.GetTeamsForEventAsync(eventId);
                });

                // Return exactly the same format as the original Dapper endpoint
                // This ensures API compatibility during migration
                var teamRows = result.Select(t => new
                {
                    Id = t.Id,
                    EventId = t.EventId,
                    Name = t.Name,
                    TableNumber = t.TableNumber,
                    MaxMembers = t.MaxMembers,
                    CreatedAt = ((DateTimeOffset)t.CreatedAt).ToUnixTimeSeconds().ToString(),
                    MemberCount = t.Participants.Count
                }).ToList();

                _loggingService.LogBusinessEvent("TeamsRetrieved", new { 
                    EventId = eventId, 
                    TeamCount = teamRows.Count,
                    TotalMembers = teamRows.Sum(t => t.MemberCount)
                });

                return Ok(teamRows);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex, operationName, new { eventId });
                
                // Better error handling than the original Dapper version
                return StatusCode(500, new { 
                    error = "Failed to retrieve teams", 
                    details = ex.Message 
                });
            }
        }
    }

    /// <summary>
    /// Get questions for an event using EF Core (replaces Dapper version)
    /// </summary>
    [HttpGet("{eventId}/questions")]
    public async Task<IActionResult> GetQuestions(string eventId)
    {
        var operationName = "GetEventQuestions";
        
        using (_loggingService.BeginScope(operationName))
        {
            _loggingService.LogApiCall($"api/v2/events/{eventId}/questions", "GET", new { eventId });

            try
            {
                var result = await _loggingService.LogPerformanceAsync(operationName, async () =>
                {
                    _loggingService.LogDatabaseOperation("SELECT", "Questions", new { eventId });
                    return await _efCoreStorage.GetQuestionsForEventAsync(eventId);
                });

                var questionRows = result.Select(q => new
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

                _loggingService.LogBusinessEvent("QuestionsRetrieved", new { 
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
                
                return StatusCode(500, new { 
                    error = "Failed to retrieve questions", 
                    details = ex.Message 
                });
            }
        }
    }
}
