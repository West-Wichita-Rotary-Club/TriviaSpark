# Unsplash Image Service Integration

## Overview

The TriviaSpark API now includes a comprehensive Unsplash service integration that allows searching and selecting public images for trivia events. This service follows Azure best practices for external API integration and provides a secure, efficient way to access Unsplash's vast collection of high-quality images.

## Features

### Core Functionality

- **Image Search**: Search Unsplash's database with custom queries and filters
- **Category-Based Search**: Predefined trivia categories for quick image discovery
- **Featured Images**: Access to popular and trending images
- **Image Details**: Retrieve complete metadata for specific images
- **Download Tracking**: Compliance with Unsplash API requirements for usage tracking
- **Simplified Selection**: Convert Unsplash images to frontend-friendly format

### Security & Performance

- **Rate Limiting Compliance**: Built-in handling of Unsplash API rate limits
- **Input Validation**: Comprehensive validation to prevent injection attacks
- **Connection Pooling**: Efficient HTTP client configuration with connection reuse
- **Error Handling**: Robust error handling with proper logging and recovery
- **Timeout Management**: Configurable timeouts to prevent hanging requests

## API Endpoints

### Search Images

```http
GET /api/unsplash/search
```

**Parameters:**

- `query` (required): Search term
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20, max: 30)
- `orderBy` (optional): Sort order - "relevant" or "latest" (default: "relevant")
- `color` (optional): Color filter - black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, blue
- `orientation` (optional): Orientation filter - landscape, portrait, squarish

**Example:**

```http
GET /api/unsplash/search?query=wine&page=1&perPage=10&color=red&orientation=landscape
```

### Search by Category

```http
GET /api/unsplash/categories/{category}
```

**Supported Categories:**

- `wine` - Wine, vineyards, beverages
- `food` - Food, cooking, restaurants
- `history` - Historical sites, museums, culture
- `science` - Research, technology, laboratories
- `sports` - Athletic activities, recreation
- `nature` - Landscapes, wildlife, outdoors
- `travel` - Destinations, landmarks, tourism
- `business` - Corporate, professional environments
- `education` - Schools, learning, academic
- `arts` - Creative works, galleries, culture

**Example:**

```http
GET /api/unsplash/categories/wine?page=1&perPage=15
```

### Get Specific Image

```http
GET /api/unsplash/images/{id}
```

Returns complete image metadata including URLs, user information, and statistics.

### Get Image Selection

```http
GET /api/unsplash/images/{id}/selection?size=regular
```

Returns a simplified image object optimized for frontend use with proper attribution.

**Size Options:**

- `thumb` - Small thumbnail (200px)
- `small` - Small image (400px)
- `regular` - Regular size (1080px width)
- `full` - Full resolution
- `raw` - Original unprocessed image

### Get Featured Images

```http
GET /api/unsplash/featured?page=1&perPage=20
```

Returns popular and trending images from Unsplash.

### Track Download

```http
POST /api/unsplash/track-download
```

**Request Body:**

```json
{
  "downloadUrl": "https://api.unsplash.com/photos/photo-id/download?ixid=tracking-id"
}
```

Required for Unsplash API compliance when an image is actually used in the application.

### Get Available Categories

```http
GET /api/unsplash/categories
```

Returns list of available trivia categories with descriptions.

## Configuration

### appsettings.json

```json
{
  "Unsplash": {
    "AccessKey": "your-unsplash-access-key",
    "BaseUrl": "https://api.unsplash.com",
    "DefaultPerPage": 20,
    "MaxPerPage": 30,
    "ApplicationName": "TriviaSpark"
  }
}
```

### Environment Variables

For production deployments, you can also configure using environment variables:

- `Unsplash__AccessKey` - Your Unsplash Access Key
- `Unsplash__ApplicationName` - Application name for API tracking

## Setup Instructions

### 1. Get Unsplash API Access

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key from the application dashboard

### 2. Configure the Service

1. Add your Unsplash Access Key to `appsettings.json` or environment variables
2. The service is automatically registered in `Program.cs` with dependency injection

### 3. Test the Integration

Use the provided HTTP test file at `tests/http/unsplash-api-tests.http` to verify the integration:

```bash
# Build and run the API
dotnet build ./TriviaSpark.Api/TriviaSpark.Api.csproj
dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
```

Then use VS Code REST Client extension to run the tests in the HTTP file.

## Usage Examples

### Frontend Integration

```typescript
// Search for wine-related images
const searchResponse = await fetch('/api/unsplash/search?query=wine&perPage=12');
const images = await searchResponse.json();

// Get image in selection format
const imageResponse = await fetch(`/api/unsplash/images/${imageId}/selection?size=regular`);
const imageSelection = await imageResponse.json();

// Track download when image is used
await fetch('/api/unsplash/track-download', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ downloadUrl: image.links.download_location })
});
```

### Service Usage in Controllers

```csharp
public class MyController : ControllerBase
{
    private readonly IUnsplashService _unsplashService;

    public MyController(IUnsplashService unsplashService)
    {
        _unsplashService = unsplashService;
    }

    public async Task<ActionResult> GetEventImages(string eventTheme)
    {
        var searchParams = new UnsplashSearchParams
        {
            Query = eventTheme,
            PerPage = 10,
            OrderBy = "relevant"
        };

        var result = await _unsplashService.SearchImagesAsync(searchParams);
        return Ok(result);
    }
}
```

## Best Practices

### Rate Limiting

- Unsplash allows 5,000 requests per hour for production apps
- The service automatically handles rate limit responses
- Consider implementing caching for frequently requested images

### Attribution Requirements

- Always display proper attribution when using Unsplash images
- Use the `AttributionText` and `AttributionUrl` from the `ImageSelection` response
- Required format: "Photo by [Photographer Name] on Unsplash"

### Download Tracking

- Call the track download endpoint when an image is actually used
- This is required by Unsplash API terms of service
- Failure to track downloads may result in API access restrictions

### Image Optimization

- Use appropriate image sizes for your use case
- `thumb` for previews and grid views
- `small` for cards and thumbnails
- `regular` for main content display
- `full` only when high resolution is required

### Error Handling

- The service returns null for failed requests with proper logging
- Always check for null responses in your frontend code
- Implement fallback images for better user experience

## Monitoring and Logging

The service includes comprehensive logging at different levels:

- **Information**: Successful operations, search queries, results counts
- **Warning**: Rate limiting, invalid requests, missing configuration
- **Error**: Network errors, API failures, unexpected exceptions
- **Debug**: Detailed request/response information (development only)

Configure logging levels in `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "TriviaSpark.Api.Services.EfCore.UnsplashService": "Information"
    }
  }
}
```

## Security Considerations

### API Key Protection

- Store Unsplash Access Key in secure configuration (Azure Key Vault for production)
- Never commit API keys to source control
- Use environment variables or secure configuration providers

### Input Validation

- All user inputs are validated and sanitized
- Image IDs are checked against valid format patterns
- Search queries are properly encoded to prevent injection

### Network Security

- HTTPS-only communication with Unsplash API
- Connection pooling with proper timeout handling
- No sensitive data is logged or exposed

## Troubleshooting

### Common Issues

1. **Empty/Null Results**
   - Check API key configuration
   - Verify network connectivity
   - Review application logs for error details

2. **Rate Limiting**
   - Monitor API usage in Unsplash dashboard
   - Implement request caching to reduce API calls
   - Consider upgrading to higher tier if needed

3. **Image Loading Failures**
   - Validate image URLs are not expired
   - Check for CORS issues in browser
   - Verify proper attribution is displayed

### Debug Mode

Enable debug logging for detailed troubleshooting:

```json
{
  "Logging": {
    "LogLevel": {
      "TriviaSpark.Api.Services.EfCore.UnsplashService": "Debug"
    }
  }
}
```

## Future Enhancements

### Planned Features

- **Caching Layer**: Redis cache for frequently accessed images
- **Bulk Operations**: Batch image processing for better performance
- **Smart Categorization**: AI-powered automatic image categorization
- **Usage Analytics**: Track popular search terms and categories
- **Image Collections**: Curated image sets for specific event types

### Integration Opportunities

- **AI Question Generation**: Use image metadata to generate trivia questions
- **Event Theming**: Automatic image selection based on event type
- **Performance Optimization**: CDN integration for faster image delivery
- **Advanced Filtering**: Machine learning-based image relevance scoring

## License and Compliance

This integration complies with:

- Unsplash API Terms of Service
- Attribution requirements for free Unsplash usage
- Rate limiting and usage tracking requirements
- Best practices for third-party API integration

For commercial usage or higher rate limits, consider upgrading to Unsplash+ API.
