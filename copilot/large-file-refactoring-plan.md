# Large File Refactoring Plan

## Summary

This document identifies all frontend files exceeding 500 lines and provides refactoring strategies to improve maintainability without changing functionality.

## Large Files Identified

| File | Lines | Priority | Impact |
|------|-------|----------|--------|
| `client/src/pages/event-manage.tsx` | 1,871 | HIGH | Most complex page, highest line count |
| `client/src/pages/api-docs.tsx` | 1,032 | LOW | Static documentation, read-only |
| `client/src/pages/event-trivia-manage.tsx` | 1,000 | MEDIUM | Complex trivia editing UI |
| `client/src/pages/presenter.tsx` | 951 | MEDIUM | Presenter view with multiple slides |
| `client/src/pages/question-edit.tsx` | 705 | MEDIUM | Question editing form |
| `client/src/components/ui/sidebar.tsx` | 691 | LOW | shadcn/ui component (vendor-like) |
| `client/src/components/questions/EditQuestionForm.tsx` | 671 | MEDIUM | Form with image handling |
| `client/src/pages/event-host.tsx` | 626 | LOW | Event host dashboard |
| `client/src/data/demoData.ts` | 589 | LOW | Static demo data |

---

## 1. event-manage.tsx (1,871 lines) — HIGH Priority

### Current Structure

- **Lines 61–190**: Type definitions (Event, Question, FunFact, EventFormData, UnsplashImage, etc.)
- **Lines 191–330**: Component initialization, state, and data fetching
- **Lines 331–540**: Mutations (updateEvent, updateStatus, saveEventImage, etc.)
- **Lines 539–640**: Image search and question save handlers
- **Lines 641–1100**: Question editing UI state and logic
- **Lines 1105–1300**: Status change, fun facts, question mutations, AI generation
- **Lines 1301–1871**: JSX render — tabs for details, questions, fun facts, teams, settings

### Refactoring Strategy

#### Phase A: Extract Type Definitions

**Before**: Types inline in event-manage.tsx
**After**: New file `client/src/types/event.ts`

```
client/src/types/
  └── event.ts       # Event, Question, FunFact, EventFormData, UnsplashImage types
```

Estimated reduction: ~130 lines

#### Phase B: Extract Custom Hooks

**Before**: All mutations and queries inline in component
**After**: Custom hooks in `client/src/hooks/`

```
client/src/hooks/
  ├── useEventData.ts          # Event query + related data fetching
  ├── useEventMutations.ts     # updateEvent, updateStatus, deleteQuestion mutations
  └── useImageSearch.ts        # Unsplash search + image save mutation
```

Estimated reduction: ~300 lines

#### Phase C: Extract Tab Content Components

**Before**: Monolithic render with inline tab content
**After**: Sub-components for each tab panel

```
client/src/components/event/
  ├── EventDetailsTab.tsx       # Event name, date, description, branding
  ├── EventQuestionsTab.tsx     # Question list, editing, ordering
  ├── EventFunFactsTab.tsx      # Fun fact management
  ├── EventTeamsTab.tsx         # Team configuration
  └── EventSettingsTab.tsx      # Event settings panel
```

Estimated reduction: ~800 lines

#### Phase D: Extract Question Editing Panel

**Before**: Question editing state and UI inline
**After**: Standalone component with its own state

```
client/src/components/event/
  └── QuestionEditPanel.tsx     # Question editing sidebar/panel
```

Estimated reduction: ~400 lines

### Result After Full Refactoring

| File | Before | After |
|------|--------|-------|
| `event-manage.tsx` | 1,871 | ~250 (orchestrator with tabs + hooks) |
| `types/event.ts` | new | ~130 |
| `hooks/useEventData.ts` | new | ~80 |
| `hooks/useEventMutations.ts` | new | ~150 |
| `hooks/useImageSearch.ts` | new | ~70 |
| `components/event/EventDetailsTab.tsx` | new | ~200 |
| `components/event/EventQuestionsTab.tsx` | new | ~250 |
| `components/event/EventFunFactsTab.tsx` | new | ~150 |
| `components/event/EventTeamsTab.tsx` | new | ~100 |
| `components/event/EventSettingsTab.tsx` | new | ~100 |
| `components/event/QuestionEditPanel.tsx` | new | ~400 |

---

## 2. event-trivia-manage.tsx (1,000 lines) — MEDIUM Priority

### Current Structure

- Inline interfaces and types (lines 38–76)
- `QuestionThumbnail` sub-component (line 82)
- `AIQuestionGeneratorForm` sub-component (line 148)
- `inferQuestionType` utility (line 358)
- `FullQuestionEditor` sub-component (line 406)
- `EventTriviaManage` main component (line 725)

### Refactoring Strategy

1. Extract `AIQuestionGeneratorForm` → `client/src/components/questions/AIQuestionGeneratorForm.tsx` (~200 lines)
2. Extract `FullQuestionEditor` → `client/src/components/questions/FullQuestionEditor.tsx` (~300 lines)
3. Extract `QuestionThumbnail` → `client/src/components/questions/QuestionThumbnail.tsx` (~60 lines)
4. Extract `inferQuestionType` → `client/src/lib/question-utils.ts` (~50 lines)

Estimated result: ~400 lines for main component

---

## 3. presenter.tsx (951 lines) — MEDIUM Priority

### Current Structure

- `SimpleProgress` inline component (line 8)
- `PresenterView` monolithic component (line 32) containing all slide types

### Refactoring Strategy

1. Extract individual slide components:
   - `PresenterQuestionSlide.tsx` — question display with timer
   - `PresenterLeaderboardSlide.tsx` — leaderboard display
   - `PresenterFunFactSlide.tsx` — fun fact interstitial
   - `PresenterWelcomeSlide.tsx` — intro/welcome screen
2. Extract presenter state management → `usePresenterState.ts` hook

Estimated result: ~250 lines for main component

---

## 4. question-edit.tsx (705 lines) — MEDIUM Priority

### Refactoring Strategy

1. Extract form sections into sub-components (answer options, difficulty selector, media panel)
2. Extract mutation logic into `useQuestionMutations.ts` hook

Estimated result: ~300 lines for main component

---

## 5. Files NOT Recommended for Refactoring

| File | Lines | Reason |
|------|-------|--------|
| `api-docs.tsx` | 1,032 | Static documentation page — splitting adds complexity without benefit |
| `sidebar.tsx` | 691 | shadcn/ui component — follows upstream patterns, should not diverge |
| `demoData.ts` | 589 | Static data — splitting reduces discoverability without meaningful gain |

---

## Testing Strategy

For each refactored file:

1. **Before refactoring**: Capture current behavior via screenshot/test for each page
2. **During refactoring**: Move code without modification — no logic changes
3. **After refactoring**: Verify identical behavior via:
   - Existing Vitest tests pass
   - Manual UI verification of each extracted component
   - Build succeeds with zero new TypeScript errors
4. **New tests**: Add Vitest tests for each newly extracted hook

---

## Effort Estimates

| Component | Effort | Risk |
|-----------|--------|------|
| event-manage.tsx (all phases) | Large (4-6 hours) | Medium — many interdependencies |
| event-trivia-manage.tsx | Medium (2-3 hours) | Low — sub-components already isolated |
| presenter.tsx | Medium (2-3 hours) | Low — slide types are naturally independent |
| question-edit.tsx | Small (1-2 hours) | Low — straightforward extraction |

---

## Recommended Execution Order

1. **event-trivia-manage.tsx** — Sub-components already delineated, lowest risk
2. **presenter.tsx** — Slide types are naturally independent
3. **question-edit.tsx** — Simple form extraction
4. **event-manage.tsx** — Largest and most complex, save for last
