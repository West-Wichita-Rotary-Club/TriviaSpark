using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for event management operations using Entity Framework Core.
/// </summary>
public interface IEfCoreEventService
{
    /// <summary>Gets all events hosted by a specific user, ordered by creation date descending.</summary>
    Task<IList<Event>> GetEventsForHostAsync(string hostId);
    /// <summary>Gets upcoming events for a host, excluding completed and cancelled events.</summary>
    Task<IList<Event>> GetUpcomingEventsAsync(string hostId);
    /// <summary>Gets currently active events for a host.</summary>
    Task<IList<Event>> GetActiveEventsAsync(string hostId);
    /// <summary>Gets public-facing upcoming events (no authentication required).</summary>
    Task<IList<Event>> GetPublicUpcomingEventsAsync(int limit = 8);
    /// <summary>Gets a single event by ID with all related entities eagerly loaded.</summary>
    Task<Event?> GetEventByIdAsync(string eventId);
    /// <summary>Creates a new event entity and sets its creation timestamp.</summary>
    Task<Event> CreateEventAsync(Event eventEntity);
    /// <summary>Updates an existing event entity.</summary>
    Task<Event> UpdateEventAsync(Event eventEntity);
    /// <summary>Deletes an event by ID. Returns false if not found.</summary>
    Task<bool> DeleteEventAsync(string eventId);
    /// <summary>Starts an event by setting its status to active and recording the start time.</summary>
    Task<Event?> StartEventAsync(string eventId);
    /// <summary>Updates the status of an event. Sets CompletedAt when status is "completed".</summary>
    Task<Event?> UpdateEventStatusAsync(string eventId, string status);
}

/// <summary>
/// EF Core implementation of event management operations.
/// Provides CRUD and lifecycle management for trivia events.
/// </summary>
public class EfCoreEventService : IEfCoreEventService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreEventService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IList<Event>> GetEventsForHostAsync(string hostId)
    {
        return await _context.Events
            .Where(e => e.HostId == hostId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IList<Event>> GetUpcomingEventsAsync(string hostId)
    {
        var now = DateTime.UtcNow;
        var maxDate = new DateTime(2099, 12, 31); // Use a reasonable max date instead of DateTime.MaxValue
        return await _context.Events
            .Where(e => e.HostId == hostId && 
                       e.Status != "completed" && 
                       e.Status != "cancelled" &&
                       (e.EventDate == null || e.EventDate >= now))
            .OrderBy(e => e.EventDate ?? maxDate)
            .ToListAsync();
    }

    public async Task<IList<Event>> GetActiveEventsAsync(string hostId)
    {
        return await _context.Events
            .Where(e => e.HostId == hostId && e.Status == "active")
            .OrderByDescending(e => e.StartedAt ?? e.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Public-facing list of upcoming or recently active events (no authentication required).
    /// Only exposes events that are either active now or drafts with a future (or unspecified) date.
    /// Excludes cancelled and completed events.
    /// </summary>
    public async Task<IList<Event>> GetPublicUpcomingEventsAsync(int limit = 8)
    {
        var now = DateTime.UtcNow;
        var maxDate = new DateTime(2099, 12, 31);
        return await _context.Events
            .Where(e => e.Status != "cancelled" && e.Status != "completed" &&
                        (e.Status == "active" || e.Status == "draft") &&
                        (e.EventDate == null || e.EventDate >= now.AddHours(-3))) // allow very recent past
            .OrderBy(e => e.EventDate ?? maxDate)
            .ThenByDescending(e => e.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Event?> GetEventByIdAsync(string eventId)
    {
        return await _context.Events
            .Include(e => e.Host)
            .Include(e => e.Questions.OrderBy(q => q.OrderIndex))
                .ThenInclude(q => q.EventImages)
            .Include(e => e.Teams.OrderBy(t => t.TableNumber ?? int.MaxValue).ThenBy(t => t.Name))
                .ThenInclude(t => t.Participants.Where(p => p.IsActive).OrderBy(p => p.Name))
            .Include(e => e.Participants.Where(p => p.IsActive).OrderBy(p => p.Name))
            .Include(e => e.FunFacts.Where(f => f.IsActive).OrderBy(f => f.OrderIndex))
            .AsSplitQuery() // Use split query for better performance with multiple includes
            .FirstOrDefaultAsync(e => e.Id == eventId);
    }

    public async Task<Event> CreateEventAsync(Event eventEntity)
    {
        eventEntity.CreatedAt = DateTime.UtcNow;
        _context.Events.Add(eventEntity);
        await _context.SaveChangesAsync();
        return eventEntity;
    }

    public async Task<Event> UpdateEventAsync(Event eventEntity)
    {
        _context.Events.Update(eventEntity);
        await _context.SaveChangesAsync();
        return eventEntity;
    }

    public async Task<bool> DeleteEventAsync(string eventId)
    {
        var eventEntity = await _context.Events.FindAsync(eventId);
        if (eventEntity == null)
            return false;

        _context.Events.Remove(eventEntity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Event?> StartEventAsync(string eventId)
    {
        var eventEntity = await _context.Events.FindAsync(eventId);
        if (eventEntity == null)
            return null;

        eventEntity.Status = "active";
        eventEntity.StartedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return eventEntity;
    }

    public async Task<Event?> UpdateEventStatusAsync(string eventId, string status)
    {
        var eventEntity = await _context.Events.FindAsync(eventId);
        if (eventEntity == null)
            return null;

        eventEntity.Status = status;
        if (status == "completed")
            eventEntity.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return eventEntity;
    }
}
