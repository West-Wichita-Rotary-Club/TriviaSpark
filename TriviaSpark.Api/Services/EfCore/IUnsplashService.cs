using TriviaSpark.Api.Services.Models;

namespace TriviaSpark.Api.Services.EfCore;

/// <summary>
/// Service interface for Unsplash API integration
/// Provides image search and selection capabilities for TriviaSpark events
/// </summary>
public interface IUnsplashService
{
    /// <summary>
    /// Search for images on Unsplash
    /// </summary>
    /// <param name="searchParams">Search parameters including query, page, and filters</param>
    /// <param name="cancellationToken">Cancellation token for request timeout</param>
    /// <returns>Search response with images and pagination info</returns>
    Task<UnsplashSearchResponse?> SearchImagesAsync(UnsplashSearchParams searchParams, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a specific image by ID from Unsplash
    /// </summary>
    /// <param name="imageId">Unsplash image ID</param>
    /// <param name="cancellationToken">Cancellation token for request timeout</param>
    /// <returns>Image details or null if not found</returns>
    Task<UnsplashImage?> GetImageByIdAsync(string imageId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Convert Unsplash image to simplified selection format for frontend
    /// </summary>
    /// <param name="unsplashImage">Unsplash image object</param>
    /// <param name="preferredSize">Preferred image size (thumb, small, regular, full)</param>
    /// <returns>Simplified image selection object</returns>
    ImageSelection ToImageSelection(UnsplashImage unsplashImage, string preferredSize = "regular");

    /// <summary>
    /// Trigger download tracking for Unsplash API compliance
    /// Required when an image is actually used in the application
    /// </summary>
    /// <param name="downloadUrl">Download tracking URL from Unsplash image</param>
    /// <param name="cancellationToken">Cancellation token for request timeout</param>
    /// <returns>True if tracking was successful</returns>
    Task<bool> TrackDownloadAsync(string downloadUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get curated collections for quick image browsing
    /// </summary>
    /// <param name="page">Page number for pagination</param>
    /// <param name="perPage">Number of collections per page</param>
    /// <param name="cancellationToken">Cancellation token for request timeout</param>
    /// <returns>List of featured collections</returns>
    Task<List<UnsplashImage>> GetFeaturedImagesAsync(int page = 1, int perPage = 20, CancellationToken cancellationToken = default);

    /// <summary>
    /// Search for images with trivia-specific categories
    /// </summary>
    /// <param name="category">Trivia category (e.g., "wine", "food", "history", "science")</param>
    /// <param name="page">Page number for pagination</param>
    /// <param name="perPage">Number of images per page</param>
    /// <param name="cancellationToken">Cancellation token for request timeout</param>
    /// <returns>Category-specific image search results</returns>
    Task<UnsplashSearchResponse?> SearchImagesByCategoryAsync(string category, int page = 1, int perPage = 20, CancellationToken cancellationToken = default);
}
