using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for participant management operations using Entity Framework Core.
/// </summary>
public interface IEfCoreParticipantService
{
    /// <summary>Gets all participants for an event, ordered by team name then participant name.</summary>
    Task<IList<Participant>> GetParticipantsForEventAsync(string eventId);
    /// <summary>Gets all participants for an event (alias for GetParticipantsForEventAsync).</summary>
    Task<IList<Participant>> GetParticipantsByEventAsync(string eventId);
    /// <summary>Gets a participant by ID with team and event included.</summary>
    Task<Participant?> GetParticipantByIdAsync(string participantId);
    /// <summary>Gets a participant by their unique join token with team and event included.</summary>
    Task<Participant?> GetParticipantByTokenAsync(string token);
    /// <summary>Creates a new participant and sets join and last active timestamps.</summary>
    Task<Participant> CreateParticipantAsync(Participant participant);
    /// <summary>Updates an existing participant and refreshes last active timestamp.</summary>
    Task<Participant> UpdateParticipantAsync(Participant participant);
    /// <summary>Deletes a participant by ID. Returns false if not found.</summary>
    Task<bool> DeleteParticipantAsync(string participantId);
    /// <summary>Switches a participant to a different team if they are allowed to switch.</summary>
    Task<bool> SwitchParticipantTeamAsync(string participantId, string? newTeamId);
}

/// <summary>
/// EF Core implementation of participant management operations.
/// Provides CRUD and team-switching operations for trivia event participants.
/// </summary>
public class EfCoreParticipantService : IEfCoreParticipantService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreParticipantService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IList<Participant>> GetParticipantsForEventAsync(string eventId)
    {
        return await _context.Participants
            .Include(p => p.Team)
            .Where(p => p.EventId == eventId)
            .OrderBy(p => p.Team!.Name)
            .ThenBy(p => p.Name)
            .ToListAsync();
    }

    public async Task<IList<Participant>> GetParticipantsByEventAsync(string eventId)
    {
        return await GetParticipantsForEventAsync(eventId);
    }

    public async Task<Participant?> GetParticipantByIdAsync(string participantId)
    {
        return await _context.Participants
            .Include(p => p.Team)
            .Include(p => p.Event)
            .FirstOrDefaultAsync(p => p.Id == participantId);
    }

    public async Task<Participant?> GetParticipantByTokenAsync(string token)
    {
        return await _context.Participants
            .Include(p => p.Team)
            .Include(p => p.Event)
            .FirstOrDefaultAsync(p => p.ParticipantToken == token);
    }

    public async Task<Participant> CreateParticipantAsync(Participant participant)
    {
        participant.JoinedAt = DateTime.UtcNow;
        participant.LastActiveAt = DateTime.UtcNow;
        
        _context.Participants.Add(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task<Participant> UpdateParticipantAsync(Participant participant)
    {
        participant.LastActiveAt = DateTime.UtcNow;
        _context.Participants.Update(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task<bool> DeleteParticipantAsync(string participantId)
    {
        var participant = await _context.Participants.FindAsync(participantId);
        if (participant == null)
            return false;

        _context.Participants.Remove(participant);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SwitchParticipantTeamAsync(string participantId, string? newTeamId)
    {
        var participant = await _context.Participants.FindAsync(participantId);
        if (participant == null || !participant.CanSwitchTeam)
            return false;

        participant.TeamId = newTeamId;
        participant.LastActiveAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return true;
    }
}
