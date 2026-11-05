# Project maintenance instructions

Last updated: **2026-11-05 (UTC)**. These instructions organize the authorized work; they do not grant new action permissions.

## Start here

1. [TASKS](project-management/TASKS.md): current review/launch state, completed development, blockers, approvals and next decision.
2. [TESTING](project-management/TESTING.md): exact tested commits, evidence, coverage and unverified areas.
3. [DECISIONS](project-management/DECISIONS.md): approved direction, pending decisions and scope boundaries.
4. Existing detailed sources: [README](README.md), [form setup/checklist](docs/estimate-form.md), [form visual/accessibility review](docs/estimate-visual-accessibility-review.md), [charcoal design review](docs/charcoal-design-review.md), [form PR #1](https://github.com/townsendjat-arch/flooring-site/pull/1), [design PR #2](https://github.com/townsendjat-arch/flooring-site/pull/2).

## Working boundaries

- Charles is Priority #1. Customer acquisition is research-only.
- Current launch preparation uses `release/combined-candidate-2026-11-05`, containing PR #1 and PR #2 together. Keep those existing draft PR branches unchanged. Read current remote heads and working-tree changes before editing; do not overwrite concurrent work.
- The 2026-11-05 focused pass authorizes hidden gallery/testimonial scaffolds, mobile workmanship/navigation improvements, truthful photo/failure copy, related tests/tracking and publication to PR #2. Preserve historical reports. Merge, deployment, integration activation, purchases and outside contact still require separate approval.
- Preserve the approved original full-color logo and image files. Mobile layout changes are authorized for the focused pass; the original featured project remains visible. Future gallery/testimonial content stays hidden until genuine material is approved.
- Keep the form endpoint and actual notification delivery marked unverified until authorized live tests prove both provider records and inbox receipt. Never place credentials or real lead data in public files.
- Do not equate no confirmed contrast defect in sampled states with completed manual accessibility testing or certification.
- The next-phase authorization permits preparing the exact combined candidate, necessary form-readiness corrections and automated tests, but no redesign or additional features. Gallery/testimonials and the production endpoint remain hidden/empty. Final approval is still required before merge, deployment or website publication.

## Keep the record current

Update the applicable tracking files in the same review branch as authorized work progresses. Record the verification date/time zone, exact PR/branch/commit, result and evidence link. Distinguish implemented, tested, ready for review, approved, released and post-release verified. A checked development task is not a released feature.

Keep detailed test reports and provider setup procedures in their existing locations; this directory is the short status and decision layer. Preserve historical test dates. Record failed, blocked and never-run checks as such. Do not update a verification date merely because a file was edited.

Before a push, inspect workflow/deployment triggers and changed paths. Publish launch-preparation changes only to the combined candidate's draft branch, with a current-head check. The branch-specific CI allowance is test-only: read-only contents, no checkout credentials, no secrets, no live delivery and no deployment. Verify the remote SHA and wait for actual completed checks on that exact SHA; never substitute an earlier tested head. Use PR checks/commit history for the containing revision rather than an impossible self-referential commit hash inside its own file.

Before marking launch-ready, resolve [all launch gates](project-management/TASKS.md#open-blockers-and-approvals), obtain separate owner release approval and retain a rollback plan. After an approved release, record the actual release commit, deployment and provider/inbox verification. Never infer launch from a branch push or successful mocked CI.
