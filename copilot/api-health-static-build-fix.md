# API Health Check Static Build Fix

## Issue Description

When running the static build version of TriviaSpark, the browser console showed an error:

```
header-pA_06Zt5.js:6   GET https://localhost:14165/api/health net::ERR_CONNECTION_REFUSED
```

This error occurred because the `useApiHealth` hook was attempting to make API calls to `/api/health` even in the static build environment where no backend server is running.

## Root Cause

The `useApiHealth` hook in `client/src/hooks/useHealth.ts` was making periodic API calls to check server health regardless of whether it was running in a static build environment or with a live backend.

## Solution Implementation

### 1. Environment Variable Detection

Modified `vite.config.ts` to expose the `STATIC_BUILD` environment variable to the client code:

```typescript
export default defineConfig({
  // ... other config
  define: {
    // Make STATIC_BUILD available to the client code
    'import.meta.env.VITE_STATIC_BUILD': JSON.stringify(process.env.STATIC_BUILD || 'false'),
  },
  // ... rest of config
});
```

### 2. Updated Health Hook

Modified `useApiHealth` hook to detect static build mode and skip API calls:

```typescript
export function useApiHealth(pollMs = 30000) {
  const [status, setStatus] = useState<ApiHealth>({ ok: false });
  const [loading, setLoading] = useState(true);

  // Check if running in static build mode
  const isStaticBuild = import.meta.env.VITE_STATIC_BUILD === 'true';

  async function check() {
    // Skip API calls in static build mode
    if (isStaticBuild) {
      setStatus({ ok: false, time: 'Static Build' });
      setLoading(false);
      return;
    }

    // ... rest of the original implementation
  }

  useEffect(() => {
    check();
    
    // Don't set up polling in static build mode
    if (isStaticBuild) {
      return;
    }
    
    const t = setInterval(check, pollMs);
    return () => clearInterval(t);
  }, [pollMs, isStaticBuild]);

  return { status, loading, refresh: check };
}
```

### 3. Enhanced Header Status Display

Updated the header component to show a more appropriate status badge for static builds:

```typescript
<span
  className={`text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1 ${
    status.ok ? "text-green-700 border-green-300 bg-green-50" : 
    (status.time === 'Static Build' ? "text-blue-700 border-blue-300 bg-blue-50" : "text-red-700 border-red-300 bg-red-50")
  }`}
  title={status.ok ? `API healthy • ${status.time ?? "now"}` : 
    status.time === 'Static Build' ? "Static demo version" : "API unreachable"
  }
  data-testid="badge-health"
  aria-live="polite"
>
  <span className={`h-2 w-2 rounded-full ${
    status.ok ? "bg-green-500" : 
    (status.time === 'Static Build' ? "bg-blue-500" : "bg-red-500")
  }`} />
  {status.ok ? "Online" : (status.time === 'Static Build' ? "Demo" : "Offline")}
</span>
```

## Results

### Before Fix

- ❌ Console error: `GET https://localhost:14165/api/health net::ERR_CONNECTION_REFUSED`
- ❌ Failed network requests every 30 seconds
- ❌ Header showed "Offline" status incorrectly

### After Fix

- ✅ No console errors related to API health checks
- ✅ No unnecessary network requests in static builds
- ✅ Header shows clear "Demo" status with blue indicator
- ✅ Static build loads cleanly without errors

## Technical Benefits

1. **Performance**: Eliminates unnecessary network requests in static builds
2. **User Experience**: Clear visual indication of demo mode vs. offline status
3. **Error Reduction**: No more console errors in static deployment
4. **Maintainability**: Environment-aware code that adapts to deployment context

## Testing

The fix was validated by:

1. Running `npm run build:static` successfully
2. Verifying no console errors in the built static files
3. Confirming the header shows "Demo" status with blue indicator
4. Ensuring the database path configuration from `C:\websites\TriviaSpark\trivia.db` works correctly

## Files Modified

1. `vite.config.ts` - Added environment variable exposure
2. `client/src/hooks/useHealth.ts` - Added static build detection
3. `client/src/components/layout/header.tsx` - Enhanced status display

## Build Command

The updated build command now includes the custom database path:

```bash
npm run build:static
```

This extracts data from `C:\websites\TriviaSpark\trivia.db` and builds a static version without API health check errors.

---

**Date**: September 11, 2025  
**Status**: ✅ Complete  
**Impact**: Resolved static build console errors and improved user experience
