# Dashboard Event ID and Title Fix - Completed

## Issue Identified

The dashboard upcoming events were showing `undefined` for event IDs and titles because of a JSON property naming mismatch between the .NET API and React frontend.

### Problem Analysis

**API Response (Before Fix)**:

```json
{
  "Id": "seed-event-coast-to-cascades",
  "Title": "Coast to Cascades Wine & Trivia Evening", 
  "EventType": "wine_dinner",
  "MaxParticipants": 50,
  ...
}
```

**Frontend Code Expectation**:

```tsx
{event.id}        // undefined - API returned "Id"
{event.title}     // undefined - API returned "Title"
{event.eventType} // undefined - API returned "EventType"
```

The .NET API was using **PascalCase** property names while the React frontend components were expecting **camelCase** property names.

## Root Cause

The `Program.cs` configuration was set to preserve exact casing:

```csharp
opts.SerializerOptions.PropertyNamingPolicy = null; // keep exact casing
```

This resulted in Entity Framework entities being serialized with their C# property names (PascalCase) instead of the JavaScript-friendly camelCase.

## Solution Implemented

Updated the JSON serialization configuration in `TriviaSpark.Api/Program.cs` to use camelCase naming:

### 1. Added Required Using Statement

```csharp
using System.Text.Json;
```

### 2. Updated JsonOptions Configuration

```csharp
builder.Services.Configure<JsonOptions>(opts =>
{
    opts.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // use camelCase for frontend compatibility
    opts.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
```

### 3. Updated Controllers JsonOptions Configuration  

```csharp
builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // use camelCase for frontend compatibility
    opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
```

## Result

**API Response (After Fix)**:

```json
{
  "id": "seed-event-coast-to-cascades",
  "title": "Coast to Cascades Wine & Trivia Evening",
  "eventType": "wine_dinner", 
  "maxParticipants": 50,
  ...
}
```

**Frontend Code Now Works**:

```tsx
{event.id}        // ✅ "seed-event-coast-to-cascades"
{event.title}     // ✅ "Coast to Cascades Wine & Trivia Evening"
{event.eventType} // ✅ "wine_dinner"
```

## Components Fixed

This fix resolves issues in all dashboard event components:

1. **UpcomingEvents Component** (`client/src/components/events/upcoming-events.tsx`)
   - Event titles now display properly
   - Event management links now use correct event IDs
   - No more `/events/undefined/manage` URLs

2. **ActiveEvents Component** (`client/src/components/events/active-events.tsx`)
   - Event titles and metadata display correctly
   - Navigation links work properly

3. **RecentEvents Component** (`client/src/components/events/recent-events.tsx`)
   - Event information displays correctly
   - All action buttons link to proper event pages

## Impact

- ✅ Event names now display on dashboard
- ✅ Event management links work correctly  
- ✅ No more undefined IDs in URLs
- ✅ Consistent JSON naming across all API endpoints
- ✅ Frontend components can access all event properties

## Testing

The fix can be verified by:

1. Opening `http://localhost:14166` in browser
2. Logging in with username: `mark`, password: `mark123`
3. Navigating to the dashboard
4. Verifying upcoming events show titles and working links

## Files Modified

- `TriviaSpark.Api/Program.cs` - Updated JSON serialization configuration

## Notes

This change affects ALL API endpoints, ensuring consistent camelCase property naming throughout the application. The frontend components were already correctly implemented to expect camelCase properties, so no frontend changes were needed.
