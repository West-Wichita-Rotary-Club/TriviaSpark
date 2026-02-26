# How to Update Question Images in TriviaSpark

**Date:** September 1, 2025  
**Project:** TriviaSpark  
**Focus:** Complete guide for managing question images using the EventImages API

## Overview

The TriviaSpark application provides a comprehensive system for managing images associated with trivia questions using the **EventImages API**. This system integrates with Unsplash to provide high-quality images while maintaining full compliance with attribution requirements.

## 🏗️ System Architecture

### Key Components

1. **EventImage Entity** - Database storage for question images with full Unsplash metadata
2. **EventImagesController** - REST API for image management operations
3. **EventImageService** - Business logic for Unsplash integration and image handling
4. **UnsplashService** - Direct Unsplash API integration with compliance features

### Database Schema

Each question can have one associated image stored in the `event_images` table:

```sql
-- Core fields
Id (Primary Key)
QuestionId (Foreign Key to questions table)
UnsplashImageId (Original Unsplash image ID)

-- Image URLs and metadata
ImageUrl (Direct hotlinked URL for display)
ThumbnailUrl (Thumbnail for previews)
Description (Alt text from Unsplash)

-- Unsplash compliance fields
AttributionText (Required photographer attribution)
AttributionUrl (Link to photographer profile with UTM parameters)
DownloadTrackingUrl (For Unsplash API compliance)
DownloadTracked (Boolean flag)

-- Display properties
Width, Height, Color (For UI theming)
SizeVariant (thumb, small, regular, full)

-- Analytics and management
UsageContext (question_image, background, etc.)
SearchContext (Original search query)
CreatedAt, LastUsedAt, ExpiresAt
SelectedByUserId (Who chose the image)
```

## 🔧 API Endpoints Reference

### Base URL

```
https://localhost:14165/api/eventimages
```

### Core Operations

#### 1. Search Images for a Question

```http
GET /api/eventimages/search?questionId={questionId}&query={searchTerm}&size=regular
```

**Purpose:** Find Unsplash images for a question and get current saved image  
**Response:** Combined search results and current question image

#### 2. Save Image for Question

```http
POST /api/eventimages
Content-Type: application/json

{
  "questionId": "question-123",
  "unsplashImageId": "unsplash-image-id",
  "sizeVariant": "regular",
  "usageContext": "question_image",
  "selectedByUserId": "user-123",
  "searchContext": "wine trivia"
}
```

#### 3. Get Current Question Image

```http
GET /api/eventimages/question/{questionId}
```

#### 4. Replace Existing Image

```http
PUT /api/eventimages/question/{questionId}/replace
Content-Type: application/json

{
  "newUnsplashImageId": "new-image-id",
  "sizeVariant": "regular",
  "selectedByUserId": "user-123"
}
```

#### 5. Remove Question Image

```http
DELETE /api/eventimages/question/{questionId}
```

#### 6. Track Image Usage (Required for Unsplash Compliance)

```http
POST /api/eventimages/question/{questionId}/track-usage
```

## 🚀 Step-by-Step Implementation Guide

### Step 1: Search for Images

First, search for appropriate images for your question:

```http
GET /api/eventimages/search?questionId=your-question-id&query=wine%20vineyard&size=regular
Accept: application/json
```

**Response includes:**

- Unsplash search results with attribution
- Current saved image for the question (if any)
- Pagination information

### Step 2: Save Selected Image

Once you've found the perfect image, save it:

```http
POST /api/eventimages
Content-Type: application/json

{
  "questionId": "your-question-id",
  "unsplashImageId": "abc123def456",
  "sizeVariant": "regular",
  "usageContext": "question_image",
  "selectedByUserId": "current-user-id",
  "searchContext": "wine vineyard"
}
```

**The API automatically:**

- Fetches full image metadata from Unsplash
- Generates compliant attribution with UTM parameters
- Stores all required compliance information
- Sets up download tracking

### Step 3: Display the Image

When displaying the image in your frontend:

```typescript
// Get the image data
const response = await fetch(`/api/eventimages/question/${questionId}`);
const imageData = await response.json();

// Display with required attribution
<div className="question-image-container">
  <img 
    src={imageData.imageUrl} 
    alt={imageData.description || 'Question image'}
    className="question-image"
  />
  
  {/* Required attribution display */}
  <div className="image-attribution">
    <a href={imageData.attributionUrl} target="_blank" rel="noopener noreferrer">
      {imageData.attributionText}
    </a>
  </div>
</div>

// Track usage for Unsplash compliance
await fetch(`/api/eventimages/question/${questionId}/track-usage`, {
  method: 'POST'
});
```

### Step 4: Update or Replace Images

To change an existing image:

```http
PUT /api/eventimages/question/your-question-id/replace
Content-Type: application/json

{
  "newUnsplashImageId": "new-abc123def456",
  "sizeVariant": "regular",
  "selectedByUserId": "current-user-id"
}
```

## 🎯 Frontend Integration Examples

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';

interface QuestionImageManagerProps {
  questionId: string;
  userId?: string;
}

export const QuestionImageManager: React.FC<QuestionImageManagerProps> = ({ 
  questionId, 
  userId 
}) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current image
  useEffect(() => {
    loadCurrentImage();
  }, [questionId]);

  const loadCurrentImage = async () => {
    try {
      const response = await fetch(`/api/eventimages/question/${questionId}`);
      if (response.ok) {
        const image = await response.json();
        setCurrentImage(image);
        
        // Track usage when image is viewed
        await fetch(`/api/eventimages/question/${questionId}/track-usage`, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Failed to load current image:', error);
    }
  };

  const searchImages = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/eventimages/search?questionId=${questionId}&query=${encodeURIComponent(searchQuery)}&size=regular`
      );
      const result = await response.json();
      setSearchResults(result.searchResults || []);
      if (result.currentImage) {
        setCurrentImage(result.currentImage);
      }
    } catch (error) {
      console.error('Failed to search images:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = async (unsplashImageId: string) => {
    try {
      const response = await fetch('/api/eventimages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          unsplashImageId,
          sizeVariant: 'regular',
          usageContext: 'question_image',
          selectedByUserId: userId,
          searchContext: searchQuery
        })
      });
      
      if (response.ok) {
        const newImage = await response.json();
        setCurrentImage(newImage);
      }
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const removeImage = async () => {
    try {
      const response = await fetch(`/api/eventimages/question/${questionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCurrentImage(null);
      }
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  return (
    <div className="question-image-manager">
      {/* Current Image Display */}
      {currentImage && (
        <div className="current-image">
          <img 
            src={currentImage.imageUrl} 
            alt={currentImage.description || 'Question image'}
            className="w-full max-w-md rounded-lg"
          />
          <div className="attribution text-xs text-gray-600 mt-2">
            <a 
              href={currentImage.attributionUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              {currentImage.attributionText}
            </a>
          </div>
          <button 
            onClick={removeImage}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Remove Image
          </button>
        </div>
      )}

      {/* Image Search */}
      <div className="image-search mt-4">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for images..."
            className="flex-1 px-3 py-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && searchImages()}
          />
          <button 
            onClick={searchImages}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results grid grid-cols-2 md:grid-cols-3 gap-4">
            {searchResults.map((image) => (
              <div key={image.id} className="search-result">
                <img 
                  src={image.urls.small} 
                  alt={image.alt_description || 'Search result'}
                  className="w-full h-32 object-cover rounded cursor-pointer"
                  onClick={() => selectImage(image.id)}
                />
                <div className="text-xs text-gray-600 mt-1">
                  Photo by {image.user.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

## 🧪 Testing with HTTP Files

Create a test file `tests/http/event-images-api-tests.http`:

```http
### EventImages API Tests for TriviaSpark
@baseUrl = https://localhost:14165/api

### Get a question ID first (replace with actual event ID)
GET {{baseUrl}}/events/your-event-id/questions
Accept: application/json

### Test 1: Search images for a question
GET {{baseUrl}}/eventimages/search?questionId=your-question-id&query=wine&size=regular
Accept: application/json

### Test 2: Save an image for a question
POST {{baseUrl}}/eventimages
Content-Type: application/json

{
  "questionId": "your-question-id",
  "unsplashImageId": "replace-with-actual-id",
  "sizeVariant": "regular",
  "usageContext": "question_image",
  "searchContext": "wine trivia"
}

### Test 3: Get current image for question
GET {{baseUrl}}/eventimages/question/your-question-id
Accept: application/json

### Test 4: Replace existing image
PUT {{baseUrl}}/eventimages/question/your-question-id/replace
Content-Type: application/json

{
  "newUnsplashImageId": "new-image-id",
  "sizeVariant": "regular"
}

### Test 5: Track image usage (required for Unsplash compliance)
POST {{baseUrl}}/eventimages/question/your-question-id/track-usage

### Test 6: Remove image from question
DELETE {{baseUrl}}/eventimages/question/your-question-id

### Test 7: Get all images for an event
GET {{baseUrl}}/eventimages/event/your-event-id
Accept: application/json

### Test 8: Search by category
GET {{baseUrl}}/eventimages/search/category?questionId=your-question-id&category=wine&size=regular
Accept: application/json

### Test 9: Admin cleanup of expired images
POST {{baseUrl}}/eventimages/admin/cleanup-expired
```

## 🛠️ Common Workflows

### Workflow 1: Adding Image to New Question

1. **Create/Edit Question** → Get question ID
2. **Search Images** → Use search endpoint with relevant terms
3. **Preview Results** → Review Unsplash search results
4. **Select Image** → POST to save chosen image
5. **Display** → Use GET endpoint to retrieve for display
6. **Track Usage** → Call track-usage when actually shown to users

### Workflow 2: Updating Existing Question Image

1. **Load Current** → GET current image to show existing
2. **Search Alternatives** → Search for new options
3. **Replace** → Use PUT replace endpoint
4. **Verify** → GET updated image to confirm changes

### Workflow 3: Bulk Image Management

1. **Get Event Images** → GET all images for an event
2. **Review Usage** → Check which questions have images
3. **Update Missing** → Add images to questions without them
4. **Cleanup** → Remove unused or expired images

## 🔐 Security & Compliance Notes

### Unsplash Compliance

- **Attribution Required:** Always display attribution text and links
- **UTM Parameters:** Automatically included in all attribution URLs
- **Download Tracking:** Required when images are actually displayed
- **Hotlinked URLs:** Never store images locally, always use Unsplash URLs

### API Security

- **Input Validation:** All endpoints validate required parameters
- **Error Handling:** Comprehensive error responses for debugging
- **Rate Limiting:** Respects Unsplash API rate limits
- **Logging:** Full audit trail of image operations

## 📊 Monitoring & Analytics

### Built-in Analytics

- **Search Context:** Tracks what searches led to image selection
- **Usage Tracking:** Records when images are actually displayed
- **User Attribution:** Tracks who selected each image
- **Cache Management:** Automatic cleanup of expired image data

### Performance Optimization

- **Size Variants:** Multiple image sizes for different use cases
- **Caching:** Database caching of Unsplash metadata
- **Lazy Loading:** Frontend can load images on demand
- **CDN URLs:** Direct Unsplash CDN links for optimal performance

## 🚨 Troubleshooting

### Common Issues

1. **"Question not found"** → Verify question ID exists in database
2. **"Image already exists"** → Use replace endpoint instead of save
3. **"Unsplash API error"** → Check API key configuration
4. **"Attribution missing"** → Ensure frontend displays attribution
5. **"Download tracking failed"** → Check Unsplash API connectivity

### Debug Steps

1. **Check Logs:** Review API logs for detailed error information
2. **Verify IDs:** Ensure question and image IDs are valid
3. **Test Endpoints:** Use HTTP test files to isolate issues
4. **Check Configuration:** Verify Unsplash API key is working
5. **Database State:** Query database directly if needed

## 📋 Next Steps

1. **Implement Frontend Components** using the React example above
2. **Add Image Categories** for easier searching
3. **Implement Batch Operations** for multiple questions
4. **Add Image Approval Workflow** for moderated events
5. **Create Admin Dashboard** for image management

This comprehensive system provides everything needed to manage question images in TriviaSpark while maintaining full Unsplash compliance and providing a great user experience.
