# Event Host Options Parsing Fix - COMPLETED

## Issue Summary

The event host page at `/event/seed-event-coast-to-cascades` was crashing with the error:

```
Uncaught TypeError: t.options.map is not a function
```

## Root Cause

The issue was in the EF Core API implementation for the `/api/events/{id}/questions` endpoint. The EF Core Question entity stores the `options` field as a JSON string in the database, but the API was returning this string directly to the frontend without parsing it back to an array.

The frontend code expected `options` to be an array so it could call `.map()` on it, but it was receiving a JSON string instead.

## Solution

Updated the EF Core API endpoint in `TriviaSpark.Api/ApiEndpoints.EfCore.cs` to parse the JSON options string before returning data to the frontend.

### Code Changes

Added a helper function `ParseQuestionOptions` that:

1. Takes a `Question` entity with `options` as a JSON string
2. Uses `System.Text.Json.JsonSerializer.Deserialize<string[]>()` to parse the string into an array
3. Returns a properly formatted object with `Options` as an array instead of a string
4. Includes fallback handling for JSON parsing errors

### Key Implementation Details

```csharp
static object ParseQuestionOptions(Question question)
{
    try
    {
        if (string.IsNullOrEmpty(question.Options))
            return new string[0];
        
        var options = System.Text.Json.JsonSerializer.Deserialize<string[]>(question.Options);
        return new
        {
            Id = question.Id,
            EventId = question.EventId,
            Type = question.Type,
            Question = question.QuestionText,
            Options = options ?? new string[0], // ← NOW AN ARRAY
            CorrectAnswer = question.CorrectAnswer,
            // ... other fields
        };
    }
    catch
    {
        // Fallback with empty options array if JSON parsing fails
        return new { /* ... */ Options = new string[0] };
    }
}
```

### Applied To Both Code Paths

The fix was applied to both:

1. **Demo/Seed events** (events starting with "seed-event-")
2. **Regular authenticated events**

Both now call `.Select(ParseQuestionOptions)` before returning the results.

## Testing

✅ **Success**: The API endpoint now returns properly formatted data with `options` as arrays
✅ **Success**: The event host page loads without JavaScript errors
✅ **Success**: Question options display correctly in the UI

## Files Modified

1. `TriviaSpark.Api/ApiEndpoints.EfCore.cs` - Updated the `/api/events/{id}/questions` endpoint

## Impact

- **Frontend**: No changes needed - the defensive parsing in `event-host.tsx` provides additional safety
- **API**: Now consistently returns `options` as arrays for all question data
- **Database**: No changes - continues to store options as JSON strings
- **Other endpoints**: May need similar fixes if they also return question data

## Status

✅ **COMPLETED** - Event host page now loads correctly with properly parsed question options.

## Prevention

Future EF Core endpoints that return question data should use the same parsing pattern to ensure consistent data formats for the frontend.
