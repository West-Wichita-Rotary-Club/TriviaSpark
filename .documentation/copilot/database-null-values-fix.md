# Database NULL Values Fix

The database has existing NULL values in fields that the EF Core model expects to be non-nullable.

## The Issue

Error: `System.InvalidOperationException: The data is NULL at ordinal 30. This method can't be called on NULL values.`

This occurs because:

1. The Event entity has fields like `PrimaryColor`, `SecondaryColor`, `FontFamily`, and `Settings` that were originally required
2. These fields were changed to nullable in the C# model but existing database records have NULL values
3. EF Core is trying to read these NULL values as non-nullable strings

## Fields Affected (based on ordinal positions)

- Ordinal 24: `PrimaryColor` (string) - should be "#7C2D12"
- Ordinal 29: `SecondaryColor` (string) - should be "#FEF3C7"  
- Ordinal 19: `FontFamily` (string) - should be "Inter"
- Ordinal 30: `Settings` (string) - should be "{}"

## Solution Applied

1. **Updated Event.cs**: Made nullable fields properly nullable with `?`
2. **Updated event creation**: Added default values for new events
3. **Created database update scripts**: SQL to fix existing NULL values

## Manual Database Fix

Since automated script failed, run this SQL manually against the SQLite database:

```sql
UPDATE Events 
SET primary_color = '#7C2D12' 
WHERE primary_color IS NULL;

UPDATE Events 
SET secondary_color = '#FEF3C7' 
WHERE secondary_color IS NULL;

UPDATE Events 
SET font_family = 'Inter' 
WHERE font_family IS NULL;

UPDATE Events 
SET settings = '{}' 
WHERE settings IS NULL;
```

## Verification

After running the SQL, verify with:

```sql
SELECT id, title, primary_color, secondary_color, font_family, settings 
FROM Events 
WHERE primary_color IS NULL 
   OR secondary_color IS NULL 
   OR font_family IS NULL 
   OR settings IS NULL;
```

This should return 0 rows if all NULL values are fixed.

## Files Modified

- `TriviaSpark.Api/Data/Entities/Event.cs` - Made theme fields nullable
- `TriviaSpark.Api/ApiEndpoints.EfCore.cs` - Added default values for event creation
- `tools/fix-null-event-fields.sql` - SQL script to fix existing data
- `tools/fix-null-event-fields.ps1` - PowerShell wrapper (needs SQLite command line)

## Status

- ✅ C# model updated
- ✅ Event creation fixed  
- ❌ Database NULL values need manual fix
- ❌ Server will continue to fail until database is updated
