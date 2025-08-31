using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreTeamService
{
    Task<IList<Team>> GetTeamsForEventAsync(string eventId);
    Task<Team?> GetTeamByIdAsync(string teamId);
    Task<Team> CreateTeamAsync(Team team);
    Task<Team> UpdateTeamAsync(Team team);
    Task<bool> DeleteTeamAsync(string teamId);
}

public class EfCoreTeamService : IEfCoreTeamService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreTeamService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IList<Team>> GetTeamsForEventAsync(string eventId)
    {
        return await _context.Teams
            .Include(t => t.Participants)
            .Where(t => t.EventId == eventId)
            .OrderBy(t => t.TableNumber ?? int.MaxValue)
            .ThenBy(t => t.Name)
            .ToListAsync();
    }

    public async Task<Team?> GetTeamByIdAsync(string teamId)
    {
        return await _context.Teams
            .Include(t => t.Participants)
            .Include(t => t.Event)
            .FirstOrDefaultAsync(t => t.Id == teamId);
    }

    public async Task<Team> CreateTeamAsync(Team team)
    {
        team.CreatedAt = DateTime.UtcNow;
        _context.Teams.Add(team);
        await _context.SaveChangesAsync();
        return team;
    }

    public async Task<Team> UpdateTeamAsync(Team team)
    {
        _context.Teams.Update(team);
        await _context.SaveChangesAsync();
        return team;
    }

    public async Task<bool> DeleteTeamAsync(string teamId)
    {
        var team = await _context.Teams.FindAsync(teamId);
        if (team == null)
            return false;

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
        return true;
    }
}
