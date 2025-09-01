# Event Host JSON Options Parsing Fix

## Issue

When accessing `/event/seed-event-coast-to-cascades`, the application crashed with:

```
Uncaught TypeError: t.options.map is not a function
```

## Root Cause

The `options` field in the database is stored as a JSON string, but the frontend was trying to use `.map()` on it directly, expecting it to be an array.

## Database Schema

```typescript
options: text("options").default("[]"), // JSON string of answer options
```

## Frontend Error Location

In `event-host.tsx`, line ~316:

```tsx
{question.options.map((option: string, optionIndex: number) => (
  // ... mapping code
))}
```

## Solution

Applied a two-layer fix:

### 1. Frontend Fix (Defensive Programming)

Updated `client/src/pages/event-host.tsx` to safely parse options:

```tsx
{(() => {
  // Safely parse options - handle both string and array formats
  let parsedOptions: string[] = [];
  try {
    if (typeof question.options === 'string') {
      parsedOptions = JSON.parse(question.options);
    } else if (Array.isArray(question.options)) {
      parsedOptions = question.options;
    }
  } catch (error) {
    console.warn('Failed to parse question options:', error);
    parsedOptions = [];
  }
  
  return parsedOptions && parsedOptions.length > 0 && (
    // ... render options
  );
})()}
```

### 2. Backend Fix (Systematic Solution)

Updated `server/database-storage.ts` to parse JSON options at the data layer:

1. **Added helper method:**

```typescript
private parseQuestionOptions(question: Question): Question {
  return {
    ...question,
    options: typeof question.options === 'string' 
      ? (() => {
          try {
            return JSON.parse(question.options);
          } catch (error) {
            console.warn(`Failed to parse options for question ${question.id}:`, error);
            return [];
          }
        })()
      : question.options
  };
}
```

2. **Updated all question retrieval methods:**

- `getQuestionsByEvent()`
- `getQuestion()`
- `createQuestion()`
- `createQuestions()`
- `updateQuestion()`

## Benefits

1. **Frontend Protection**: Component handles malformed data gracefully
2. **API Consistency**: All question data from API now has parsed options arrays
3. **Future-Proof**: Other components using question data won't face the same issue
4. **Error Handling**: Graceful degradation when JSON parsing fails

## Testing

- `/event/seed-event-coast-to-cascades` now loads without errors
- Question options display correctly in the event host view
- No impact on other functionality

## Files Modified

1. `client/src/pages/event-host.tsx` - Added defensive parsing
2. `server/database-storage.ts` - Added systematic options parsing

## Status

✅ **Fixed** - Event host page now loads correctly with properly parsed question options.
