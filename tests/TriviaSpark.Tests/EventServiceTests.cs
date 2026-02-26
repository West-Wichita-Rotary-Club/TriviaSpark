using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Services.EfCore;

namespace TriviaSpark.Tests;

[TestClass]
public class EventServiceTests
{
    private TriviaSparkDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<TriviaSparkDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new TriviaSparkDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [TestMethod]
    public async Task CreateEventAsync_SetsCreatedAtAndReturnsEvent()
    {
        using var context = CreateInMemoryContext();
        var service = new EfCoreEventService(context);

        var newEvent = new Event
        {
            Id = "test-event-1",
            Title = "Sample Trivia Night",
            HostId = "host-1",
            EventType = "corporate",
            Status = "draft"
        };

        var result = await service.CreateEventAsync(newEvent);

        Assert.IsNotNull(result);
        Assert.AreEqual("Sample Trivia Night", result.Title);
        Assert.AreEqual("draft", result.Status);
        Assert.AreNotEqual(default, result.CreatedAt);
    }

    [TestMethod]
    public async Task GetEventByIdAsync_ReturnsNullForNonexistentEvent()
    {
        using var context = CreateInMemoryContext();
        var service = new EfCoreEventService(context);

        var result = await service.GetEventByIdAsync("nonexistent-id");

        Assert.IsNull(result);
    }

    [TestMethod]
    public async Task DeleteEventAsync_ReturnsFalseForNonexistentEvent()
    {
        using var context = CreateInMemoryContext();
        var service = new EfCoreEventService(context);

        var result = await service.DeleteEventAsync("nonexistent-id");

        Assert.IsFalse(result);
    }

    [TestMethod]
    public async Task DeleteEventAsync_ReturnsTrueAndRemovesEvent()
    {
        using var context = CreateInMemoryContext();
        var service = new EfCoreEventService(context);

        context.Events.Add(new Event
        {
            Id = "delete-me",
            Title = "To Be Deleted",
            HostId = "host-1",
            EventType = "party",
            Status = "draft",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var result = await service.DeleteEventAsync("delete-me");

        Assert.IsTrue(result);
        Assert.IsNull(await context.Events.FindAsync("delete-me"));
    }
}
