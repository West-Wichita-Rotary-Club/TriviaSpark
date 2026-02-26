# Data Model: Upgrade to .NET 10 LTS

**Feature**: `002-dotnet10-lts-upgrade`  
**Date**: 2026-02-26

## No Data Model Changes

This is a version upgrade feature. **No entities, fields, relationships, validation rules, or state transitions are added, modified, or removed.**

The existing data model is preserved exactly as-is:

- All EF Core entity classes remain unchanged
- All data annotations (`[Key]`, `[Required]`, `[ForeignKey]`, etc.) remain unchanged
- Database schema (tables, columns, indexes, constraints) remains unchanged
- Production database file (`C:\websites\TriviaSpark\trivia.db`) is not migrated or modified
- `TriviaSparkDbContext` configuration remains unchanged

### EF Core Version Impact

EF Core 10.0.3 is backwards compatible with the existing model configuration. No `OnModelCreating` changes are required. The SQLite provider (`Microsoft.EntityFrameworkCore.Sqlite 10.0.3`) supports the same schema as 9.0.9.

### Migration Note

No new EF Core migrations are generated as part of this upgrade. If the team later adopts new EF Core 10 features (e.g., improved complex type support), that would be a separate feature.
