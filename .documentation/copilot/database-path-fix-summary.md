# Database Path Fix - Demo Questions Issue Resolution

*Date: September 9, 2025*

## Issue Identified

The demo version was only showing 10-13 questions while the presenter mode had 15 questions because the data extraction script was using the wrong database path.

## Root Cause

**Incorrect Database Path:**

- Extract script was looking at: `./data/trivia.db` (local project database)
- Actual database location: `C:\websites\TriviaSpark\trivia.db`

**Database Contents:**

- Local database: 13 questions
- Actual database: 15 questions (all with background images)

## Fix Applied

### 1. Updated Database Path in Extract Script

**File**: `scripts/extract-data.mjs`

**Before:**

```javascript
const DATABASE_URL = process.env.DATABASE_URL || 'file:./data/trivia.db';
const dbPath = join(rootDir, 'data', 'trivia.db');
```

**After:**

```javascript
const DATABASE_URL = process.env.DATABASE_URL || 'file:C:/websites/TriviaSpark/trivia.db';
const dbPath = 'C:/websites/TriviaSpark/trivia.db';
```

### 2. Verified Database Contents

**Actual Database Questions (15 total):**

1. q1-wine-regions - Oregon Pinot Noir regions
2. q2-rotary-service - Rotary International focus
3. q3-pacific-northwest - Mount Rainier elevation
4. q4-oregon-wine-variety - Oregon signature grape
5. q5-oregon-geographic-feature - Geographic boundaries
6. bb291980-... - Rotary global initiative
7. q6-oregon-coast-lighthouse - Heceta Head Lighthouse
8. q7-cascade-volcanic-peak - Mount St. Helens eruption
9. q8-oregon-coast-haystack - Haystack Rock location
10. q9-cascade-lakes-highway - Scenic highway loop
11. q10-oregon-coast-dunes - Oregon Dunes recreation area
12. 856ee667-... - Mount Hood mountain range
13. 641b7da0-... - Mount Hood historic lodge
14. f753f9d5-... - Mount Hood elevation
15. d7aa55c6-... - Rotary focus areas

**All questions include:**

- ✅ Background images (background_image_url)
- ✅ Multiple choice options
- ✅ Correct answers and explanations
- ✅ Proper categorization (wine, geography, rotary)

## Results

### ✅ Before Fix

- Demo version: 10-13 questions
- Presenter mode: 15 questions
- Database mismatch causing inconsistent experience

### ✅ After Fix

- Demo version: 15 questions (all with backgrounds)
- Presenter mode: 15 questions (consistent)
- Both modes now use the same question set

### Build Verification

**Extract Script Output:**

```
📊 Events: 1, Questions: 15, Fun Facts: 6
🎯 Primary event: "Coast to Cascades Wine & Trivia Evening"
```

**Static Build Success:**

```
✓ built in 3.03s
../docs/assets/ - All assets generated successfully
```

## File Changes

1. **`scripts/extract-data.mjs`** - Updated database path to point to actual database
2. **`client/src/data/demoData.ts`** - Regenerated with all 15 questions
3. **`docs/` directory** - Static build updated with correct question count

## Testing Status

- ✅ Extract script now finds all 15 questions
- ✅ Static build completes successfully
- ✅ Demo data file contains all questions with backgrounds
- ✅ Build info shows correct question count (15)

## Next Steps

1. **Test Demo Mode**: Verify demo version shows all 15 questions
2. **Test Presenter Mode**: Confirm presenter mode still works with full question set
3. **Verify Backgrounds**: Check that all questions display background images properly

## Prevention

To avoid this issue in the future:

- Document the correct database location in project README
- Consider using environment variables for database path configuration
- Add validation in extract script to warn if question count differs from expected

The demo and presenter modes should now show consistent content with all 15 questions and background images.
