# Contest Rules Slide Enhancement

## Overview

Added an intermediate contest rules slide that appears after clicking "Start Game" but before the first trivia question begins. This provides clear guidelines for participants and ensures everyone understands the game format.

## Changes Made

### Game State Enhancement

**File**: `client/src/pages/presenter.tsx`

**New Game State**: Added `"rules"` to the game state enum:

```tsx
const [gameState, setGameState] = useState<"waiting" | "rules" | "question" | "answer" | "leaderboard">("waiting");
```

### Function Updates

**Modified `handleStartGame`**: Now transitions to rules instead of directly to questions:

```tsx
const handleStartGame = () => {
  setGameState("rules");
};
```

**Added `handleStartQuestions`**: New function to proceed from rules to first question:

```tsx
const handleStartQuestions = () => {
  setGameState("question");
  setTimeLeft(30);
  setIsTimerActive(true);
};
```

### Rules Slide Component

Added a comprehensive rules display with:

- **Shield icon** and "Contest Rules" heading
- **Numbered rules list** with clear formatting
- **Responsive design** for various screen sizes
- **Professional styling** consistent with the wine theme

### Contest Rules Content

1. **No internet searches!!!** (Remember the 4-way test...)
2. **20 seconds per question** allowed for a team answer
3. Write your **letter answer** on your whiteboard
4. Keep your **correct answer held high** until scorekeeper has acknowledged it
5. **Erase and repeat**
6. Leave your **marker, eraser and whiteboard** on your table when we finish
7. **Have fun!** 🎉

### Control Panel Enhancement

Added controls for the rules state:

```tsx
{gameState === "rules" && (
  <Button
    onClick={handleStartQuestions}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 lg:px-8 py-2 lg:py-4 text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0"
    data-testid="button-start-questions"
  >
    <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
    Let's Play!
  </Button>
)}
```

## User Flow Enhancement

### Previous Flow

1. Welcome Screen → "Start Game" → First Question

### New Flow

1. Welcome Screen → "Start Game" → **Contest Rules** → "Let's Play!" → First Question

## Benefits

1. **Clear Expectations**: Participants understand the rules before gameplay begins
2. **Professional Presentation**: Establishes structure and fairness expectations
3. **Rotary Values**: References the 4-way test in rule #1
4. **Equipment Instructions**: Clear guidance on whiteboard usage
5. **Interactive Transition**: Maintains engagement with clear call-to-action buttons

## Design Features

- **Visual Hierarchy**: Numbered rules with large, bold numbers in wine color
- **Responsive Layout**: Adapts to different screen sizes with proper spacing
- **Consistent Theming**: Matches the wine/champagne color scheme
- **Clear Typography**: Easy-to-read font sizes with proper contrast
- **Professional Icons**: Shield icon reinforces the "rules" concept

## Testing

To test the enhancement:

1. Build and run the application:

   ```bash
   npm run build
   dotnet run --project ./TriviaSpark.Api/TriviaSpark.Api.csproj
   ```

2. Navigate to presenter mode:

   ```
   https://localhost:14165/presenter/seed-event-coast-to-cascades
   ```

3. Test the flow:
   - Click "Start Game" from the welcome screen
   - Verify the contest rules slide appears
   - Click "Let's Play!" to proceed to the first question

## Technical Implementation Details

- **State Management**: Clean state transitions with proper timer initialization
- **Icon Integration**: Added Shield icon import from lucide-react
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Accessibility**: Proper semantic HTML structure and ARIA considerations
- **Performance**: No additional API calls or heavy operations

This enhancement provides a professional, structured approach to trivia events while maintaining the engaging, interactive experience participants expect.
