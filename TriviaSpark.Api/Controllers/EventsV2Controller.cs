using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services.EfCore;

namespace TriviaSpark.Api.Controllers;

/// <summary>
/// Migration example: Teams endpoint using EF Core instead of Dapper
/// This demonstrates how to replace the existing Dapper-based minimal API endpoints
/// </summary>
[ApiController]
[Route("api/v2/events")]
public class EventsV2Controller : ControllerBase
{
    private readonly IEfCoreStorageService _efCoreStorage;

    public EventsV2Controller(IEfCoreStorageService efCoreStorage)
    {
        _efCoreStorage = efCoreStorage;
    }

    /// <summary>
    /// Get teams for an event using EF Core (replaces Dapper version)
    /// This endpoint demonstrates the migration from Dapper to EF Core
    /// </summary>
    [HttpGet("{eventId}/teams")]
    public async Task<IActionResult> GetTeams(string eventId)
    {
        try
        {
            var teams = await _efCoreStorage.GetTeamsForEventAsync(eventId);
            
            // Return exactly the same format as the original Dapper endpoint
            // This ensures API compatibility during migration
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

            return Ok(teamRows);
        }
        catch (Exception ex)
        {
            // Better error handling than the original Dapper version
            return StatusCode(500, new { 
                error = "Failed to retrieve teams", 
                details = ex.Message 
            });
        }
    }

    /// <summary>
    /// Get questions for an event using EF Core (replaces Dapper version)
    /// </summary>
    [HttpGet("{eventId}/questions")]
    public async Task<IActionResult> GetQuestions(string eventId)
    {
        try
        {
            var questions = await _efCoreStorage.GetQuestionsForEventAsync(eventId);
            
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

            return Ok(questionRows);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                error = "Failed to retrieve questions", 
                details = ex.Message 
            });
        }
    }
}
