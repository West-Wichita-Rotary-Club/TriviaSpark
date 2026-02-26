# QuestionType Integration (2025-09-13)

## Summary

Added support for a new `questionType` classification field across the stack to distinguish between gameplay question categories:

- `game` (default core game question)
- `training` (practice / warm-up questions)
- `tie-breaker` (used only if scores are tied)

This is separate from the existing `type` field which describes question format (e.g., `multiple_choice`, `true_false`).

## Changes Implemented

### Shared Schema (`shared/schema.ts`)

- Added `questionType` column to `questions` drizzle schema with default `game`.
- Extended Zod schemas: `questionGenerationSchema`, `updateQuestionSchema`, `bulkQuestionSchema` to include optional `questionType`.

### Backend (EF Core Minimal API)

- DTO records updated: `UpdateQuestion`, `GenerateQuestionsRequest`, `BulkQuestionData` to include `QuestionType`.
- Integrated `QuestionType` assignment in:
  - Update question endpoint (PUT `/api/questions/{id}`)
  - AI generation flow (mapping newly generated or demo fallback questions)
  - Bulk insert endpoint
- `Question` entity already contained `QuestionType` with default `game`; DbContext mapping ensures persistence.

### Frontend

- `event-trivia-manage.tsx`: Augmented `Question` interface with `questionType` and added a colored badge (Game / Training / Tie-Breaker).
- `question-generator.tsx`: Added classification selector and optional `questionType` in form submission.
- `demoData.ts`: Added `questionType` values to demo questions (mix of `training`, `game`, and a few `tie-breaker`) for presenter fallback scenarios.

### Demo Data

- Ensures presenter mode can now filter or style practice vs. core vs. tie-breaker questions (future UI logic can leverage `questionType`).

## Migration / Data Notes

Existing SQLite databases will not automatically have the new `questionType` column if managed outside EF Core migrations. Recommended actions:

1. For development, run refresh script or recreate DB so drizzle + EF both see the column.
1. For production, apply an ALTER TABLE:

  ```sql
  ALTER TABLE questions ADD COLUMN question_type TEXT DEFAULT 'game';
  ```

1. Legacy rows will default to `game`.

## Testing Performed

- TypeScript `npm run check` passed after adjustments.
- Backend `dotnet build` succeeded.
- Verified no type errors after adding optional classification.

## Follow-Up Opportunities

- Add UI filtering/group tabs (Game / Training / Tie-Breaker) in trivia management list.
- Presenter flow: explicit sections or warm-up phase using `training` questions prior to starting main game.
- Tie-breaker invocation logic when scores tied.
- Data export/reporting by classification.

## Accessibility & UI Considerations

- Badge color choices: blue tint for training, orange tint for tie-breaker, wine tint for game. Ensure contrast meets WCAG (further audit recommended).

## Contrast Issue (Pending)

User reported light text on light background in a waiting state earlier. This was not yet addressed in this change set—scheduled next.

## Checklist

- [x] Shared schema updated
- [x] Backend endpoints adjusted
- [x] Frontend question management displays classification
- [x] Demo data updated
- [x] Builds & type checks pass
- [x] Documentation added (this file)
- [ ] Contrast issue fix (next task)

---
Prepared by Copilot automation on 2025-09-13.
