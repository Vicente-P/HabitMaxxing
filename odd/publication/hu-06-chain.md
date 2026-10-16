# HU-06 publication chain

## Intent and authorization
Prepare a local feature-branch-chain from develop commit d7cc2cd023b021deb76fddd28a69b993f4e3c7c3, containing the CI branch filters merged in PR #23. The future tracker PR stays draft/no-merge until its children are reviewed and integrated. This bootstrap contains no application behavior.

## Branch order and provenance
| Publication branch | Immediate base | Original work |
|---|---|---|
| codex/hu-06-v2-create-habit | develop d7cc2cd | This passive bootstrap |
| codex/hu-06-v2-create-api | codex/hu-06-v2-create-habit | 91374a5: protected creation API, tests and docs |
| codex/hu-06-v2-catalog | codex/hu-06-v2-create-api | bec5ca0: owned configured catalog, tests and docs |
| codex/hu-06-v2-dashboard | codex/hu-06-v2-catalog | 1338a68 plus evidence commits bc005e5, 9476118, c6ba223, 5a2babb and 40b7f14 |

Original refs and historical evidence remain unchanged. The task-document portion of 45464ee may be carried separately; its CI patch is already integrated and must not be replayed.

## Checks and boundaries
- Replay verified behavior without new logic; preserve previous RED evidence rather than inventing another RED run.
- Run Node 22 full regression and typecheck at each child boundary; run final tracked-file check-only lint, whitespace, ancestry and byte-equivalence checks.
- Recalculate gross slice sizes. Prior accepted API 518/dashboard 607 exceptions do not automatically approve changed reconstructed sizes.
- Existing build and local PostgreSQL/browser acceptance remain historical evidence; no new build, database or browser operations are authorized here.
- Native review consent is candidate-specific and does not transfer to reconstructed candidates; the parent manages assessment and consent.
- No push, PR creation, merge, deployment, network operations, credentials inspection or generated-file edits. Exact preview APP_ORIGIN remains a release prerequisite.
- Engram mirror remains pending: no authoritative runtime session identity is available.

## Next step
After local checks, hand off exact branch boundaries and counts for a separate publication decision. HU-09 daily agenda and production acceptance remain out of scope.
