using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Services.EfCore;
using TriviaSpark.Api.Services.Models;

namespace TriviaSpark.Api.Controllers;

/// <summary>
/// Controller for Unsplash image search and selection
/// Provides endpoints for finding and selecting public images for trivia events
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UnsplashController : ControllerBase
{
    private readonly IUnsplashService _unsplashService;
    private readonly ILogger<UnsplashController> _logger;

    public UnsplashController(
        IUnsplashService unsplashService,
        ILogger<UnsplashController> logger)
    {
        _unsplashService = unsplashService ?? throw new ArgumentNullException(nameof(unsplashService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Search for images on Unsplash
    /// </summary>
    /// <param name="query">Search query (required)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="perPage">Results per page (default: 20, max: 30)</param>
    /// <param name="orderBy">Sort order: relevant, latest (default: relevant)</param>
    /// <param name="color">Color filter: black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, blue</param>
    /// <param name="orientation">Orientation filter: landscape, portrait, squarish</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Search results with images and pagination info</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(UnsplashSearchResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<UnsplashSearchResponse>> SearchImages(
        [FromQuery] string query,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        [FromQuery] string orderBy = "relevant",
        [FromQuery] string? color = null,
        [FromQuery] string? orientation = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                _logger.LogWarning("Empty search query provided");
                return BadRequest(new { error = "Search query is required" });
            }

            var searchParams = new UnsplashSearchParams
            {
                Query = query.Trim(),
                Page = Math.Max(page, 1),
                PerPage = Math.Min(Math.Max(perPage, 1), 30),
                OrderBy = orderBy,
                Color = color ?? string.Empty,
                Orientation = orientation ?? string.Empty,
                ContentFilter = "high"
            };

            _logger.LogInformation("Searching Unsplash images: {Query}", query);

            var result = await _unsplashService.SearchImagesAsync(searchParams, cancellationToken);

            if (result == null)
            {
                _logger.LogWarning("Unsplash search returned null result for query: {Query}", query);
                return StatusCode(500, new { error = "Failed to search images. Please try again later." });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching Unsplash images: {Message}", ex.Message);
            return StatusCode(500, new { error = "An error occurred while searching images" });
        }
    }

    /// <summary>
    /// Get a specific image by ID
    /// </summary>
    /// <param name="id">Unsplash image ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Image details</returns>
    [HttpGet("images/{id}")]
    [ProducesResponseType(typeof(UnsplashImage), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<UnsplashImage>> GetImage(
        string id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { error = "Image ID is required" });
            }

            _logger.LogDebug("Fetching Unsplash image: {ImageId}", id);

            var image = await _unsplashService.GetImageByIdAsync(id, cancellationToken);

            if (image == null)
            {
                _logger.LogWarning("Unsplash image not found: {ImageId}", id);
                return NotFound(new { error = "Image not found" });
            }

            return Ok(image);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Unsplash image {ImageId}: {Message}", id, ex.Message);
            return StatusCode(500, new { error = "An error occurred while fetching the image" });
        }
    }

    /// <summary>
    /// Convert Unsplash image to simplified selection format
    /// </summary>
    /// <param name="id">Unsplash image ID</param>
    /// <param name="size">Preferred image size: thumb, small, regular, full (default: regular)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Simplified image selection object</returns>
    [HttpGet("images/{id}/selection")]
    [ProducesResponseType(typeof(ImageSelection), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<ImageSelection>> GetImageSelection(
        string id,
        [FromQuery] string size = "regular",
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { error = "Image ID is required" });
            }

            _logger.LogDebug("Fetching Unsplash image selection: {ImageId}", id);

            var image = await _unsplashService.GetImageByIdAsync(id, cancellationToken);

            if (image == null)
            {
                _logger.LogWarning("Unsplash image not found for selection: {ImageId}", id);
                return NotFound(new { error = "Image not found" });
            }

            var selection = _unsplashService.ToImageSelection(image, size);
            return Ok(selection);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating image selection for {ImageId}: {Message}", id, ex.Message);
            return StatusCode(500, new { error = "An error occurred while processing the image selection" });
        }
    }

    /// <summary>
    /// Search images by trivia category
    /// </summary>
    /// <param name="category">Trivia category (wine, food, history, science, sports, nature, travel, business, education, arts)</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="perPage">Results per page (default: 20, max: 30)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Category-specific search results</returns>
    [HttpGet("categories/{category}")]
    [ProducesResponseType(typeof(UnsplashSearchResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<UnsplashSearchResponse>> SearchByCategory(
        string category,
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(category))
            {
                return BadRequest(new { error = "Category is required" });
            }

            // Validate category
            var validCategories = new[] { "wine", "food", "history", "science", "sports", "nature", "travel", "business", "education", "arts" };
            if (!validCategories.Contains(category.ToLowerInvariant()))
            {
                return BadRequest(new { 
                    error = "Invalid category", 
                    validCategories = validCategories 
                });
            }

            _logger.LogInformation("Searching Unsplash images by category: {Category}", category);

            var result = await _unsplashService.SearchImagesByCategoryAsync(
                category,
                Math.Max(page, 1),
                Math.Min(Math.Max(perPage, 1), 30),
                cancellationToken);

            if (result == null)
            {
                _logger.LogWarning("Category search returned null result for: {Category}", category);
                return StatusCode(500, new { error = "Failed to search images by category. Please try again later." });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching by category {Category}: {Message}", category, ex.Message);
            return StatusCode(500, new { error = "An error occurred while searching images by category" });
        }
    }

    /// <summary>
    /// Get featured/popular images
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="perPage">Results per page (default: 20, max: 30)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of featured images</returns>
    [HttpGet("featured")]
    [ProducesResponseType(typeof(List<UnsplashImage>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<List<UnsplashImage>>> GetFeaturedImages(
        [FromQuery] int page = 1,
        [FromQuery] int perPage = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Fetching featured Unsplash images");

            var images = await _unsplashService.GetFeaturedImagesAsync(
                Math.Max(page, 1),
                Math.Min(Math.Max(perPage, 1), 30),
                cancellationToken);

            return Ok(images);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching featured images: {Message}", ex.Message);
            return StatusCode(500, new { error = "An error occurred while fetching featured images" });
        }
    }

    /// <summary>
    /// Track image download for Unsplash API compliance
    /// This should be called when an image is actually used in the application
    /// </summary>
    /// <param name="downloadUrl">Download tracking URL from Unsplash image</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success status</returns>
    [HttpPost("track-download")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult> TrackDownload(
        [FromBody] TrackDownloadRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.DownloadUrl))
            {
                return BadRequest(new { error = "Download URL is required" });
            }

            _logger.LogDebug("Tracking Unsplash download: {DownloadUrl}", request.DownloadUrl);

            var success = await _unsplashService.TrackDownloadAsync(request.DownloadUrl, cancellationToken);

            if (success)
            {
                return Ok(new { message = "Download tracked successfully" });
            }
            else
            {
                return StatusCode(500, new { error = "Failed to track download" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking download: {Message}", ex.Message);
            return StatusCode(500, new { error = "An error occurred while tracking the download" });
        }
    }

    /// <summary>
    /// Get available trivia categories
    /// </summary>
    /// <returns>List of available categories</returns>
    [HttpGet("categories")]
    [ProducesResponseType(typeof(List<CategoryInfo>), 200)]
    public ActionResult<List<CategoryInfo>> GetCategories()
    {
        var categories = new List<CategoryInfo>
        {
            new() { Name = "wine", DisplayName = "Wine & Beverages", Description = "Wine, vineyards, beverages, and related imagery" },
            new() { Name = "food", DisplayName = "Food & Cuisine", Description = "Food, cooking, restaurants, and culinary arts" },
            new() { Name = "history", DisplayName = "History & Culture", Description = "Historical sites, artifacts, museums, and cultural heritage" },
            new() { Name = "science", DisplayName = "Science & Technology", Description = "Scientific research, technology, laboratories, and discoveries" },
            new() { Name = "sports", DisplayName = "Sports & Recreation", Description = "Athletic activities, sports venues, and recreational activities" },
            new() { Name = "nature", DisplayName = "Nature & Landscapes", Description = "Natural landscapes, wildlife, forests, and outdoor scenes" },
            new() { Name = "travel", DisplayName = "Travel & Destinations", Description = "Tourist destinations, landmarks, and travel-related imagery" },
            new() { Name = "business", DisplayName = "Business & Professional", Description = "Business environments, corporate settings, and professional activities" },
            new() { Name = "education", DisplayName = "Education & Learning", Description = "Educational institutions, learning materials, and academic settings" },
            new() { Name = "arts", DisplayName = "Arts & Creative", Description = "Artistic works, galleries, creative processes, and cultural arts" }
        };

        return Ok(categories);
    }
}

/// <summary>
/// Request model for tracking downloads
/// </summary>
public class TrackDownloadRequest
{
    public string DownloadUrl { get; set; } = string.Empty;
}

/// <summary>
/// Category information for the frontend
/// </summary>
public class CategoryInfo
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
