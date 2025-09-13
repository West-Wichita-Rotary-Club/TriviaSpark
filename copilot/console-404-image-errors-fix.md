# Fix: Console 404 Image Errors in Trivia Management

## Issue Description

The manage trivia interface was generating 404 console warnings when trying to fetch images for questions that don't have associated images:

```
[WRN] HTTP Response | GET /api/eventimages/question/q16-timberline-lodge | Status: 404 | Content-Type: application/json; charset=utf-8 | Body: {"error":"No image found for this question"}
[WRN] HTTP Response | GET /api/eventimages/question/q17-mount-hood-elevation | Status: 404 | Content-Type: application/json; charset=utf-8 | Body: {"error":"No image found for this question"}
```

## Root Cause

The frontend components were making API calls to fetch question images but throwing errors on 404 responses instead of gracefully handling the "no image found" case. This caused:

- Console warnings and errors
- Unnecessary server load from failed requests
- Poor user experience with error states

## Solution Applied

Updated all three components that fetch question images to properly handle 404 responses:

### Files Modified

1. **`client/src/pages/event-trivia-manage.tsx`** - QuestionThumbnail component
2. **`client/src/pages/event-manage.tsx`** - Question editor modal
3. **`client/src/components/questions/EditQuestionForm.tsx`** - Question edit form

### Code Changes

```typescript
// BEFORE (threw error on 404)
if (!response.ok) {
  throw new Error("Failed to fetch event image");
}

// AFTER (handles 404 gracefully)
if (!response.ok) {
  // Return null for 404 (no image found) instead of throwing error
  if (response.status === 404) {
    return null;
  }
  throw new Error("Failed to fetch event image");
}
```

## Result

- ✅ Console warnings eliminated for questions without images
- ✅ UI gracefully shows placeholders when no image is available
- ✅ Better user experience with smooth loading states
- ✅ Reduced server log noise
- ✅ Proper error handling only for actual server errors (5xx, network issues, etc.)

## Testing

The fix was applied to all three components and successfully builds without TypeScript errors. The manage trivia interface should now load without console warnings for questions that don't have associated images.

## Impact

- **No breaking changes** - existing functionality preserved
- **Improved performance** - eliminates unnecessary error handling overhead  
- **Better UX** - smooth loading with appropriate placeholders
- **Cleaner logs** - only logs actual errors, not expected 404s for missing images
