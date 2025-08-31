using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreResponseService
{
    Task<IList<Response>> GetResponsesForQuestionAsync(string questionId);
    Task<IList<Response>> GetResponsesForParticipantAsync(string participantId);
    Task<Response?> GetResponseByIdAsync(string responseId);
    Task<Response> CreateResponseAsync(Response response);
    Task<Response> UpdateResponseAsync(Response response);
    Task<bool> DeleteResponseAsync(string responseId);
}

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
