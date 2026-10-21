# Project maintenance instructions

Last updated: **2026-10-21 (UTC)**. These instructions organize the authorized work; they do not grant new action permissions.

## Start here

1. [TASKS](project-management/TASKS.md): current review/launch state, completed development, blockers, approvals and next decision.
2. [TESTING](project-management/TESTING.md): exact tested commits, evidence, coverage and unverified areas.
3. [DECISIONS](project-management/DECISIONS.md): approved direction, pending decisions and scope boundaries.
4. Existing detailed sources: [README](README.md), [form setup/checklist](docs/estimate-form.md), [form visual/accessibility review](docs/estimate-visual-accessibility-review.md), [charcoal design review](docs/charcoal-design-review.md), [form PR #1](https://github.com/townsendjat-arch/flooring-site/pull/1), [design PR #2](https://github.com/townsendjat-arch/flooring-site/pull/2).

## Working boundaries

- Charles is Priority #1. Customer acquisition is research-only.
- Keep tracking changes on `review/charcoal-white-design`, the existing PR #2 branch. PR #1 is a separate, unchanged dependency. Read current remote heads and working-tree changes before editing; do not overwrite concurrent work.
- The current tracking authorization is documentation-only. Preserve existing reports and link them. No further design/features, merge, deployment, integration activation, services/purchases or outside contact without approval.
- Preserve the approved original full-color logo and photos; do not alter artwork, crop, layout or content under a documentation task.
- Keep the form endpoint and actual notification delivery marked unverified until authorized live tests prove both provider records and inbox receipt. Never place credentials or real lead data in public files.
- Do not equate no confirmed contrast defect in sampled states with completed manual accessibility testing or certification.

## Keep the record current

Update the applicable tracking files in the same review branch as authorized work progresses. Record the verification date/time zone, exact PR/branch/commit, result and evidence link. Distinguish implemented, tested, ready for review, approved, released and post-release verified. A checked development task is not a released feature.

Keep detailed test reports and provider setup procedures in their existing locations; this directory is the short status and decision layer. Preserve historical test dates. Record failed, blocked and never-run checks as such. Do not update a verification date merely because a file was edited.

Before a push, inspect workflow/deployment triggers and changed paths. For a docs-only update, verify only the four requested tracking paths changed, validate relative links and whitespace, and preserve every production/workflow file. Publish only to the authorized existing branch, with a current-head check. Then verify the remote SHA and wait for any triggered CI on that exact SHA; report the new docs head separately from earlier tested code. Use PR checks/commit history for the containing revision rather than an impossible self-referential commit hash inside its own file.

Before marking launch-ready, resolve [all launch gates](project-management/TASKS.md#open-blockers-and-approvals), obtain separate owner release approval and retain a rollback plan. After an approved release, record the actual release commit, deployment and provider/inbox verification. Never infer launch from a branch push or successful mocked CI.
