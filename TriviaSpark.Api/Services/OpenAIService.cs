using System.Text.Json;
using System.Text;

namespace TriviaSpark.Api.Services;

public interface IOpenAIService
{
    Task<List<GeneratedQuestion>> GenerateQuestionsAsync(string eventId, string topic, string difficulty, int count, string eventContext = "");
}

public class OpenAIService : IOpenAIService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAIService> _logger;
    private readonly string _apiKey;

    public OpenAIService(HttpClient httpClient, IConfiguration configuration, ILogger<OpenAIService> logger)
    {
        _apiKey = configuration["OPENAI_API_KEY"] ?? 
                 Environment.GetEnvironmentVariable("OPENAI_API_KEY") ??
                 throw new InvalidOperationException("OpenAI API key not found. Please set OPENAI_API_KEY in configuration or environment variables.");
        
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.openai.com/v1/");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        _logger = logger;
    }

    public async Task<List<GeneratedQuestion>> GenerateQuestionsAsync(string eventId, string topic, string difficulty, int count, string eventContext = "")
    {
        try
        {
            var prompt = BuildPrompt(topic, difficulty, count, eventContext);
            
            _logger.LogInformation("Generating {Count} questions for topic '{Topic}' with difficulty '{Difficulty}'", count, topic, difficulty);

            var requestBody = new
            {
                model = "gpt-4o",
                messages = new[]
                {
                    new { role = "system", content = "You are an expert trivia question generator. Generate engaging, accurate, and well-researched trivia questions. Always respond with valid JSON in the exact format specified." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.7,
                max_tokens = 2000
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("chat/completions", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("OpenAI API request failed with status {StatusCode}: {Error}", response.StatusCode, errorContent);
                throw new InvalidOperationException($"OpenAI API request failed: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("OpenAI API Response: {Response}", responseContent);

            var apiResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (apiResponse?.Choices == null || !apiResponse.Choices.Any())
            {
                throw new InvalidOperationException("OpenAI returned empty response");
            }

            var messageContent = apiResponse.Choices[0].Message.Content.Trim();
            
            // Remove markdown code block markers if present
            if (messageContent.StartsWith("```json"))
            {
                messageContent = messageContent.Substring(7);
            }
            if (messageContent.EndsWith("```"))
            {
                messageContent = messageContent.Substring(0, messageContent.Length - 3);
            }
            
            messageContent = messageContent.Trim();

            _logger.LogDebug("Extracted JSON Content: {Content}", messageContent);

            var questions = JsonSerializer.Deserialize<List<GeneratedQuestion>>(messageContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (questions == null || questions.Count == 0)
            {
                throw new InvalidOperationException("Failed to parse questions from OpenAI response");
            }

            _logger.LogInformation("Successfully generated {ActualCount} questions from OpenAI", questions.Count);
            return questions;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse OpenAI response as JSON");
            throw new InvalidOperationException("Failed to parse OpenAI response. The AI returned invalid JSON.", ex);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP request to OpenAI failed");
            throw new InvalidOperationException("Failed to communicate with OpenAI", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate questions from OpenAI");
            throw new InvalidOperationException("Failed to generate questions from OpenAI", ex);
        }
    }

    private string BuildPrompt(string topic, string difficulty, int count, string eventContext)
    {
        var difficultyDescription = difficulty.ToLowerInvariant() switch
        {
            "easy" => "suitable for beginners with basic knowledge",
            "medium" => "requiring moderate knowledge and some deeper understanding",
            "hard" => "challenging questions for experts or enthusiasts",
            "mixed" => "a mix of easy, medium, and hard questions",
            _ => "medium difficulty"
        };

        var contextPart = string.IsNullOrWhiteSpace(eventContext) ? "" : $"\n\nEvent Context: {eventContext}";

        return $@"Generate {count} trivia questions about {topic}. The difficulty should be {difficultyDescription}.{contextPart}

Requirements:
- All questions should be multiple choice with exactly 4 options (A, B, C, D)
- Questions should be engaging, accurate, and well-researched
- Include a brief explanation for each correct answer
- Vary the topics within the main subject to keep it interesting
- Ensure questions are appropriate for a trivia event setting

Return the response as a JSON array with this exact structure:
[
  {{
    ""question"": ""Your question text here?"",
    ""options"": [""Option A"", ""Option B"", ""Option C"", ""Option D""],
    ""correctAnswer"": ""Option A"",
    ""explanation"": ""Brief explanation of why this is correct"",
    ""difficulty"": ""easy"",
    ""category"": ""{topic}""
  }}
]

Make sure the JSON is valid and contains exactly {count} questions.";
    }
}

public class GeneratedQuestion
{
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string CorrectAnswer { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public string Difficulty { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class OpenAIResponse
{
    public List<Choice> Choices { get; set; } = new();
}

public class Choice
{
    public Message Message { get; set; } = new();
}

public class Message
{
    public string Content { get; set; } = string.Empty;
}
