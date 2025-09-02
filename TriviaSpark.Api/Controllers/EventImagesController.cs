using Microsoft.AspNetCore.Mvc;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Services.EfCore;

namespace TriviaSpark.Api.Controllers;

/// <summary>
/// Controller for managing EventImages - images from Unsplash saved for specific questions
/// Provides endpoints for searching, selecting, and managing images for trivia questions
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EventImagesController : ControllerBase
{
    private readonly IEventImageService _eventImageService;
    private readonly ILogger<EventImagesController> _logger;

    public EventImagesController(
        IEventImageService eventImageService,
        ILogger<EventImagesController> logger)
    {
        _eventImageService = eventImageService ?? throw new ArgumentNullException(nameof(eventImageService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Search for images and get current saved image for a question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="query">Search query</param>
    /// <param name="size">Image size variant (thumb, small, regular, full)</param>
    /// <param name="context">Usage context for analytics</param>
    /// <param name="userId">User performing the search</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Search results and current saved image</returns>
    [HttpGet("search")]
    [ProducesResponseType(typeof(ImageSearchAndSelectionResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<ImageSearchAndSelectionResult>> SearchImagesForQuestion(
        [FromQuery] string questionId,
        [FromQuery] string query,
        [FromQuery] string size = "regular",
        [FromQuery] string? context = null,
        [FromQuery] string? userId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest(new { error = "Search query is required" });
            }

            _logger.LogInformation("Searching images for question {QuestionId} with query: {Query}", 
                questionId, query);

            var result = await _eventImageService.SearchAndSelectImageAsync(
                questionId, query, size, context, userId, cancellationToken);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching images for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while searching images" });
        }
    }

    /// <summary>
    /// Search images by category for a question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="category">Category name</param>
    /// <param name="size">Image size variant</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Category search results and current saved image</returns>
    [HttpGet("search/category")]
    [ProducesResponseType(typeof(ImageSearchAndSelectionResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<ImageSearchAndSelectionResult>> SearchImagesByCategory(
        [FromQuery] string questionId,
        [FromQuery] string category,
        [FromQuery] string size = "regular",
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            if (string.IsNullOrWhiteSpace(category))
            {
                return BadRequest(new { error = "Category is required" });
            }

            _logger.LogInformation("Searching images by category {Category} for question {QuestionId}", 
                category, questionId);

            var result = await _eventImageService.SearchImagesByCategoryForQuestionAsync(
                questionId, category, size, cancellationToken);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching images by category {Category} for question {QuestionId}: {Message}", 
                category, questionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while searching images by category" });
        }
    }

    /// <summary>
    /// Save a specific image for a question
    /// </summary>
    /// <param name="request">Image save request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Saved EventImage</returns>
    [HttpPost]
    [ProducesResponseType(typeof(EventImageResponse), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<EventImageResponse>> SaveImageForQuestion(
        [FromBody] CreateEventImageRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { error = "Request body is required" });
            }

            if (string.IsNullOrWhiteSpace(request.QuestionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            if (string.IsNullOrWhiteSpace(request.UnsplashImageId))
            {
                return BadRequest(new { error = "Unsplash Image ID is required" });
            }

            _logger.LogInformation("Saving image {UnsplashImageId} for question {QuestionId}", 
                request.UnsplashImageId, request.QuestionId);

            var eventImage = await _eventImageService.SaveImageForQuestionAsync(request, cancellationToken);

            if (eventImage == null)
            {
                return BadRequest(new { error = "Failed to save image. Question or image may not exist." });
            }

            var response = _eventImageService.ToEventImageResponse(eventImage);
            return CreatedAtAction(nameof(GetImageForQuestion), 
                new { questionId = eventImage.QuestionId }, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving image {UnsplashImageId} for question {QuestionId}: {Message}", 
                request?.UnsplashImageId, request?.QuestionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while saving the image" });
        }
    }

    /// <summary>
    /// Get the saved image for a specific question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>EventImage if found</returns>
    [HttpGet("question/{questionId}")]
    [ProducesResponseType(typeof(EventImageResponse), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<EventImageResponse>> GetImageForQuestion(
        string questionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            var eventImage = await _eventImageService.GetImageForQuestionAsync(questionId, cancellationToken);

            if (eventImage == null)
            {
                return NotFound(new { error = "No image found for this question" });
            }

            var response = _eventImageService.ToEventImageResponse(eventImage);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting image for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while retrieving the image" });
        }
    }

    /// <summary>
    /// Get all images for a specific event
    /// </summary>
    /// <param name="eventId">Event ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of EventImages for the event</returns>
    [HttpGet("event/{eventId}")]
    [ProducesResponseType(typeof(List<EventImageResponse>), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<List<EventImageResponse>>> GetImagesForEvent(
        string eventId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(eventId))
            {
                return BadRequest(new { error = "Event ID is required" });
            }

            var eventImages = await _eventImageService.GetImagesForEventAsync(eventId, cancellationToken);

            var responses = eventImages
                .Select(ei => _eventImageService.ToEventImageResponse(ei))
                .ToList();

            return Ok(responses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting images for event {EventId}: {Message}", 
                eventId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while retrieving event images" });
        }
    }

    /// <summary>
    /// Replace an existing question image with a new one
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="request">Replacement request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated EventImage</returns>
    [HttpPut("question/{questionId}/replace")]
    [ProducesResponseType(typeof(EventImageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<EventImageResponse>> ReplaceQuestionImage(
        string questionId,
        [FromBody] ReplaceImageRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            if (request == null || string.IsNullOrWhiteSpace(request.NewUnsplashImageId))
            {
                return BadRequest(new { error = "New Unsplash Image ID is required" });
            }

            _logger.LogInformation("Replacing image for question {QuestionId} with {UnsplashImageId}", 
                questionId, request.NewUnsplashImageId);

            var eventImage = await _eventImageService.ReplaceQuestionImageAsync(
                questionId, 
                request.NewUnsplashImageId, 
                request.SizeVariant ?? "regular",
                request.SelectedByUserId,
                cancellationToken);

            if (eventImage == null)
            {
                return BadRequest(new { error = "Failed to replace image. Question or new image may not exist." });
            }

            var response = _eventImageService.ToEventImageResponse(eventImage);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error replacing image for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while replacing the image" });
        }
    }

    /// <summary>
    /// Remove the saved image for a question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success status</returns>
    [HttpDelete("question/{questionId}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult> RemoveImageForQuestion(
        string questionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            _logger.LogInformation("Removing image for question {QuestionId}", questionId);

            var success = await _eventImageService.RemoveImageForQuestionAsync(questionId, cancellationToken);

            if (!success)
            {
                return NotFound(new { error = "No image found for this question" });
            }

            return Ok(new { message = "Image removed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing image for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while removing the image" });
        }
    }

    /// <summary>
    /// Track image usage for Unsplash compliance
    /// Should be called when an image is actually displayed to users
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success status</returns>
    [HttpPost("question/{questionId}/track-usage")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(500)]
    public async Task<ActionResult> TrackImageUsage(
        string questionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
            {
                return BadRequest(new { error = "Question ID is required" });
            }

            var success = await _eventImageService.TrackImageUsageAsync(questionId, cancellationToken);

            if (!success)
            {
                return NotFound(new { error = "No image found for this question or tracking failed" });
            }

            return Ok(new { message = "Image usage tracked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking image usage for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return StatusCode(500, new { error = "An error occurred while tracking image usage" });
        }
    }

    /// <summary>
    /// Administrative endpoint to cleanup expired image cache entries
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of cleaned up entries</returns>
    [HttpPost("admin/cleanup-expired")]
    [ProducesResponseType(typeof(CleanupResult), 200)]
    [ProducesResponseType(500)]
    public async Task<ActionResult<CleanupResult>> CleanupExpiredImages(
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Starting cleanup of expired image cache entries");

            var cleanedCount = await _eventImageService.CleanupExpiredImagesAsync(cancellationToken);

            var result = new CleanupResult
            {
                CleanedCount = cleanedCount,
                Message = $"Successfully cleaned up {cleanedCount} expired image cache entries"
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired images: {Message}", ex.Message);
            return StatusCode(500, new { error = "An error occurred while cleaning up expired images" });
        }
    }
}

/// <summary>
/// Request model for replacing an image
/// </summary>
public class ReplaceImageRequest
{
    public string NewUnsplashImageId { get; set; } = string.Empty;
    public string? SizeVariant { get; set; } = "regular";
    public string? SelectedByUserId { get; set; }
}

/// <summary>
/// Result model for cleanup operations
/// </summary>
public class CleanupResult
{
    public int CleanedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}
