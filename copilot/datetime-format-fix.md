# DateTime Format Fix for API Tests

## Issue Description

The event creation API was failing with a JSON serialization error:

```
System.Text.Json.JsonException: The JSON value could not be converted to TriviaSpark.Api.CreateEventRequest. 
Path: $.eventDate | LineNumber: 8 | BytePositionInLine: 24.
System.FormatException: The JSON value is not in a supported DateTime format.
```

## Root Cause

The HTTP test file (`tests/http/api-tests.http`) was using the REST Client extension's `{{now}}` variable:

```json
{
  "eventDate": "{{now}}"
}
```

The `{{now}}` variable generates a timestamp format that System.Text.Json in .NET cannot parse reliably.

## Solution

Updated the test file to use a proper ISO 8601 DateTime format:

```json
{
  "eventDate": "2025-09-15T19:00:00.000Z"
}
```

## Technical Details

### .NET DateTime Parsing

The `CreateEventRequest` record expects `DateTime? EventDate`:

```csharp
public record CreateEventRequest(
    string Title, 
    string? Description, 
    string EventType, 
    int MaxParticipants, 
    string Difficulty, 
    string? Status, 
    string? QrCode, 
    DateTime? EventDate,  // <-- This field
    string? EventTime, 
    string? Location, 
    string? SponsoringOrganization, 
    string? Settings
);
```

System.Text.Json can reliably parse these DateTime formats:

- ISO 8601 with time: `"2025-09-15T19:00:00.000Z"`
- ISO 8601 date only: `"2025-09-15"`
- ISO 8601 with offset: `"2025-09-15T19:00:00-07:00"`

### REST Client Variables

The `{{now}}` variable can produce various formats depending on the system locale and REST Client version, which may not be compatible with .NET's JSON deserializer.

## Files Updated

### `tests/http/api-tests.http`

**Before:**

```json
"eventDate": "{{now}}"
```

**After:**

```json
"eventDate": "2025-09-15T19:00:00.000Z"
```

### Other Test Files

Checked other HTTP test files:

- `tests/http/slug-id-tests.http` - ✅ Already using correct format (`"2025-12-15"`)
- No other files were using `{{now}}` variable

## Testing

After the fix, the event creation API should work correctly. The test can be run using:

1. Open `tests/http/api-tests.http` in VS Code
2. Use REST Client extension
3. Run the "Create event" request
4. Should receive successful response with slug-based event ID

## Best Practices

### For HTTP Test Files

1. **Use explicit dates**: Instead of variables like `{{now}}`
2. **ISO 8601 format**: Always use standard DateTime formats
3. **Future dates**: Use dates in the future for event testing
4. **Consistent formats**: Maintain consistent DateTime formatting across all tests

### For API Development

1. **Explicit DateTime handling**: Consider custom JsonConverter if specific formats are required
2. **Validation**: Add proper DateTime validation to API models
3. **Error messages**: Provide clear error messages for DateTime parsing failures
4. **Documentation**: Document expected DateTime formats in API specs

## Related Files

- `TriviaSpark.Api/ApiEndpoints.EfCore.cs` - Event creation endpoint
- `tests/http/api-tests.http` - Main API test suite
- `tests/http/slug-id-tests.http` - Slug-based ID test suite (no changes needed)

## Status

✅ **Fixed** - Event creation API now accepts properly formatted DateTime values
