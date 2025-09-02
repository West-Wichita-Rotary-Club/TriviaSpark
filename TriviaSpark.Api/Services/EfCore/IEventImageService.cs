using TriviaSpark.Api.Data.Entities;
using TriviaSpark.Api.Services.Models;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Service interface for managing EventImages - images from Unsplash that are saved for specific questions
/// Provides functionality to search, select, store, and manage images for trivia questions
/// </summary>
public interface IEventImageService
{
    /// <summary>
    /// Search for images and optionally save one for a specific question
    /// </summary>
    /// <param name="questionId">Question ID to associate the image with</param>
    /// <param name="searchQuery">Search query for Unsplash</param>
    /// <param name="sizeVariant">Preferred image size (thumb, small, regular, full)</param>
    /// <param name="usageContext">Context for analytics (background, question_image, etc.)</param>
    /// <param name="selectedByUserId">User who is selecting the image</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Search results and any existing saved image for the question</returns>
    Task<ImageSearchAndSelectionResult> SearchAndSelectImageAsync(
        string questionId,
        string searchQuery,
        string sizeVariant = "regular",
        string? usageContext = null,
        string? selectedByUserId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Save a specific Unsplash image for a question
    /// </summary>
    /// <param name="request">Image creation request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created EventImage or null if failed</returns>
    Task<EventImage?> SaveImageForQuestionAsync(
        CreateEventImageRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the saved image for a specific question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>EventImage if found, null otherwise</returns>
    Task<EventImage?> GetImageForQuestionAsync(
        string questionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all images for a specific event (through questions)
    /// </summary>
    /// <param name="eventId">Event ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of EventImages for the event</returns>
    Task<List<EventImage>> GetImagesForEventAsync(
        string eventId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing EventImage
    /// </summary>
    /// <param name="eventImage">EventImage to update</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated EventImage or null if not found</returns>
    Task<EventImage?> UpdateEventImageAsync(
        EventImage eventImage,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Remove the saved image for a question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if removed, false if not found</returns>
    Task<bool> RemoveImageForQuestionAsync(
        string questionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Mark an image as downloaded (for Unsplash compliance)
    /// This should be called when the image is actually displayed to users
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if tracking was successful</returns>
    Task<bool> TrackImageUsageAsync(
        string questionId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Replace an existing question image with a new one from Unsplash
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="newUnsplashImageId">New Unsplash image ID</param>
    /// <param name="sizeVariant">Preferred image size</param>
    /// <param name="selectedByUserId">User making the change</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated EventImage or null if failed</returns>
    Task<EventImage?> ReplaceQuestionImageAsync(
        string questionId,
        string newUnsplashImageId,
        string sizeVariant = "regular",
        string? selectedByUserId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get images that need download tracking (compliance with Unsplash API)
    /// </summary>
    /// <param name="limit">Maximum number of images to return</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of EventImages that need download tracking</returns>
    Task<List<EventImage>> GetImagesNeedingDownloadTrackingAsync(
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Clean up expired image cache entries
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of expired entries removed</returns>
    Task<int> CleanupExpiredImagesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Search for images by category for a specific question
    /// </summary>
    /// <param name="questionId">Question ID</param>
    /// <param name="category">Trivia category</param>
    /// <param name="sizeVariant">Preferred image size</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Search results and any existing saved image</returns>
    Task<ImageSearchAndSelectionResult> SearchImagesByCategoryForQuestionAsync(
        string questionId,
        string category,
        string sizeVariant = "regular",
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Convert EventImage to response DTO
    /// </summary>
    /// <param name="eventImage">EventImage entity</param>
    /// <returns>EventImageResponse DTO</returns>
    EventImageResponse ToEventImageResponse(EventImage eventImage);
}

/// <summary>
/// Result containing both search results and any existing saved image for a question
/// </summary>
public class ImageSearchAndSelectionResult
{
    /// <summary>
    /// Search results from Unsplash
    /// </summary>
    public UnsplashSearchResponse? SearchResults { get; set; }

    /// <summary>
    /// Currently saved image for the question (if any)
    /// </summary>
    public EventImage? CurrentImage { get; set; }

    /// <summary>
    /// Simplified image selections for frontend consumption
    /// </summary>
    public List<ImageSelection> ImageSelections { get; set; } = new();

    /// <summary>
    /// The search query that was used
    /// </summary>
    public string SearchQuery { get; set; } = string.Empty;

    /// <summary>
    /// The question ID this search is for
    /// </summary>
    public string QuestionId { get; set; } = string.Empty;
}
