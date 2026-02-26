# API Contracts: Upgrade to .NET 10 LTS

**Feature**: `002-dotnet10-lts-upgrade`  
**Date**: 2026-02-26

## No API Contract Changes

This is a version upgrade feature. **No API endpoints, request/response schemas, status codes, or routes are added, modified, or removed.**

All existing API contracts remain identical:
- All REST endpoints preserve their routes, HTTP methods, and response shapes
- All SignalR hub methods preserve their signatures
- All shared TypeScript types in `shared/schema.ts` remain unchanged
- JSON serialization (camelCase) is unchanged

The upgrade to ASP.NET Core 10 and related packages does not alter the public API surface.
