using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreQuestionService
{
    Task<IList<Question>> GetQuestionsForEventAsync(string eventId);
    Task<Question?> GetQuestionByIdAsync(string questionId);
    Task<Question> CreateQuestionAsync(Question question);
    Task<Question> UpdateQuestionAsync(Question question);
    Task<bool> DeleteQuestionAsync(string questionId);
    Task<bool> ReorderQuestionsAsync(IList<string> questionOrder);
    Task<IList<Question>> CreateQuestionsAsync(IList<Question> questions);
    Task<IList<Question>> BulkInsertQuestionsAsync(IList<Question> questions);
    Task<int> GetNextOrderIndexAsync(string eventId);
}

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
