-- SQL script to fix NULL values in Events table
-- Run this directly against the SQLite database to fix existing NULL values

UPDATE Events 
SET 
    primary_color = '#7C2D12' 
WHERE primary_color IS NULL;

UPDATE Events 
SET 
    secondary_color = '#FEF3C7' 
WHERE secondary_color IS NULL;

UPDATE Events 
SET 
    font_family = 'Inter' 
WHERE font_family IS NULL;

UPDATE Events 
SET 
    settings = '{}' 
WHERE settings IS NULL;

-- Verify the changes
SELECT id, title, primary_color, secondary_color, font_family, settings
FROM Events
WHERE primary_color IS NOT NULL;
