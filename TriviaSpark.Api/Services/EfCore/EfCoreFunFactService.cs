using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreFunFactService
{
    Task<IList<FunFact>> GetFunFactsForEventAsync(string eventId);
    Task<FunFact?> GetFunFactByIdAsync(string funFactId);
    Task<FunFact> CreateFunFactAsync(FunFact funFact);
    Task<FunFact> UpdateFunFactAsync(FunFact funFact);
    Task<bool> DeleteFunFactAsync(string funFactId);
}

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
