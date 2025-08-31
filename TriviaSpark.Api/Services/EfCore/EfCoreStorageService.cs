using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Services.EfCore;
using DapperUser = TriviaSpark.Api.Services.User;

namespace TriviaSpark.Api.Services.EfCore;

public interface IEfCoreStorageService
{
    // User operations
    Task<DapperUser?> GetUserByUsernameAsync(string username);
    Task<DapperUser?> GetUserByIdAsync(string userId);
    Task<bool> ValidatePasswordAsync(string username, string password);

    // Event operations
    Task<IList<Event>> GetEventsForHostAsync(string hostId);
    Task<IList<Event>> GetUpcomingEventsAsync(string hostId);
    Task<IList<Event>> GetActiveEventsAsync(string hostId);
    Task<Event?> GetEventByIdAsync(string eventId);
    Task<Event> CreateEventAsync(Event eventEntity);
    Task<Event?> StartEventAsync(string eventId);
    Task<Event?> UpdateEventStatusAsync(string eventId, string status);

    // Question operations
    Task<IList<Question>> GetQuestionsForEventAsync(string eventId);
    Task<Question> CreateQuestionAsync(Question question);
    Task<IList<Question>> CreateQuestionsAsync(IList<Question> questions);
    Task<bool> ReorderQuestionsAsync(string eventId, IList<string> questionOrder);

    // Team operations
    Task<IList<Team>> GetTeamsForEventAsync(string eventId);
    Task<Team> CreateTeamAsync(Team team);

    // Participant operations
    Task<IList<Participant>> GetParticipantsForEventAsync(string eventId);
    Task<Participant?> GetParticipantByTokenAsync(string token);
    Task<Participant> CreateParticipantAsync(Participant participant);
    Task<bool> SwitchParticipantTeamAsync(string participantId, string? newTeamId);

    // Response operations
    Task<IList<Response>> GetResponsesForQuestionAsync(string questionId);
    Task<Response> CreateResponseAsync(Response response);

    // Fun fact operations
    Task<IList<FunFact>> GetFunFactsForEventAsync(string eventId);

    // Analytics operations
    Task<object> GetEventAnalyticsAsync(string eventId);
    Task<object> GetLeaderboardAsync(string eventId, string type);
    Task<object> GetResponseSummaryAsync(string eventId);
    Task LockTeamSwitchingAsync(string eventId);
}

public class EfCoreStorageService : IEfCoreStorageService
{
    private readonly IEfCoreUserService _userService;
    private readonly IEfCoreEventService _eventService;
    private readonly IEfCoreQuestionService _questionService;
    private readonly IEfCoreTeamService _teamService;
    private readonly IEfCoreParticipantService _participantService;
    private readonly IEfCoreResponseService _responseService;
    private readonly IEfCoreFunFactService _funFactService;

    public EfCoreStorageService(
        IEfCoreUserService userService,
        IEfCoreEventService eventService,
        IEfCoreQuestionService questionService,
        IEfCoreTeamService teamService,
        IEfCoreParticipantService participantService,
        IEfCoreResponseService responseService,
        IEfCoreFunFactService funFactService)
    {
        _userService = userService;
        _eventService = eventService;
        _questionService = questionService;
        _teamService = teamService;
        _participantService = participantService;
        _responseService = responseService;
        _funFactService = funFactService;
    }

    // User operations
    public async Task<DapperUser?> GetUserByUsernameAsync(string username)
        => await _userService.GetUserByUsernameAsync(username);

    public async Task<DapperUser?> GetUserByIdAsync(string userId)
        => await _userService.GetUserByIdAsync(userId);

    public async Task<bool> ValidatePasswordAsync(string username, string password)
        => await _userService.ValidatePasswordAsync(username, password);

    // Event operations
    public async Task<IList<Event>> GetEventsForHostAsync(string hostId)
        => await _eventService.GetEventsForHostAsync(hostId);

    public async Task<IList<Event>> GetUpcomingEventsAsync(string hostId)
        => await _eventService.GetUpcomingEventsAsync(hostId);

    public async Task<IList<Event>> GetActiveEventsAsync(string hostId)
        => await _eventService.GetActiveEventsAsync(hostId);

    public async Task<Event?> GetEventByIdAsync(string eventId)
        => await _eventService.GetEventByIdAsync(eventId);

    public async Task<Event> CreateEventAsync(Event eventEntity)
        => await _eventService.CreateEventAsync(eventEntity);

    public async Task<Event?> StartEventAsync(string eventId)
        => await _eventService.StartEventAsync(eventId);

    public async Task<Event?> UpdateEventStatusAsync(string eventId, string status)
        => await _eventService.UpdateEventStatusAsync(eventId, status);

    // Question operations
    public async Task<IList<Question>> GetQuestionsForEventAsync(string eventId)
        => await _questionService.GetQuestionsForEventAsync(eventId);

    public async Task<Question> CreateQuestionAsync(Question question)
        => await _questionService.CreateQuestionAsync(question);

    public async Task<IList<Question>> CreateQuestionsAsync(IList<Question> questions)
        => await _questionService.CreateQuestionsAsync(questions);

    public async Task<bool> ReorderQuestionsAsync(string eventId, IList<string> questionOrder)
        => await _questionService.ReorderQuestionsAsync(questionOrder);

    // Team operations
    public async Task<IList<Team>> GetTeamsForEventAsync(string eventId)
        => await _teamService.GetTeamsForEventAsync(eventId);

    public async Task<Team> CreateTeamAsync(Team team)
        => await _teamService.CreateTeamAsync(team);

    // Participant operations
    public async Task<IList<Participant>> GetParticipantsForEventAsync(string eventId)
        => await _participantService.GetParticipantsForEventAsync(eventId);

    public async Task<Participant?> GetParticipantByTokenAsync(string token)
        => await _participantService.GetParticipantByTokenAsync(token);

    public async Task<Participant> CreateParticipantAsync(Participant participant)
        => await _participantService.CreateParticipantAsync(participant);

    public async Task<bool> SwitchParticipantTeamAsync(string participantId, string? newTeamId)
        => await _participantService.SwitchParticipantTeamAsync(participantId, newTeamId);

    // Response operations
    public async Task<IList<Response>> GetResponsesForQuestionAsync(string questionId)
        => await _responseService.GetResponsesForQuestionAsync(questionId);

    public async Task<Response> CreateResponseAsync(Response response)
        => await _responseService.CreateResponseAsync(response);

    // Fun fact operations
    public async Task<IList<FunFact>> GetFunFactsForEventAsync(string eventId)
        => await _funFactService.GetFunFactsForEventAsync(eventId);

    // Analytics operations - Implement properly with EF Core
    public async Task<object> GetEventAnalyticsAsync(string eventId)
    {
        var participants = await _participantService.GetParticipantsByEventAsync(eventId);
        var teams = await _teamService.GetTeamsForEventAsync(eventId);
        var questions = await _questionService.GetQuestionsForEventAsync(eventId);

        int totalResponses = 0, correctResponses = 0, totalPoints = 0;
        var questionPerformance = new List<object>();

        foreach (var q in questions)
        {
            var responses = await _responseService.GetResponsesForQuestionAsync(q.Id);
            var correct = responses.Count(r => r.IsCorrect);
            var avgPoints = responses.Any() ? responses.Average(r => r.Points) : 0;
            
            questionPerformance.Add(new
            {
                id = q.Id,
                question = q.QuestionText,
                totalResponses = responses.Count,
                correctResponses = correct,
                accuracy = responses.Any() ? (double)correct / responses.Count * 100 : 0,
                averagePoints = avgPoints,
                difficulty = q.Difficulty
            });
            
            totalResponses += responses.Count;
            correctResponses += correct;
            totalPoints += responses.Sum(r => r.Points);
        }

        var teamPerformance = new List<object>();
        foreach (var t in teams)
        {
            var members = t.Participants ?? new List<Participant>();
            int teamPoints = 0, teamResponses = 0;
            
            foreach (var p in members)
            {
                var responses = await _responseService.GetResponsesForParticipantAsync(p.Id);
                teamPoints += responses.Sum(r => r.Points);
                teamResponses += responses.Count;
            }
            
            teamPerformance.Add(new
            {
                id = t.Id,
                name = t.Name,
                participantCount = members.Count,
                totalPoints = teamPoints,
                totalResponses = teamResponses,
                averagePointsPerParticipant = members.Any() ? (double)teamPoints / members.Count : 0
            });
        }

        var eventEntity = await _eventService.GetEventByIdAsync(eventId);
        return new
        {
            event_ = new
            {
                id = eventEntity?.Id,
                title = eventEntity?.Title,
                status = eventEntity?.Status,
                participantCount = participants.Count,
                teamCount = teams.Count,
                questionCount = questions.Count
            },
            performance = new
            {
                totalResponses,
                correctResponses,
                overallAccuracy = totalResponses > 0 ? (double)correctResponses / totalResponses * 100 : 0,
                totalPoints,
                averagePointsPerResponse = totalResponses > 0 ? (double)totalPoints / totalResponses : 0
            },
            questionPerformance,
            teamPerformance
        };
    }

    public async Task<object> GetLeaderboardAsync(string eventId, string type)
    {
        if (type.ToLowerInvariant() == "teams")
        {
            var teams = await _teamService.GetTeamsForEventAsync(eventId);
            var leaderboardEntries = new List<TeamLeaderboardEntry>();
            
            foreach (var t in teams)
            {
                var members = t.Participants ?? new List<Participant>();
                int totalPoints = 0, totalResponses = 0, correctResponses = 0;
                
                foreach (var p in members)
                {
                    var responses = await _responseService.GetResponsesForParticipantAsync(p.Id);
                    totalPoints += responses.Sum(r => r.Points);
                    totalResponses += responses.Count;
                    correctResponses += responses.Count(r => r.IsCorrect);
                }
                
                leaderboardEntries.Add(new TeamLeaderboardEntry
                {
                    Team = new { id = t.Id, name = t.Name, tableNumber = t.TableNumber },
                    ParticipantCount = members.Count,
                    TotalPoints = totalPoints,
                    TotalResponses = totalResponses,
                    CorrectResponses = correctResponses,
                    Accuracy = totalResponses > 0 ? (double)correctResponses / totalResponses * 100 : 0,
                    AveragePointsPerParticipant = members.Any() ? (double)totalPoints / members.Count : 0
                });
            }
            
            // Sort by total points and set ranks
            var sortedEntries = leaderboardEntries.OrderByDescending(x => x.TotalPoints).ToList();
            for (var i = 0; i < sortedEntries.Count; i++)
            {
                sortedEntries[i].Rank = i + 1;
            }
            
            return new { type = "teams", leaderboard = sortedEntries };
        }
        else
        {
            var participants = await _participantService.GetParticipantsByEventAsync(eventId);
            var leaderboardEntries = new List<ParticipantLeaderboardEntry>();
            
            foreach (var p in participants)
            {
                var responses = await _responseService.GetResponsesForParticipantAsync(p.Id);
                var totalPoints = responses.Sum(r => r.Points);
                var correct = responses.Count(r => r.IsCorrect);
                
                var team = !string.IsNullOrWhiteSpace(p.TeamId) ? await _teamService.GetTeamByIdAsync(p.TeamId) : null;
                
                leaderboardEntries.Add(new ParticipantLeaderboardEntry
                {
                    Participant = new { id = p.Id, name = p.Name },
                    Team = team != null ? new { id = team.Id, name = team.Name } : null,
                    TotalPoints = totalPoints,
                    TotalResponses = responses.Count,
                    CorrectResponses = correct,
                    Accuracy = responses.Any() ? (double)correct / responses.Count * 100 : 0
                });
            }
            
            // Sort by total points and set ranks
            var sortedEntries = leaderboardEntries.OrderByDescending(x => x.TotalPoints).ToList();
            for (var i = 0; i < sortedEntries.Count; i++)
            {
                sortedEntries[i].Rank = i + 1;
            }
            
            return new { type = "participants", leaderboard = sortedEntries };
        }
    }

    public async Task<object> GetResponseSummaryAsync(string eventId)
    {
        var questions = await _questionService.GetQuestionsForEventAsync(eventId);
        var summary = new List<object>();
        
        foreach (var q in questions)
        {
            var responses = await _responseService.GetResponsesForQuestionAsync(q.Id);
            var distribution = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            int totalPoints = 0;
            int? fastest = null;
            int? slowest = null;
            int totalWithTimes = 0;
            int timesSum = 0;
            
            foreach (var r in responses)
            {
                var ans = string.IsNullOrWhiteSpace(r.Answer) ? "No Answer" : r.Answer;
                distribution[ans] = distribution.TryGetValue(ans, out var c) ? c + 1 : 1;
                totalPoints += r.Points;
                
                if (r.ResponseTime.HasValue)
                {
                    fastest = fastest.HasValue ? Math.Min(fastest.Value, r.ResponseTime.Value) : r.ResponseTime.Value;
                    slowest = slowest.HasValue ? Math.Max(slowest.Value, r.ResponseTime.Value) : r.ResponseTime.Value;
                    timesSum += r.ResponseTime.Value;
                    totalWithTimes++;
                }
            }
            
            var correct = responses.Count(r => r.IsCorrect);
            summary.Add(new
            {
                question = new
                {
                    id = q.Id,
                    text = q.QuestionText,
                    correctAnswer = q.CorrectAnswer,
                    type = q.Type,
                    difficulty = q.Difficulty,
                    orderIndex = q.OrderIndex
                },
                responses = new
                {
                    total = responses.Count,
                    correct,
                    incorrect = responses.Count - correct,
                    accuracy = responses.Any() ? (double)correct / responses.Count * 100 : 0
                },
                scoring = new
                {
                    totalPoints,
                    averagePoints = responses.Any() ? (double)totalPoints / responses.Count : 0,
                    maxPossiblePoints = responses.Count * 20
                },
                timing = new
                {
                    fastestResponseTime = fastest,
                    slowestResponseTime = slowest,
                    averageResponseTime = totalWithTimes > 0 ? (int?)Math.Round((double)timesSum / totalWithTimes) : null
                },
                answerDistribution = distribution
            });
        }
        
        return new { eventId, summary };
    }

    public async Task LockTeamSwitchingAsync(string eventId)
    {
        var participants = await _participantService.GetParticipantsByEventAsync(eventId);
        foreach (var p in participants)
        {
            p.CanSwitchTeam = false;
            await _participantService.UpdateParticipantAsync(p);
        }
    }
}

// Helper classes for leaderboard responses
public class TeamLeaderboardEntry
{
    public int Rank { get; set; }
    public object Team { get; set; } = null!;
    public int ParticipantCount { get; set; }
    public int TotalPoints { get; set; }
    public int TotalResponses { get; set; }
    public int CorrectResponses { get; set; }
    public double Accuracy { get; set; }
    public double AveragePointsPerParticipant { get; set; }
}

public class ParticipantLeaderboardEntry
{
    public int Rank { get; set; }
    public object Participant { get; set; } = null!;
    public object? Team { get; set; }
    public int TotalPoints { get; set; }
    public int TotalResponses { get; set; }
    public int CorrectResponses { get; set; }
    public double Accuracy { get; set; }
}
