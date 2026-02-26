using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for trivia response management operations using Entity Framework Core.
/// </summary>
public interface IEfCoreResponseService
{
    /// <summary>Gets all responses for a specific question, ordered by submission time.</summary>
    Task<IList<Response>> GetResponsesForQuestionAsync(string questionId);
    /// <summary>Gets all responses from a specific participant, ordered by question order.</summary>
    Task<IList<Response>> GetResponsesForParticipantAsync(string participantId);
    /// <summary>Gets a response by ID with participant and question included.</summary>
    Task<Response?> GetResponseByIdAsync(string responseId);
    /// <summary>Creates a new response and sets its submission timestamp.</summary>
    Task<Response> CreateResponseAsync(Response response);
    /// <summary>Updates an existing response entity.</summary>
    Task<Response> UpdateResponseAsync(Response response);
    /// <summary>Deletes a response by ID. Returns false if not found.</summary>
    Task<bool> DeleteResponseAsync(string responseId);
}

/// <summary>
/// EF Core implementation of trivia response management.
/// Provides CRUD operations for participant answers to trivia questions.
/// </summary>
public class EfCoreResponseService : IEfCoreResponseService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreResponseService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IList<Response>> GetResponsesForQuestionAsync(string questionId)
    {
        return await _context.Responses
            .Include(r => r.Participant)
            .ThenInclude(p => p.Team)
            .Where(r => r.QuestionId == questionId)
            .OrderBy(r => r.SubmittedAt)
            .ToListAsync();
    }

    public async Task<IList<Response>> GetResponsesForParticipantAsync(string participantId)
    {
        return await _context.Responses
            .Include(r => r.Question)
            .Where(r => r.ParticipantId == participantId)
            .OrderBy(r => r.Question.OrderIndex)
            .ThenBy(r => r.SubmittedAt)
            .ToListAsync();
    }

    public async Task<Response?> GetResponseByIdAsync(string responseId)
    {
        return await _context.Responses
            .Include(r => r.Participant)
            .Include(r => r.Question)
            .FirstOrDefaultAsync(r => r.Id == responseId);
    }

    public async Task<Response> CreateResponseAsync(Response response)
    {
        response.SubmittedAt = DateTime.UtcNow;
        _context.Responses.Add(response);
        await _context.SaveChangesAsync();
        return response;
    }

    public async Task<Response> UpdateResponseAsync(Response response)
    {
        _context.Responses.Update(response);
        await _context.SaveChangesAsync();
        return response;
    }

    public async Task<bool> DeleteResponseAsync(string responseId)
    {
        var response = await _context.Responses.FindAsync(responseId);
        if (response == null)
            return false;

        _context.Responses.Remove(response);
        await _context.SaveChangesAsync();
        return true;
    }
}
