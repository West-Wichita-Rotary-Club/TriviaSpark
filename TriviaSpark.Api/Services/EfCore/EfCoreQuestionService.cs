using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Interface for question management operations using Entity Framework Core.
/// </summary>
public interface IEfCoreQuestionService
{
    /// <summary>Gets all questions for an event, ordered by order index then creation date.</summary>
    Task<IList<Question>> GetQuestionsForEventAsync(string eventId);
    /// <summary>Gets a question by ID with its parent event included.</summary>
    Task<Question?> GetQuestionByIdAsync(string questionId);
    /// <summary>Creates a single question, auto-assigning order index if not specified.</summary>
    Task<Question> CreateQuestionAsync(Question question);
    /// <summary>Updates an existing question entity.</summary>
    Task<Question> UpdateQuestionAsync(Question question);
    /// <summary>Deletes a question by ID. Returns false if not found.</summary>
    Task<bool> DeleteQuestionAsync(string questionId);
    /// <summary>Reorders questions by assigning sequential order indices based on the provided ID list.</summary>
    Task<bool> ReorderQuestionsAsync(IList<string> questionOrder);
    /// <summary>Creates multiple questions in a single operation with auto-assigned order indices.</summary>
    Task<IList<Question>> CreateQuestionsAsync(IList<Question> questions);
    /// <summary>Bulk inserts questions (delegates to CreateQuestionsAsync).</summary>
    Task<IList<Question>> BulkInsertQuestionsAsync(IList<Question> questions);
    /// <summary>Gets the next available order index for a new question in an event.</summary>
    Task<int> GetNextOrderIndexAsync(string eventId);
}

/// <summary>
/// EF Core implementation of question management operations.
/// Provides CRUD, reordering, and bulk operations for trivia questions.
/// </summary>
public class EfCoreQuestionService : IEfCoreQuestionService
{
    private readonly TriviaSparkDbContext _context;

    public EfCoreQuestionService(TriviaSparkDbContext context)
    {
        _context = context;
    }

    public async Task<IList<Question>> GetQuestionsForEventAsync(string eventId)
    {
        return await _context.Questions
            .Where(q => q.EventId == eventId)
            .OrderBy(q => q.OrderIndex)
            .ThenBy(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<Question?> GetQuestionByIdAsync(string questionId)
    {
        return await _context.Questions
            .Include(q => q.Event)
            .FirstOrDefaultAsync(q => q.Id == questionId);
    }

    public async Task<Question> CreateQuestionAsync(Question question)
    {
        question.CreatedAt = DateTime.UtcNow;
        
        // Set order index to the next available position if not specified
        if (question.OrderIndex == 0)
        {
            var maxOrder = await _context.Questions
                .Where(q => q.EventId == question.EventId)
                .MaxAsync(q => (int?)q.OrderIndex) ?? 0;
            question.OrderIndex = maxOrder + 1;
        }
        
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<Question> UpdateQuestionAsync(Question question)
    {
        _context.Questions.Update(question);
        await _context.SaveChangesAsync();
        return question;
    }

    public async Task<bool> DeleteQuestionAsync(string questionId)
    {
        var question = await _context.Questions.FindAsync(questionId);
        if (question == null)
            return false;

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReorderQuestionsAsync(IList<string> questionOrder)
    {
        var questions = await _context.Questions
            .Where(q => questionOrder.Contains(q.Id))
            .ToListAsync();

        if (questions.Count != questionOrder.Count)
            return false;

        for (int i = 0; i < questionOrder.Count; i++)
        {
            var question = questions.FirstOrDefault(q => q.Id == questionOrder[i]);
            if (question != null)
            {
                question.OrderIndex = i + 1;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IList<Question>> BulkInsertQuestionsAsync(IList<Question> questions)
    {
        return await CreateQuestionsAsync(questions);
    }

    public async Task<int> GetNextOrderIndexAsync(string eventId)
    {
        var maxOrder = await _context.Questions
            .Where(q => q.EventId == eventId)
            .MaxAsync(q => (int?)q.OrderIndex) ?? 0;
        return maxOrder + 1;
    }

    public async Task<IList<Question>> CreateQuestionsAsync(IList<Question> questions)
    {
        var eventId = questions.FirstOrDefault()?.EventId;
        if (eventId == null)
            return questions;

        // Get the next available order index
        var maxOrder = await _context.Questions
            .Where(q => q.EventId == eventId)
            .MaxAsync(q => (int?)q.OrderIndex) ?? 0;

        var now = DateTime.UtcNow;
        for (int i = 0; i < questions.Count; i++)
        {
            questions[i].CreatedAt = now;
            if (questions[i].OrderIndex == 0)
            {
                questions[i].OrderIndex = maxOrder + i + 1;
            }
        }

        _context.Questions.AddRange(questions);
        await _context.SaveChangesAsync();
        return questions;
    }
}
