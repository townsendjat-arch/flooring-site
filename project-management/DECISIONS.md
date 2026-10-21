# Charles's flooring website: decision log

Updated: **2026-10-21 (UTC)**. Decisions below distinguish approved direction from final review or release approval.

| Date | Decision and status | Consequence / evidence |
| --- | --- | --- |
| 2026-10-21 | APPROVED direction: charcoal/white/light-gray interface with the original full-color Colorado logo | Preserve original header/footer artwork and crop, photos, layout, typography, copy, contact destinations and form behavior. [Design record](../docs/charcoal-design-review.md) |
| 2026-10-21 | IMPLEMENTED, awaiting final package review: design revision in draft PR #2 stacked on the unchanged form PR #1 | Review packages separately; after an approved form merge, retarget/rebase and rerun checks. [PR #2](https://github.com/townsendjat-arch/flooring-site/pull/2), [PR #1](https://github.com/townsendjat-arch/flooring-site/pull/1) |
| 2026-10-21 | REVIEW disposition: no confirmed contrast defect in sampled screenshot/source-color states | Preserve all raw inconclusive axe records; this is bounded review, not full accessibility signoff. [Testing ledger](TESTING.md#accessibility-disposition) |
| 2026-10-21 | CONTINUED guardrail: endpoint remains empty; real notification delivery unverified | Mock success means neither live acceptance nor inbox receipt. Provider/account/inbox/privacy/spam/terms/operations decisions remain open. [Form checklist](../docs/estimate-form.md) |
| 2026-10-21 | APPROVED: four-file project tracking on the existing review branch | Add TASKS, TESTING, DECISIONS and root LINK-INSTRUCTIONS; link detailed reports rather than duplicate them; keep status current as authorized work progresses |
| 2026-10-21 | PRIORITY: Charles remains Priority #1; customer acquisition is research-only | No outreach, service purchase or integration activation is authorized |
| 2026-10-21 | NOT APPROVED: further design/features, merge, deployment, new integrations, purchases or outside contact | Obtain specific approval before those actions; documentation or a passing test does not grant it |

## Decisions still required

1. Owner/client final review of both existing PR packages and preserved content.
2. Provider/account/form, exact notification inbox, privacy/terms/limits/costs and operational owner.
3. Authorization and results for synthetic live-delivery tests and provider protections.
4. Completion/disposition of actual-device, assistive-technology and native zoom testing.
5. Exact release candidate, merge/deploy approval and rollback/post-release verification.

Use the gate IDs and completion evidence in [TASKS.md](TASKS.md), not a second parallel checklist. When a decision changes, add a dated entry with its scope and evidence; do not rewrite an earlier test as testing a later commit.
