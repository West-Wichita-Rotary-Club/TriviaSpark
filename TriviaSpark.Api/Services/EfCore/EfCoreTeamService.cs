using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for team management operations using Entity Framework Core.
/// </summary>
public interface IEfCoreTeamService
{
    /// <summary>Gets all teams for an event, ordered by table number then name.</summary>
    Task<IList<Team>> GetTeamsForEventAsync(string eventId);
    /// <summary>Gets a team by ID with its participants and event included.</summary>
    Task<Team?> GetTeamByIdAsync(string teamId);
    /// <summary>Creates a new team and sets its creation timestamp.</summary>
    Task<Team> CreateTeamAsync(Team team);
    /// <summary>Updates an existing team entity.</summary>
    Task<Team> UpdateTeamAsync(Team team);
    /// <summary>Deletes a team by ID. Returns false if not found.</summary>
    Task<bool> DeleteTeamAsync(string teamId);
}

/// <summary>
/// EF Core implementation of team management operations.
/// Provides CRUD operations for trivia event teams.
/// </summary>
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
