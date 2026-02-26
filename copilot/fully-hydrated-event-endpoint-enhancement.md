# Fully Hydrated Event Endpoint Enhancement

## Overview

The `/api/events/{id}` endpoint has been updated to return a fully hydrated event object that includes all related entities in a single API call. This enhancement improves performance and reduces the number of round-trips needed to get complete event information.

## Changes Made

### 1. Updated EfCoreEventService.GetEventByIdAsync()

**File**: `TriviaSpark.Api/Services/EfCore/EfCoreEventService.cs`

The method now uses Entity Framework's `.Include()` and `.ThenInclude()` methods to eagerly load all related entities:

- **Host information**: Complete user details for the event host
- **Questions**: All questions ordered by `OrderIndex`, including:
  - EventImages associated with each question
- **Teams**: All teams ordered by table number and name, including:
  - Active participants in each team, ordered by name  
- **Participants**: All active participants ordered by name
- **Fun Facts**: All active fun facts ordered by `OrderIndex`

Key improvements:
- Uses `.AsSplitQuery()` for optimal performance with multiple includes
- Applies filtering (active participants, active fun facts) at the database level
- Orders data appropriately for frontend consumption

### 2. Enhanced Question Entity

**File**: `TriviaSpark.Api/Data/Entities/Question.cs`

Added navigation property to support the relationship with EventImages:

```csharp
public virtual ICollection<EventImage> EventImages { get; set; } = new List<EventImage>();
```

### 3. Updated Entity Relationships

**File**: `TriviaSpark.Api/Data/TriviaSparkDbContext.cs`

Updated the EventImage relationship configuration to properly reference the new navigation property:

```csharp
// Question -> EventImages (one-to-many)
modelBuilder.Entity<EventImage>()
    .HasOne(ei => ei.Question)
    .WithMany(q => q.EventImages)
    .HasForeignKey(ei => ei.QuestionId)
    .OnDelete(DeleteBehavior.Cascade);
```

## API Response Structure

The `/api/events/{id}` endpoint now returns a complete event object with the following structure:

```json
{
  "id": "event-id",
  "title": "Event Title",
  "description": "Event description",
  "hostId": "host-user-id",
  // ... all other event properties ...
  
  "host": {
    "id": "host-user-id",
    "username": "hostname",
    "fullName": "Host Full Name",
    "email": "host@example.com"
    // ... other host properties ...
  },
  
  "questions": [
    {
      "id": "question-id",
      "questionText": "What is the question?",
      "options": "[\"A\", \"B\", \"C\", \"D\"]",
      "correctAnswer": "A",
      "orderIndex": 1,
      // ... other question properties ...
      
      "eventImages": [
        {
          "id": "event-image-id",
          "questionId": "question-id",
          "unsplashImageId": "unsplash-id",
          "imageUrl": "https://image-url",
          "thumbnailUrl": "https://thumbnail-url",
          "attributionText": "Photo by Photographer on Unsplash",
          "attributionUrl": "https://photographer-profile",
          "width": 1920,
          "height": 1080
          // ... other image properties ...
        }
      ]
    }
  ],
  
  "teams": [
    {
      "id": "team-id",
      "name": "Team Name",
      "tableNumber": 1,
      "maxMembers": 6,
      // ... other team properties ...
      
      "participants": [
        {
          "id": "participant-id",
          "name": "Participant Name",
          "isActive": true,
          "teamId": "team-id"
          // ... other participant properties ...
        }
      ]
    }
  ],
  
  "participants": [
    {
      "id": "participant-id",
      "name": "Participant Name",
      "teamId": "team-id",
      "isActive": true
      // ... other participant properties ...
    }
  ],
  
  "funFacts": [
    {
      "id": "fun-fact-id",
      "title": "Fun Fact Title",
      "content": "Interesting information...",
      "orderIndex": 1,
      "isActive": true
      // ... other fun fact properties ...
    }
  ]
}
```

## Performance Considerations

- **Split Query**: Uses `.AsSplitQuery()` to avoid Cartesian explosion when loading multiple collections
- **Filtering**: Applies database-level filtering for active participants and fun facts
- **Ordering**: Sorts data at the database level to reduce frontend processing
- **Single Request**: Eliminates the need for multiple API calls to get complete event data

## Testing

Test files have been created to verify the enhanced functionality:

- `tests/http/fully-hydrated-event-test.http` - Comprehensive test scenarios
- Updated `TriviaSpark.Api/TriviaSpark.Api.http` - Documentation of the enhanced endpoint

## Benefits

1. **Reduced API Calls**: Get all event data in a single request
2. **Better Performance**: Database-level filtering and ordering
3. **Consistent Data**: All related data fetched in a single transaction
4. **Improved UX**: Faster loading times for event details pages
5. **Simplified Frontend**: Less complex state management needed

## Backward Compatibility

This change is backward compatible. The endpoint URL and authentication requirements remain the same - only the response payload has been enhanced with additional related data.