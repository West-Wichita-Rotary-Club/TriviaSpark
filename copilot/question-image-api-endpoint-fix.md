# Question Image Data API Endpoint Fix

## Overview

Fixed the issue where question image data was not being populated when editing questions in the trivia manager. The problem was caused by incorrect API endpoint URLs in the frontend that didn't match the actual backend endpoints.

## Problem Identified

The frontend components were calling incorrect API endpoints for question image data:

**Incorrect Frontend URLs:**

- GET `/api/questions/{questionId}/eventimage`
- PUT `/api/questions/{questionId}/eventimage`

**Actual Backend URLs:**

- GET `/api/eventimages/question/{questionId}`
- PUT `/api/eventimages/question/{questionId}/replace`

## Files Modified

### 1. EditQuestionForm.tsx

**File**: `client/src/components/questions/EditQuestionForm.tsx`

**Changes**:

- Fixed GET endpoint for fetching event image data
- Fixed PUT endpoint for saving event image data

**Before**:

```tsx
queryKey: ["/api/questions", question.id, "eventimage"],
queryFn: async () => {
  const response = await fetch(`/api/questions/${question.id}/eventimage`, {
    credentials: 'include',
  });
```

**After**:

```tsx
queryKey: ["/api/eventimages/question", question.id],
queryFn: async () => {
  const response = await fetch(`/api/eventimages/question/${question.id}`, {
    credentials: 'include',
  });
```

**PUT endpoint fix**:

```tsx
// Before
const response = await fetch(`/api/questions/${question.id}/eventimage`, {
  method: "PUT",

// After  
const response = await fetch(`/api/eventimages/question/${question.id}/replace`, {
  method: "PUT",
```

### 2. event-trivia-manage.tsx

**File**: `client/src/pages/event-trivia-manage.tsx`

**Changes**:

- Fixed GET endpoint for fetching event image data in the trivia management page

**Before**:

```tsx
queryKey: ['/api/questions', questionId, 'eventimage'],
queryFn: async () => {
  const response = await fetch(`/api/questions/${questionId}/eventimage`, {
```

**After**:

```tsx
queryKey: ['/api/eventimages/question', questionId],
queryFn: async () => {
  const response = await fetch(`/api/eventimages/question/${questionId}`, {
```

### 3. event-manage.tsx

**File**: `client/src/pages/event-manage.tsx`

**Changes**:

- Fixed both GET and PUT endpoints for event image handling

**GET endpoint fix**:

```tsx
// Before
queryKey: ["/api/questions", question.id, "eventimage"],
const response = await fetch(`/api/questions/${question.id}/eventimage`, {

// After
queryKey: ["/api/eventimages/question", question.id],
const response = await fetch(`/api/eventimages/question/${question.id}`, {
```

**PUT endpoint fix**:

```tsx
// Before
const response = await fetch(`/api/questions/${question.id}/eventimage`, {
  method: "PUT",

// After
const response = await fetch(`/api/eventimages/question/${question.id}/replace`, {
  method: "PUT",
```

## Backend API Endpoints (Reference)

The correct backend endpoints in `EventImagesController.cs`:

- **GET** `/api/eventimages/question/{questionId}` - Fetch event image for question
- **PUT** `/api/eventimages/question/{questionId}/replace` - Replace/update event image
- **POST** `/api/eventimages` - Create new event image
- **GET** `/api/eventimages/event/{eventId}` - Get all images for an event

## Impact

This fix resolves the following issues:

1. **Question Image Loading**: Event images now load properly when editing questions
2. **Image Data Population**: All image metadata (URL, attribution, size, etc.) is now populated correctly
3. **Image Updates**: Changes to question images are now saved properly
4. **Consistent API Usage**: All components now use the correct API endpoints

## Testing

To verify the fix:

1. Build and run the application:

   ```bash
   npm run build
   dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
   ```

2. Navigate to the trivia management page:

   ```
   https://localhost:14165/events/seed-event-coast-to-cascades/manage/trivia
   ```

3. Click "Edit" on a question that has an image
4. Verify that:
   - The existing image loads in the edit form
   - Image metadata is displayed correctly
   - Image search and replacement functionality works
   - Changes are saved properly

## Technical Details

- **Query Key Changes**: Updated React Query cache keys to match new endpoints
- **HTTP Method Alignment**: PUT operations now use the `/replace` endpoint as designed
- **Credential Handling**: Maintained proper cookie-based authentication
- **Error Handling**: Existing error handling remains functional with new endpoints

This fix ensures that the question editing functionality works as intended, providing a complete image management experience in the trivia manager.
