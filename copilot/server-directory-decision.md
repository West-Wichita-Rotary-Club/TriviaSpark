# Server Directory Decision

## Decision

**Recommend deletion** of `server/` at repository root.

## Rationale

1. The directory's own README states it is archived.
2. A preserved copy already exists at `archive/server/`.
3. No active code references any files in `server/`.
4. The current backend (`TriviaSpark.Api/`) fully replaces it.
5. Keeping duplicate archived code in root violates the constitution's directory structure rules (root is for essentials only).

## Action Required

**Tech lead approval needed** before deletion. If approved:

```bash
# Remove server/ directory (archive/server/ already preserves the code)
Remove-Item -Recurse -Force server/
```

## Impact

- Zero impact on functionality — no code references `server/`.
- Reduces repository clutter and confusion about which backend is active.
