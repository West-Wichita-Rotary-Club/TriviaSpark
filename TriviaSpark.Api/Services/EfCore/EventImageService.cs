using Microsoft.EntityFrameworkCore;
using TriviaSpark.Api.Data;
using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Services.Models;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Service for managing EventImages - images from Unsplash saved for specific questions
/// Implements secure, efficient image management with Unsplash API compliance
/// Following Azure best practices for data access and external API integration
/// </summary>
public class EventImageService : IEventImageService
{
    private readonly TriviaSparkDbContext _context;
    private readonly IUnsplashService _unsplashService;
    private readonly ILogger<EventImageService> _logger;

    public EventImageService(
        TriviaSparkDbContext context,
        IUnsplashService unsplashService,
        ILogger<EventImageService> logger)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _unsplashService = unsplashService ?? throw new ArgumentNullException(nameof(unsplashService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<ImageSearchAndSelectionResult> SearchAndSelectImageAsync(
        string questionId,
        string searchQuery,
        string sizeVariant = "regular",
        string? usageContext = null,
        string? selectedByUserId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
                throw new ArgumentException("Question ID is required", nameof(questionId));

            if (string.IsNullOrWhiteSpace(searchQuery))
                throw new ArgumentException("Search query is required", nameof(searchQuery));

            _logger.LogInformation("Searching images for question {QuestionId} with query: {SearchQuery}", 
                questionId, searchQuery);

            // Get current saved image for the question
            var currentImage = await GetImageForQuestionAsync(questionId, cancellationToken);

            // Search Unsplash for new images
            var searchParams = new UnsplashSearchParams
            {
                Query = searchQuery,
                Page = 1,
                PerPage = 20,
                OrderBy = "relevant",
                ContentFilter = "high"
            };

            var searchResults = await _unsplashService.SearchImagesAsync(searchParams, cancellationToken);

            // Convert search results to simplified selections
            var imageSelections = new List<ImageSelection>();
            if (searchResults?.Results != null)
            {
                imageSelections = searchResults.Results
                    .Select(img => _unsplashService.ToImageSelection(img, sizeVariant))
                    .ToList();
            }

            var result = new ImageSearchAndSelectionResult
            {
                SearchResults = searchResults,
                CurrentImage = currentImage,
                ImageSelections = imageSelections,
                SearchQuery = searchQuery,
                QuestionId = questionId
            };

            _logger.LogInformation("Found {ResultCount} images for question {QuestionId}", 
                imageSelections.Count, questionId);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching images for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            
            // Return empty result on error
            return new ImageSearchAndSelectionResult
            {
                SearchQuery = searchQuery,
                QuestionId = questionId
            };
        }
    }

    public async Task<EventImage?> SaveImageForQuestionAsync(
        CreateEventImageRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (string.IsNullOrWhiteSpace(request.QuestionId))
                throw new ArgumentException("Question ID is required", nameof(request));

            if (string.IsNullOrWhiteSpace(request.UnsplashImageId))
                throw new ArgumentException("Unsplash Image ID is required", nameof(request));

            _logger.LogInformation("Saving image {UnsplashImageId} for question {QuestionId}", 
                request.UnsplashImageId, request.QuestionId);

            // Verify the question exists
            var questionExists = await _context.Questions
                .AnyAsync(q => q.Id == request.QuestionId, cancellationToken);

            if (!questionExists)
            {
                _logger.LogWarning("Question {QuestionId} not found", request.QuestionId);
                return null;
            }

            // Get image details from Unsplash
            var unsplashImage = await _unsplashService.GetImageByIdAsync(request.UnsplashImageId, cancellationToken);
            if (unsplashImage == null)
            {
                _logger.LogWarning("Unsplash image {UnsplashImageId} not found", request.UnsplashImageId);
                return null;
            }

            // Remove existing image for the question if any
            await RemoveImageForQuestionAsync(request.QuestionId, cancellationToken);

            // Create image selection
            var imageSelection = _unsplashService.ToImageSelection(unsplashImage, request.SizeVariant);

            // Create new EventImage entity
            var eventImage = new EventImage
            {
                Id = Guid.NewGuid().ToString(),
                QuestionId = request.QuestionId,
                UnsplashImageId = request.UnsplashImageId,
                ImageUrl = imageSelection.Url,
                ThumbnailUrl = imageSelection.ThumbnailUrl,
                Description = imageSelection.Description,
                AttributionText = imageSelection.AttributionText,
                AttributionUrl = imageSelection.AttributionUrl,
                DownloadTrackingUrl = unsplashImage.Links.DownloadLocation,
                Width = imageSelection.Width,
                Height = imageSelection.Height,
                Color = imageSelection.Color,
                SizeVariant = request.SizeVariant,
                UsageContext = request.UsageContext,
                SelectedByUserId = request.SelectedByUserId,
                SearchContext = request.SearchContext,
                DownloadTracked = false,
                CreatedAt = DateTime.UtcNow,
                LastUsedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(30) // Cache for 30 days
            };

            _context.EventImages.Add(eventImage);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully saved image {UnsplashImageId} for question {QuestionId} with ID {EventImageId}", 
                request.UnsplashImageId, request.QuestionId, eventImage.Id);

            return eventImage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving image {UnsplashImageId} for question {QuestionId}: {Message}", 
                request.UnsplashImageId, request.QuestionId, ex.Message);
            return null;
        }
    }

    public async Task<EventImage?> GetImageForQuestionAsync(
        string questionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
                return null;

            var eventImage = await _context.EventImages
                .Include(ei => ei.Question)
                .Include(ei => ei.SelectedBy)
                .FirstOrDefaultAsync(ei => ei.QuestionId == questionId, cancellationToken);

            if (eventImage != null)
            {
                // Update last used timestamp
                eventImage.LastUsedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }

            return eventImage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting image for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return null;
        }
    }

    public async Task<List<EventImage>> GetImagesForEventAsync(
        string eventId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(eventId))
                return new List<EventImage>();

            var eventImages = await _context.EventImages
                .Include(ei => ei.Question)
                .Include(ei => ei.SelectedBy)
                .Where(ei => ei.Question.EventId == eventId)
                .OrderBy(ei => ei.Question.OrderIndex)
                .ToListAsync(cancellationToken);

            _logger.LogDebug("Found {ImageCount} images for event {EventId}", 
                eventImages.Count, eventId);

            return eventImages;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting images for event {EventId}: {Message}", 
                eventId, ex.Message);
            return new List<EventImage>();
        }
    }

    public async Task<EventImage?> UpdateEventImageAsync(
        EventImage eventImage,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (eventImage == null)
                return null;

            _context.EventImages.Update(eventImage);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogDebug("Updated EventImage {EventImageId}", eventImage.Id);

            return eventImage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating EventImage {EventImageId}: {Message}", 
                eventImage?.Id, ex.Message);
            return null;
        }
    }

    public async Task<bool> RemoveImageForQuestionAsync(
        string questionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
                return false;

            var existingImage = await _context.EventImages
                .FirstOrDefaultAsync(ei => ei.QuestionId == questionId, cancellationToken);

            if (existingImage != null)
            {
                _context.EventImages.Remove(existingImage);
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Removed image {EventImageId} for question {QuestionId}", 
                    existingImage.Id, questionId);

                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing image for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return false;
        }
    }

    public async Task<bool> TrackImageUsageAsync(
        string questionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
                return false;

            var eventImage = await _context.EventImages
                .FirstOrDefaultAsync(ei => ei.QuestionId == questionId, cancellationToken);

            if (eventImage == null)
            {
                _logger.LogWarning("No image found for question {QuestionId} to track usage", questionId);
                return false;
            }

            // Skip if already tracked
            if (eventImage.DownloadTracked)
            {
                _logger.LogDebug("Image usage already tracked for question {QuestionId}", questionId);
                return true;
            }

            // Track download with Unsplash
            var success = await _unsplashService.TrackDownloadAsync(
                eventImage.DownloadTrackingUrl, 
                cancellationToken);

            if (success)
            {
                eventImage.DownloadTracked = true;
                eventImage.LastUsedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Successfully tracked image usage for question {QuestionId}", questionId);
            }
            else
            {
                _logger.LogWarning("Failed to track image usage for question {QuestionId}", questionId);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error tracking image usage for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return false;
        }
    }

    public async Task<EventImage?> ReplaceQuestionImageAsync(
        string questionId,
        string newUnsplashImageId,
        string sizeVariant = "regular",
        string? selectedByUserId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Replacing image for question {QuestionId} with new image {UnsplashImageId}", 
                questionId, newUnsplashImageId);

            var request = new CreateEventImageRequest
            {
                QuestionId = questionId,
                UnsplashImageId = newUnsplashImageId,
                SizeVariant = sizeVariant,
                SelectedByUserId = selectedByUserId,
                UsageContext = "replacement",
                SearchContext = "manual_replacement"
            };

            return await SaveImageForQuestionAsync(request, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error replacing image for question {QuestionId}: {Message}", 
                questionId, ex.Message);
            return null;
        }
    }

    public async Task<List<EventImage>> GetImagesNeedingDownloadTrackingAsync(
        int limit = 100,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var images = await _context.EventImages
                .Where(ei => !ei.DownloadTracked)
                .OrderBy(ei => ei.CreatedAt)
                .Take(limit)
                .ToListAsync(cancellationToken);

            _logger.LogDebug("Found {ImageCount} images needing download tracking", images.Count);

            return images;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting images needing download tracking: {Message}", ex.Message);
            return new List<EventImage>();
        }
    }

    public async Task<int> CleanupExpiredImagesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var now = DateTime.UtcNow;
            var expiredImages = await _context.EventImages
                .Where(ei => ei.ExpiresAt.HasValue && ei.ExpiresAt.Value < now)
                .ToListAsync(cancellationToken);

            if (expiredImages.Any())
            {
                _context.EventImages.RemoveRange(expiredImages);
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Cleaned up {ExpiredCount} expired image cache entries", 
                    expiredImages.Count);
            }

            return expiredImages.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired images: {Message}", ex.Message);
            return 0;
        }
    }

    public async Task<ImageSearchAndSelectionResult> SearchImagesByCategoryForQuestionAsync(
        string questionId,
        string category,
        string sizeVariant = "regular",
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(questionId))
                throw new ArgumentException("Question ID is required", nameof(questionId));

            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("Category is required", nameof(category));

            _logger.LogInformation("Searching images by category {Category} for question {QuestionId}", 
                category, questionId);

            // Get current saved image
            var currentImage = await GetImageForQuestionAsync(questionId, cancellationToken);

            // Search by category
            var searchResults = await _unsplashService.SearchImagesByCategoryAsync(
                category, 1, 20, cancellationToken);

            // Convert to selections
            var imageSelections = new List<ImageSelection>();
            if (searchResults?.Results != null)
            {
                imageSelections = searchResults.Results
                    .Select(img => _unsplashService.ToImageSelection(img, sizeVariant))
                    .ToList();
            }

            var result = new ImageSearchAndSelectionResult
            {
                SearchResults = searchResults,
                CurrentImage = currentImage,
                ImageSelections = imageSelections,
                SearchQuery = category,
                QuestionId = questionId
            };

            _logger.LogInformation("Found {ResultCount} images in category {Category} for question {QuestionId}", 
                imageSelections.Count, category, questionId);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching images by category {Category} for question {QuestionId}: {Message}", 
                category, questionId, ex.Message);
            
            return new ImageSearchAndSelectionResult
            {
                SearchQuery = category,
                QuestionId = questionId
            };
        }
    }

    public EventImageResponse ToEventImageResponse(EventImage eventImage)
    {
        if (eventImage == null)
            throw new ArgumentNullException(nameof(eventImage));

        return new EventImageResponse
        {
            Id = eventImage.Id,
            QuestionId = eventImage.QuestionId,
            UnsplashImageId = eventImage.UnsplashImageId,
            ImageUrl = eventImage.ImageUrl,
            ThumbnailUrl = eventImage.ThumbnailUrl,
            Description = eventImage.Description,
            AttributionText = eventImage.AttributionText,
            AttributionUrl = eventImage.AttributionUrl,
            Width = eventImage.Width,
            Height = eventImage.Height,
            Color = eventImage.Color,
            SizeVariant = eventImage.SizeVariant,
            UsageContext = eventImage.UsageContext,
            DownloadTracked = eventImage.DownloadTracked,
            CreatedAt = eventImage.CreatedAt,
            LastUsedAt = eventImage.LastUsedAt,
            SearchContext = eventImage.SearchContext
        };
    }
}
