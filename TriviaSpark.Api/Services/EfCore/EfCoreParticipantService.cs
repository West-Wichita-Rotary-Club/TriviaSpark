using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreParticipantService
{
    Task<IList<Participant>> GetParticipantsForEventAsync(string eventId);
    Task<IList<Participant>> GetParticipantsByEventAsync(string eventId);
    Task<Participant?> GetParticipantByIdAsync(string participantId);
    Task<Participant?> GetParticipantByTokenAsync(string token);
    Task<Participant> CreateParticipantAsync(Participant participant);
    Task<Participant> UpdateParticipantAsync(Participant participant);
    Task<bool> DeleteParticipantAsync(string participantId);
    Task<bool> SwitchParticipantTeamAsync(string participantId, string? newTeamId);
}

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
