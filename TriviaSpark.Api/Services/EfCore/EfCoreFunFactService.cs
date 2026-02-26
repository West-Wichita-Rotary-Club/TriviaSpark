using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for fun fact management operations using Entity Framework Core.
/// </summary>
public interface IEfCoreFunFactService
{
    /// <summary>Gets all active fun facts for an event, ordered by order index then creation date.</summary>
    Task<IList<FunFact>> GetFunFactsForEventAsync(string eventId);
    /// <summary>Gets a fun fact by ID with its parent event included.</summary>
    Task<FunFact?> GetFunFactByIdAsync(string funFactId);
    /// <summary>Creates a new fun fact, auto-assigning order index if not specified.</summary>
    Task<FunFact> CreateFunFactAsync(FunFact funFact);
    /// <summary>Updates an existing fun fact entity.</summary>
    Task<FunFact> UpdateFunFactAsync(FunFact funFact);
    /// <summary>Deletes a fun fact by ID. Returns false if not found.</summary>
    Task<bool> DeleteFunFactAsync(string funFactId);
}

/// <summary>
/// EF Core implementation of fun fact management.
/// Provides CRUD operations for trivia event fun facts.
/// </summary>
public class EfCoreFunFactService : IEfCoreFunFactService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreFunFactService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IList<FunFact>> GetFunFactsForEventAsync(string eventId)
    {
        return await _context.FunFacts
            .Where(f => f.EventId == eventId && f.IsActive)
            .OrderBy(f => f.OrderIndex)
            .ThenBy(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<FunFact?> GetFunFactByIdAsync(string funFactId)
    {
        return await _context.FunFacts
            .Include(f => f.Event)
            .FirstOrDefaultAsync(f => f.Id == funFactId);
    }

    public async Task<FunFact> CreateFunFactAsync(FunFact funFact)
    {
        funFact.CreatedAt = DateTime.UtcNow;
        
        // Set order index to the next available position if not specified
        if (funFact.OrderIndex == 0)
        {
            var maxOrder = await _context.FunFacts
                .Where(f => f.EventId == funFact.EventId)
                .MaxAsync(f => (int?)f.OrderIndex) ?? 0;
            funFact.OrderIndex = maxOrder + 1;
        }
        
        _context.FunFacts.Add(funFact);
        await _context.SaveChangesAsync();
        return funFact;
    }

    public async Task<FunFact> UpdateFunFactAsync(FunFact funFact)
    {
        _context.FunFacts.Update(funFact);
        await _context.SaveChangesAsync();
        return funFact;
    }

    public async Task<bool> DeleteFunFactAsync(string funFactId)
    {
        var funFact = await _context.FunFacts.FindAsync(funFactId);
        if (funFact == null)
            return false;

        _context.FunFacts.Remove(funFact);
        await _context.SaveChangesAsync();
        return true;
    }
}
