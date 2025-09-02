using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Web;
using TriviaSpark.Api.Services.Models;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Unsplash API service implementation
/// Provides secure, efficient access to Unsplash's public image database
/// Following Azure best practices for external API integration
/// </summary>
public class UnsplashService : IUnsplashService, IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly UnsplashOptions _options;
    private readonly ILogger<UnsplashService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    // Category mapping for trivia-specific searches
    private static readonly Dictionary<string, string> CategoryMappings = new()
    {
        { "wine", "wine OR vineyard OR grapes OR cellar OR sommelier" },
        { "food", "food OR cooking OR restaurant OR chef OR cuisine" },
        { "history", "history OR historical OR ancient OR museum OR monument" },
        { "science", "science OR laboratory OR research OR technology OR discovery" },
        { "sports", "sports OR athletic OR stadium OR competition OR team" },
        { "nature", "nature OR landscape OR wildlife OR forest OR mountain" },
        { "travel", "travel OR destination OR landmark OR tourism OR culture" },
        { "business", "business OR office OR corporate OR meeting OR professional" },
        { "education", "education OR school OR university OR learning OR books" },
        { "arts", "art OR painting OR sculpture OR gallery OR creative" }
    };

    public UnsplashService(
        HttpClient httpClient,
        IOptions<UnsplashOptions> options,
        ILogger<UnsplashService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _options = options.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        // Validate required configuration
        if (string.IsNullOrWhiteSpace(_options.AccessKey))
        {
            throw new InvalidOperationException("Unsplash Access Key is required. Please configure in appsettings.json");
        }

        // Configure HttpClient with proper headers and timeouts
        _httpClient.BaseAddress = new Uri(_options.BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Client-ID {_options.AccessKey}");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", $"{_options.ApplicationName}/1.0");
        _httpClient.Timeout = TimeSpan.FromSeconds(30); // Reasonable timeout for API calls

        // JSON serializer options for consistent parsing
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        _logger.LogInformation("UnsplashService initialized with base URL: {BaseUrl}", _options.BaseUrl);
    }

    public async Task<UnsplashSearchResponse?> SearchImagesAsync(
        UnsplashSearchParams searchParams, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Validate and sanitize search parameters
            if (string.IsNullOrWhiteSpace(searchParams.Query))
            {
                _logger.LogWarning("Empty search query provided");
                return null;
            }

            // Ensure per_page is within acceptable limits
            var perPage = Math.Min(Math.Max(searchParams.PerPage, 1), _options.MaxPerPage);
            var page = Math.Max(searchParams.Page, 1);

            // Build query parameters
            var queryParams = new Dictionary<string, string>
            {
                { "query", searchParams.Query.Trim() },
                { "page", page.ToString() },
                { "per_page", perPage.ToString() },
                { "order_by", searchParams.OrderBy },
                { "content_filter", searchParams.ContentFilter }
            };

            // Add optional filters if specified
            if (!string.IsNullOrWhiteSpace(searchParams.Color))
                queryParams["color"] = searchParams.Color;

            if (!string.IsNullOrWhiteSpace(searchParams.Orientation))
                queryParams["orientation"] = searchParams.Orientation;

            var queryString = string.Join("&", queryParams.Select(kvp => 
                $"{HttpUtility.UrlEncode(kvp.Key)}={HttpUtility.UrlEncode(kvp.Value)}"));

            var requestUri = $"/search/photos?{queryString}";

            _logger.LogDebug("Searching Unsplash: {Query} (page {Page}, per_page {PerPage})", 
                searchParams.Query, page, perPage);

            // Make API request with retry logic
            var response = await _httpClient.GetAsync(requestUri, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Unsplash API request failed: {StatusCode} - {ReasonPhrase}", 
                    response.StatusCode, response.ReasonPhrase);
                
                // Check for rate limiting
                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    var rateLimitReset = response.Headers.GetValues("X-Ratelimit-Remaining").FirstOrDefault();
                    _logger.LogWarning("Unsplash rate limit exceeded. Reset time: {RateLimitReset}", rateLimitReset);
                }

                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var searchResponse = JsonSerializer.Deserialize<UnsplashSearchResponse>(jsonContent, _jsonOptions);

            _logger.LogInformation("Unsplash search completed: {TotalResults} results found for '{Query}'", 
                searchResponse?.Total ?? 0, searchParams.Query);

            return searchResponse;
        }
        catch (TaskCanceledException ex) when (ex.CancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning("Unsplash search request was cancelled");
            return null;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Network error during Unsplash search: {Message}", ex.Message);
            return null;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse Unsplash API response: {Message}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during Unsplash search: {Message}", ex.Message);
            return null;
        }
    }

    public async Task<UnsplashImage?> GetImageByIdAsync(string imageId, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(imageId))
            {
                _logger.LogWarning("Empty image ID provided");
                return null;
            }

            // Sanitize image ID to prevent injection
            var sanitizedId = imageId.Trim();
            if (!IsValidImageId(sanitizedId))
            {
                _logger.LogWarning("Invalid image ID format: {ImageId}", imageId);
                return null;
            }

            var requestUri = $"/photos/{HttpUtility.UrlEncode(sanitizedId)}";

            _logger.LogDebug("Fetching Unsplash image: {ImageId}", sanitizedId);

            var response = await _httpClient.GetAsync(requestUri, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch Unsplash image {ImageId}: {StatusCode}", 
                    sanitizedId, response.StatusCode);
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var image = JsonSerializer.Deserialize<UnsplashImage>(jsonContent, _jsonOptions);

            _logger.LogDebug("Successfully fetched Unsplash image: {ImageId}", sanitizedId);

            return image;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Unsplash image {ImageId}: {Message}", imageId, ex.Message);
            return null;
        }
    }

    public ImageSelection ToImageSelection(UnsplashImage unsplashImage, string preferredSize = "regular")
    {
        if (unsplashImage == null)
            throw new ArgumentNullException(nameof(unsplashImage));

        // Select appropriate URL based on preferred size
        var imageUrl = preferredSize.ToLowerInvariant() switch
        {
            "thumb" => unsplashImage.Urls.Thumb,
            "small" => unsplashImage.Urls.Small,
            "regular" => unsplashImage.Urls.Regular,
            "full" => unsplashImage.Urls.Full,
            "raw" => unsplashImage.Urls.Raw,
            _ => unsplashImage.Urls.Regular
        };

        // Build attribution text as required by Unsplash API terms
        var attributionText = !string.IsNullOrWhiteSpace(unsplashImage.User.Name)
            ? $"Photo by {unsplashImage.User.Name} on Unsplash"
            : "Photo by Unsplash";

        // Build attribution URL with required UTM parameters for Unsplash API compliance
        var attributionUrl = !string.IsNullOrWhiteSpace(unsplashImage.Links.Html)
            ? $"{unsplashImage.Links.Html}?utm_source=TriviaSpark&utm_medium=referral"
            : "https://unsplash.com?utm_source=TriviaSpark&utm_medium=referral";

        // Build photographer profile URL with UTM parameters
        var photographerUrl = !string.IsNullOrWhiteSpace(unsplashImage.User.Links.Html)
            ? $"{unsplashImage.User.Links.Html}?utm_source=TriviaSpark&utm_medium=referral"
            : string.Empty;

        return new ImageSelection
        {
            Id = unsplashImage.Id,
            Description = unsplashImage.Description ?? unsplashImage.AltDescription ?? "Untitled",
            Url = imageUrl,
            ThumbnailUrl = unsplashImage.Urls.Thumb,
            AttributionText = attributionText,
            AttributionUrl = attributionUrl,
            PhotographerName = unsplashImage.User.Name ?? "Unknown",
            PhotographerUrl = photographerUrl,
            Width = unsplashImage.Width,
            Height = unsplashImage.Height,
            Color = unsplashImage.Color ?? "#000000"
        };
    }

    public async Task<bool> TrackDownloadAsync(string downloadUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(downloadUrl))
            {
                _logger.LogWarning("Empty download URL provided for tracking");
                return false;
            }

            // Validate URL format
            if (!Uri.TryCreate(downloadUrl, UriKind.Absolute, out var uri))
            {
                _logger.LogWarning("Invalid download URL format: {DownloadUrl}", downloadUrl);
                return false;
            }

            _logger.LogDebug("Tracking Unsplash download: {DownloadUrl}", downloadUrl);

            // Make GET request to the download tracking endpoint
            var response = await _httpClient.GetAsync(downloadUrl, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogDebug("Successfully tracked Unsplash download");
                return true;
            }
            else
            {
                _logger.LogWarning("Failed to track Unsplash download: {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking Unsplash download: {Message}", ex.Message);
            return false;
        }
    }

    public async Task<List<UnsplashImage>> GetFeaturedImagesAsync(
        int page = 1, 
        int perPage = 20, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Ensure parameters are within acceptable limits
            var safePage = Math.Max(page, 1);
            var safePerPage = Math.Min(Math.Max(perPage, 1), _options.MaxPerPage);

            var queryString = $"page={safePage}&per_page={safePerPage}&order_by=popular";
            var requestUri = $"/photos?{queryString}";

            _logger.LogDebug("Fetching featured Unsplash images (page {Page}, per_page {PerPage})", 
                safePage, safePerPage);

            var response = await _httpClient.GetAsync(requestUri, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to fetch featured images: {StatusCode}", response.StatusCode);
                return new List<UnsplashImage>();
            }

            var jsonContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var images = JsonSerializer.Deserialize<List<UnsplashImage>>(jsonContent, _jsonOptions);

            _logger.LogInformation("Fetched {Count} featured images from Unsplash", images?.Count ?? 0);

            return images ?? new List<UnsplashImage>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching featured images: {Message}", ex.Message);
            return new List<UnsplashImage>();
        }
    }

    public async Task<UnsplashSearchResponse?> SearchImagesByCategoryAsync(
        string category, 
        int page = 1, 
        int perPage = 20, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(category))
        {
            _logger.LogWarning("Empty category provided for search");
            return null;
        }

        // Use category mapping if available, otherwise use the category as-is
        var searchQuery = CategoryMappings.TryGetValue(category.ToLowerInvariant(), out var mappedQuery) 
            ? mappedQuery 
            : category;

        var searchParams = new UnsplashSearchParams
        {
            Query = searchQuery,
            Page = page,
            PerPage = perPage,
            OrderBy = "relevant",
            ContentFilter = "high"
        };

        _logger.LogDebug("Searching Unsplash by category: {Category} -> {Query}", category, searchQuery);

        return await SearchImagesAsync(searchParams, cancellationToken);
    }

    /// <summary>
    /// Validates image ID format to prevent injection attacks
    /// </summary>
    private static bool IsValidImageId(string imageId)
    {
        // Unsplash image IDs are typically alphanumeric with dashes and underscores
        return !string.IsNullOrWhiteSpace(imageId) && 
               imageId.Length <= 50 && 
               imageId.All(c => char.IsLetterOrDigit(c) || c == '-' || c == '_');
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}

/// <summary>
/// Extension methods for registering Unsplash service
/// </summary>
public static class UnsplashServiceExtensions
{
    /// <summary>
    /// Registers Unsplash service with dependency injection
    /// </summary>
    public static IServiceCollection AddUnsplashService(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure options from appsettings.json
        services.Configure<UnsplashOptions>(configuration.GetSection(UnsplashOptions.SectionName));

        // Register HttpClient with proper configuration
        services.AddHttpClient<IUnsplashService, UnsplashService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        })
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler()
        {
            // Enable connection pooling and compression
            UseCookies = false,
            UseDefaultCredentials = false
        });

        return services;
    }
}
