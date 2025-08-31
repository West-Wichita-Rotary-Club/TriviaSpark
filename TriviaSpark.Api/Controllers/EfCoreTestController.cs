using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services.EfCore;

namespace TriviaSpark.Api.Controllers;

[ApiController]
[Route("api/efcore")]
public class EfCoreTestController : ControllerBase
{
    private readonly IEfCoreStorageService _efCoreStorage;

    public EfCoreTestController(IEfCoreStorageService efCoreStorage)
    {
        _efCoreStorage = efCoreStorage;
    }

    [HttpGet("events/{eventId}/teams")]
    public async Task<IActionResult> GetTeamsEfCore(string eventId)
    {
        try
        {
            var teams = await _efCoreStorage.GetTeamsForEventAsync(eventId);
            
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

            return Ok(teamRows);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("events/{eventId}/participants")]
    public async Task<IActionResult> GetParticipantsEfCore(string eventId)
    {
        try
        {
            var participants = await _efCoreStorage.GetParticipantsForEventAsync(eventId);
            
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

            return Ok(participantRows);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("events/{eventId}/questions")]
    public async Task<IActionResult> GetQuestionsEfCore(string eventId)
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
            return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
        }
    }

    [HttpGet("events/{eventId}/fun-facts")]
    public async Task<IActionResult> GetFunFactsEfCore(string eventId)
    {
        try
        {
            var funFacts = await _efCoreStorage.GetFunFactsForEventAsync(eventId);
            
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

            return Ok(funFactRows);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
        }
    }
}
